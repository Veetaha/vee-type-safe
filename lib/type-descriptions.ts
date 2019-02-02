import { 
    BasicObject, BasicTypeName, BasicObjectMap, TypeDescription 
} from './index';
import isISODate = require('is-iso-date');

/**
 * Returns true if suspect is truthy and typeof suspect === 'object' or 'function'.
 * @param suspect Value of any type to check.
 */
export function isBasicObject(suspect: unknown) : suspect is BasicObject<unknown> {
    return Boolean(
        suspect && (typeof suspect === 'object' || typeof suspect === 'function')
    );
}

/**
 * Returns true if suspect is a string, that may be returned by application
 * of `typeof` operator (e.g. 'number', 'undefined', 'function')
 * @param suspect Value af any type to check.
 */
export function isBasicTypeName(suspect: string): suspect is BasicTypeName {
    switch (suspect) {
        case 'number':    case 'string': case 'boolean':
        case 'undefined': case 'object': case 'function':
        case 'symbol': return true;
        default:       return false;
    }
}

/**
 * Retuns `Set<TypeDescription>(['undefined', typeDescr]))`
 * @param typeDescr `TypeDescription` that will be united with `'undefined'` TD.
 */
export function optional(typeDescr: TypeDescription) {
    return new Set<TypeDescription>(['undefined', typeDescr]);
}

/**
 * Returns a predicate that accepts a suspect of any type and matches it to
 * one of the provided possible values by
 * ~~~typescript
 * possibleValues.includes(suspect)
 * ~~~
 * @param possibleValues Array with values of any type, suspect is matched to.
 */
export function isOneOf<T>(possibleValues: T[]){
    return function isOneOfTheGivenPossibleValues(suspect: any): suspect is T { 
        return possibleValues.includes(suspect);
    };
}


/**
 * Returns a `TypePredicate` that checks whether given string enum values include 
 * its suspect.
 * 
 * @param typeStringScriptEnum typescript string enumeration get values from
 * 
 * @remarks
 * Beware that this function accepts only string enums, e.g.:
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * enum UserRole {
 *      Guest    = 'guest',
 *      Standart = 'standart',
 *      Admin    = 'admin'
 * }
 * enum UserRoleNumber {
 *      Guest, Standart, Admin // implicit values: 0, 1, 2
 * }
 * 
 * Vts.mismatch({ role: 'guest' }, { role: Vts.isInEnum(UserRole) }); // ok
 * Vts.mismatch({ role: 0 }, { role: Vts.isInEnum(UserRoleNumber) }); // compile error
 * 
 * ```
 * 
 */
export function isInEnum<
    TEnum extends BasicObjectMap<keyof TEnum, string>
>(typeScriptStringEnum: TEnum) { 
    const enumValues = Object.values(typeScriptStringEnum);
    return (suspect: unknown): suspect is TEnum[keyof TEnum] => 
        typeof suspect === 'string' && enumValues.includes(suspect);
}


/**
 * Checks that suspect is a string and it conforms to ISO 8601 format.
 * @param suspect Value of unknown type to check.
 * @return True if suspect is a string containing a date in ISO 8601 format.
 * Internally uses 'is-iso-date' npm package.
 */
export function isIsoDateString(suspect: unknown): suspect is string {
    return typeof suspect === 'string' && isISODate(suspect);
}

/**
 * Returns true if `suspect` is a string of BSON object id format.
 *  
 * @param suspect - Value of unknown type to validate.
 * @remarks 
 * BSON format is the format used by MongoDB documents.
 * This function doesn't depend on any libarary at all.
 * You can safely validate id's even on the client side.
 * The `RegExp` for this fucntion was taken from ['bson'](https://www.npmjs.com/package/bson)
 * npm package.
 */
export function isBsonObjectIdString(suspect: unknown): suspect is string {
    return typeof suspect === 'string' && /^[0-9a-fA-F]{24}$/.test(suspect);
}

/**
 * Returns `true` if `suspect === null`
 */
export function isNull(suspect: unknown): suspect is null {
    return suspect === null;
}
/**
 * Returns `true` if `suspect === undefined`
 */
export function isUndefined(suspect: unknown): suspect is undefined {
    return suspect === undefined;
}

/**
 * Shorthand for `new Set<TypeDescription>([isNull, typeDescr])`
 */
export function isNullOr(typeDescr: TypeDescription) {
    return new Set<TypeDescription>([isNull, typeDescr]);
}

/**
 * Returns `true` if `suspect` is integer, i.e. doesn't have decimal part.
 */
export function isInteger(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && Number.isInteger(suspect);
}

/**
 * Returns `true` if `suspect` is integer, and `suspect > 0`
 */
export function isPositiveInteger(suspect: unknown): suspect is number {
    return isInteger(suspect) && suspect > 0;
}
/**
 * Returns `true` if `suspect` is integer, and `suspect < 0`
 */
export function isNegativeInteger(suspect: unknown): suspect is number {
    return isInteger(suspect) && suspect < 0;
}

/**
 * Returns `true` if `suspect` is number, and `suspect > 0`
 */
export function isPositiveNumber(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && suspect > 0;
}

/**
 * Returns `true` if `suspect` is number, and `suspect < 0`
 */
export function isNegativeNumber(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && suspect < 0;
}

/**
 * Returns `true` if `suspect` is integer, and `suspect >= 0`
 */
