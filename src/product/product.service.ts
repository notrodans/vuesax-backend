import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ProductService {
	constructor(private readonly prisma: PrismaService) {}

	async findMany(where: Prisma.ProductWhereInput) {
		return await this.prisma.product.findMany({ where: {} });
	}
}
