# Stoic - Immutable pseudo-primitives

:construction: **This library is still in EARLY DEVELOPMENT with missing features and maybe critical bugs.** :construction:

A lightweight utility for creating deeply immutable, prototype-free data structures.
Useful for schema definitions, safe config data, or readonly runtime state.

## Notice of LLM (AI) support

:robot: Contains supervised vibecode from [ChatGPT-4o](https://chatgpt.com/).

## Installation

```
npm i @nth-erik/stoic
```

## Usage

Example:

```js
const { Stoic } = await import('@nth-erik/stoic');

const stoicObject = Stoic.create({
  a: 'Hello',
  b: ['world!'],
});

stoicObject.a = 'Goodbye';
stoicObject.b[0] = 'cruel world...';
console.log(Object.values(stoicObject).flat().join(', ')); // Hello, world!
```

## API

### `Stoic`

The Stoic namespace provides core utilities for freezing data into deeply immutable, read-only structures.

#### `Stoic.create(source)`

Creates a deeply immutable, prototype-free clone of any supported value.

Parameters:

- `source` - The value to sanitize and wrap. It can be of any supported type.

Returns:

- A deeply frozen Stoic structure or primitive. The function ensures that the returned value is:
  - Primitives are returned as-is.
  - Arrays are wrapped as `StoicArray` instances.
  - Plain objects are wrapped as `StoicObject` instances.
  - Errors are cloned into `StoicError` instances.
  - Known immutable types (e.g., `Date`, `RegExp`) are returned as their primitive representation (e.g., number, string).

Throws:

- `TypeError` if the input contains unsupported or unsafe types (e.g., `Promise`, `WeakMap`, `Function`).

**Circular References:**

- Circular references are replaced with `undefined`, and a warning is logged that includes the original and current paths.

**Example:**

```js
const frozen = Stoic.create({
  name: 'Alice',
  tags: ['admin'],
  created: new Date(),
});

frozen.name = 'Bob'; // ❌ TypeError
```

#### `Stoic.delegateStoicMethods(options)`

Defines non-mutating methods on a custom prototype by delegating to a built-in JavaScript prototype (e.g., `Array.prototype` or `Object.prototype`).

Parameters:

- `options.target` (Object) - The prototype to define methods on.
- `options.source` (Object) - The built-in prototype to delegate method calls to.
- `options.mapping` (Object.<string, false|function>) - Map of method names to wrapping strategies.
  - If the value is `false`, the result is returned as-is.
  - If the value is a function, the result is passed to that function and its return value is used.

Returns:

- A modified prototype with the delegated and possibly wrapped methods.

Example:

```js
Stoic.delegateStoicMethods({
  target: StoicArray.prototype,
  source: Array.prototype,
  mapping: {
    map: (result) => new StoicArray(result),
    includes: false,
  },
});
```

### `StoicError(error)`

Creates a deeply immutable, prototype-free error structure. This is useful for safe logging or serialization without exposing prototype behavior.

Parameters:

- `error` (Error): A native Error instance to wrap.

Returns:

- A deeply frozen StoicError that is fully frozen and stripped of prototype. The structure retains `name`, `message`, `stack`, and optionally `cause` (if available).

Throws:

- `TypeError`: If the input is not an `Error` instance.

```js
const err = new Error('Something went wrong');
const frozenErr = new StoicError(err);
console.log(frozenErr.stack); // Logs stack trace
```

### `StoicObject(source)`

Creates a deeply immutable plain object with no prototype. All nested objects and arrays are recursively wrapped and frozen, ensuring the structure cannot be modified.

Parameters:

- `source` (Object): The plain object to convert into a deeply frozen structure.

Returns:

- A deeply frozen StoicObject.

Throws:

- `TypeError`: If the input is not a plain object.

```js
const config = new StoicObject({ debug: true });
config.debug = false; // ❌ TypeError: Cannot assign to read only property 'debug'
```

### `StoicArray(source)`

Creates a deeply immutable array-like structure with no prototype. All nested values are recursively frozen. Includes most read-only array methods (e.g., map, slice, find).

Parameters:

- `source` (Array): The array to convert into a deeply frozen structure.

Returns:

- A deeply frozen StoicArray.

Throws:

- `TypeError`: If the input is not an array.

```js
const frozenArr = new StoicArray(['a', 'b']);
frozenArr[0] = 'x'; // ❌ TypeError: Cannot assign to read only property '0'
```

## FAQ

- Q: Are you one of these braindead evangelists who thinks we should just random-roll our functions?
- A: No, but I'm also not a masochist. Fortunately the AI is a tireless coder an intelligent developer can brainstorm with, addressing potential points of failure, and reason about cryptic implementation choices. This way I can delegate chores, and focus on refining and improving the initial solution with a mix of follow-up questions and optimizations from both ends.

- Q: Is this it? Three object types and a namespace?
- A: Yeah, it's not even minimized, so anyone can take a look and tell me why it sucks.

- Q: Why are Stoic, StoicError, StoicObject and StoicArray in a single module?
- A: Because they are deeply interdependent to ensure deeply immutable structures. Separating them would create a dependency loop.
