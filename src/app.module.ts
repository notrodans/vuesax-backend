import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./database/prisma.module";
import { ProductModule } from "./product/product.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [AuthModule, PrismaModule, UserModule, ConfigModule.forRoot(), ProductModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
