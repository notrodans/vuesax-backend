import { Body, UseGuards, Controller, Post, HttpCode, Patch } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/auth-guard";
import { User } from "../decorators/user.decorator";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

	@UseGuards(JwtAuthGuard)
	@Post("profile")
	@HttpCode(200)
	async profile(@Body() refresh: { refreshToken: string }) {
		const { iat, exp, ...payload } = await this.jwtService.verify(refresh.refreshToken);
		return await this.userService.findByEmail(payload.email);
	}

	@UseGuards(JwtAuthGuard)
	@Patch("update")
	async update(
		@User() user: Prisma.UserCreateInput,
		@Body() updateBody: { data: Prisma.UserUpdateInput }
	) {
		return await this.userService.update({ email: user.email }, updateBody.data);
	}
}
