import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const createProducts = async (quantity: number) => {
	for (let i = 0; i < quantity; i++) {
		const productTitle = faker.commerce.productName();
		const categoryName = faker.commerce.department();

		await prisma.product.create({
			data: {
				title: productTitle,
				slug: faker.helpers.slugify(productTitle),
				description: faker.commerce.productDescription(),
				price: +faker.commerce.price(10, 4999, 0),
				primaryImage: faker.image.imageUrl(),
				rating: +faker.datatype.float({ min: 1, max: 5 }).toFixed(1),
				images: Array.from({ length: 2 }).map(() => faker.image.imageUrl()),
				brand: faker.company.name(),
				brandSlug: faker.helpers.slugify(faker.company.name()),
				category: {
					create: {
						image: faker.image.imageUrl(),
						name: categoryName,
						slug: faker.helpers.slugify(categoryName)
					}
				}
			}
		});

		await addProducts(categoryName, 50);
	}
};

const addProducts = async (category: string, amount: number) => {
	for (let i = 0; i < amount; i++) {
		await prisma.product.create({
			data: {
				title: faker.commerce.productName(),
				slug: faker.helpers.slugify(faker.commerce.productName()),
				description: faker.commerce.productDescription(),
				price: +faker.commerce.price(10, 4999, 0),
				primaryImage: faker.image.imageUrl(),
				rating: +faker.datatype.float({ min: 1, max: 5 }).toFixed(1),
				images: Array.from({ length: 2 }).map(() => faker.image.imageUrl()),
				brand: faker.company.name(),
				brandSlug: faker.helpers.slugify(faker.company.name()),
				categorySlug: faker.helpers.slugify(category)
			}
		});
	}
};

async function main() {
	console.log("Start seeding");
	await createProducts(50);
}

main()
	.catch(e => console.log(e))
	.finally(async () => {
		await prisma.$disconnect();
	});
