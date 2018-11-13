# vee-type-safe
[![npm version](https://badge.fury.io/js/vee-type-safe.svg)](https://badge.fury.io/js/vee-type-safe)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)


This is a simple TypeScript type checking utility library.
Requires Typescript version `>= 3.0`.

## API

### V 2.2.0
<div> 
  <h2 class="doc-heading">Summary</h2>
  <p>Takes given properties from the object and returns them as a new object.</p>
  <h2 class="doc-heading">Parameters</h2>
  <table class="doc-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>sourceObject</td>
        <td>
          <p>Source object to take data from.</p>
        </td>
      </tr>
      <tr>
        <td>propertyNames</td>
        <td>
          <p>Array of property names to include to the returend object.</p>
        </td>
      </tr>
    </tbody>
  </table>
  <h2 class="doc-heading">Return Value</h2>
  <p>New object that is a shallow copy of 
    <code class="doc-code-span">sourceObject</code> with the properties given as 
    <code class="doc-code-span">propertyNames</code> array.
  </p>
  <h2 class="doc-heading">Remarks</h2>
  <p>This function will be useful when serializing your objects as data holders using generic JSON.stringify() and you don&#x27;t want any excess properties to be exposed to the serialized representation.</p>
  <pre class="doc-fenced-code"><code language="typescript"
  >import * as Vts from &#x27;vee-type-safe&#x27;;
const userDocument = {
    _id: &#x27;someid85&#x27;,
    name: &#x27;Kuzya&#x27;,
    secretInfo: 42
};
JSON.stringify(userDocument);
// {_id:&quot;someid85&quot;,name:&quot;Kuzya&quot;,secretInfo:42}
JSON.stringify(take(userDocument, [&#x27;_id&#x27;, &#x27;name&#x27;]));
// {_id:&quot;someid85&quot;,name:&quot;Kuzya&quot;}
</code>
  </pre> 
</div>

## v 2.0

*(Pleese, see v 1.0 API in the first place if you are not familiar with this library)*

### `match(suspect: unknown, typeDescr: TypeDescription): MatchInfo`

Returns a `MatchInfo` object (description is bellow) that stores an information whether `conforms(suspect, typeDescr)` and if not, why and where its invalid property is.
This is a powerful tool to generate useful error messages while validating value shape type.
~~~typescript
    const untrustedJson = {
        client: 'John Doe',
        walletNumber: null
    };
    const ExpectedJsonTD: TypeDescription = {
        client: 'string',
        walletNumber: num => typeof num === 'string' && /\d{16}/.test(num)
    };

    const typeInfo = match(untrustedJson, ExpectedJsonTD);
    if (!typeInfo.matched) {
        // logs: [ 'walletNumber' ] null [Function: walletNumber]
        console.log(typeInfo.path, typeInfo.actualValue, typeInfo.expectedTd);


        throw new Error(typeInfo.toErrorString());
    }
    // process client
~~~


### `exactlyMatch(suspect: unknown, typeDescr: TypeDescription): ExactMatchInfo`

Works the same way as `match(suspect, typeDescr)` but returns a failed match info if `suspect` or its child objects contain excess properties that are not listed in `typeDescr`.

~~~typescript
    const untrustedJson = /* ... */;
    const ExpectedJsonTD: TypeDescription = /* ... */;
    const dbDocument = /* ... */

    const typeInfo = exactlyMatch(untrustedJson, ExpectedJsonTD);
    if (!typeInfo.matched) {
        throw new Error(typeInfo.toErrorString());
    }
    // now you may safely assign untrustedJson to dbDocument:
    dbDocument = { ...dbDocument, ...untrustedJson  }
    // dbDocument = Object.assign(dbDocument, untrustedJson)
~~~

### `tryMatch(suspect: unknown, typeDescr: TypeDescription)`
### `tryExactlyMatch(suspect: unknown, typeDescr: TypeDescription)`

These functions return nothing. They throw `TypeMismatchError` if their `suspect` failed to match to the given `typeDescr`.

`TypeMismatchError` is an instance of `Error` with `typeMismatch: FailedMatchInfo` property.

`FailedMatchError` is just a `MatchEror` with required `path`, `actualValue` and `expectedTd` properties.


### class MatchInfo

Represents the result of running `match(suspect, typeDescr)`
or `exactlyMatch(suspect, typeDescr)` (the result of the second one is derived from `MatchInfo`) functions.
It contains an information wether `suspect` conforms to the given `typeDescr` or not, the actual value, expected type description and a property path to unexpected value type.

### properties

* `matched: boolean` - *true* if the match was successful (i.e. `conforms(suspect, typeDescr) === true`), *false* otherwise. If it is *true*, then no `path`, `actualValue` and `expectedTd` properties are present in this `MatchInfo` object.

* `path?: PathArray` - an array of numbers and strings which defines a path to suspect's invalid `actualValue`. E.g. if `suspect.foo.bar[3][5]` failed to match to the `expectedTd`, then `path` would be `[ 'foo', 'bar', 3, 5 ]`

* `expectedTd?: TypeDescription` - `TypeDescription` that `actualValue` was expected to conform to.

* `actualValue?: unknown` - value which failed to conform to the `expectedTd`.

### methods

### `pathString()`

Returns `path` converted to a human readable JavaScript property access notation string if match was failed. If match was successful retuns an empty string.
Retuned string begins with the `'root'` as the root object to access the properties.
~~~typescript
const info = match(
    {
        foo: {
            bar: {
                'twenty two': [
                    { prop: 'str' }, 
                    { prop: -23 }
                ]
            }
        }
    },
    { foo: { bar: { 'twenty two': [ { prop: 'string' } ] } } }
);

info.pathString() === `root.foo.bar['twenty two'][1].prop`
~~~

### `toErrorString()`

Returns a string of form:

*value (`JSON.stringify(actualValue)`) at path '`pathString()`' doesn't conform to the given type description (`stringifyTd(expectedTd)`)*

If `JSON.stringify(actualValue)` throws an error, it is excluded from the returned string. Returns an empty string if match was successful.

*Note:* derived `ExactMatchInfo` class only adds a word *exactly* before *conform* in the string.

## vee-type-safe/express
This is a library for *ExpressJS* routing middleware functions.

### `matchType(getRequestProperty, typeDescr, makeError?)`

Returns `express.Handler` that matches the value returned by `getRequestProperty(req)` to `typeDescr` and if it fails, calls `next(makeError(failedTypeInfo))`.
Thus you can be sure that the property of `express.Request` object was type checked before using it in your middleware.

Does type matching via core library `match` function.

* `getRequestProperty: (req: express.Request) => unknown` - this function returns a suspect to match to `typeDescr`
* `typeDescr` - type description that the value returned by `getRequestProperty(req)` must match to
* `makeError?: (failInfo: FailedMatchInfo) => unknown` - it is an optional function which makes a custom error to forward to `next()`, by default this function retuns `BadTypeStatusError`

`BadTypeStatusError` is an instance of `TypeMismatchError` that has a `status: number` property, which is http *BAD_REQUEST* by default.

~~~typescript
    import * as express      from 'express';
    import * as ExpressTypes from 'vee-type-safe/express'
    import * as Types        from 'vee-type-safe';
    const router = express.Router();
    router.post('api/v1/messages',
        ExpressTypes.matchType(
            req => req.body, // or ExpressTypes.ReqBody
            {
                filters: ['string'],
                limit: Types.isPositiveInteger
            },
            failInfo => new MyCustomError(failInfo.path, failInfo.actualValue)
        ),
        (req, res, next) => {
            /* your middleware, where you can trust to req.body */
            const filters = req.body.filters.join();
            // ...
        }
    );
~~~

There is a list of handy functions to specify as `getRequestProperty` argument:
* `ReqBody(req)    => req.body`
* `ReqParams(req)  => req.params`
* `ReqQuery(req)   => req.query`
* `ReqCookies(req) => req.cookies`
* `ReqHeaders(req) => req.headers`
~~~typescript
    import * as ExpressTypes from 'vee-type-safe/express';
    /* ... */
    router.get('api/v1/users/',
        ExpressTypes.matchType(ExpressTypes.ReqQuery, { title: 'string' }),
        (req, res, next) => {
            const title: string = req.query.title; // now you are sure
            /* ... */
        }
    );
~~~


### `exactlyMatchType(getRequestProperty, typeDescr, makeError?)`

The same middleware factory as `matchType()`, but does type matching via core library `exactlyMatch` function.



## v 1.0

### `conforms<T>(suspect, typeDescr): suspect is T`
  **You will use this function or `exactlyConforms()` 95% of the time interacting with this library.**
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
import { conforms } from 'vee-type-safe';

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

// Type argument:
interface Human {
    name: string;
    id:   number;
}
const HumanTD = {
    name: 'string',
    id:   'number'
};
function tryUseHuman(maybeHuman: unknown) {
    if (conforms<Human>(maybeHuman, HumanTD)) {
        // maybeHuman is of type Human here
        maybeHuman.name;
        maybeHuman.id;
    }
}
~~~

### `exactlyConforms<T>(suspect, typeDescr): suspect is T`
This function is the same as `conforms()`, but returns *false* for suspect object that has excess properties (those, that are not present in type description object).
~~~typescript
conforms(23, 'number') === exactlyConforms(23, 'number');
const suspect = {
    listedInt: 7,
    listedStr: 'readme',
    unlistedProp: ['some', 'excess', 'prop', 'value']
}
const td: TypeDescription = {
    listedInt: isPositiveInteger,
    listedStr: 'string'
}
conforms(suspect, td) === true;
exactlyConforms(suspect, td) === false;
~~~




### Factory functions
 (previously were in namespace Factory)
  
Factory functions return `TypePredicate`s to use as type descriptions when calling `conforms(suspect, typeDescr)`.
`TypePredicate` is a function of type:

`(suspect: unknown): boolean`

### `isNumberWithinRange(min, max)`
    
 Returns a predicate that returns *true* if its argument is a number within the range \[`min`, `max`] or \[`max`, `min`] if `min > max`.
 ~~~typescript
 import { conforms } from 'vee-type-safe';
 
 conforms(
 {
     num: 32
 },
 {
     num: isNumberWithinRange(0, 5)    
 }); // false
 ~~~
 
### `isIntegerWithinRange(min, max)`
 The same as `isNumberWithinRange(min, max)`, but its returned predicate returns *false* if forwarded argument is not an integer.
 
### `optional(typeDescr: TypeDescription)`
Retuns `TypePredicate` which retuns `typeof suspect === 'undefined' || conforms(typeDescr)`, which you may use as a type description for optional object properties. This predicate is effectively the same as calling `conforms(suspect, new Set<TypeDescription>([typeDescr, 'undefined']));`
~~~typescript
import { conforms } from 'vee-type-safe';
conforms(
{
    prop: 'str'
},{
    prop: optional('number')
}) 
// return false because the property is not undefined, 
// but doesn't conform to 'number' type
conforms(
{
    prop: -23
},{
    prop: optional(isNegativeInteger)
});
// returns true because the property is not undefined
// and conforms to isNegativeInteger restriction
~~~
 
   
 
### `isOneOf<T>(possibleValues: T[])`
  Returns a predicate that accepts a suspect of `any` type and matches it to
    one of the provided possible values by
    `possibleValues.includes(suspect)`. **Don't confuse it with `new Set(possibleValues)`** when forwarding as a type description to `conforms()` function, because `possibleValues` are not TDs, but values to match with.
~~~typescript
import { conforms } from 'vee-type-safe';

conforms(2, isOneOf([0, 1, 2, 3])); // true
conforms(2, new Set([0, 1, 2, 3])); // compile error
// Set<numbers> is not a Set<TypeDescritpion>
~~~ 

### `makeTdWithOptionalProps(srcTypeDescr: TypeDescrObjMap)`
Returns a new `TypeDescrObjMap` (which is assignable to `TypeDescription`) object that is composed of `srcTypeDescr` properties wrapped as
 
 `result[propName] = optional(srcTypeDescr[propName])`
 
 for each `propName` in `srcTypeDescr` own property names.
 
 
### Type definitions

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
import { assertNever } from 'vee-type-safe';
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
import { isBasicTypeName } from 'vee-type-safe';

isBasicTypeName('null');    // false
isBasicTypeName(' number'); // false
isBasicTypeName('number');  // true
~~~

### `isIsoDateString(suspect: unknown)`
Checks that suspect is a string and it conforms to ISO 8601 format.
Internally uses ['is-iso-date'](https://www.npmjs.com/package/is-iso-date) npm package. Returns `suspect is string` as a type guard.
Example taken from [here](https://www.npmjs.com/package/is-iso-date):
~~~typescript
import { isIsoDateString, conforms } from 'vee-type-safe';
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
const someObj = {
    date: '2015-02-21T00:52Z'
};
conforms(someObj, {
    date: isIsoDateString
}); // true
~~~

### Self explanatory functions
All these functions take `unknown` type argument and return `suspect is number`, which is useful as a type guard or when using as a type description.

* `isInteger(suspect)`
* `isPositiveInteger(suspect)`
* `isNegativeInteger(suspect)`
* `isPositiveNumber(suspect)`
* `isNegativeNumber(suspect)`
* `isZeroOrPositiveInteger(suspect)`
* `isZeroOrNegativeInteger(suspect)`
* `isZeroOrPositiveNumber(suspect)`
* `isZeroOrNegativeNumber(suspect)`
~~~typescript
import { conforms } from 'vee-type-safe';
conforms(
{
    id: 2,
    volume: 22.5
},
{
    id:    isPositiveInteger,
    money: isZeroOrPositiveNumber
}); // true
~~~


### `defaultIfNotConforms<T>(typeDescr, suspect, defaultVal): T`
Checks whether `suspect` conforms to the given type description (`typeDescr`) and returns it if `conforms(suspect, typeDescr)`, otherwise returns `defaultVal`.
* `typeDescr: TypeDescription` - TD suspect may conform to. `defaultVal` **must** conform to this TD
* `suspect: unknown` value to provide default for
* `defaultVal: T` value that conforms to `typeDescr` that is returned by this function if `!conforms(suspect, typeDescr)`
~~~typescript
import { defaultIfNotConforms } from 'vee-type-safe';

const id = defaultIfNotConforms(isPositiveInteger, parseInt('-1'), 0);
// id === 0;
const id2 = defaultIfNotConforms(isPositiveInteger, parseInt('444'), 0);
// id2 === 444
~~~