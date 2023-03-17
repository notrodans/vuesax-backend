import { IsNumber, IsString, MaxLength, MinLength } from "class-validator";

export class ProductDto {
	@IsNumber()
	id: number;

	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsNumber()
	@MinLength(1)
	@MaxLength(5)
	rating: number;

	@IsString()
	brand: string;

	@IsNumber()
	cost: number;

	@IsString({ each: true })
	images: string[];
}
