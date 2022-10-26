import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { inject } from 'inversify';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ParsedQs } from 'qs';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../types';
import { IMiddleware } from './middleware.interface';

export class AuthMiddleware implements IMiddleware {
	constructor(private secret: string) {}
	execute(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction,
	): void {
		if (req.headers.authorization) {
			verify(req.headers.authorization.split(' ')[1], this.secret, (err, payload) => {
				if (err) {
					next();
				} else if (payload) {
					req.user = (<JwtPayload>payload).email;
					next();
				}
			});
		}
		next();
	}
}