export function isZeroOrPositiveInteger(suspect: unknown): suspect is number {
    return isInteger(suspect) && suspect >= 0;
}
/**
 * Returns `true` if `suspect` is integer, and `suspect <= 0`
 */
export function isZeroOrNegativeInteger(suspect: unknown): suspect is number {
    return isInteger(suspect) && suspect <= 0;
}

/**
 * Returns `true` if `suspect` is number, and `suspect >= 0`
 */
export function isZeroOrPositiveNumber(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && suspect >= 0;
}

/**
 * Returns `true` if `suspect` is number, and `suspect <= 0`
 */
export function isZeroOrNegativeNumber(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && suspect <= 0;
}
/**
 * Returns `true` if `suspect` is number and `suspect === 0` 
 */
export function isZero(suspect: unknown): suspect is 0 {
    return suspect === 0;
}



/**
 * Returns a predicate that checks its suspect to be an integer, such that
 * `suspect !== target`.
 * @param target Number to check inequality to.
 */
export function isIntegerNotEqual(target: number) {
    return function isIntegerNotEqualToTheGivenTarget(suspect: unknown): suspect is number {
        return isInteger(suspect) && suspect !== target;
    };
}


/**
 * Returns a predicate that checks its suspect to be an integer, such that
 * `suspect <= target`.
 * @param target Number to check inequality to.
 */
export function isIntegerLessOrEq(target: number) {
    return function isIntegerLessOrEqToTheGivenTarget(suspect: unknown): suspect is number {
        return isInteger(suspect) && suspect <= target;
    };
}

/**
 * Returns a predicate that checks its suspect to be an integer, such that
 * `suspect >= target`
 * @param target Number to check inequality to.
 */
export function isIntegerGreaterOrEq(target: number) {
    return function isNumberGreaterOrEqToTheGivenTarget(suspect: unknown): suspect is number {
        return isInteger(suspect) && suspect >= target;
    };
}

/**
 * Returns a predicate that checks its suspect to be an integer, such that
 * `suspect < target`
 * @param target Number to check inequality to.
 */
export function isIntegerLessThan(target: number) {
    return function isIntegerLessThanTheGivenTarget(suspect: unknown): suspect is number {
        return isInteger(suspect) && suspect < target;
    };
}

/**
 * Returns a predicate that checks its suspect to be an integer, such that
 * `suspect > target`
 * @param target Number to check inequality to. 
 */
export function isIntegerGreaterThan(target: number) {
    return function isIntegerGreaterThanTheGivenTarget(suspect: unknown): suspect is number {
        return isInteger(suspect) && suspect > target;
    };
}


/**
 * Returns a predicate that checks its suspect to be a number, such that
 * `suspect !== target`.
 * @param target Number to check inequality to.
 */
export function isNumberNotEqual(target: number) {
    return function isNumberNotEqualToTheGivenTarget(suspect: unknown): suspect is number {
        return typeof suspect === 'number' && suspect !== target;
    };
}


/**
 * Returns a predicate that checks its suspect to be a number, such that
 * `suspect <= target`.
 * @param target Number to check inequality to.
 */
export function isNumberLessOrEq(target: number) {
    return function isNumberLessOrEqToTheGivenTarget(suspect: unknown): suspect is number {
        return typeof suspect === 'number' && suspect <= target;
    };
}

/**
 * Returns a predicate that checks its suspect to be a number, such that
 * `suspect >= target`
 * @param target Number to check inequality to.
 */
export function isNumberGreaterOrEq(target: number) {
    return function isNumberGreaterOrEqToTheGivenTarget(suspect: unknown): suspect is number {
        return typeof suspect === 'number' && suspect >= target;
    };
}

/**
 * Returns a predicate that checks its suspect to be a number, such that
 * `suspect < target`
 * @param target Number to check inequality to.
 */
export function isNumberLessThan(target: number) {
    return function isNumberLessThanTheGivenTarget(suspect: unknown): suspect is number {
        return typeof suspect === 'number' && suspect < target;
    };
}

/**
 * Returns a predicate that checks its suspect to be a number, such that
 * `suspect > target`
 * @param target Number to check inequality to. 
 */
export function isNumberGreaterThan(target: number) {
    return function isNumberGreaterThanTheGivenTarget(suspect: unknown): suspect is number {
        return typeof suspect === 'number' && suspect > target;
    };
}

/**
 * Returns a predicate which checks its suspect to be a number within the range 
 * [min, max].
 * @param min Minimum value suspect can be.
 * @param max Maximum value suspect can be.
 */
export function isNumberWithinRange(min: number, max: number) {
    return function isNumberWithinTheGivenRange(suspect: unknown): suspect is number {
        return typeof suspect === 'number' && (
        min > max                          ?
        (max <= suspect && suspect <= min) :
        (min <= suspect && suspect <= max)    );
    };
}

/**
 * Returns a predicate which checks its suspect to be an integer within the range [min, max].
 * @param min Minimum value suspect can be.
 * @param max Maximum value suspect can be.
 */
export function isIntegerWithinRange(min: number, max: number) {
    return function isIntegerWithinTheGivenRange(suspect: unknown): suspect is number { 
        return isInteger(suspect)          && (
        min > max                          ? 
        (max <= suspect && suspect <= min) :
        (min <= suspect && suspect <= max)    );
    };
}
