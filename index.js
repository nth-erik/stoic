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
 * Checks whether a given value is a plain object
 * (i.e., directly created via `{}` or `new Object()`).
 *
 * @function
 * @memberof Stoic
 * @param {*} value - The value to test.
 * @returns {boolean} `true` if it's a plain object; otherwise `false`.
 *
 * @example
 * Stoic.isPlainObject({}); // true
 * Stoic.isPlainObject(new Date()); // false
 */
Stoic.isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 * Recursively converts the given value into a deeply immutable structure.
 * - Arrays become `StoicArray`
 * - Plain objects become `StoicObject`
 * - Other values are returned as-is
 *
 * @function
 * @memberof Stoic
 * @param {*} sourceValue - The value to wrap.
 * @returns {*} A deeply frozen Stoic structure or primitive.
 *
 * @example
 * const frozen = Stoic.create({ foo: ['bar'] });
 * frozen.foo[0] = 'baz'; // ❌ TypeError
 */
Stoic.create = (sourceValue) => {
  if (Array.isArray(sourceValue)) return new StoicArray(sourceValue);
  if (Stoic.isPlainObject(sourceValue)) return new StoicObject(sourceValue);
  return sourceValue;
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

  if (Array.isArray(source) || !Stoic.isPlainObject(source)) {
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
