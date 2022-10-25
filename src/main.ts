import 'reflect-metadata';
import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { ExceptionFilter } from './errors/exception.filter';
import { LoggerService } from './logger/logger.service';
import { TYPES } from './types';
import { UserController } from './users/user.controller';
import { UserService } from './users/users.service';
import { ConfigService } from './config/config.service';
import { PrismaService } from './database/prisma.service';
import { UserRepository } from './users/user.repository';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind(TYPES.ExceptionFilter).to(ExceptionFilter).inSingletonScope();
	bind(TYPES.UserService).to(UserService).inSingletonScope();
	bind(TYPES.UserController).to(UserController).inSingletonScope();
	bind(TYPES.UserRepository).to(UserRepository).inSingletonScope();
	bind(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind(TYPES.Application).to(App).inSingletonScope();
});

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);

	app.init();

	return { appContainer, app };
}

export const { appContainer, app } = bootstrap();
