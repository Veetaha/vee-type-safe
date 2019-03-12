import { TypeDescription } from "./type-description-types";

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

/**
 * Defines a syncronous (if not `TRet extends Promise`) routine
 * with arguments specified as a tuple type `TArgs` and return type as `TRet`.
 * 
 * @param TArgs Tuple type of arguments that defined routine accepts.
 * @param TRet  Type of the return value of the routine.
 */
export type Routine<
    TArgs extends unknown[] = [], 
    TRet = void
> = (...args: TArgs) => TRet;

/**
 * Defines an asyncronous routine, which is typically marked with `async` qualifier,
 * with arguments specified as a tuple type `TArgs` and return type as `Promise<TRet>`.
 *
 * @param TArgs Tuple type of arguments that defined async routine accepts.
 * @param TRet  Type of the return value of the async routine.
 * 
 */
export type AsyncRoutine<
    TArgs extends unknown[] = [], 
    TRet = void
> = (...args: TArgs) => Promise<TRet>;

/**
 * Defines the type of result, which is passed to `TPromise.then(cb)` `cb` callback.
 * @param TPromise Target `Promise` to unwrap result from.
 */
export type PromiseResult<TPromise extends Promise<any>> = (
    TPromise extends Promise<infer TResult> ? TResult : never
);

/**
 * Defines the result of the `Promise` return by the specified `AsyncRoutine`
 * @param TAsyncRoutine `AsyncRoutine` to unwrap return type `Promise` result from.
 */
export type AsyncReturnType<TAsyncRoutine extends AsyncRoutine<any[], any>> = (
    PromiseResult<ReturnType<TAsyncRoutine>>
);

/** 
 * Defines constructor function type.
 * @param TInstance Type of instances produced by this constructor.
 * @param TArgs     Tuple type of arguments, this constructor accepts.
 */
export interface ClassType<
    TInstance = unknown,
    TArgs extends unknown[] = any[]
> 
extends Function {
    // tslint:disable-next-line: callable-types
    new (...args: TArgs): TInstance;
}

/**
 * Defines constructor function prototype property type.
 * @param TClass Target constructor function type.
 */
export type ClassPrototype<TClass extends ClassType> = (
    TClass['prototype']
);

export type ClassDecorator = (
    <TClassType extends ClassType = ClassType>
    (target: TClassType) => TClassType | void
);

export type MethodDecorator<
    TArgs   extends any[] = any[], 
    TRetval extends any   = any
> = (
    <TProto extends BasicObject = BasicObject>(
        classPrototype: TProto,
        propName:       string | symbol,
        propDescriptor: TypedPropertyDescriptor<(this: TProto, ...args: TArgs) => TRetval>
    ) => void |         TypedPropertyDescriptor<(this: TProto, ...args: TArgs) => TRetval>
);

export type PropertyDecorator<TPropType = unknown> = (
    <TPropName extends string | symbol>
    (classPrototype: Record<TPropName, TPropType>, propName: TPropName) => void
);

export type ParameterDecorator = (
    classPrototype: BasicObject, 
    methodName:     string | symbol, 
    parameterIndex: number
) => void;


/**
 * Defines which type of properties to filter.
 */
export const enum FilterOpts {
    /**
     * Defines properties which values are assignable to the given type.
     */
    Assignable, 

    /**
     * Defines properties which values are not assignable to the given type.
     */
    NotAssignable, 

    /**
     * Defines properties which values are assignable or if those are
     * of a union type, that union contains a type that is assignable
     * to the given type.
     */
    Containing, 

    /** 
     * Defines properties which values are not assignable or if those are
     * of a union type, that union doesn't contain a type that is assignable
     * to the given type.
     */
    NotContaining
}

/**
 * Defines a union of property names taken from `TObj` which value type is 
 * assignable to `TValue`.
 * 
 * @param TObj       Target object type to filter property names from.
 * @param TValue     Type of value that filtered propnames value type must be assignable to. 
 * @param TFilterOpt Defines which class of properties to take. See `FilterOpts` for details.
 */
export type FilteredPropNames<
    TObj extends BasicObject, 
    TValue, 
    TFilterOpt extends FilterOpts = FilterOpts.Assignable
> = { 
        [TKey in keyof TObj]: (
            TFilterOpt  extends FilterOpts.Assignable   ?
            (TObj[TKey] extends TValue ? TKey  : never) :

            TFilterOpt  extends FilterOpts.NotAssignable ?
            (TObj[TKey] extends TValue ? never : TKey)   :

            TFilterOpt extends FilterOpts.Containing ?
            (Extract<TObj[TKey], TValue> extends never ? never : TKey) :

            TFilterOpt extends FilterOpts.NotContaining ?
            (Extract<TObj[TKey], TValue> extends never ? TKey : never) : 
            
            never
        )
}[keyof TObj];
                                                                


/**
 * Defines an object type which properties are all taken from `TObj` and their values
 * are assignable to `TValue`.
 * 
 * @param TObj   Target object type to filter properties from.
 * @param TValue Type of value that filtered properties value type must be assignable to. 
 * @param TFilterOpt Defines which class of properties to take. See `FilterOpts` for details
 */
export type FilterProps<
    TObj extends BasicObject, 
    TValue, 
    FilterOpt extends FilterOpts = FilterOpts.Assignable
> = (
    Pick<TObj, FilteredPropNames<TObj, TValue, FilterOpt>>
);

export type MarkUndefedPropsAsOptional<TObj extends BasicObject> = (
    & Partial<FilterProps<TObj, undefined, FilterOpts.Containing>> 
    & RemoveProperties<TObj, FilteredPropNames<TObj, undefined, FilterOpts.Containing>>
);
