/**
 * @module stoic
 * @version 1.0.0
 * @description
 * A lightweight utility for creating deeply immutable, prototype-free data structures.
 * Useful for schema definitions, safe config data, or readonly runtime state.
 *
 * @example
 * import { Stoic, StoicObject, StoicArray } from 'stoic';
 *
 * const raw = { user: { name: 'Alice' }, tags: ['admin'] };
 * const frozen = Stoic.create(raw);
 *
 * frozen.user.name = 'Bob'; // ❌ TypeError: Cannot assign to read only property
 */

// -- Stoic --

/**
 * The Stoic namespace provides core utilities for freezing data
 * into deeply immutable, read-only structures.
 *
 * @namespace
 */
export const Stoic = Object.create(null);

/**
 * Creates a deeply immutable, prototype-free clone of any supported value.
 *
 * This function recursively sanitizes the input:
 * - Primitives are returned as-is.
 * - Arrays are wrapped as `StoicArray` instances.
 * - Plain objects become `StoicObject` instances.
 * - Errors are cloned into `StoicError` instances.
 * - Known immutable types (e.g. Date, RegExp) are returned as their primitive representation (e.g. number, string).
 *
 * Circular references are not preserved: they are replaced with `undefined`,
 * and a warning is logged including the current and original paths.
 *
 * Unsupported types (e.g., Promise, WeakMap, Function) will throw a `TypeError`.
 *
 * @function Stoic.create
 * @param {*} source - The input value to sanitize and wrap.
 * @param {WeakMap<object, string[]>} [_seen] - Internal use only for tracking circular references.
 * @param {Array<string|number>} [_path] - Internal use only for current traversal path.
 * @returns {*} A safe, deeply frozen version of the input.
 * @throws {TypeError} If the input includes unsupported or unsafe types.
 *
 * @example
 * const frozen = Stoic.create({
 *   name: 'Alice',
 *   tags: ['admin'],
 *   created: new Date(),
 * });
 *
 * frozen.name = 'Bob'; // ❌ TypeError
 */
Stoic.create = function (source, _seen = new WeakMap(), _path = []) {
  if (source === null || source === undefined) return source;
  if (typeof source !== 'object') return source;

  if (_seen.has(source)) {
    const originalPath = _seen.get(source);
    console.warn(
      `Circular ref at path ${_path.join('.')} to ${originalPath.join('.')}`,
    );
    return void 0;
  }

  _seen.set(source, _path.slice());

  const tag = Object.prototype.toString.call(source);

  if (
    tag === '[object StoicObject]' ||
    tag === '[object StoicArray]' ||
    tag === '[object StoicError]'
  ) {
    return source;
  }

  if (tag === '[object Date]') return source.valueOf();

  if (tag === '[object RegExp]') return source.toString();

  if (Array.isArray(source)) {
    const proxy = [];
    for (let i = 0; i < source.length; i++) {
      proxy[i] = Stoic.create(source[i], _seen, _path.concat(i));
    }
    return StoicArray(proxy);
  }

  if (tag === '[object Error]') {
    console.log('error case', tag);
    return new StoicError(source);
  }

  if (tag === '[object Object]') {
    console.log('object case', tag);
    const proxy = Object.create(null);
    for (const key in source) {
      proxy[key] = Stoic.create(source[key], _seen, _path.concat(key));
    }
    return StoicObject(proxy);
  }

  if (
    tag === '[object Boolean]' ||
    tag === '[object Number]' ||
    tag === '[object String]' ||
    tag === '[object Symbol]' ||
    tag === '[object BigInt]' ||
    tag === '[object Date]'
  ) {
    return Object.valueOf(source);
  }

  throw new TypeError(`Stoic.create: Unsupported type ${tag}`);
};

