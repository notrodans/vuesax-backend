import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ProductsService {
	constructor(private readonly prisma: PrismaService) {}

	async find(where: Prisma.ProductWhereInput) {
		return await this.prisma.product.findFirst({
			where
		});
	}

	async findMany(select: Prisma.ProductFindManyArgs) {
		return await this.prisma.product.findMany(select);
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
