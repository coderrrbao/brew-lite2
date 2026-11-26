import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, PaymentStatus, Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ProductsService } from "../products/products.service";
import { UsersService } from "../users/users.service";
import { CreatePaymentDto, PayOrderDto } from "./dto/create-payment.dto";
import { PromotionsService } from "../promotions/promotions.service";

const PAYABLE: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PAYMENT_FAILED,
];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly promotionsService: PromotionsService,
  ) {}

  async create(dto: CreatePaymentDto & { idempotencyKey: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      select: { id: true, total: true, status: true },
    });
    if (!order) throw new NotFoundException("Đơn hàng không tồn tại");
    if (!PAYABLE.includes(order.status)) {
      throw new ConflictException(
        "Đơn hàng đã thanh toán hoặc không thể thanh toán",
      );
    }

    let payment;
    try {
      payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          idempotencyKey: dto.idempotencyKey,
          amount: order.total,
          method: dto.method,
          status: PaymentStatus.PENDING,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        payment = await this.prisma.payment.findUniqueOrThrow({
          where: { idempotencyKey: dto.idempotencyKey },
        });
        if (payment.orderId !== order.id) {
          throw new ConflictException(
            "Idempotency key đã dùng cho đơn hàng khác",
          );
        }
      } else {
        throw e;
      }
    }

    return {
      message: `QR thanh toán cho đơn hàng ${payment.orderId}`,
      payment,
      orderId: payment.orderId,
    };
  }

  async pay(dto: PayOrderDto & { idempotencyKey: string }) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { order: { include: { items: true } } },
      });
      if (!payment) throw new NotFoundException("Payment key not found");

      const { order } = payment;

      if (!PAYABLE.includes(order.status)) {
        return {
          message:
            order.status === OrderStatus.PAID
              ? "Đơn hàng đã thanh toán"
              : "Đơn hàng không thể thanh toán",
          order,
          payment,
        };
      }

      let pointsSpent = 0;
      if (dto.success) {
        await this.productsService.reserveStock(
          tx,
          order.items.flatMap((i) =>
            i.productId ? [{ productId: i.productId, qty: i.qty }] : [],
          ),
        );
        pointsSpent = await this.applyLoyalty(tx, order);

        if (order.userId && order.promotionCode) {
          await this.promotionsService.recordVoucherUsage(
            {
              userId: order.userId,
              promotionCode: order.promotionCode,
              orderId: order.id,
              discountAmount: order.discountAmount,
            },
            tx,
          );
        }
      } else {
        if (order.promotionCode) {
          await this.promotionsService.rollbackVoucherUsage(order.id, tx);
        }
      }

      let updatedOrder;
      try {
        updatedOrder = await tx.order.update({
          where: { id: order.id, status: order.status },
          data: {
            status: dto.success ? OrderStatus.PAID : OrderStatus.PAYMENT_FAILED,
            pointsSpent,
          },
          include: { items: true, payments: true },
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new ConflictException("Trạng thái đơn hàng vừa thay đổi"); // rollback cả kho + điểm
        }
        throw e;
      }

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: dto.success ? PaymentStatus.PAID : PaymentStatus.FAILED,
        },
      });

      return {
        message: dto.success
          ? `Thanh toán đơn hàng ${order.id} thành công`
          : `Thanh toán đơn hàng ${order.id} thất bại`,
        order: updatedOrder,
        payment: updatedPayment,
      };
    });
  }

  /**
   * Cộng điểm tích lũy (EARN) sau khi thanh toán thành công.
   * Không trừ điểm đổi mã (REDEEM) ở đây — điểm đã được trừ từ bước
   * "Đổi điểm lấy mã" (POST /promotions/redeem) trước đó rồi.
   * Trả về pointsSpent (số điểm đã tiêu để đổi mã) để ghi vào đơn hàng.
   */
  private async applyLoyalty(
    tx: Prisma.TransactionClient,
    order: {
      id: string;
      userId: string | null;
      promotionCode: string | null;
      total: number;
    },
  ): Promise<number> {
    if (!order.userId) return 0;

    // Lấy số điểm đã tiêu từ RedeemedVoucher (đã trừ ở bước đổi mã, chỉ đọc để ghi vào đơn)
    let pointsSpent = 0;
    if (order.promotionCode) {
      const redeemed = await tx.redeemedVoucher.findUnique({
        where: {
          userId_promotionCode: {
            userId: order.userId,
            promotionCode: order.promotionCode,
          },
        },
        select: { pointsSpent: true },
      });
      pointsSpent = redeemed?.pointsSpent ?? 0;
    }

    // Cộng điểm tích lũy khi hoàn tất đơn hàng (EARN)
    const earned = this.usersService.calculatePoints(order.total);
    if (earned > 0) {
      await this.usersService.addLoyaltyPoints(
        order.userId,
        earned,
        order.id,
        tx,
      );
    }

    return pointsSpent;
  }

  async reserveStock(
    tx: Prisma.TransactionClient,
    items: ReadonlyArray<{ productId: string; qty: number }>,
  ): Promise<void> {
    // Gộp các dòng cùng sản phẩm
    const quantities = new Map<string, number>();
    for (const { productId, qty } of items) {
      quantities.set(productId, (quantities.get(productId) ?? 0) + qty);
    }

    // Sắp xếp id để các transaction đồng thời khóa theo cùng một thứ tự, tránh deadlock
    const entries = [...quantities].sort(([a], [b]) => a.localeCompare(b));

    for (const [productId, qty] of entries) {
      const { count } = await tx.product.updateMany({
        where: { id: productId, stock: { gte: qty } },
        data: { stock: { decrement: qty }, version: { increment: 1 } },
      });
      if (count > 0) continue;

      // Chỉ query thêm khi thất bại để báo đúng lý do
      const exists = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!exists)
        throw new NotFoundException(`Sản phẩm ${productId} không tồn tại`);
      throw new ConflictException(`Sản phẩm ${productId} không đủ hàng`);
    }
  }
}
