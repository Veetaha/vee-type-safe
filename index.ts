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
    return isInteger(suspect) && suspect < 0;
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
    return function optional_value(suspect: unknown): suspect is T {
        return typeof suspect === 'undefined' || conforms(suspect, typeDescr);
    };
}

/**
 * Returns a predicate which checks its suspect to be a number within the range [min, max].
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

export type PathArray = (string | number)[];

interface FailedMatchArgument {
    path:        PathArray;
    expectedTd:  TypeDescription;
    actualValue: unknown;
}

export class MatchInfo {
    path?:        PathArray;
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
        return /^[a-zA-Z$_][\w\d$_]*$/.test(suspect);
    }
    
    pathString() {
        return !this.path ? '' : this.path.reduce((result, currentPart) => {
            if (typeof currentPart === 'string') {
                return result + (MatchInfo.isJsIdentifier(currentPart) ? 
                        `.${currentPart}` : `['${currentPart}']`
                       );
            }
            return `${result}[${currentPart}]`;
        }, 'root');
    }
    toErrorString() {
        if (this.matched) {
            return '';
        }
        try {
            return `Value (${JSON.stringify(this.actualValue)}) at '${
                    this.pathString()
                }' doesn't conform to the given type description (${
                    stringifyTd(this.expectedTd!)
                })`;
        } catch (err) {
            return `value at '${
                this.pathString()
            }' doesn't conform to the given type description (${
                stringifyTd(this.expectedTd!)
            })`;
        }
    }
}
export type FailedMatchInfo = Required<MatchInfo>;

export class ExactMatchInfo extends MatchInfo {
    constructor(failedMatchArgument?: FailedMatchArgument){
        super(failedMatchArgument);
    }
    toErrorString() {
        if (this.matched) {
            return '';
        }
        try {
            return `value (${JSON.stringify(this.actualValue)}) at '${
                this.pathString()
            }' doesn't exactly conform to the given type description (${
                stringifyTd(this.expectedTd!)
            })`;
        } catch (err) {
            return `value at '${
                this.pathString()
            }' doesn't exactly conform to the given type description (${
                stringifyTd(this.expectedTd!)
            })`;
        }
    }
}


class TypeMatcher {
    private static readonly TrueMatch = new MatchInfo;

    protected currentPath: (string | number)[] = [];


    // tslint:disable-next-line:prefer-function-over-method
    protected trueMatch() {
        return TypeMatcher.TrueMatch;
    }
    protected falseMatch(actualValue: unknown, expectedTd: TypeDescription) {
        return new MatchInfo({ 
            actualValue, 
            expectedTd, 
            path: [ ...this.currentPath ] 
        });
    }

    protected matchArray(
        suspect: unknown[], 
        getTd: (index: number) => TypeDescription
    ) {
        for (let i = 0; i < suspect.length; ++i) {
            this.currentPath.push(i);
            const result = this.match(suspect[i], getTd(i));
            this.currentPath.pop();
            if (!result.matched) {
                return result;
            }
        }
        return this.trueMatch();
    }

    protected matchSet(suspect: unknown, typeDescr: TypeDescrSet) {
        for (const possibleTypeDescr of typeDescr) {
            const matchRes = this.match(suspect, possibleTypeDescr);
            if (matchRes.matched) {
                return matchRes;
            }
        }
        return this.falseMatch(suspect, typeDescr);
    }

    protected matchObject(suspect: BasicObject, typeDescr: TypeDescrObjMap) {
        for (const propName of Object.getOwnPropertyNames(typeDescr)) {
            this.currentPath.push(propName);
            const matchRes = this.match(suspect[propName], typeDescr[propName]);
            this.currentPath.pop();
            if (!matchRes.matched) {
                return matchRes;
            }
        }
        return this.trueMatch();
    }
    match(suspect: unknown, typeDescr: TypeDescription): MatchInfo {
        if (typeof typeDescr === 'string') {
            return typeof suspect === typeDescr ?
                this.trueMatch() : this.falseMatch(suspect, typeDescr);
        }
        if (typeof typeDescr === 'function') {
            return typeDescr(suspect) ?
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
        if (tdProps.length < susProps.length) {
            return this.falseMatch(suspect, typeDescr);
        }
        let i = susProps.length;
        for (const propName of tdProps) {
            this.currentPath.push(propName);
            const matchRes = this.match(suspect[propName], typeDescr[propName]);
            this.currentPath.pop();
            if (!matchRes.matched) {
                return matchRes;
            }
            i -= Number(propName in suspect);
        }
        return i ? this.falseMatch(suspect, typeDescr) : this.trueMatch();
    }
    // tslint:disable-next-line:prefer-function-over-method
    protected trueMatch() {
        return ExactTypeMatcher.TrueExactMatch;
    }
    protected falseMatch(actualValue: unknown, expectedTd: TypeDescription) {
        return new ExactMatchInfo({ 
            actualValue, 
            expectedTd,
            path: [ ...this.currentPath ]
        });
    }

}

export class TypeMismatchError extends Error {
    constructor(public typeMismatch: FailedMatchInfo
    ) { 
        super(typeMismatch.toErrorString());
    }
}

export function match(suspect: unknown, typeDescr: TypeDescription) {
    return (new TypeMatcher).match(suspect, typeDescr);
}

export function exactlyMatch(suspect: unknown, typeDescr: TypeDescription) {
    return (new ExactTypeMatcher).match(suspect, typeDescr);
}

export function tryMatch(suspect: unknown, typeDescr: TypeDescription) {
    const matched = match(suspect, typeDescr);
    if (!matched.matched) {
        throw new TypeMismatchError(matched as FailedMatchInfo);
    }
}

export function tryExactlyMatch(suspect: unknown, typeDescr: TypeDescription) {
    const matched = exactlyMatch(suspect, typeDescr);
    if (!matched.matched) {
        throw new TypeMismatchError(matched as FailedMatchInfo);
    }
}

function stringifyTd(typeDescr: TypeDescription): string  {
    return stringifyTdImpl(typeDescr).replace(/\\n|\\"|"/g, substr => substr === '\\n' ? '\n' : '');
}

function stringifyTdImpl(typeDescr: TypeDescription): string {
    return !isBasicObject(typeDescr)            ? 
            typeDescr                           : 
            typeDescr instanceof Function       ?
            `<${typeDescr.name}>`               :
            typeDescr instanceof Set            ?
            [...typeDescr.values()].map(stringifyTd).join(' | ') :
            JSON.stringify(typeDescr, (_key, value: TypeDescription) => 
                value instanceof Function || 
                value instanceof Set       ? 
                stringifyTdImpl(value)     :
                value
            , 4);
}

export type PropNamesArray<TObject extends BasicObject> = (keyof TObject)[];
export type Take<
    TSourceObject extends BasicObject, 
    TPropNames    extends PropNamesArray<TSourceObject>
> = { 
    [TProperty in TPropNames[number]]: TSourceObject[TProperty];
};

/**
 * Takes given properties from the object and returns them as a new object.
 *  
 * @param sourceObject - Source object to take data from.
 * @param propertyNames - Array of property names to include to the returend object.
 * @returns New object that is a shallow copy of `sourceObject` 
 * with the properties given as `propertyNames` array.
 *
 * @remarks This function will be useful when serializing
 * your objects as data holders using generic JSON.stringify() and you
 * don't want any excess properties to be exposed to the serialized 
 * representation.
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * const userDocument = {
 *     _id: 'someid85',
 *     name: 'Kuzya',
 *     secretInfo: 42
 * };
 * JSON.stringify(userDocument); 
 * // {_id:"someid85",name:"Kuzya",secretInfo:42}
 * JSON.stringify(take(userDocument, ['_id', 'name']));
 * // {_id:"someid85",name:"Kuzya"}
 * ```
 */
export function take<
    TSourceObject extends BasicObject<any>, 
    TPropNames    extends PropNamesArray<TSourceObject>
>(
    sourceObject: TSourceObject, propertyNames: TPropNames
): Take<TSourceObject, TPropNames> {
    return propertyNames.reduce((newObject, propertyName) => {
        newObject[propertyName] = sourceObject[propertyName];
        return newObject;
    }, {} as Take<TSourceObject, TPropNames>);
}

export type MappedObject<TSourceObject extends BasicObject<any>, MappedValue> = {
    [TSourceObjectKey in keyof TSourceObject]: MappedValue;
};



/**
 * The same as `take(sourceObject, Object.getOwnPropertyNames(keysObject))`,
 * but with stronger typing.
 */
export function takeFromKeys<
    TKeysObject   extends BasicObject<any>,
    TSourceObject extends MappedObject<TKeysObject, any>
>(sourceObject: TSourceObject, keysObj: TKeysObject) {
    return take(
        sourceObject, 
        Object.getOwnPropertyNames(keysObj) as PropNamesArray<TKeysObject>
    );
}