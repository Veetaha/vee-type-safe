import { isBasicObject, optional } from './type-descriptions';
import { 
    BasicObject,  
    BasicObjectMap, 
    MismatchInfoData, 
    PathArray, 
    Maybe,  
    PropNamesArray, 
    Take, 
    MappedObject 
} from './types';
import { 
    TypeDescription, 
    TypeDescrObject, 
    TypeDescrSet, 
    TypeDescriptionTarget
} from './type-description-types';
export * from './type-descriptions';
export * from './types';
export * from './type-description-types';


/**
 * C++ style operator, a syntactic sugar for writing casts like 
 * `value as any as T` when a simple `value as T` cast cannot be performed. 
 * Use it with caution! 
 * 
 * @remarks 
 * This function is actually noop at runtime, all it does, it suppresses 
 * 'inability to cast' tsc error. It's better to use this function rather than
 * `value as any as T` cast, because it amplifies your attention to such uneven
 * places in code and it may be easier to do a Ctrl + F search for these.
 * 
 * @param target value to cast by any means to T.
 */
export function reinterpret<T>(target: any): T {
    return target;
}
/**
 * TypeScript type guard that always returns true.
 * 
 * @remarks 
 * You may use it in an if statement to assert the proper type in the 
 * following code execution path.
 * 
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * const enum SomeEnum {
 *     A = 0, B, C
 * }
 * const numb: number = 2;
 * if (!Vts.typeAssert<SomeEnum>(numb)) { return; }
 * numb; // deduced type is SomeEnum
 * ```  
 * 
 * @param _target Target value, to make type assertion of.
 */
export function typeAssert<T>(_target: any): _target is T {
    return true;
}

/**
 * This function is no-op, but it is useful to check whether 
 * you have handled all the cases and some code path is unreachable. 
 * 
 * @remarks
 * TypeScript compiler will issue an error if you forward a value 
 * not of never type to this function.
 * 
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * const enum Enum {
 *     A, B, C
 * }
 * function fn(en: Enum) {
 *     switch (en) {
 *         case Enum.A: {  return; }
 *         case Enum.B: {  return; }
 *         default: {
 *             Vts.assertNever(en); // compile Error, en is of type Enum.C
 *         }
 *     }
 * }
 * //-------------
 * const num = 23;
 * if (typeof num !== 'number'){
 *     Vts.assertNever(num); // no error, this code is unreachable
 *     // num is of type never here
 * }
 * ```
 * 
 * @param _suspect 
 */
export function assertNever(_suspect: never) {}

