import { NextFunction, Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { inject, injectable } from 'inversify';
import { BaseController } from '../common/base.controller';
import { ValidateMiddleware } from '../common/validate.middleware';
import { HttpError } from '../errors/http-error';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { IUserController } from './user-controller.interface';
import { IUserService } from './user-service.interface';
import { IConfigService } from '../config/config.service.interface';
import { GuardMiddleware } from '../common/guard.middleware';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) logger: ILogger,
		@inject(TYPES.UserService) private readonly userService: IUserService,
		@inject(TYPES.ConfigService) private readonly configService: IConfigService,
	) {
		super(logger);

		this.bindRoutes([
			{
				method: 'post',
				path: '/login',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				method: 'post',
				path: '/register',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				method: 'get',
				path: '/info',
				func: this.info,
				middlewares: [new GuardMiddleware()],
			},
		]);
	}

	async login(
		{ body }: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const isLoggedIn = await this.userService.validateUser(body);
		if (!isLoggedIn) {
			return next(new HttpError(401, 'User does not exist', 'login'));
		}
		const jwt = await this.signJWT(body.email, this.configService.get('SECRET'));
		res.status(200).send({ jwt });
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.createUser(body);
		if (!result) {
			return next(new HttpError(422, 'User already exists'));
		}
		this.ok(res, { email: result.email, id: result.id });
	}

	async info(
		{ user }: Request,
		res: Response<any, Record<string, any>>,
		next: NextFunction,
	): Promise<void> {
		const userInfo = await this.userService.getUserInfo(user);
		this.ok(res, { email: userInfo?.email, id: userInfo?.id });
	}
	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						return reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
