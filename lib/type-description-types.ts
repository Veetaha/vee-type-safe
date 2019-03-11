import { BasicObject, BasicFunctor, MarkUndefedPropsAsOptional } from "./types";

// Type to type description:

/**
 * Makes an alias for the type that maps properties of `TTargetObject` to `TypeDescription`'s
 * 
 * @param TTargetObject Object (probably interface) type to alias `TypeDescription` for.
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
 * export const HumanTD: Vts.TypeDescrObject<Human> = {
 *     name: 'string',
 *     age: Vts.isPositiveInteger // you will get better intellisense here
 * };
 * ```
 */
export type TypeDescrObject<TTargetObject extends BasicObject = BasicObject<any>> = {
    [TKey in keyof TTargetObject]: TypeDescription<TTargetObject[TKey]>;
};

export interface TypeDescrArray<TTargetItems = any> 
extends Array<TypeDescription<TTargetItems>> {}

export interface TypeDescrSet<TTarget = any> 
extends Set<TypeDescription<TTarget>> {}

export type TypePredicate<TTarget = unknown> = (
    TTarget extends unknown       ? 
    (suspect: unknown) => boolean :
    (suspect: unknown) => suspect is TTarget
);



/**
 * Defines a type that describes another type's shape. 
 * It is accepted by type matching functions like 
 * `mismatch(), conforms(), duckMismatch(), exactlyConforms()`.
 * This type is a meta-type, as it describes limitations over other types.
 * 
 * @param TTarget Type that defined `TypeDescription` must describe.
 * 
 * @remarks
 * There exists a bunch of ways you may describe your type with `TypeDescription`.
 * E.g. you can describe `number` type the following way:
 * ```ts
 * type TypeDescription<number> = 
 *  | 'number' 
 *  | (suspect: unknown) => suspect is number
 *  | Set<TypeDescription<number>> 
 * ```
 * So if you need to create a type description, use more specific subtype of it,
 * rather than using default union type.
 * 
 * There is a handy function `td()` that preserves literally all types you used
 * to define your `TypeDescription`, thus you may further retrieve the type,
 * that is described by your `TypeDescription` without having to write it yourself.
 * If you want to get the described type from the given `TypeDescription`,
 * see `TypeDescriptionTarget`.
 * 
 * Example:
 * ```ts
 * import * as Vts from 'vee-type-safe';
 * 
 * const NameTD = Vts.td({
 *     first: 'string',
 *     last:  'string'
 * });
 * 
 * type Name = Vts.TypeDescriptionTarget<typeof NameTD>;
 * 
 * // statically generated TypeScript type:
 * // Name === {
 * //     first: string;
 * //     last:  string;
 * // }
 * 
 * const JsonUserTD = Vts.td({
 *     name:     NameTD,
 *     password: /[a-zA-Z]{3,32}/,
 *     email:    (suspect): suspect is string => {
 *         // instert custom logic to check that suspect is an email string here
 *         return true;
 *     },
 *     cash:       Vts.isInteger,
 *     isDisabled: 'boolean'
 * });
 * 
 * type JsonUser = Vts.TypeDescriptionTarget<typeof JsonUserTD>;
 * 
 * // statically generated TypeScript
 * // JsonUser === {
 * //     name:       Name;
 * //     password:   string;
 * //     email:      string;
 * //     cash:       number;
 * //     isDisabled: boolean;
 * // }
 * 
 * 
 * ```
 * 
 * 
 * 
 */
export type TypeDescription<TTarget = any> = 
    | TypePredicate<TTarget>
    | TypeDescrSet<TTarget>
    | 
( 
    TTarget extends number      ? 'number'           : 
    TTarget extends string      ? 'string' | RegExp  :
    TTarget extends boolean     ? 'boolean'          :
    TTarget extends bigint      ? 'bigint'           :
    TTarget extends undefined   ? 'undefined'        :
    TTarget extends null        ? 'object'           :
    TTarget extends symbol      ? 'symbol'           :
    TTarget extends Function    ? 'function'         :
    TTarget extends unknown[]   ? TypeDescrArray<TTarget[number]> | 'object' :
    TTarget extends BasicObject ? TypeDescrObject<TTarget>        | 'object' :
    never
);

// Type description to type:


type TypePredicateTarget<TTypePredicate extends TypePredicate> = (
    TTypePredicate extends (suspect: unknown) => suspect is infer R ? R : never
);

type TypeDescrObjectTarget<TTypeDescrObject extends TypeDescrObject> = (
    MarkUndefedPropsAsOptional<_TypeDescrObjectTarget<TTypeDescrObject>>  
);

type _TypeDescrObjectTarget<TTypeDescrObject extends TypeDescrObject> = {
    [TKey in keyof TTypeDescrObject]: TypeDescriptionTarget<TTypeDescrObject[TKey]>;
};

