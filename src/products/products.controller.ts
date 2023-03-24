import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	ParseArrayPipe,
	Patch,
	Post,
	Query,
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
	async findProduct(@Param("id") id: string) {
		const product = await this.productService.findUnique({ id: +id });
		if (!product) {
			throw new NotFoundException("Product is not exists");
		}
		return product;
	}

	@Get("bySlug/:slug")
	async findManyProduct(
		@Param("slug") slug?: string,
		@Query("search") search?: string,
		@Query("page") page?: string,
		@Query("total") total?: string,
		@Query("rating") rating?: string,
		@Query("price", new ParseArrayPipe({ items: Number, separator: "," })) price?: [number, number],
		@Query("brands", new ParseArrayPipe({ items: String, separator: ",", optional: true }))
		brands?: string[]
	) {
		const where: Prisma.ProductWhereInput = {};

		if (search) {
			Object.assign(where, { title: { contains: search } });
		}

		if (brands) {
			Object.assign(where, { brandSlug: { in: brands } });
		}

		if (slug) {
			Object.assign(where, { categorySlug: { contains: slug } });
		}

		if (rating) {
			Object.assign(where, { rating: { gte: +rating } });
		}

		if (price) {
			Object.assign(where, { price: { gte: price[0], lte: price[1] } });
		}

		const products = await this.productService.findMany(where, {
			skip: page ? +page : 1,
			take: total ? +total : 10
		});

		if (!products.length) {
			throw new NotFoundException("Products was not find");
		}
		return products;
	}

	@Get()
	async findAllProduct() {
		const products = await this.productService.findAllProduct();
		if (!products) {
			throw new NotFoundException("Products was not find");
		}
		return products;
	}

	@UsePipes(ValidationPipe)
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async create(@Body() product: ProductDto) {
		const oldProduct = await this.productService.findUnique({ title: product.title });
		if (oldProduct) {
			throw new BadRequestException("Product is already exists");
		}
		return await this.productService.create({ ...product, brandSlug: "hehe" });
	}

	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete(":id")
	async delete(@Param("id") id: string) {
		const oldProduct = await this.productService.findUnique({ id: +id });
		if (!oldProduct) {
			throw new BadRequestException("Product is not exists");
		}
		return await this.productService.delete({ id: +id });
	}

	@UsePipes(ValidationPipe)
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Patch(":id")
	async update(@Param() id: Prisma.ProductWhereUniqueInput, @Body() data: ProductUpdateDto) {
		const oldProduct = await this.productService.findUnique({ id: +id });
		if (!oldProduct) {
			throw new NotFoundException("Product is not exists");
		}
		return await this.productService.update(id, data);
	}
}
