import express, { Express } from 'express';
import { inject, injectable } from 'inversify';
import { ExceptionFilter } from './errors/exception.filter';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { UserController } from './users/user.controller';
import { json } from 'body-parser';
import { PrismaService } from './database/prisma.service';
import { AuthMiddleware } from './common/auth.middleware';
import { ConfigService } from './config/config.service';

@injectable()
export class App {
	private app: Express;
	private port: number;

	constructor(
		@inject(TYPES.ILogger) private readonly logger: ILogger,
		@inject(TYPES.UserController)
		private readonly userController: UserController,
		@inject(TYPES.ExceptionFilter)
		private readonly exceptionFilter: ExceptionFilter,
		@inject(TYPES.PrismaService) private readonly prismaService: PrismaService,
		@inject(TYPES.ConfigService) private readonly configService: ConfigService,
	) {
		this.app = express();
		this.port = 8000;
	}

	useMiddleware(): void {
		this.app.use(json());
		const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}

	userRoutes(): void {
		this.app.use('/users', this.userController.router);
	}

	useExceptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.userRoutes();
		this.useExceptionFilters();
		await this.prismaService.connect();
		this.app.listen(this.port);
		this.logger.log(`Server has started on port ${this.port}`);
	}
}
