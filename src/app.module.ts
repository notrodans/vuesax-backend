import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CategoryModule } from "./categories/categories.module";
import { PrismaModule } from "./database/prisma.module";
import { ProductModule } from "./products/products.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		PrismaModule,
		AuthModule,
		UserModule,
		ProductModule,
		CategoryModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
