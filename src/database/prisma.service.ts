import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';

@injectable()
export class PrismaService {
	client: PrismaClient;
	constructor(@inject(TYPES.ILogger) private readonly logger: ILogger) {
		this.client = new PrismaClient();
	}
	async connect(): Promise<void> {
		await this.client.$connect();
		this.logger.log('Connected to db');
	}

	async disconnect(): Promise<void> {
		await this.client.$disconnect();
	}
}
