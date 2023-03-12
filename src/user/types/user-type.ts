export interface IUser {
	id?: number;
	email: string;
	login: string;
	firstName: string;
	lastName: string;
	password: string;
	refreshToken?: string;
	createdAt?: Date;
	updatedAt?: Date;
}
