import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "../../database/prisma.service";
import { JwtPayload } from "../../types/jwt-payload";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.get("JWT_SECRET")
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		return this.prisma.user.findUnique({ where: { email: payload.email } });
	}
}