/**
 * Determines whether the specified suspect type satisfies the restriction of the given type
 * description (TD).
 * @param TTarget   Typescript type suspect is treated as, if this function returns true.
 * @param suspect   Entity of unknown type to be tested for conformance according to TD.
 * @param typeDescr If it is a basic JavaScript typename string (should satisfy typeof operator
 *                  domain definition), then function returns `typeof suspect === typeDescr`.
 *                  If it is a `RegExp`, then returns
 *                  `typeof suspect === 'string' && typeDescr.test(suspect)`.
 *                  Else if it is a Set<TD>, returns true if suspect conforms to at
 *                  least one of the given TDs in Set.
 *                  Else if it is an Array<TD> and it consists of one item,
 *                  returns true if suspect is Array and each of its items conforms to the given
 *                  TD at typeDescr[0].
 *                  Else if it is an Array<TD> and it consists of more than one item,
 *                  returns true if suspect is Array and suspect.length === typeDescr.length
 *                  and each suspect[i] conforms to typeDescr[i] type description.
 *                  Else if it is an empty Array, returns true if suspet is Array of any type.
 *                  Else if it is an object, returns true if suspect is an object and
 *                  each typeDescr[key] is a TD for suspect[key]. (Excess properties in suspect
 *                  do not matter).
 *                  Else if it is a TypePredicate, then returns typeDescr(suspect).
 *                  Else returns false.
 * @remarks
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * 
 * Vts.conforms(
 * {
 *        prop: 'lala',
 *        tel:  '8800-555-35-35'
 *        prop2: true,
 *        obj: {
 *            obj: [23, false]
 *        },
 *        someIDontCareProperty: null // excess properties are ok
 * },
 * {
 *        prop: 'string',
 *        tel:  /\d{4}-\d{3}-\d{2}-\d{2}/, // claims a string of given format
 *        prop2: 'boolean',
 *        obj: {
 *            obj: ['number', 'boolean'] // claims a fixed length tuple
 *        }
 * }); // true
 * 
 * Vts.conforms(
 * {
 *      arr: ['array', null, 'of any type', 8888 ],
 *      strArr: ['Pinkie', 'Promise', 'some', 'strings'],
 *      oneOf: 2,
 *      custom: 43
 * }, 
 * {
 *      arr: [],                              // claims an array of any type
 *      strArr: ['string'],                   // claims an array of any length
 *      oneOf: new Set(['boolean', 'number']),// claims to be one of these types
 *      custom: isOddNumber                   // custom type predicate function
 * }); // true
 * 
 * function isOddNumber(suspect: unknown): suspect is number {
 *     return typeof suspect === 'number' && suspect % 2;
 * }  
 * 
 * // Type argument:
 * interface Human {
 *     name: string;
 *     id:   number;
 * }
 * const HumanTD: Vts.TypeDescription<Human>  = {
 *     name: 'string',  // using Vts.TypeDescription<T> gives you better typing
 *     id:   'number'
 * };
 * function tryUseHuman(maybeHuman: unknown) {
 *     if (conforms<Human>(maybeHuman, HumanTD)) {
 *         // maybeHuman is of type Human here
 *         maybeHuman.name;
 *         maybeHuman.id;
 *     }
 * }
 * 
 * ```
 */
export function conforms
<TTypeDescr extends TypeDescription>
(suspect: unknown, typeDescr: TTypeDescr): suspect is TypeDescriptionTarget<TTypeDescr> {
    return !duckMismatch(suspect, typeDescr);
}

/**
 * 
 * Same as `conforms()`, but returns false for suspect object that has 
 * excess properties (those, that are not present in type description object).
 * 
 * @param T         Typescript type suspect is treated as, if this function returns true.
 * @param suspect   Entity of unknown type to be tested for conformance according to TD.
 * @param typeDescr `TypeDescription` that describes limitations that must be
 *                  applied to `suspect` to pass the match (see `conforms()` for
 *                  more info about the structure of `TypeDescription`).
 * 
 * @remarks
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * Vts.conforms(23, 'number') === Vts.exactlyConforms(23, 'number');
 * const suspect = {
 *     listedInt: 7,
 *     listedStr: 'readme',
 *     unlistedProp: ['some', 'excess', 'prop', 'value']
 * }
 * // notice that if you had used Vts.TypeDescription<typeof suspect> type here,
 * // you would have got error squiggles, that td lacks 'unlistedProp' property.
 * const td: Vts.TypeDescription = {
 *     listedInt: Vts.isPositiveInteger,
 *     listedStr: 'string'
 * }
 * Vts.conforms(suspect, td) === true;
 * Vts.exactlyConforms(suspect, td) === false;
 * ```
 */
export function exactlyConforms
<TTypeDescr extends TypeDescription>
(suspect: unknown, typeDescr: TTypeDescr): suspect is TypeDescriptionTarget<TTypeDescr> {
    return !mismatch(suspect, typeDescr);
}

/**
 * 
 * Checks whether suspect conforms to the given type description and returns it if yes,
 * otherwise returns the default value.
 * @param T          Type of `defaultVal` and the type described by `typeDescr`
 * @param typeDescr  Type description suspect may conform to, 
 *                   `defaultVal` MUST conform to this TD.
 * @param suspect    Value of unknown type to provide default value for.
 * @param defaultVal Value that conforms to `typeDescr` TD that is 
 *                   returned by this function if `!conforms(suspect, typeDescr)`.
 */
