import express, { Express } from 'express';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import { ExceptionFilter } from './errors/exception.filter';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { UserController } from './users/user.controller';
import { json } from 'body-parser';

@injectable()
export class App {
	private app: Express;
	private server: Server;
	private port: number;

	constructor(
		@inject(TYPES.ILogger) private readonly logger: ILogger,
		@inject(TYPES.UserController)
		private readonly userController: UserController,
		@inject(TYPES.ExceptionFilter)
		private readonly exceptionFilter: ExceptionFilter,
	) {
		this.app = express();
		this.port = 8000;
	}

	useMiddleware(): void {
		this.app.use(json());
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
		this.server = this.app.listen(this.port);
		this.logger.log(`Server has started on port ${this.port}`);
	}
}
