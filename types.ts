/**
 * Defines an object with string keys, and all values of TValue type.
 * @param TValue Type of values, stored in object's properties.
 */
export interface BasicObject<TValue = unknown> {
    [key: string]: TValue;
}

/**
 * Same as BasicObject<>, but defines all properties as readonly.
 * @param TValue Type of values, stored in object's readonly properties.
 */
export interface ROBasicObject<TValue = unknown> {
    readonly [key: string]: TValue;
}

/**
 * Defines a type T that may also be null or undefined.
 * @param T Type to make "nullable".
 */
export type Maybe<T> = T | null | undefined;


/**
 * Defines an object type with the keys being in TKey type union and values of
 * TValue type.
 * @remarks
 * All vanilla TypeScript Object properties, such as .toString, .hasOwnProperty
 * do not get mapped.
 * 
 * @param TKey   Type of keys of the created type.
 * @param TValue Type of values stored in the created type.
 */
export type BasicObjectMap<
    TKey extends string | number | symbol = string, 
    TValue = unknown
> = {
    [key in Exclude<TKey, keyof Object>]: TValue;
};

/**
 * Defines a Functor (function object) with the property values of type TProps.
 * 
 * @param TArgs   Tuple of argument types that this functor accepts.
 * @param TRetval Type that this functor returns.
 * @param TProps  Type of values stored by string keys on this object type.
 */
export interface BasicFunctor<
    TArgs extends any[]  = unknown[],
    TRetval              = unknown,
    TProps               = unknown
    > extends BasicObject<TProps> {
    (...args: TArgs): TRetval;
}

/**
 * Same as BasicFunctor, but inherits from ROBasicObject, instead of BasicObject.
 * 
 * @param TArgs   Tuple of argument types that this functor accepts.
 * @param TRetval Type that this functor returns.
 * @param TProps  Type of readonly values stored by string keys on this object type.
 */
export interface ROBasicFunctor<
    TArgs extends any[]  = unknown[],
    TRetval              = unknown,
    TProps               = unknown
    > extends ROBasicObject<TProps> {
    (...args: TArgs): TRetval;
}

/**
 * Defines a union of all possible value types defined in the language.
 * @remarks null and undefined are considered to be primitive types.
 */
export type PrimitiveType = 
    | number 
    | string 
    | boolean  
    | undefined 
    | symbol 
    | null
    | bigint;
/**
 * Defines a union of all possible strings retuned by applying  `typeof` operator.
 */
export type BasicTypeName = 
    | 'number'    
    | 'string' 
    | 'boolean'  
    | 'undefined' 
    | 'object' 
    | 'function' 
    | 'symbol'
    | 'bigint';


/**
 * Defines an object type with the same keys as `TSourceObjects`, but all values
 * of `TMappedValue`.
 * @param TSourceObject Type of object to take properties from.
 * @param TMappedValue  Type of values in the created object type.
 */
export type MappedObject<TSourceObject extends BasicObject<any>, TMappedValue> = {
    [TSourceObjectKey in keyof TSourceObject]: TMappedValue;
};
    
/**
 * Defines the same object type as `TSourceObject`, but with `TPropName` property
 * having the value of type `TNewPropType`.
 * 
 * @param TSourceObject Type of object to replace property type of.
 * @param TPropName     Type of property to change type of (may be a string literal).
 * @param TNewPropType  Type of value stored at `TPropName` key in the returned type.
 */
export type ReplaceProperty<
    TSourceObject extends BasicObject,
    TPropName extends keyof TSourceObject,
    TNewPropType
> = {
    [Key in keyof TSourceObject]:
    Key extends TPropName ? TNewPropType : TSourceObject[Key];
};

/**
 * Defines the same object type as `TSourceObject`, but without `TPropName` properties.
 * @param TSourceObject  Type of object to remove property from.
 * @param TPropNameUnion A single or union type of properties to remove from `TSourceObject`.
 */
export type RemoveProperties<
    TSourceObject extends BasicObject,
    TPropNamesUnion extends keyof TSourceObject
> = {
    [Key in Exclude<keyof TSourceObject, TPropNamesUnion>]: TSourceObject[Key];
};


export interface TypeDescrObjMap extends BasicObject<TypeDescription> {}
export interface TypeDescrArray  extends Array<TypeDescription> {}
export interface TypeDescrSet    extends Set<TypeDescription> {}
export type TypePredicate = (suspect: unknown) => boolean;
/**
 * Defines a union type, accepted type matching functions like 
 * `mismatch(), conforms(), duckMismatch(), exactlyConforms()`.
 * This type is a meta-type, as it describes limitations over other types.
 */
export type TypeDescription = 
    | TypeDescrObjMap 
    | TypeDescrArray 
    | TypePredicate 
    | TypeDescrSet 
    | BasicTypeName  
    | RegExp;

/**
 * Makes an alias for the type that maps properties of T to `TypeDescription`'s
 * 
 * @param T Object (probably interface) type to alias `TypeDescription` for.
 * 
 * @remarks
 * Use it like so:
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * export interface Human {
 *     name: string;
 *     age: number;
 * }
 * 
 * export const HumanTD: Vts.TypeDescriptionOf<Human> = {
 *     name: 'string',
 *     age: Vts.isPositiveInteger // you will get better intellisense here
 * };
 * ```
 */
export type TypeDescriptionOf<T extends BasicObject> = BasicObjectMap<keyof T, TypeDescription>;


export type PathArray = (string | number)[];

export interface MismatchInfoData {
    path:        PathArray;
    expectedTd:  TypeDescription;
    actualValue: unknown;
}

export type PropNamesArray<TObject extends BasicObject> = (keyof TObject)[];

/**
 * Defines an object type with the `TPropNames` properties subset taken from
 * `TSourceObject`
 * @param TSourceObject Type of object to take property type from
 * @param TPropNames    Union type of keys of properties to take from `TSourceObject`
 */
export type Take<
    TSourceObject extends BasicObject, 
    TPropNames    extends PropNamesArray<TSourceObject>
> = { 
    [TProperty in TPropNames[number]]: TSourceObject[TProperty];
};