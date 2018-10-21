# vee-type-safe
[![npm version](https://badge.fury.io/js/vee-type-safe.svg)](https://badge.fury.io/js/vee-type-safe)


This is a simple TypeScript type checking utility library.
Requires Typescript version `>= 3.0`.

## API

### `conforms<T>(suspect, typeDescr): suspect is T`
  **You will use this function 95% of the time interacting with this library.**
  It is a two in one: runtime type checker and static type guard.   
  Determines whether the specified suspect type satisfies the restriction of the given type
  description (TD). (Seeing example below first may be helpful).
  
  * `T` is a TypeScript type suspect is treated as, if this function returns *true*.
  * `suspect` is a value of `unknown` type to be tested for conformance according to TD.
  
  * `typeDescr` is a value of `TypeDescription` type. 
    * If `isBasicTypeName(typeDescr)`. 
      Returns `typeof suspect === typeDescr`.
    * If `typeDescr` is a `TypePredicate` function. Returns `Boolean(typeDescr(suspect))`.
    * If `typeDescr instanceof Set<TD>`.
      Returns *true* if suspect conforms to at least one of the given TDs in the `Set`.
    * If `Array.isArray(typeDescr)` returns *false* if `!Array.isArray(suspect)` 
        * If `typeDescr.length === 1`. Returns *true* if each of suspect's items conforms to the given
                   TD at `typeDescr[0]`.
        * If `typeDescr.length > 1`. Returns *true* if `suspect.length === typeDescr.length`
                   and each `suspect[i]` conforms to `typeDescr[i]` type description.
        * If `typeDescr.length === 0`. Returns *true*.
     * If `isBasicObject(typeDescr)`. Returns *true* if `isBasicObject(suspect)` and
                   each `suspect[key]` conforms to `typeDescr[key]`. ([Excess properties in `suspect`
                   do not matter](https://en.wikipedia.org/wiki/Duck_typing)).
     * Else returns *false*.
     
~~~typescript  
    conforms(
    {
           prop: 'lala',
           prop2: true,
           obj: {
               obj: [23, false]
           },
           someIDontCareProperty: null // excess properties are ok
    },
    {
           prop: 'string',
           prop2: 'boolean',
           obj: {
               obj: ['number', 'boolean'] // claims a fixed length tuple
           }
    }); // true
    
    conforms(
    {
         arr: ['array', null, 'of any type', 8888 ],
         strArr: ['Pinkie', 'Promise', 'some', 'strings'],
         oneOf: 2,
         custom: 43
    }, 
    {
         arr: [],                              // claims an array of any type
         strArr: ['string'],                   // claims an array of any length
         oneOf: new Set(['boolean', 'number']),// claims to be one of these types
         custom: isOddNumber                   // custom type predicate function
    }); // true
    
    function isOddNumber(suspect: unknown): suspect is number {
        return typeof suspect === 'number' && suspect % 2; 
    }  
~~~
### `namespace Factory`
This namespace provides handy functions that return `TypePredicate`s to use as type descriptions when calling `conforms(suspect, typeDescr)`.
`TypePredicate` is a function of type:

`(suspect: unknown): boolean`

### `Factory.isNumberWithinRange(min, max)`
    
 Returns a predicate that returns *true* if its argument is a number within the range \[`min`, `max`] or \[`max`, `min`] if `min > max`.
 ~~~typescript
    conforms(
    {
        num: 32
    },
    {
        num: Factory.isNumberWithinRange(0, 5)    
    }); // false
 ~~~
 
### `Factory.isIntegerWithinRange(min, max)`
 The same as `Factory.isNumberWithinRange(min, max)`, but its returned predicate returns *false* if forwarded argument is not an integer.  
 
### `isOneOf<T>(possibleValues: T[])`
  Returns a predicate that accepts a suspect of `any` type and matches it to
    one of the provided possible values by
    `possibleValues.includes(suspect)`. **Don't confuse it with `new Set(possibleValues)`** when forwarding as a type description to `conforms()` function, because `possibleValues` are not TDs, but values to match with.
~~~typescript
    conforms(2, isOneOf([0, 1, 2, 3])); // true
    conforms(2, new Set([0, 1, 2, 3])); // compile error
    // Set<numbers> is not a Set<TypeDescritpion>
~~~ 
 

### `interface BasicObject<T>`
A shorthand for `{ [key: string]: T; }` type.

### `interface BasicFunctor`<TArgs, TRetval, TProps>`
This interface implies a callable `BasicObject<TProps>`, where 
`TArgs` is a tuple of argument types, `TRetval` is the return type of this function.

### `type PrimitiveType`
A set of all primitive types (`null` is treated as a primitive type).

### `type BasicTypeName`
A set of strings which are in `typeof` operator domain (`'string' | 'boolean' | 'object' ...`).

### `isBasicObject(suspect)`
Returns *true* if suspect is truthy (e.g. not `null`) and `typeof suspect === 'object'` or `'function'`.

### `reinterpret<T>(value)`
C++ style operator, a syntactic sugar for writing
casts like `value as any as T` when a simple `value as T` cast cannot be performed. Use it with caution!


### `typeAssert<T>(value): value is T`
TypeScript type guard that always returns *true*.
You may use it in an if statement to assert the proper type in the following code execution path.
~~~typescript
    import { typeAssert } from 'vee-type-safe';
    const enum SomeEnum {
        A = 0, B, C
    }
    const numb: number = 2;
    if (!typeAssert<SomeEnum>(numb)) { return; }
    numb; // deduced type is SomeEnum
    
~~~
### `assertNever(suspect: never)`
This function is no-op, but it is useful to check whether you have
 handled all the cases and some code path is unreachable. TypeScript compiler will issue an error if you forward a value not of [`never` type](https://www.typescriptlang.org/docs/handbook/basic-types.html#never) to this function.
~~~typescript
const enum Enum {
    A, B, C
}
function fn(en: Enum) {
    switch (en) {
        case Enum.A: { /***/ return; }
        case Enum.B: { /***/ return; }
        default: {
            assertNever(en); // compile Error, en is of type Enum.C
        }
    }
}
//-------------
const num = 23;
if (typeof num !== 'number'){
    assertNever(num); // no error, this code is unreachable
    // num is of type never here
}
~~~ 


### `isBasicTypeName(suspect): suspect is BasicTypeName`
Returns *true* if suspect is a string that is inside a set of `BasicTypeName` type set.
~~~typescript
    isBasicTypeName('null');    // false
    isBasicTypeName(' number'); // false
    isBasicTypeName('number');  // true
~~~

### `isIsoDateString(suspect: unknown)`
Checks that suspect is a string and it conforms to ISO 8601 format.
Internally uses ['is-iso-date'](https://www.npmjs.com/package/is-iso-date) npm package. Returns `suspect is string` as a type guard.
Example taken from [here](https://www.npmjs.com/package/is-iso-date):
~~~typescript
    isIsoDateString(8888); // false
    isIsoDateString({
       iso: '2015-02-21T00:52:43.822Z'
    }); // false
    isIsoDateString( '2015-02-21T00:52:43.822Z' ); // true
    isIsoDateString( '2015-02-21T00:52:43.822' );  // false
    isIsoDateString( '2015-02-21T00:52:43Z' );     // true
    isIsoDateString( '2015-02-21T00:52:43' );      // false
    isIsoDateString( '2015-02-21T00:52Z' );        // true
    isIsoDateString( '2015-02-21T00:52' );         // false
    isIsoDateString( '2015-02-21T00Z' );           // false
~~~

### Self explanatory functions
All these functions take `unknown` type argument and return `suspect is number`, which is useful as a type guard.

* `isInteger(suspect)`
* `isPositiveInteger(suspect)`
* `isPositiveNumber(suspect)`
* `isZeroOrPositiveInteger(suspect)`
* `isZeroOrPositiveNumber(suspect)`