export function defaultIfNotConforms<TTarget> 
(typeDescr: TypeDescription<TTarget>, suspect: unknown, defaultVal: TTarget): TTarget {
    return conforms(suspect, typeDescr) ? suspect as TTarget : defaultVal;
}

/**
 * Returns a new `TypeDescrObjMap` (which is assignable to `TypeDescription`) 
 * object that is composed of `typeDescr` properties wrapped as
 * ```ts
 *  result[propName] = optional(typeDescr[propName])
 * ```
 * for each propName in `typeDescr` own property names.
 *  
 * @param TTD       Type of TD object, i.e an object with values of `TypeDescription` type.
 * @param typeDescr Object to make new `TypeDescrObjMap` 
 *                  with all optional properties from.
 */
export function makeTdWithOptionalProps<TTD extends TypeDescrObject>(
    typeDescr: TTD
): BasicObjectMap<keyof TTD, ReturnType<typeof optional>> {
    return Object
        .getOwnPropertyNames(typeDescr)
            .reduce((newTd, propName) => {
                    newTd[propName] = optional(typeDescr[propName]);
                    return newTd;
                },
                {} as { [TKey in keyof TTD]: Set<'undefined' | TTD[TKey]>; }
            );
}

/**
 * Represents the result of running `mismatch(suspect, typeDescr)` or 
 * `duckMismatch(suspect, typeDescr)` functions. 
 * 
 * @remarks
 * It contains information about why suspect doesn't conform to 
 * the given `typeDescr`: the actual value, expected type description and 
 * a property path to unexpected value type.
 */
export class MismatchInfo implements MismatchInfoData {
    /**
     *  An array of numbers and strings which defines a path to suspect's 
     *  invalid `actualValue`. 
     *  @remarks
     *  E.g. if suspect.foo.bar[3][5] failed to match to the `expectedTd`, 
     *  then path would be `[ 'foo', 'bar', 3, 5 ]`.
     */
    path: PathArray;
    /**
     * TypeDescription that `actualValue` was expected to conform to.
     */
    expectedTd: TypeDescription;
    /**
     * Value that failed to conform to the `expectedTd`.
     */
    actualValue: unknown;

    /**
     * Creates an instance of MismatchInfo, takes on object with data properties.
     * You will never used it, it is used only internally.
     * @param mismatchData Object which contains data about type mismatch.
     */
    constructor(mismatchData: MismatchInfoData) { 
        this.path        = mismatchData.path;
        this.expectedTd  = mismatchData.expectedTd;
        this.actualValue = mismatchData.actualValue;
    }

    private static isJsIdentifier(suspect: string) {
        return /^[a-zA-Z$_][\w\d$_]*$/.test(suspect);
    }

    /**
     * Returns path converted to a human readable JavaScript 
     * property access notation string if match was failed. 
     * Returned string begins with the 'root' as the root object to access 
     * the properties.
     * 
     * @remarks
     * ```ts
     * import * as Vts from 'vee-type-safe';
     * const mismatchInfo = Vts.mismatch(
     *     {
     *         foo: {
     *             bar: {
     *                 'twenty two': [
     *                     { prop: 'str' }, 
     *                     { prop: -23 }
     *                 ]
     *             }
     *         }
     *     },
     *     { foo: { bar: { 'twenty two': [ { prop: 'string' } ] } } }
     * );
     * 
     * mismatchInfo.pathString() === `root.foo.bar['twenty two'][1].prop`;
     * ```
     */
    pathString() {
        return this.path.reduce((result, currentPart) => 
            `${result}${
                typeof currentPart === 'string'                    ? (
                MismatchInfo.isJsIdentifier(String(currentPart)) ? 
                `.${currentPart}`                                : 
                `['${currentPart}']`                               ) :
                `[${currentPart}]`
            }`, 
            'root'
        );
    }

