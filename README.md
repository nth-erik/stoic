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

Stoic:

### Stoic

The Stoic namespace provides core utilities for freezing data into deeply immutable, read-only structures.

#### `.create(source)`

Recursively converts the given value into a deeply immutable structure.

- Arrays become `StoicArray`
- Plain objects become `StoicObject`
- Other values are returned as-is

Parameters:

- sourceValue - The value to wrap.

Returns:

- A deeply frozen Stoic structure or primitive.

```js
const frozen = Stoic.create({ foo: ['bar'] });
frozen.foo[0] = 'baz'; // ❌ TypeError
```

#### `.isPlainObject(candidate)`

⚠️ ERROR, needs refinement

Checks whether a given value is a plain object (i.e., directly created via `{}` or `new Object()`).

Parameters:

- value - The value to test.

Returns:

- `true` if it's a plain object; otherwise `false`.

```js
Stoic.isPlainObject({}); // true
Stoic.isPlainObject(new Date()); // false
```

## FAQ

- Q: Are you one of these braindead evangelists who thinks we should just random-roll our functions?
- A: No, but I'm also not a masochist. On the other hand, the AI is a tireless coder an intelligent developer can brainstorm with, addressing potential points of failure, and reason about cryptic implementation choices. This way I can delegate chores, and focus on refining and improving on the initial solution with a mix of follow-up questions and manual optimization for quality assessment from both ends.

- Q: Is this it? Two prototypes and a namespace?
- A: Yeah, it's not even minimized, so anyone can take a look and tell me why it sucks.

- Q: Why are Stoic, StoicObject and StoicArray in a single module?
- A: Because they are deeply interdependent to ensure deeply immutable structures. Separating them would create a dependency loop.
