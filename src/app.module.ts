import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./database/prisma.module";
import { ProductModule } from "./products/products.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, PrismaModule, UserModule, ProductModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
