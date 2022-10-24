import { IConfigService } from './config.service.interface';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class ConfigService implements IConfigService {
	private config: DotenvParseOutput;
	constructor(@inject(TYPES.ILogger) private readonly logger: ILogger) {
		const result: DotenvConfigOutput = config();
		if (result.error) {
			this.logger.error('Unable to read file .env');
			throw new Error('Config file parsing error');
		}
		this.logger.log('Env file successfully read');
		this.config = result.parsed as DotenvParseOutput;
	}
	get(key: string): string {
		return this.config[key];
	}
}
