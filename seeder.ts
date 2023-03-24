import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const createProducts = async (quantity: number) => {
	let productsLength = 0;
	for (let i = 0; i < quantity; i++) {
		const productTitle = faker.commerce.productName();
		const categoryName = faker.commerce.department();

		try {
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
			productsLength += 1;
		} catch (e) {
			console.log(e);
		}
	}
	console.log(productsLength);
};

const addProducts = async (quantity: number) => {
	let productsLength = 0;
	for (let i = 0; i < quantity; i++) {
		const productTitle = faker.commerce.productName();
		const categoryName = faker.commerce.department();

		try {
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
					categorySlug: "Computers"
				}
			});
			productsLength += 1;
		} catch (e) {
			console.log(e);
		}
	}
	console.log(productsLength);
};

async function main() {
	console.log("Start seeding");
	await addProducts(50);
	// await createProducts(50);
}

main()
	.catch(e => console.log(e))
	.finally(async () => {
		await prisma.$disconnect();
	});