/**
 * Defines non-mutating methods on a custom prototype by delegating to a built-in
 * JavaScript prototype (e.g., `Array.prototype` or `Object.prototype`).
 *
 * The `mapping` object defines which methods to assign and how to post-process the result:
 * - If the value is `false`, the result is returned as-is.
 * - If the value is a function, the result is passed to that function and its return value is used.
 *
 * This allows for whitelisting and wrapping behavior (e.g., returning a new StoicArray).
 *
 * @memberof Stoic
 * @param {Object} options - The configuration object.
 * @param {Object} options.target - The prototype to define methods on.
 * @param {Object} options.source - The built-in prototype to delegate method calls to.
 * @param {Object.<string, false|function>} options.mapping - Map of method names to wrapping strategies.
 * @example
 * Stoic.delegateStoicMethods({
 *   target: StoicArray.prototype,
 *   source: Array.prototype,
 *   mapping: {
 *     map: (result) => new StoicArray(result),
 *     includes: false
 *   }
 * });
 */
Stoic.delegateStoicMethods = function ({ target, source, mapping }) {
  for (const [method, wrapper] of Object.entries(mapping)) {
    Object.defineProperty(target, method, {
      value: function (...args) {
        const result = source[method].apply(this, args);
        return wrapper ? wrapper(result) : result;
      },
    });
  }
};

Object.freeze(Stoic);

// -- StoicError --

/**
 * Creates a deeply immutable, prototype-free error structure.
 * Useful for safe logging or serialization without exposing prototype behavior.
 *
 * Retains `name`, `message`, `stack`, and optional `cause`, if available.
 * Returns a structure that mimics a native error but is fully frozen and stripped of prototype.
 *
 * @constructor
 * @param {Error} error - A native Error instance to wrap.
 * @returns {StoicError} A frozen, non-prototype error structure.
 * @throws {TypeError} If the input is not an `Error` instance.
 *
 * @example
 * const err = new Error('Something went wrong');
 * const frozenErr = new StoicError(err);
 * console.log(frozenErr.stack); // Logs stack trace
 */
export function StoicError(error) {
  if (Object.prototype.toString.call(error) !== '[object Error]') {
    throw new TypeError('StoicError expects an error.');
  }

  console.log('ERROR CASE INTERNAL');

  const instance = Object.create(StoicError.prototype);

  Object.defineProperty(instance, 'name', {
    value: 'Stoic' + error.name,
  });

  Object.defineProperty(instance, 'message', {
    value: error.message,
  });

  Object.defineProperty(instance, 'stack', {
    value: error.stack,
  });

  if ('cause' in error) {
    Object.defineProperty(instance, 'cause', {
      value: Stoic.create(error.cause),
    });
  }

  Object.freeze(instance);

  console.log(Object.prototype.toString.call(instance));

  return instance;
}

StoicError.prototype = Object.create(Stoic);

Object.defineProperty(StoicError.prototype, Symbol.toStringTag, {
  value: 'StoicError',
});

Object.freeze(StoicError.prototype);
Object.freeze(StoicError);

// -- StoicObject --

/**
 * Creates a deeply immutable plain object with no prototype.
 * All nested objects and arrays are also recursively wrapped and frozen.
 *
 * @constructor
 * @param {Object} source - A plain object to convert.
 * @returns {StoicObject} A frozen, deeply immutable structure.
 * @throws {TypeError} If the input is not a plain object.
 *
 * @example
 * const config = new StoicObject({ debug: true });
 * config.debug = false; // ❌ TypeError
 */
