import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	verbose: true,
	preset: 'ts-jest',
	testPathIgnorePatterns: ['dist'],
};

export default config;
