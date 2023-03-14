import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Roles, User } from "@prisma/client";
import { hash, verify } from "argon2";
import { PrismaService } from "../database/prisma.service";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/auth-login.dto";
import { AuthRegisterDto } from "./dto/auth-register.dto";
import { TokensDto } from "./dto/auth-token.dto";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService
	) {}

	async validateUser(email: string, password: string): Promise<User> {
		try {
			const user = await this.prisma.user.findUnique({ where: { email } });
			await verify(user?.password, password);
			return user;
		} catch {
			throw new UnauthorizedException("Неверные данные");
		}
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
		const refreshToken = this.createRefreshToken({ email: user.email, roles: [Roles.USER] });

		const userData = {
			email: user.email,
			login: user.login,
			firstName: user.firstName,
			lastName: user.lastName,
			password: hashedPassword,
			roles: [Roles.USER],
			refreshToken
		};

		const newUser = await this.userService.create(userData);

		return newUser;
	}

	async refreshToken(refreshToken: string): Promise<Omit<TokensDto, "refreshToken">> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { iat, exp, ...payload } = await this.jwtService.verify(refreshToken);
		const user = await this.userService.findByEmail(payload.email);
		if (!user) {
			throw new HttpException("User was not found", 409);
		}

		if (user.refreshToken === refreshToken) {
			const accessToken = this.createAccessToken(payload);
			return { accessToken };
		}
	}

	createAccessToken(payload: { email: string; roles: Roles[] }) {
		return this.jwtService.sign(payload);
	}

	createRefreshToken(payload: { email: string; roles: Roles[] }) {
		return this.jwtService.sign(payload, { expiresIn: "7d" });
	}
}
