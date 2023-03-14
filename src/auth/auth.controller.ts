import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth-login.dto";
import { AuthRegisterDto } from "./dto/auth-register.dto";
import { TokensDto } from "./dto/auth-token.dto";
import { JwtAuthGuard } from "./guards/auth-guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	async login(@Body() loginDto: LoginDto): Promise<{
		user: { email: string; firstName: string; lastName: string; login: string };
		tokens: TokensDto;
	}> {
		await this.authService.validateUser(loginDto.email, loginDto.password);

		return await this.authService.login(loginDto);
	}

	@Post("register")
	async register(@Body() registerDto: AuthRegisterDto): Promise<void> {
		await this.authService.register(registerDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post("refresh")
	async refresh(
		@Body() refreshData: { refreshToken: string }
	): Promise<Omit<TokensDto, "refreshToken">> {
		const refresh = await this.authService.refreshToken(refreshData.refreshToken);
		return refresh;
	}
}
