import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/auth-guard";
import { RolesGuard } from "../auth/guards/role.guard";
import { Roles } from "../decorators/role.decorator";
import { CategoryService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@UsePipes(ValidationPipe)
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post()
	async create(@Body() createCategoryDto: CreateCategoryDto) {
		const oldCategory = await this.categoryService.findUnique({ slug: createCategoryDto.slug });

		if (oldCategory) {
			throw new NotFoundException("Category already exists");
		}

		return this.categoryService.create(createCategoryDto);
	}

	@Get()
	async findAll() {
		const oldCategories = await this.categoryService.findAll();
		if (!oldCategories) {
			throw new NotFoundException("Categories was not find");
		}
		return await this.categoryService.findAll();
	}

	@Get(":id")
	async findOne(@Param("id") id: string) {
		const oldCategory = await this.categoryService.findUnique({ id: +id });
		if (!oldCategory) {
			throw new NotFoundException("Category was not find");
		}
		return this.categoryService.findUnique({ id: +id });
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
		return this.categoryService.update(+id, updateCategoryDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.categoryService.remove(+id);
	}
}
