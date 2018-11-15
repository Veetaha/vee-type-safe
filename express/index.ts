import * as Vts     from '../index';
import * as express   from 'express';
import * as HttpCodes from 'http-status-codes';

export class BadTypeStatusError extends Vts.TypeMismatchError {    
    constructor(
        typeMismatch: Vts.MismatchInfo,
        public status = HttpCodes.BAD_REQUEST
    ) { 
        super(typeMismatch);
    }
}

export type RequestPropertyGetter = (req: express.Request) => unknown;
export type ErrorMaker = (failedMatchInfo: Vts.MismatchInfo) => unknown;

export type ReqBody<TBody>       = Vts.ReplaceProperty<express.Request, 'body',    TBody>;
export type ReqParams<TParams>   = Vts.ReplaceProperty<express.Request, 'params',  TParams>;
export type ReqQuery<TQuery>     = Vts.ReplaceProperty<express.Request, 'query',   TQuery>;
export type ReqCookies<TCookies> = Vts.ReplaceProperty<express.Request, 'cookies', TCookies>;
export type ReqHeaders<THeaders> = Vts.ReplaceProperty<express.Request, 'headers', THeaders>;

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

export function ensureDuckTypeMatch(
    getRequestProperty: RequestPropertyGetter, 
    typeDescr: Vts.TypeDescription,
    makeError: ErrorMaker = (failedMatch: Vts.MismatchInfo) => new BadTypeStatusError(failedMatch)
) {
    return ((req, _res, next) => {
        const matchInfo = Vts.duckMismatch(getRequestProperty(req), typeDescr);
        if (matchInfo) {
            return next(makeError(matchInfo));
        }
        return next();
    }) as express.Handler;
}

export function ensureTypeMatch(
    getRequestProperty: RequestPropertyGetter, 
    typeDescr: Vts.TypeDescription,
    makeError: ErrorMaker = (failedMatch: Vts.MismatchInfo) => new BadTypeStatusError(failedMatch)
) {
    return ((req, _res, next) => {
        const matchInfo = Vts.mismatch(getRequestProperty(req), typeDescr);
        if (matchInfo) {
            return next(makeError(matchInfo));
        }
        return next();
    }) as express.Handler;
}