interface TypeDescriptionArrayTarget<TArrayItems extends TypeDescription[]> 
extends Array<TypeDescriptionTarget<TArrayItems[number]>>
{}

type TypeDescrSetTarget<TTypeDescrSet extends TypeDescrSet> = (
    TTypeDescrSet extends Set<infer TItems> ? (
        TItems extends TypeDescription ? TypeDescriptionTarget_2<TItems> : never
    ) : never
);

type TypeDescrSetTarget_2<TTypeDescrSet extends TypeDescrSet> = (
    TTypeDescrSet extends Set<infer TItems> ? (
        TItems extends TypeDescription ? TypeDescriptionTarget_3<TItems> : never
    ) : never
);

type TypeDescrSetTarget_3<TTypeDescrSet extends TypeDescrSet> = (
    TTypeDescrSet extends Set<infer TItems> ? (
        TItems extends TypeDescription ? TypeDescriptionTarget_4<TItems> : never
    ) : never
);

type TypeDescrSetTarget_4<TTypeDescrSet extends TypeDescrSet> = (
    TTypeDescrSet extends Set<infer TItems> ? (
        TItems extends TypeDescription ? TypeDescriptionTarget_5<TItems> : never
    ) : never
);

type TypeDescrSetTarget_5<TTypeDescrSet extends TypeDescrSet> = (
    TTypeDescrSet extends Set<infer TItems> ? (
        TItems extends TypeDescription ? TypeDescriptionTarget_6<TItems> : never
    ) : never
);

type TypeDescriptionTargetWithoutSet<TTypeDescr extends TypeDescription> = (
    TTypeDescr extends RegExp          ? string                                 :
    TTypeDescr extends 'string'        ? string                                 :
    TTypeDescr extends 'number'        ? number                                 :
    TTypeDescr extends 'boolean'       ? boolean                                :
    TTypeDescr extends 'bigint'        ? bigint                                 :
    TTypeDescr extends 'undefined'     ? undefined                              :
    TTypeDescr extends 'object'        ? BasicObject | null                     :
    TTypeDescr extends 'function'      ? BasicFunctor                           :
    TTypeDescr extends 'symbol'        ? symbol                                 :    
    TTypeDescr extends TypeDescrArray  ? TypeDescriptionArrayTarget<TTypeDescr> :
    TTypeDescr extends TypePredicate   ? TypePredicateTarget<TTypeDescr>        :
    TTypeDescr extends TypeDescrObject ? TypeDescrObjectTarget<TTypeDescr>      : 
    never
);

/**
 * Defines a type that is described by the given `TTypeDescr` type description.
 * @param TTypeDescr Type description to infer described type from.
 * @remarks
 * This type is basically inverse to `TypeDescription`, but not exactly.
 * Because of TypeScript circular types limitation enough nested `TypeDescrSet`
 * type will cause to return `never` type.
 * 
 * This type aspires to support to the following equality:
 *  `TypeDescriptionTarget<TypeDescription<T>> === T`
 * But it doesn't, because `TypeDesescription<T>` must be a more specific 
 * subtype of `TypeDescription`. You should make it using `td()` function.
 * 
 * See `TypeDescription` for more explanation.
 * 
 */
export type TypeDescriptionTarget<TTypeDescr extends TypeDescription> = (    
    TTypeDescr extends TypeDescrSet ? 
    TypeDescrSetTarget<TTypeDescr>  :
    TypeDescriptionTargetWithoutSet<TTypeDescr>
);

type TypeDescriptionTarget_2<TTypeDescr extends TypeDescription> = (    
    TTypeDescr extends TypeDescrSet ? 
    TypeDescrSetTarget_2<TTypeDescr>  :
    TypeDescriptionTargetWithoutSet<TTypeDescr>
);

type TypeDescriptionTarget_3<TTypeDescr extends TypeDescription> = (    
    TTypeDescr extends TypeDescrSet ? 
    TypeDescrSetTarget_3<TTypeDescr>  :
    TypeDescriptionTargetWithoutSet<TTypeDescr>
);

type TypeDescriptionTarget_4<TTypeDescr extends TypeDescription> = (    
    TTypeDescr extends TypeDescrSet ? 
    TypeDescrSetTarget_4<TTypeDescr>  :
    TypeDescriptionTargetWithoutSet<TTypeDescr>
);

type TypeDescriptionTarget_5<TTypeDescr extends TypeDescription> = (    
    TTypeDescr extends TypeDescrSet ? 
    TypeDescrSetTarget_5<TTypeDescr>  :
    TypeDescriptionTargetWithoutSet<TTypeDescr>
);

type TypeDescriptionTarget_6<TTypeDescr extends TypeDescription> = (
    TypeDescriptionTargetWithoutSet<TTypeDescr>
);
