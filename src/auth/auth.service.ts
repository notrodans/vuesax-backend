import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User } from "@prisma/client";
import { hash, verify } from "argon2";
import { PrismaService } from "../database/prisma.service";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/auth-login.dto";
import { AuthRegisterDto } from "./dto/auth-register.dto";
import { TokensDto } from "./dto/auth-token.dto";
import { AuthUpdateDto } from "./dto/auth-update.dto";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService
	) {}

	async validateUser(email: string, password: string): Promise<User> {
		const user = await this.prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new UnauthorizedException("Wrong email");
		}

		const isPasswordValid = await verify(user.password, password);
		if (!isPasswordValid) {
			throw new UnauthorizedException("Wrong password");
		}

		return user;
	}

	async login(userData: LoginDto): Promise<{
		user: { email: string; firstName: string; lastName: string; login: string };
		tokens: TokensDto;
	}> {
		const payload = { email: userData.email };
		const accessToken = this.jwtService.sign(payload);
		const newRefreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });
		const newUser = await this.userService.update(
			{ email: userData.email },
			{
				refreshToken: newRefreshToken
			}
		);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, createdAt, updatedAt, refreshToken, password, ...user } = newUser;
		return {
			user: user,
			tokens: {
				accessToken,
				refreshToken: newRefreshToken
			}
		};
	}

	async register(user: AuthRegisterDto): Promise<User> {
		const oldUser = await this.userService.findByEmail(user.email);
		if (oldUser) {
			throw new HttpException("User is existed", 409);
		}

		const hashedPassword = await hash(user.password);

		const userData = {
			email: user.email,
			login: user.login,
			firstName: user.firstName,
			lastName: user.lastName,
			password: hashedPassword
		};

		const newUser = await this.userService.create(userData);

		return newUser;
	}

	async refreshTokens(refreshToken: string): Promise<TokensDto> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { iat, exp, ...payload } = await this.jwtService.verify(refreshToken);
		const user = await this.userService.findByEmail(payload.email);
		if (!user) {
			throw new HttpException("User was not found", 409);
		}

		if (user && user.refreshToken === refreshToken) {
			const accessToken = this.jwtService.sign(payload);
			const newRefreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });
			await this.userService.update({ id: user.id }, { refreshToken: newRefreshToken });
			return {
				accessToken,
				refreshToken: newRefreshToken
			};
		}
	}

	async update(where: Prisma.UserWhereUniqueInput, updateDto: AuthUpdateDto) {
		return await this.userService.update(where, updateDto);
	}

	async createTokens(email: string) {
		const accessToken = this.jwtService.sign({ email });
		const refreshToken = this.jwtService.sign({ email }, { expiresIn: "7d" });
		return {
			accessToken,
			refreshToken
		};
	}
}