    /**
     * 
     * Returns a string of form:
     * "value (JSON.stringify(actualValue)) at path 'pathString()' doesn't 
     *  exactly conform to the given type description (stringifyTd(expectedTd))"
     * 
     * @remarks
     * If `JSON.stringify(actualValue)` throws an error, it is excluded 
     * from the returned string.
     */
    toErrorString() {
        let valueRepr: Maybe<string>;
        try { valueRepr = JSON.stringify(this.actualValue); } 
        finally {}

        return `value${valueRepr ? ` (${valueRepr})` : ''} at '${
            this.pathString()
        }' doesn't exactly conform to the given type description (${
            stringifyTd(this.expectedTd)
        })`;
    }
}

/**
 * @deprecated Use just class MismatchInfo
 */
export class FailedMatchInfo extends MismatchInfo {
    get matched() { return false; }

    constructor(failedMatch: MismatchInfoData) {
        super(failedMatch);
    }
}


/**
 * Inherits MismatchInfo and only overrides toErrorString() method.
 */
export class DuckMismatchInfo extends MismatchInfo {
    constructor(mismatchData: MismatchInfoData){
        super(mismatchData);
    }
    /**
     * @override
     */
    toErrorString() {
        let valueRepr: Maybe<string>;
        try { valueRepr = JSON.stringify(this.actualValue); } 
        finally {}
        
        return `value${valueRepr ? ` (${valueRepr})` : ''} at '${
            this.pathString()
        }' doesn't conform to the given type description (${
            stringifyTd(this.expectedTd)
        })`;
    }
}

/**
 * For internal use only.
 */
class Mismatcher {
    protected currentPath: (string | number)[] = [];

