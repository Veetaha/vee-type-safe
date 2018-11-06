import * as Types from '../index';
import * as express from 'express';
import * as HttpCodes from 'http-status-codes';

export class BadTypeError extends Error {    
    constructor(
        public failedTypeMatch: Types.FailedMatchInfo,
        public status = HttpCodes.BAD_REQUEST
    ) { 
        super(failedTypeMatch.toErrorString());
     }
}

export function checkTypeMatch(
    reqProperty: string, 
    typeDescr: Types.TypeDescription,
    makeError = (failedMatch: Types.FailedMatchInfo) => new BadTypeError(failedMatch)
) {
    return ((req: Types.BasicObject, _res, next) => {
        const matchInfo = Types.match(req[reqProperty], typeDescr);
        if (!matchInfo.matched) {
            return next(makeError(matchInfo as Types.FailedMatchInfo));
        }
        return next();
    }) as express.Handler;
}

export function checkTypeExactMatch(
    reqProperty: string, 
    typeDescr: Types.TypeDescription,
    makeError = (failedMatch: Types.FailedMatchInfo) => new BadTypeError(failedMatch)
) {
    return ((req: Types.BasicObject, _res, next) => {
        const matchInfo = Types.exactMatch(req[reqProperty], typeDescr);
        if (!matchInfo.matched) {
            return next(makeError(matchInfo as Types.FailedMatchInfo));
        }
        return next();
    }) as express.Handler;
}