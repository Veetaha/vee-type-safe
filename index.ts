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

export function exactlyConforms<T = unknown>(suspect: unknown, typeDescr: TypeDescription)
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
            return suspect.every((item: unknown) => exactlyConforms(item, typeDescr[0]));
        }
        if (typeDescr.length !== suspect.length) {
            return false;
        }
        return typeDescr.every((itemDescr, i) => exactlyConforms(suspect[i], itemDescr));
    }
    if (typeDescr instanceof Set) {
        for (const possibleTypeDescr of typeDescr) {
            if (exactlyConforms(suspect, possibleTypeDescr)) {
                return true;
            }
        }
        return false;
    }
    if (!isBasicObject(suspect) || Array.isArray(suspect)) {
        return false;
    }
    const susProps = Object.getOwnPropertyNames(suspect);
    const tdProps  = Object.getOwnPropertyNames(typeDescr);
    let i = susProps.length;
    return tdProps.length >= susProps.length &&
        tdProps.every(propName => {
            if (!exactlyConforms(suspect[propName], typeDescr[propName])){
                return false;
            }
            i -= Number(propName in suspect);
            return true;
        }) && !i;
}



export function isInteger(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && Number.isInteger(suspect);
}
export function isPositiveInteger(suspect: unknown): suspect is number {
    return isInteger(suspect) && suspect > 0;
}
export function isNegativeInteger(suspect: unknown): suspect is number {
    return isInteger(suspect) && suspect < 0
}
export function isPositiveNumber(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && suspect > 0;
}
export function isNegativeNumber(suspect: unknown): suspect is number {
    return typeof suspect === 'number' && suspect < 0;
}
export function isZeroOrPositiveInteger(suspect: unknown): suspect is number {
    return isPositiveInteger(suspect) || suspect === 0;
}
export function isZeroOrNegativeInteger(suspect: unknown): suspect is number {
    return isNegativeInteger(suspect) || suspect === 0;
}
export function isZeroOrPositiveNumber(suspect: unknown): suspect is number {
    return isPositiveNumber(suspect) || suspect === 0;
}
export function isZeroOrNegativeNumber(suspect: unknown): suspect is number {
    return isNegativeNumber(suspect) || suspect === 0;
}
export function isZero(suspect: unknown): suspect is 0 {
    return typeof suspect === 'number' && suspect === 0;
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



export function makeTdWithOptionalProps(typeDescr: TypeDescrObjMap) {
    return Object.getOwnPropertyNames(typeDescr)
                 .reduce((newTd, propName) => {
                        newTd[propName] = optional(typeDescr[propName]);
                        return newTd;
                     },
                     {} as TypeDescrObjMap
                 );
}


/**
 * A shorthand for `conforms(suspect, new Set<TypeDescription>('undefined', typeDescr))`
 * @param typeDescr
 */
export function optional<T>(typeDescr: TypeDescription) {
    return (suspect: unknown): suspect is T =>  typeof suspect === 'undefined' ||
                                                conforms(suspect, typeDescr);
}

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

interface FailedMatchArgument {
    path:        string[], 
    expectedTd:  TypeDescription, 
    actualValue: unknown
}

export class MatchInfo {
    path?:        string[];
    expectedTd?:  TypeDescription;
    actualValue?: unknown;

    get matched() { return !this.path; }
    constructor(failure?: FailedMatchArgument) { 
        if (failure) {
            this.path        = failure.path;
            this.expectedTd  = failure.expectedTd;
            this.actualValue = failure.actualValue;
        }
    }

    private static isJsIdentifier(suspect: string) {
        return /^[\w$_][\w\d$_]*$/.test(suspect);
    }
    
    pathString() {
        return !this.path ? 'root' : this.path.reduce((result, currentPart) =>  
            result                                +
            MatchInfo.isJsIdentifier(currentPart) ?
            `.${currentPart}`                     :
            Number.isNaN(+currentPart)            ? 
            `['${currentPart}']`                  :
            `[${+currentPart}]`
        , 'root');
    }
    toErrorString() {
        if (!this.matched) {
            return '';
        }
        try {
            return `Value (${JSON.stringify(this.actualValue)}) at path '${
                    this.pathString()
                }' doesn't conform to the given type description (\n${
                    stringifyTd(this.expectedTd!)
                })`
        } catch (err) {
            return `Value at path '${
                this.pathString()
            }' doesn't conform to the given type description (\n${
                stringifyTd(this.expectedTd!)
            })`
        }
    }
}
export type FailedMatchInfo = Required<MatchInfo>;

export class ExactMatchInfo extends MatchInfo {
    constructor(failedMatchArgument?: FailedMatchArgument){
        super(failedMatchArgument);
    }
    toErrorString() {
        if (!this.matched) {
            return '';
        }
        try {
            return `Value (${JSON.stringify(this.actualValue)}) at path '${
                    this.pathString()
                }' doesn't exactly conform to the given type description (\n${
                    stringifyTd(this.expectedTd!)
                })`
        } catch (err) {
            return `Value at path '${
                this.pathString()
            }' doesn't exactly conform to the given type description (\n${
                stringifyTd(this.expectedTd!)
            })`
        }
    }
}


class TypeMatcher {
    private static readonly TrueMatch = new MatchInfo;

    protected currentPath: string[] = [];

    protected falseMatch(actualValue: unknown, expectedTd: TypeDescription) {
        return new MatchInfo({ actualValue, expectedTd, path: this.currentPath });
    }

    protected trueMatch() {
        return TypeMatcher.TrueMatch;
    }

    protected matchArray(
        suspect: unknown[], 
        getTd: (index: number) => TypeDescription
    ) {
        for (let i = 0; i < suspect.length; ++i) {
            this.currentPath.push(String(i));
            const result = this.match(suspect[i], getTd(i));
            if (!result.matched) {
                return result
            }
            this.currentPath.pop();
        }
        return this.trueMatch();
    }

    protected matchSet(suspect: unknown, typeDescr: TypeDescrSet) {
        for (const possibleTypeDescr of typeDescr) {
            const matchRes = this.match(suspect, possibleTypeDescr)
            if (!matchRes.matched) {
                return matchRes;
            }
        }
        return this.trueMatch();
    }

    protected matchObject(suspect: BasicObject, typeDescr: TypeDescrObjMap) {
        for (const propName of Object.getOwnPropertyNames(typeDescr)) {
            this.currentPath.push(propName);
            const matchRes = this.match(suspect[propName], typeDescr[propName]);
            if (!matchRes.matched) {
                return matchRes;
            }
            this.currentPath.pop();
        }
        return this.trueMatch();
    }
    match(suspect: unknown, typeDescr: TypeDescription): MatchInfo {
        if (typeof typeDescr === 'string') {
            return typeof suspect === typeDescr ?
                this.trueMatch() : this.falseMatch(suspect, typeDescr);
        }
        if (typeof typeDescr === 'function') {
            return (typeDescr as TypePredicate)(suspect) ?
                this.trueMatch() : this.falseMatch(suspect, typeDescr);
        }
        if (Array.isArray(typeDescr)) {
            if (!Array.isArray(suspect)) {
                return this.falseMatch(suspect, typeDescr);
            }
            if (!typeDescr.length) {
                return this.trueMatch();
            }
            if (typeDescr.length === 1) {
                return this.matchArray(suspect, () => typeDescr[0]);
            }
            return typeDescr.length !== suspect.length ?
                   this.falseMatch(suspect, typeDescr) :
                   this.matchArray(suspect, i => typeDescr[i]);
        }
        if (typeDescr instanceof Set) {
            return this.matchSet(suspect, typeDescr);
        }
        if (!isBasicObject(suspect) || Array.isArray(suspect)) {
            return this.falseMatch(suspect, typeDescr);
        }
        return this.matchObject(suspect, typeDescr);
    }

}

class ExactTypeMatcher extends TypeMatcher {
    private static readonly TrueExactMatch = new ExactMatchInfo;

    protected matchObject(suspect: BasicObject, typeDescr: TypeDescrObjMap) {
        const susProps = Object.getOwnPropertyNames(suspect);
        const tdProps  = Object.getOwnPropertyNames(typeDescr);
        let i = susProps.length;
        if (tdProps.length < susProps.length) {
            return this.falseMatch(suspect, typeDescr);
        };
        for (const propName of tdProps) {
            this.currentPath.push(propName);
            const matchRes = this.match(undefined, typeDescr[propName]);
            if (!matchRes.matched) {
                return matchRes;
            }
            i -= Number(propName in suspect);
            this.currentPath.pop();
        }
        return i ? this.falseMatch(suspect, typeDescr) : this.trueMatch();
    }
    protected trueMatch() {
        return ExactTypeMatcher.TrueExactMatch;
    }
    protected falseMatch(actualValue: unknown, expectedTd: TypeDescription) {
        return new ExactMatchInfo({ 
            actualValue, 
            expectedTd,
            path: this.currentPath
        });
    }

}

export function match(
    suspect: unknown, 
    typeDescr: TypeDescription
): MatchInfo {
    return (new TypeMatcher).match(suspect, typeDescr);
}

export function exactMatch(
    suspect: unknown, 
    typeDescr: TypeDescription
): MatchInfo {
    return (new ExactTypeMatcher).match(suspect, typeDescr);
}

export function stringifyTd(typeDescr: TypeDescription): string {
    return !isBasicObject(typeDescr)            ? 
            typeDescr                           : 
            typeDescr instanceof Function       ?
            `<${typeDescr.name}>`               :
            typeDescr instanceof Set            ?
            [...typeDescr.values()].map(stringifyTd).join(' | ') :
            JSON.stringify(typeDescr, (_key, value: TypeDescription) => 
                stringifyTd(value)
            );
}