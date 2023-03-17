import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/auth-guard";
import { RolesGuard } from "../auth/guards/role.guard";
import { Roles } from "../decorators/role.decorator";
import { ProductDto } from "./dto/product-create.dto";
import { ProductUpdateDto } from "./dto/product-update.dto";
import { ProductService } from "./products.service";

@Controller("products")
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Get(":id")
	async findProduct(@Param() id: Prisma.ProductWhereUniqueInput) {
		return await this.productService.findUnique(id);
	}

	@Get("many/:where")
	async findManyProduct(@Param() where: Prisma.ProductWhereUniqueInput) {
		return await this.productService.findMany(where);
	}

	@Get()
	async findAllProduct() {
		return await this.productService.findAllProduct();
	}

	@UsePipes(ValidationPipe)
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post("create")
	async create(@Body() product: ProductDto) {
		return await this.productService.create(product);
	}

	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete(":id")
	async delete(@Param() id: Prisma.ProductWhereUniqueInput) {
		return await this.productService.delete(id);
	}

	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Patch(":id")
	async update(@Param() id: Prisma.ProductWhereUniqueInput, @Body() data: ProductUpdateDto) {
		return await this.productService.update(id, data);
	}
}
