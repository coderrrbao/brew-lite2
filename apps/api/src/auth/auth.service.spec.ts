import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from './refresh-tokens.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  hashSync: jest.fn(() => '$2a$12$dummy'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersMock: {
    create: jest.Mock;
    findByEmail: jest.Mock;
  };
  let jwtMock: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let refreshTokensMock: {
    store: jest.Mock;
    consume: jest.Mock;
    revokeAllForUser: jest.Mock;
  };

  const publicUser = {
    id: 'u1',
    name: 'Hoang',
    email: 'hoang@example.com',
    role: 'CUSTOMER',
    loyaltyPoints: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    usersMock = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    jwtMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    refreshTokensMock = {
      store: jest.fn(),
      consume: jest.fn(),
      revokeAllForUser: jest.fn(),
    };

    service = new AuthService(
      usersMock as unknown as UsersService,
      jwtMock as unknown as JwtService,
      refreshTokensMock as unknown as RefreshTokensService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('băm mật khẩu, tạo người dùng và trả về cặp token', async () => {
      const bcrypt = jest.requireMock('bcryptjs');
      bcrypt.hash.mockResolvedValue('$2a$12$password-hash');
      usersMock.create.mockResolvedValue(publicUser);
      jwtMock.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      refreshTokensMock.store.mockResolvedValue(undefined);

      const result = await service.register({
        email: 'hoang@example.com',
        password: 'password123',
        name: 'Hoang',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(usersMock.create).toHaveBeenCalledWith({
        email: 'hoang@example.com',
        name: 'Hoang',
        passwordHash: '$2a$12$password-hash',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: publicUser,
      });
      expect(refreshTokensMock.store).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          token: 'refresh-token',
          expiresAt: expect.any(Date),
        }),
      );
    });

    it('ném ConflictException khi email đã tồn tại', async () => {
      const bcrypt = jest.requireMock('bcryptjs');
      bcrypt.hash.mockResolvedValue('$2a$12$password-hash');
      usersMock.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.register({
          email: 'hoang@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('trả về auth response khi email và mật khẩu hợp lệ', async () => {
      const bcrypt = jest.requireMock('bcryptjs');
      usersMock.findByEmail.mockResolvedValue({
        ...publicUser,
        passwordHash: '$2a$12$password-hash',
      });
      bcrypt.compare.mockResolvedValue(true);
      jwtMock.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      refreshTokensMock.store.mockResolvedValue(undefined);

      const result = await service.login({
        email: 'hoang@example.com',
        password: 'password123',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        '$2a$12$password-hash',
      );
      expect(result.user).toEqual(publicUser);
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('ném UnauthorizedException khi mật khẩu sai', async () => {
      const bcrypt = jest.requireMock('bcryptjs');
      usersMock.findByEmail.mockResolvedValue({
        ...publicUser,
        passwordHash: '$2a$12$password-hash',
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'hoang@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('ném UnauthorizedException khi email không tồn tại', async () => {
      const bcrypt = jest.requireMock('bcryptjs');
      usersMock.findByEmail.mockResolvedValue(null);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('consume refresh token hợp lệ và phát hành cặp token mới', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 'u1',
        jti: 'refresh-id',
        email: 'hoang@example.com',
        role: 'CUSTOMER',
      });
      refreshTokensMock.consume.mockResolvedValue(true);
      jwtMock.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      refreshTokensMock.store.mockResolvedValue(undefined);

      const result = await service.refresh({
        refreshToken: 'old-refresh-token',
      });

      expect(refreshTokensMock.consume).toHaveBeenCalledWith(
        'refresh-id',
        'old-refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('thu hồi toàn bộ session khi refresh token không hợp lệ', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 'u1',
        jti: 'refresh-id',
        email: 'hoang@example.com',
        role: 'CUSTOMER',
      });
      refreshTokensMock.consume.mockResolvedValue(false);

      await expect(
        service.refresh({ refreshToken: 'invalid-refresh-token' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(refreshTokensMock.revokeAllForUser).toHaveBeenCalledWith('u1');
    });
  });

  describe('logout', () => {
    it('consume refresh token để đăng xuất', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 'u1',
        jti: 'refresh-id',
        email: 'hoang@example.com',
        role: 'CUSTOMER',
      });
      refreshTokensMock.consume.mockResolvedValue(true);

      await expect(
        service.logout({ refreshToken: 'refresh-token' }),
      ).resolves.toBeUndefined();
      expect(refreshTokensMock.consume).toHaveBeenCalledWith(
        'refresh-id',
        'refresh-token',
      );
    });

    it('ném UnauthorizedException khi refresh token hết hạn hoặc không hợp lệ', async () => {
      jwtMock.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(
        service.logout({ refreshToken: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(refreshTokensMock.consume).not.toHaveBeenCalled();
    });
  });
});
