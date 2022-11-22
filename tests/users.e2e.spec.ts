import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

describe('Users e2e', () => {
	it('Register - error', async () => {
		const res = await request(application.app).post('/users/register').send({
			email: 'diyor@gmail.com',
			name: 'diyor',
			password: '1234',
		});

		expect(res.statusCode).toEqual(422);
	});

	it('Login - error', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: 'dr@gmail.com',
			password: '1234',
		});
		expect(res.statusCode).toEqual(401);
		expect(res.body).toHaveProperty('err');
	});

	it('Login - success', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: 'diyor@gmail.com',
			password: '1234',
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('jwt');
	});

	it('Info - error', async () => {
		const res = await request(application.app).get('/users/info');
		expect(res.statusCode).toEqual(401);
	});

	it('Info - success', async () => {
		const { body } = await request(application.app).post('/users/login').send({
			email: 'diyor@gmail.com',
			password: '1234',
		});

		const res = await request(application.app)
			.get('/users/info')
			.set('Authorization', `Body ${body.jwt}`);

		console.log('Body', res.body);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('email');
		expect(res.body).toHaveProperty('id');
	});
});

afterAll(async () => {
	await application.close();
});
