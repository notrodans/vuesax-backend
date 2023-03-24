import { HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role, User } from "@prisma/client";
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
		const user = await this.prisma.user.findUnique({ where: { email } });
		if (user && (await verify(user?.password, password))) {
			return user;
		}
		return null;
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
		const hashedPassword = await hash(user.password);
		const refreshToken = this.createRefreshToken({ email: user.email, roles: [Role.USER] });

		const userData = {
			email: user.email,
			login: user.login,
			firstName: user.firstName,
			lastName: user.lastName,
			password: hashedPassword,
			role: Role.USER,
			refreshToken
		};

		const newUser = await this.userService.create(userData);

		return newUser;
	}

	async refreshToken(refreshToken: string): Promise<Omit<TokensDto, "refreshToken">> {
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

	createAccessToken(payload: { email: string; roles: Role[] }) {
		return this.jwtService.sign(payload);
	}

	createRefreshToken(payload: { email: string; roles: Role[] }) {
		return this.jwtService.sign(payload, { expiresIn: "7d" });
	}
}
