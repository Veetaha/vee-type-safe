import * as Types     from '../index';
import * as express   from 'express';
import * as HttpCodes from 'http-status-codes';

export class BadTypeStatusError extends Types.TypeMismatchError {    
    constructor(
        typeMismatch: Types.FailedMatchInfo,
        public status = HttpCodes.BAD_REQUEST
    ) { 
        super(typeMismatch);
    }
}

export type RequestPropertyGetter = (req: express.Request) => unknown;
export type ErrorMaker = (failedMatchInfo: Types.FailedMatchInfo) => unknown;

export function ReqBody(req: express.Request) {
    return req.body;
}
export function ReqParams(req: express.Request) {
    return req.params;
}
export function ReqQuery(req: express.Request) {
    return req.query;
}
export function ReqCookies(req: express.Request) {
    return req.cookies;
}
export function ReqHeaders(req: express.Request) {
    return req.headers;
}

export function matchType(
    getRequestProperty: RequestPropertyGetter, 
    typeDescr: Types.TypeDescription,
    makeError: ErrorMaker = (failedMatch: Types.FailedMatchInfo) => new BadTypeStatusError(failedMatch)
) {
    return ((req, _res, next) => {
        const matchInfo = Types.match(getRequestProperty(req), typeDescr);
        if (!matchInfo.matched) {
            return next(makeError(matchInfo as Types.FailedMatchInfo));
        }
        return next();
    }) as express.Handler;
}

export function exactlyMatchType(
    getRequestProperty: RequestPropertyGetter, 
    typeDescr: Types.TypeDescription,
    makeError: ErrorMaker = (failedMatch: Types.FailedMatchInfo) => new BadTypeStatusError(failedMatch)
) {
    return ((req, _res, next) => {
        const matchInfo = Types.exactlyMatch(getRequestProperty(req), typeDescr);
        if (!matchInfo.matched) {
            return next(makeError(matchInfo as Types.FailedMatchInfo));
        }
        return next();
    }) as express.Handler;
}
