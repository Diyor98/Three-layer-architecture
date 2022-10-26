import { UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../types';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { IUserRepository } from './user-repository.interface';
import { IUserService } from './user-service.interface';
import { User } from './user.entity';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.ConfigService) private readonly configService: IConfigService,
		@inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
	) {}
	async createUser({ email, name, password }: UserRegisterDto): Promise<UserModel | null> {
		const newUser = new User(email, name);
		const salt = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));
		const existingUser = await this.userRepository.find(email);
		if (existingUser) {
			return null;
		}
		return this.userRepository.create(newUser);
	}

	async validateUser(dto: UserLoginDto): Promise<boolean> {
		const existingUser = await this.userRepository.find(dto.email);
		if (!existingUser) return false;
		const newUser = new User(existingUser.email, existingUser.name, existingUser.password);
		return newUser.compare(dto.password);
	}
}
