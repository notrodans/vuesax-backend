import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ProductService {
	constructor(private readonly prisma: PrismaService) {}

	async findUnique(where: Prisma.ProductWhereUniqueInput) {
		return await this.prisma.product.findUnique({ where });
	}

	async findMany(
		where: Prisma.ProductWhereInput,
		{ skip: pageNumber, take: total, ...args }: Prisma.ProductFindManyArgs
	) {
		const page = (pageNumber - 1) * total;

		return await this.prisma.product.findMany({ where, skip: page, take: total, ...args });
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
