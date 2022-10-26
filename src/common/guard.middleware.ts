import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { HttpError } from '../errors/http-error';
import { IMiddleware } from './middleware.interface';

export class GuardMiddleware implements IMiddleware {
	execute(req: Request, res: Response<any, Record<string, any>>, next: NextFunction): void {
		if (req.user) {
			return next();
		}
		res.status(401).send({ error: 'Unauthorized' });
	}
}
