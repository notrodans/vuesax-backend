import { IsNumber, IsString } from "class-validator";

export class ProductDto {
	@IsString()
	title: string;

	@IsString()
	slug: string;

	@IsString()
	description: string;

	@IsString()
	brand: string;

	@IsNumber()
	price: number;

	@IsString()
	primaryImage: string;

	@IsString({ each: true })
	images: string[];
}
