import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ProductService {
	constructor(private readonly prisma: PrismaService) {}

	async findUnique(where: Prisma.ProductWhereUniqueInput) {
		return await this.prisma.product.findUnique({ where });
	}

	async findMany(where: Prisma.ProductWhereInput) {
		return await this.prisma.product.findMany({ where });
	}

	async findAllProduct() {
		return await this.prisma.product.findMany();
	}

	async create(data: Prisma.ProductCreateInput) {
		return await this.prisma.product.create({ data });
	}

	async update(where: Prisma.ProductWhereUniqueInput, data: Prisma.ProductUpdateInput) {
		return await this.prisma.product.update({ where, data });
	}

	async delete(where: Prisma.ProductWhereUniqueInput) {
		return await this.prisma.product.delete({ where });
	}
}
