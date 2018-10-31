import isISODate = require('is-iso-date');

export interface BasicObject<TValue = unknown> {
    [key: string]: TValue;
}

export interface BasicFunctor<
    TArgs extends any[]  = unknown[],
    TRetval              = unknown,
    TProps               = unknown
    > extends BasicObject<TProps> {
    (...args: TArgs): TRetval;
}

export type PrimitiveType = number | string | boolean  | undefined | symbol | null;

export type BasicTypeName = 'number'    | 'string' | 'boolean'  |
                            'undefined' | 'object' | 'function' | 'symbol';

/**
 * Returns true if suspect is truthy and typeof suspect === 'object' or 'function'.
 * @param suspect Value of any type to check.
 */
export function isBasicObject(suspect: unknown) : suspect is BasicObject<unknown> {
    return Boolean(
        suspect && (typeof suspect === 'object' || typeof suspect === 'function')
    );
}

export function reinterpret<T>(target: any): T{
    return target;
}
export function typeAssert<T>(_target: any): _target is T {
    return true;
}
export function assertNever(_suspect: never) {}

export function isBasicTypeName(suspect: string): suspect is BasicTypeName {
    switch (suspect) {
        case 'number':    case 'string': case 'boolean':
        case 'undefined': case 'object': case 'function':
        case 'symbol': return true;
        default:       return false;
    }
}
export interface TypeDescrObjMap extends BasicObject<TypeDescription>
{}
export interface TypeDescrArray  extends Array<TypeDescription>
{}
export interface TypeDescrSet    extends Set<TypeDescription>
{}
export type TypePredicate   = (suspect: unknown) => boolean;
export type TypeDescription = TypeDescrObjMap | TypeDescrArray | TypePredicate |
                                 TypeDescrSet | BasicTypeName;

/**
 * Determines whether the specified suspect type satisfies the restriction of the given type
 * description (TD).
 * @type  T         Typescript type suspect is treated as, if this function returns true.
 * @param suspect   Entity of unknown type to be tested for conformance according to TD.
 * @param typeDescr If it is a basic JavaScript typename string (should satisfy typeof operator
 *                  domain definition), then function returns "typeof suspect === typeDescr".
 *
 *                  Else if it is a Set<TD>, returns true if suspect conforms to at
 *                  least one of the given TDs in Set.
 *
 *                  Else if it is an Array<TD> and it consists of one item,
 *                  returns true if suspect is Array and each of its items conforms to the given
 *                  TD at typeDescr[0].
 *
 *                  Else if it is an Array<TD> and it consists of more than one item,
 *                  returns true if suspect is Array and suspect.length === typeDescr.length
 *                  and each suspect[i] conforms to typeDescr[i] type description.
 *
 *                  Else if it is an empty Array, throws Error.
 *
 *                  Else if it is an object, returns true if suspect is an object and
 *                  each typeDescr[key] is a TD for suspect[key]. (Excess properties in suspect
 *                  do not matter).
 *
 *                  Else if it is a TypePredicate, then returns typeDescr(suspect).
 *
 *                  Else returns false.
 */
export function conforms<T = unknown>(suspect: unknown, typeDescr: TypeDescription)
    : suspect is T {
    //
    if (typeof typeDescr === 'string') {
        return typeof suspect === typeDescr;
    }
    if (typeof typeDescr === 'function') {
        return Boolean((typeDescr as TypePredicate)(suspect));
    }
    if (Array.isArray(typeDescr)) {
        if (!Array.isArray(suspect)) {
            return false;
        }
        if (!typeDescr.length) {
            return true;
        }
        if (typeDescr.length === 1) {
            return suspect.every((item: unknown) => conforms(item, typeDescr[0]));
        }
        if (typeDescr.length !== suspect.length) {
            return false;
        }
        return typeDescr.every((itemDescr, i) => conforms(suspect[i], itemDescr));
    }
    if (typeDescr instanceof Set) {
        for (const possibleTypeDescr of typeDescr) {
            if (conforms(suspect, possibleTypeDescr)) {
                return true;
            }
        }
        return false;
    }
    if (!isBasicObject(suspect) || Array.isArray(suspect)) {
        return false;
    }
    return Object.getOwnPropertyNames(typeDescr).every(propName => conforms(
        suspect[propName], typeDescr[propName]
    ));
}

export function isInteger(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && Number.isInteger(suspect);
}
export function isPositiveInteger(suspect: unknown): suspect is number {
    return isInteger(suspect) && suspect > 0;
}
export function isPositiveNumber(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && suspect > 0;
}
export function isZeroOrPositiveInteger(suspect: unknown): suspect is number {
    return isPositiveInteger(suspect) || suspect === 0;
}

export function isZeroOrPositiveNumber(suspect: unknown): suspect is number {
    return isPositiveNumber(suspect) || suspect === 0;
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
 * Checks whether suspect conforms to the given type description and returns it if yes,
 * otherwise returns the default value.
 * @param typeDescr Type description suspect may conform to, defaultVal MUST conform to this TD
 * @param suspect Value of unknown type to provide default value for
 * @param defaultVal Value that conforms to typeDescr TD that is returned by this function if !conforms(suspect, typeDescr)
 */
export function defaultIfNotConforms<T>(
    typeDescr: TypeDescription, suspect: unknown, defaultVal: T
): T {
    return conforms<T>(suspect, typeDescr) ? suspect : defaultVal;
}


export namespace Factory {
    /**
     * Returns a predicate which checks its suspect to be a number within the range [min, max].
     * @param min Minimum value suspect can be.
     * @param max Maximum value suspect can be.
     */
    export function isNumberWithinRange(min: number, max: number) {
        return (suspect: unknown): suspect is number => typeof suspect === 'number' &&
            (min > max
                ? (max <= suspect && suspect <= min)
                : (min <= suspect && suspect <= max));
    }

    /**
     * Returns a predicate which checks its suspect to be an integer within the range [min, max].
     * @param min Minimum value suspect can be.
     * @param max Maximum value suspect can be.
     */
    export function isIntegerWithinRange(min: number, max: number) {
        return (suspect: unknown): suspect is number => isInteger(suspect) &&
            (min > max
                ? (max <= suspect && suspect <= min)
                : (min <= suspect && suspect <= max));
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
        return (suspect: any): suspect is T => possibleValues.includes(suspect);
    }
}