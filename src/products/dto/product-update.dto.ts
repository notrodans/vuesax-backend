import { IsNumber, IsString } from "class-validator";

export class ProductUpdateDto {
	@IsString()
	title?: string;

	@IsString()
	description?: string;

	@IsString()
	brand?: string;

	@IsNumber()
	cost?: number;

	@IsString({ each: true })
	images?: string[];
}