    // tslint:disable-next-line:prefer-function-over-method
    protected trueMatch() {
        return null;
    }
    protected falseMatch(actualValue: unknown, expectedTd: TypeDescription) {
        return new MismatchInfo({ 
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
            const mismatchInfo = this.mismatch(suspect[i], getTd(i));
            this.currentPath.pop();
            if (mismatchInfo) {
                return mismatchInfo;
            }
        }
        return this.trueMatch();
    }

    protected matchSet(suspect: unknown, typeDescr: TypeDescrSet) {
        for (const possibleTypeDescr of typeDescr) {
            const mismatchInfo = this.mismatch(suspect, possibleTypeDescr);
            if (!mismatchInfo) {
                return mismatchInfo;
            }
        }
        return this.falseMatch(suspect, typeDescr);
    }

    protected matchObject(suspect: BasicObject, typeDescr: TypeDescrObject) {
        const susProps = Object.getOwnPropertyNames(suspect);
        const tdProps  = Object.getOwnPropertyNames(typeDescr);
        if (tdProps.length < susProps.length) {
            return this.falseMatch(suspect, typeDescr);
        }
        let i = susProps.length;
        for (const propName of tdProps) {
            this.currentPath.push(propName);
            const mismatchInfo = this.mismatch(suspect[propName], typeDescr[propName]);
            this.currentPath.pop();
            if (mismatchInfo) {
                return mismatchInfo;
            }
            i -= Number(propName in suspect);
        }
        return i ? this.falseMatch(suspect, typeDescr) : this.trueMatch();
    }

    mismatch(suspect: unknown, typeDescr: TypeDescription): null | MismatchInfo {
        if (typeof typeDescr === 'string') {
            return typeof suspect === typeDescr ?
                this.trueMatch() : this.falseMatch(suspect, typeDescr);
        }
        if (typeof typeDescr === 'function') {
            return typeDescr(suspect) ?
                this.trueMatch() : this.falseMatch(suspect, typeDescr);
        }
        if (typeDescr instanceof RegExp) {
            return typeof suspect === 'string' && typeDescr.test(suspect) ?
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
/**
 * For internal use only.
 */
class DuckMismatcher extends Mismatcher {
    /**
     * @override
     */
    protected matchObject(suspect: BasicObject, typeDescr: TypeDescrObject) {
        for (const propName of Object.getOwnPropertyNames(typeDescr)) {
            this.currentPath.push(propName);
            const mismatchInfo = this.mismatch(suspect[propName], typeDescr[propName]);
            this.currentPath.pop();
            if (mismatchInfo) {
                return mismatchInfo;
            }
        }
        return this.trueMatch();
    }
    /**
     * @override
     */
    protected falseMatch(actualValue: unknown, expectedTd: TypeDescription) {
        return new DuckMismatchInfo({ 
            actualValue, 
            expectedTd,
            path: [ ...this.currentPath ]
        });
    }

}
/**
 * Represents an error risen by type mismatch inconsistency.
 * Stores `MismatchInfo` that rose this error.
 */
export class TypeMismatchError extends Error {
    /**
     * Contains information about occured type mismatch.
     */
    typeMismatch: MismatchInfo;
    /**
     * Instantiates TypeMismatchError with the given `MismatchInfo` data.
     * @param typeMismatch `MismatchInfo` that describes an errored type.
     */
    constructor(typeMismatch: MismatchInfo) { 
        super(typeMismatch.toErrorString());
        this.typeMismatch = typeMismatch;
    }
}

/**
 * Same as `mismatch(suspect, typeDescr)` but allows `suspect` object with 
 * excess properties to pass the match.
 *
 * @param suspect   Value of `unknown` type to be tested for conformance to `typeDescr`.
 * @param typeDescr `TypeDescription` that describes limitations that must be
 *                  applied to `suspect` to pass the match (see `conforms()` for
 *                  more info about the structure of `TypeDescription`).
 * 
 * @remarks
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * 
 * Vts.duckMismatch(
 *     { name: 'Ihor', somePropertyIDontCareAbout: 42 },
 *     { name: 'string' }
 * ); // returns null as suspect is allowed to have excess properties
 * 
 * const untrustedJson = {
 *     client: 'John Doe',
 *     walletNumber: null,
 * };
 * const ExpectedJsonTD: Vts.TypeDescription<typeof untrustedJson> = {
 *     client: 'string',
 *     walletNumber: /\d{16}/ // implies a string of the given format
 * };
 *  
 * const mismatchInfo = Vts.duckMismatch(untrustedJson, ExpectedJsonTD);
 * if (mismatchInfo) {
 *     throw new Vts.TypeMismatchError(mismatchInfo);
 * }
 * // or you could use `Vts.ensureDuckMatch(untrustedJson, ExpectedJsonTD)`
 * // which does the same thing.
 * // ...
 * // process validated client here
 * ```
 */
export function duckMismatch(suspect: unknown, typeDescr: TypeDescription) {
    return (new DuckMismatcher).mismatch(suspect, typeDescr);
}

/**
 * Returns a `MismatchInfo` object that stores an information about type 
 * incompatability for the given `typeDescr`. 
 * 
 * @param suspect   Value of `unknown` type to be tested for conformance to `typeDescr`.
 * @param typeDescr `TypeDescription` that describes limitations that must be
 *                  applied to `suspect` to pass the match (see `conforms()` for
 *                  more info about the structure of `TypeDescription`).
 * 
 * @remarks
 * `MismatchInfo` stores information about why and where 
 * `suspect`'s invalid property is. If `exactlyConforms(suspect, typeDescr)` 
 * this function returns `null`. This is a powerful tool to generate useful 
 * error messages while validating value shape type. 
 * Note: this function doesn't let pass the match for `suspect` that has 
 * properties not listed in `typeDescr` which differentiates it 
 * from `duckMismatch()`.
 * ```ts
 *   import * as Vts from 'vee-type-safe';
 *   const untrustedJson = {}; // some value
 *   const ExpectedJsonTD: Vts.TypeDescription = {}; //some type description
 *   const dbDocument = {}; // some NoSQL database document
 *
 *   const mismatchInfo = Vts.mismatch(untrustedJson, ExpectedJsonTD);
 *   if (mismatchInfo) {
 *       console.log(
 *           mismatchInfo.path,
 *           mismatchInfo.actualValue,
 *           mismatchInfo.expectedTd
 *       );
 *       // logs human readable path to invalid property
 *       console.log(mismatchInfo.pathString());
 *
 *       // `mismatchInfo.toErrorString()` generates human readable error message
 *       throw new Vts.TypeMismatchError(mismatchInfo);
 *   }
 *   // now you may safely assign untrustedJson to dbDocument:
 *   dbDocument = Object.assign(dbDocument, untrustedJson);
 * ```
 */
export function mismatch(suspect: unknown, typeDescr: TypeDescription) {
    return (new Mismatcher).mismatch(suspect, typeDescr);
    
}

/**
 * This function returns nothing. It throws `TypeMismatchError` if its `suspect`
 * failed to match to the given `typeDescr` by executing 
 * `duckMismatch(suspect, typeDescr)`.
 * @param suspect 
 * @param typeDescr 
 */
export function ensureDuckMatch(suspect: unknown, typeDescr: TypeDescription) {
    const mismatchInfo = duckMismatch(suspect, typeDescr);
    if (mismatchInfo) {
        throw new TypeMismatchError(mismatchInfo);
    }
}

/**
 * This function returns nothing. It throws `TypeMismatchError` if its `suspect`
 * failed to match to the given `typeDescr` by executing 
 * `mismatch(suspect, typeDescr)`.
 * @param suspect 
 * @param typeDescr 
 */
export function ensureMatch(suspect: unknown, typeDescr: TypeDescription) {
    const mismatchInfo = mismatch(suspect, typeDescr);
    if (mismatchInfo) {
        throw new TypeMismatchError(mismatchInfo);
    }
}

/**
 * For internal use only
 */
function stringifyTd(typeDescr: TypeDescription): string  {
    return stringifyTdImpl(typeDescr).replace(/\\n|\\"|"/g, substr => substr === '\\n' ? '\n' : '');
}

/**
 * For internal use only
 */
function stringifyTdImpl(typeDescr: TypeDescription): string {
    return !isBasicObject(typeDescr)            ? 
            typeDescr                           : 
            typeDescr instanceof Function       ?
            `<${typeDescr.name}>`               :
            typeDescr instanceof Set            ?
            [...typeDescr.values()].map(stringifyTd).join(' | ') :
            typeDescr instanceof RegExp         ?
            `/${typeDescr.source}/`             :
            JSON.stringify(typeDescr, (_key, value: TypeDescription) => 
                value instanceof Function || 
                value instanceof Set      ||
                value instanceof RegExp   ? 
                stringifyTdImpl(value)    :
                value
            , 4);
}


/**
 * Takes given properties from the object and returns them as a new object.
 *  
 * @param sourceObject - Source object to take data from.
 * @param propertyNames - Array of property names to include to the returend object.
 * @returns New object that is a shallow copy of `sourceObject` 
 * with the properties given as `propertyNames` array.
 *
 * @remarks 
 * This function will be useful when serializing
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



/**
 * The same as `take(sourceObject, Object.getOwnPropertyNames(keysObject))`,
 * but with stronger typing.
 */
export function takeFromKeys<
    TKeysObject   extends BasicObject<any>,
    TSourceObject extends MappedObject<Partial<TKeysObject>, any>
>(sourceObject: TSourceObject, keysObj: TKeysObject) {
    return take(
        sourceObject, 
        Object.getOwnPropertyNames(keysObj) as PropNamesArray<TKeysObject>
    );
}
