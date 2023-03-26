import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@UsePipes(ValidationPipe)
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async create(@Body() createCategoryDto: CreateCategoryDto) {
		const oldCategory = await this.categoriesService.findUnique({ slug: createCategoryDto.slug });

		if (oldCategory) {
			throw new NotFoundException("Category already exists");
		}

		return this.categoriesService.create(createCategoryDto);
	}

	@Get()
	async findAll(@Query("search") search?: string) {
		const where: Prisma.CategoryWhereInput = {};
		if (search) {
			Object.assign(where, { name: { contains: search, mode: "insensitive" } });
		}
		const oldCategories = await this.categoriesService.findMany();
		if (!oldCategories) {
			throw new NotFoundException("Categories was not find");
		}
		return await this.categoriesService.findMany(where);
	}

	@Get(":id")
	async findOne(@Param("id") id: string) {
		const oldCategory = await this.categoriesService.findUnique({ id: +id });
		if (!oldCategory) {
			throw new NotFoundException("Category was not find");
		}
		return this.categoriesService.findUnique({ id: +id });
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
		return this.categoriesService.update(+id, updateCategoryDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.categoriesService.remove(+id);
	}
}
