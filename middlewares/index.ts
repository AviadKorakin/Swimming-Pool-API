import { requireAuth } from '@clerk/express';
import { Request, ParamsDictionary, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const requireAuthWithErrorHandler = () => (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>, next: () => void) => {
    requireAuth()(req, res, (err) => {
        if (err) {
            console.error('Authentication Error:', err.message);
            return res.status(403).json({
                error: 'Access denied. Authentication required.',
                message: err.message,
            });
        }
        next();
    });
};

export default requireAuthWithErrorHandler;
