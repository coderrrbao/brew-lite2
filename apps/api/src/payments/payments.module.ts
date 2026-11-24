import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { UsersModule } from "../users/users.module";
import { OrdersModule } from "../orders/orders.module";
import { ProductsModule } from "../products/products.module";
import { PromotionsModule } from "../promotions/promotions.module";
import { PromotionsService } from "../promotions/promotions.service";

@Module({
  imports: [UsersModule, OrdersModule,ProductsModule, PromotionsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PromotionsService],
})
export class PaymentsModule {}
