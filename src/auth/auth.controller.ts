import { Body, Controller, NotFoundException, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth-login.dto";
import { AuthRegisterDto } from "./dto/auth-register.dto";
import { TokensDto } from "./dto/auth-token.dto";
import { AuthUpdateDto } from "./dto/auth-update.dto";
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
	async refresh(@Body() refreshData: { refreshToken: string }): Promise<TokensDto> {
		return await this.authService.refreshTokens(refreshData.refreshToken);
	}

	@UseGuards(JwtAuthGuard)
	@Post("update")
	async update(@Body() updateBody: { email: string; data: AuthUpdateDto }) {
		return await this.authService.update({ email: updateBody.email }, updateBody.data);
	}
}
