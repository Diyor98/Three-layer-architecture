import 'reflect-metadata';
import { UserModel } from '@prisma/client';
import { Container } from 'inversify';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../types';
import { IUserRepository } from './user-repository.interface';
import { IUserService } from './user-service.interface';
import { User } from './user.entity';
import { UserService } from './users.service';
import { UserLoginDto } from './dto/user-login.dto';

const ConfigServiceMock: IConfigService = {
	get: jest.fn(),
};

const UserRepositoryMock: IUserRepository = {
	create: jest.fn(),
	find: jest.fn(),
};

const container = new Container();
let configService: IConfigService;
let userRepository: IUserRepository;
let userService: IUserService;

beforeAll(() => {
	container.bind<IUserService>(TYPES.UserService).to(UserService);
	container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock);
	container.bind<IUserRepository>(TYPES.UserRepository).toConstantValue(UserRepositoryMock);

	configService = container.get<IConfigService>(TYPES.ConfigService);
	userRepository = container.get<IUserRepository>(TYPES.UserRepository);
	userService = container.get<IUserService>(TYPES.UserService);
});

let createdUser: UserModel | null;

describe('User Service', () => {
	it('should create a user', async () => {
		configService.get = jest.fn().mockReturnValueOnce('1');
		userRepository.create = jest.fn().mockImplementationOnce((user: User): UserModel => {
			return {
				name: user.name,
				email: user.email,
				password: user.password,
				id: 1,
			};
		});
		createdUser = await userService.createUser({
			email: 'a@gmail.ru',
			name: 'diyor',
			password: '1',
		});

		expect(createdUser?.id).toEqual(1);
		expect(createdUser?.password).not.toEqual('1');
	});

	describe('validateUser', () => {
		it('should return false if user does not exist', async () => {
			userRepository.find = jest.fn().mockResolvedValueOnce(null);
			expect(await userService.validateUser(mockUserLoginDto)).toEqual(false);
		});

		it('should return true if user password is valid', async () => {
			userRepository.find = jest.fn().mockResolvedValueOnce(createdUser);
			expect(await userService.validateUser(mockUserLoginDto)).toEqual(true);
		});
		it('should return false if user password is not valid', async () => {
			userRepository.find = jest.fn().mockResolvedValueOnce(createdUser);
			expect(
				await userService.validateUser({ email: mockUserLoginDto.email, password: '2' }),
			).toEqual(false);
		});
	});
});

const mockUserLoginDto: UserLoginDto = {
	email: 'a@gmail.com',
	password: '1',
};
