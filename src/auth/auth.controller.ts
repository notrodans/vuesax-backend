import {
	Body,
	Controller,
	HttpException,
	Post,
	UnauthorizedException,
	UsePipes,
	ValidationPipe
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth-login.dto";
import { AuthRegisterDto } from "./dto/auth-register.dto";
import { TokensDto } from "./dto/auth-token.dto";

@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {}

	@UsePipes(ValidationPipe)
	@Post("login")
	async login(@Body() loginDto: LoginDto): Promise<{
		user: { email: string; firstName: string; lastName: string; login: string };
		tokens: TokensDto;
	}> {
		const valid = await this.authService.validateUser(loginDto.email, loginDto.password);

		if (!valid) {
			throw new UnauthorizedException();
		}

		return await this.authService.login(loginDto);
	}

	@UsePipes(ValidationPipe)
	@Post("register")
	async register(@Body() registerDto: AuthRegisterDto): Promise<void> {
		const oldUser = await this.userService.findByEmail(registerDto.email);
		if (oldUser) {
			throw new HttpException("User is existed", 409);
		}

		await this.authService.register(registerDto);
	}

	@Post("refresh")
	async refresh(
		@Body() refreshData: Pick<TokensDto, "refreshToken">
	): Promise<Omit<TokensDto, "refreshToken">> {
		const refresh = await this.authService.refreshToken(refreshData.refreshToken);
		return refresh;
	}
}
