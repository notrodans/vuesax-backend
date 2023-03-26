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
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
	constructor(private readonly productService: ProductsService) {}

	@Get(":slug")
	async findProduct(@Param("slug") slug: string) {
		const product = await this.productService.find({
			slug: { contains: slug, mode: "insensitive" }
		});
		if (!product) {
			throw new NotFoundException("Product is not exists");
		}
		return product;
	}

	@Get("bySlug/:categorySlug")
	async findManyProduct(
		@Param("categorySlug") slug?: string,
		@Query("search") search?: string,
		@Query("page") page?: string,
		@Query("total") total?: string,
		@Query("rating") rating?: string,
		@Query("price", new ParseArrayPipe({ items: Number, separator: ",", optional: true }))
		price?: [number, number],
		@Query("brands", new ParseArrayPipe({ items: String, separator: ",", optional: true }))
		brands?: string[]
	) {
		const select: Prisma.ProductFindManyArgs = {
			where: {}
		};

		if (search) {
			Object.assign(select.where, { title: { contains: search, mode: "insensitive" } });
		}

		if (brands) {
			Object.assign(select.where, { brandSlug: { in: brands } });
		}

		if (slug) {
			Object.assign(select.where, { categorySlug: { contains: slug, mode: "insensitive" } });
		}

		if (rating) {
			Object.assign(select.where, { rating: { gte: +rating } });
		}

		if (price) {
			Object.assign(select.where, { price: { gte: price[0], lte: price[1] } });
		}

		if (page) {
			Object.assign(select, { skip: (+page - 1) * +total });
		}

		if (total) {
			Object.assign(select, { take: +total });
		}

		const products = await this.productService.findMany(select);

		return { pages: Math.ceil(products.length / (+total || 10)), products };
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
		const oldProduct = await this.productService.find({ title: product.title });
		if (oldProduct) {
			throw new BadRequestException("Product is already exists");
		}
		return await this.productService.create({ ...product, brandSlug: "hehe" });
	}

	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete(":id")
	async delete(@Param("id") id: string) {
		const oldProduct = await this.productService.find({ id: +id });
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
		const oldProduct = await this.productService.find({ id: +id });
		if (!oldProduct) {
			throw new NotFoundException("Product is not exists");
		}
		return await this.productService.update(id, data);
	}
}
