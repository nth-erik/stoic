function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Wraps a plain object or array in an immutable structure.
 * Dispatches to StoicObject or StoicArray depending on the input type.
 *
 * @class
 * @param {*} source - The input to be wrapped.
 * @returns {StoicObject|StoicArray|*} A deeply frozen version of the input, or the original value if unsupported.
 */
export class Stoic {
  constructor(source) {
    if (Array.isArray(source)) return new StoicArray(source);
    if (isPlainObject(source)) return new StoicObject(source);

    return source;
  }
}

/**
 * Immutable, deeply frozen wrapper for plain objects.
 * Converts nested structures using Stoic.
 * Supports common object methods with immutable returns.
 *
 * @class
 * @param {Object} source - A non-array, plain object.
 * @throws {TypeError} If source is not a plain object.
 */
export class StoicObject {
  constructor(source) {
    if (source instanceof StoicObject) return source;
    if (Array.isArray(source) || !isPlainObject(source)) {
      throw new TypeError(
        'StoicObject expects a non-array object. Use Stoic to handle ambiguous data types.',
      );
    }

    const instance = Object.create(StoicObject.prototype);

    for (const [key, value] of Object.entries(source)) {
      Object.defineProperty(instance, key, {
        value: new Stoic(value),
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }

    Object.setPrototypeOf(instance, Stoic);
    Object.freeze(instance);

    return instance;
  }

  hasOwnProperty(key) {
    return Object.prototype.hasOwnProperty.call(this, key);
  }

  toString() {
    return Object.prototype.toString.call(this);
  }

  get [Symbol.toStringTag]() {
    return 'StoicObject';
  }
}

/**
 * Immutable, deeply frozen wrapper for arrays.
 * Supports common array methods with immutable returns.
 *
 * @class
 * @param {Array} source - An array to wrap.
 * @throws {TypeError} If source is not an array.
 */
export class StoicArray {
  constructor(source) {
    if (source instanceof StoicArray) return source;
    if (!Array.isArray(source)) {
      throw new TypeError(
        'StoicArray expects an array. Use Stoic to handle ambiguous data types.',
      );
    }

    const instance = Object.create(StoicArray.prototype);

    for (let i = 0; i < source.length; i++) {
      Object.defineProperty(instance, i, {
        value: new Stoic(source[i]),
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }

    Object.defineProperty(instance, 'length', {
      value: source.length,
      writable: false,
      enumerable: false,
      configurable: false,
    });

    Object.defineProperty(instance, Symbol.iterator, {
      value: function* () {
        for (let i = 0; i < this.length; i++) {
          yield instance[i];
        }
      },
      writable: false,
      enumerable: false,
      configurable: false,
    });

    Object.setPrototypeOf(instance, Stoic);
    Object.freeze(instance);

    return instance;
  }

  // Methods

  at(index) {
    return Array.prototype.at.call(this, index);
  }

  concat(...items) {
    return new StoicArray(Array.prototype.concat.call([], ...items));
  }

  every(callbackFn, thisArg) {
    return Array.prototype.every.call(this, callbackFn, thisArg);
  }

  filter(callbackFn, thisArg) {
    return new StoicArray(
      Array.prototype.filter.call(this, callbackFn, thisArg),
    );
  }

  find(callbackFn, thisArg) {
    return Array.prototype.find.call(this, callbackFn, thisArg);
  }

  findIndex(callbackFn, thisArg) {
    return Array.prototype.findIndex.call(this, callbackFn, thisArg);
  }

  findLast(callbackFn, thisArg) {
    return Array.prototype.findLast.call(this, callbackFn, thisArg);
  }

  forEach(callbackFn, thisArg) {
    Array.prototype.forEach.call(this, callbackFn, thisArg);
  }

  includes(searchElement, fromIndex) {
    return Array.prototype.includes.call(this, searchElement, fromIndex);
  }

  indexOf(searchElement, fromIndex) {
    return Array.prototype.indexOf.call(this, searchElement, fromIndex);
  }

  join(separator) {
    return Array.prototype.join.call(this, separator);
  }

  lastIndexOf(searchElement, fromIndex) {
    return Array.prototype.lastIndexOf.call(this, searchElement, fromIndex);
  }

  map(callbackFn, thisArg) {
    return new StoicArray(Array.prototype.map.call(this, callbackFn, thisArg));
  }

  reduce(callbackFn, initialValue) {
    return Array.prototype.reduce.call(this, callbackFn, initialValue);
  }

  reduceRight(callbackFn, initialValue) {
    return Array.prototype.reduceRight.call(this, callbackFn, initialValue);
  }

  slice(start, end) {
    return new StoicArray(Array.prototype.slice.call(this, start, end));
  }

  some(callbackFn, thisArg) {
    return Array.prototype.some.call(this, callbackFn, thisArg);
  }

  toLocaleString() {
    return Array.prototype.toLocaleString.call(this);
  }

  toReversed() {
    return new StoicArray(Array.prototype.toReversed.call(this));
  }

  toSorted(compareFn) {
    return new StoicArray(Array.prototype.toSorted.call(this, compareFn));
  }

  toSpliced(start, deleteCount, ...items) {
    return new StoicArray(
      Array.prototype.toSpliced.call(this, start, deleteCount, ...items),
    );
  }

  toString() {
    return Array.prototype.toString.call(this);
  }

  values() {
    return Array.prototype.values.call(this);
  }

  with(index, value) {
    return new StoicArray(Array.prototype.with.call(this, index, value));
  }
}

export default {
  Stoic,
  StoicArray,
  StoicObject,
};