export function StoicObject(source) {
  if (source instanceof StoicObject) return source;

  if (
    Array.isArray(source) ||
    Object.prototype.toString.call(source) !== '[object Object]'
  ) {
    throw new TypeError('StoicObject expects a plain object.');
  }

  const instance = Object.create(StoicObject.prototype);

  for (const [key, value] of Object.entries(source)) {
    Object.defineProperty(instance, key, {
      value: Stoic.create(value),
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }

  Object.freeze(instance);

  return instance;
}

StoicObject.prototype = Object.create(Stoic);

Stoic.delegateStoicMethods({
  target: StoicObject.prototype,
  source: Object.prototype,
  mapping: {
    hasOwnProperty: false,
    toString: false,
  },
});

Object.defineProperty(StoicObject.prototype, Symbol.toStringTag, {
  value: 'StoicObject',
});

Object.freeze(StoicObject.prototype);
Object.freeze(StoicObject);

// -- StoicArray --

/**
 * Creates a deeply immutable array-like structure with no prototype.
 * All nested values are recursively frozen.
 * Includes most read-only Array methods (e.g., `map`, `slice`, `find`).
 *
 * @constructor
 * @param {Array} source - An array to convert.
 * @returns {StoicArray} A frozen, deeply immutable array structure.
 * @throws {TypeError} If the input is not an array.
 *
 * @example
 * const frozenArr = new StoicArray(['a', 'b']);
 * frozenArr[0] = 'x'; // ❌ TypeError
 */
export function StoicArray(source) {
  if (source instanceof StoicArray) return source;

  if (!Array.isArray(source)) {
    throw new TypeError('StoicArray expects an array.');
  }

  const instance = Object.create(StoicArray.prototype);

  for (let i = 0; i < source.length; i++) {
    Object.defineProperty(instance, i, {
      value: Stoic.create(source[i]),
    });
  }

  Object.defineProperty(instance, 'length', {
    value: source.length,
  });

  Object.defineProperty(instance, Symbol.iterator, {
    value: function* () {
      for (let i = 0; i < this.length; i++) {
        yield this[i];
      }
    },
  });

  Object.freeze(instance);

  return instance;
}

StoicArray.prototype = Object.create(Stoic);

Stoic.delegateStoicMethods({
  target: StoicArray.prototype,
  source: Array.prototype,
  mapping: {
    at: (res) => Stoic.create(res),
    concat: (res) => new StoicArray(res),
    every: false,
    filter: (res) => new StoicArray(res),
    find: (res) => Stoic.create(res),
    findIndex: (res) => Stoic.create(res),
    findLast: (res) => Stoic.create(res),
    forEach: false,
    includes: false,
    indexOf: false,
    join: false,
    lastIndexOf: false,
    map: (res) => new StoicArray(res),
    reduce: false,
    reduceRight: (res) => Stoic.create(res),
    slice: (res) => new StoicArray(res),
    some: false,
    toLocaleString: false,
    toReversed: (res) => new StoicArray(res),
    toSorted: (res) => new StoicArray(res),
    toSpliced: (res) => new StoicArray(res),
    toString: false,
    values: (res) => Stoic.create(res),
    with: (res) => new StoicArray(res),
  },
});

Object.defineProperty(StoicArray.prototype, Symbol.toStringTag, {
  value: 'StoicArray',
});

Object.freeze(StoicArray.prototype);
Object.freeze(StoicArray);

// -- Type Definitions --

/**
 * A deeply immutable, prototype-free error structure.
 * Does not inherit from `Error.prototype`.
 *
 * @typedef {Object} StoicError
 * @property {string} name - Error type name.
 * @property {string} message - Brief error description.
 * @property {string} stack - Error name and message with call stack.
 * @property {string} [cause] - Error cause - what triggered the error.
 * @property {string} [Symbol.toStringTag='StoicError'] - Custom string tag used by `Object.prototype.toString`.
 */

/**
 * A deeply immutable, prototype-free object structure.
 * Does not inherit from `Object.prototype`.
 *
 * @typedef {Object} StoicObject
 * @property {function(string): boolean} hasOwnProperty - Checks if a property exists directly on the instance.
 * @property {function(): string} toString - Returns a string representation of the object.
 * @property {string} [Symbol.toStringTag='StoicObject'] - Custom string tag used by `Object.prototype.toString`.
 */

/**
 * A deeply immutable, prototype-free array-like structure.
 * Supports most read-only array methods (`map`, `filter`, `slice`, etc.).
 *
 * @typedef {Object} StoicArray
 * @property {number} length - The number of elements.
 * @property {function(): Iterator} [Symbol.iterator] - Enables `for...of` loops.
 * @property {string} [Symbol.toStringTag='StoicArray'] - Custom string tag used by `Object.prototype.toString`.
 *
 * @example
 * for (const item of frozenArray) {
 *   console.log(item);
 * }
 */
