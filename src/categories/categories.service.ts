import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createCategoryDto: CreateCategoryDto) {
		return await this.prisma.category.create({ data: createCategoryDto });
	}

	async findMany(where?: Prisma.CategoryWhereInput) {
		return await this.prisma.category.findMany({ where });
	}

	async findUnique(where: Prisma.CategoryWhereUniqueInput) {
		return await this.prisma.category.findUnique({ where });
	}

	async update(id: number, updateCategoryDto: UpdateCategoryDto) {
		return await this.prisma.category.update({ where: { id }, data: updateCategoryDto });
	}

	async remove(id: number) {
		return await this.prisma.category.delete({ where: { id } });
	}
}
