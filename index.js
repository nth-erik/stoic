'use strict';

export const Stoic = Object.create(null);

Stoic.isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Object.getPrototypeOf(value) === Object.prototype;

Stoic.create = (sourceValue) => {
  if (Array.isArray(sourceValue)) return new StoicArray(sourceValue);
  if (Stoic.isPlainObject(sourceValue)) return new StoicObject(sourceValue);
  return sourceValue;
};

// StoicObject

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

Object.defineProperty(StoicObject.prototype, 'constructor', {
  value: StoicObject,
});

Object.defineProperty(StoicObject.prototype, 'hasOwnProperty', {
  value: function (key) {
    return Object.prototype.hasOwnProperty.call(this, key);
  },
});

Object.defineProperty(StoicObject.prototype, 'toString', {
  value: function () {
    return Object.prototype.toString.call(this);
  },
});

Object.defineProperty(StoicObject.prototype, Symbol.toStringTag, {
  value: 'StoicObject',
});

Object.freeze(StoicObject.prototype);
Object.freeze(StoicObject);

// StoicArray

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

Object.defineProperty(StoicArray.prototype, 'at', {
  value: function (index) {
    return Array.prototype.at.call(this, index);
  },
});

Object.defineProperty(StoicArray.prototype, 'concat', {
  value: function (...items) {
    return new StoicArray(Array.prototype.concat.call([...this], ...items));
  },
});

Object.defineProperty(StoicArray.prototype, 'every', {
  value: function (callbackFn, thisArg) {
    return Array.prototype.every.call(this, callbackFn, thisArg);
  },
});

Object.defineProperty(StoicArray.prototype, 'filter', {
  value: function (callbackFn, thisArg) {
    return new StoicArray(
      Array.prototype.filter.call(this, callbackFn, thisArg),
    );
  },
});

Object.defineProperty(StoicArray.prototype, 'find', {
  value: function (callbackFn, thisArg) {
    return Array.prototype.find.call(this, callbackFn, thisArg);
  },
});

Object.defineProperty(StoicArray.prototype, 'findIndex', {
  value: function (callbackFn, thisArg) {
    return Array.prototype.findIndex.call(this, callbackFn, thisArg);
  },
});

Object.defineProperty(StoicArray.prototype, 'findLast', {
  value: function (callbackFn, thisArg) {
    return Array.prototype.findLast.call(this, callbackFn, thisArg);
  },
});

Object.defineProperty(StoicArray.prototype, 'forEach', {
  value: function (callbackFn, thisArg) {
    Array.prototype.forEach.call(this, callbackFn, thisArg);
  },
});

Object.defineProperty(StoicArray.prototype, 'includes', {
  value: function (searchElement, fromIndex) {
    return Array.prototype.includes.call(this, searchElement, fromIndex);
  },
});

Object.defineProperty(StoicArray.prototype, 'indexOf', {
  value: function (searchElement, fromIndex) {
    return Array.prototype.indexOf.call(this, searchElement, fromIndex);
  },
});

Object.defineProperty(StoicArray.prototype, 'join', {
  value: function (separator) {
    return Array.prototype.join.call(this, separator);
  },
});

Object.defineProperty(StoicArray.prototype, 'lastIndexOf', {
  value: function (searchElement, fromIndex) {
    return Array.prototype.lastIndexOf.call(this, searchElement, fromIndex);
  },
});

Object.defineProperty(StoicArray.prototype, 'map', {
  value: function (callbackFn, thisArg) {
    return new StoicArray(Array.prototype.map.call(this, callbackFn, thisArg));
  },
});

Object.defineProperty(StoicArray.prototype, 'reduce', {
  value: function (callbackFn, initialValue) {
    return Array.prototype.reduce.call(this, callbackFn, initialValue);
  },
});

Object.defineProperty(StoicArray.prototype, 'reduceRight', {
  value: function (callbackFn, initialValue) {
    return Array.prototype.reduceRight.call(this, callbackFn, initialValue);
  },
});

Object.defineProperty(StoicArray.prototype, 'slice', {
  value: function (start, end) {
    return new StoicArray(Array.prototype.slice.call(this, start, end));
  },
});

Object.defineProperty(StoicArray.prototype, 'some', {
  value: function (callbackFn, thisArg) {
    return Array.prototype.some.call(this, callbackFn, thisArg);
  },
});

Object.defineProperty(StoicArray.prototype, 'toLocaleString', {
  value: function () {
    return Array.prototype.toLocaleString.call(this);
  },
});

Object.defineProperty(StoicArray.prototype, 'toReversed', {
  value: function () {
    return new StoicArray(Array.prototype.toReversed.call(this));
  },
});

Object.defineProperty(StoicArray.prototype, 'toSorted', {
  value: function (compareFn) {
    return new StoicArray(Array.prototype.toSorted.call(this, compareFn));
  },
});

Object.defineProperty(StoicArray.prototype, 'toSpliced', {
  value: function (start, deleteCount, ...items) {
    return new StoicArray(
      Array.prototype.toSpliced.call(this, start, deleteCount, ...items),
    );
  },
});

Object.defineProperty(StoicArray.prototype, 'toString', {
  value: function () {
    return Array.prototype.toString.call(this);
  },
});

Object.defineProperty(StoicArray.prototype, 'values', {
  value: function () {
    return Array.prototype.values.call(this);
  },
});

Object.defineProperty(StoicArray.prototype, 'with', {
  value: function (index, value) {
    return new StoicArray(Array.prototype.with.call(this, index, value));
  },
});

Object.freeze(StoicArray.prototype);
Object.freeze(StoicArray);

export default {
  Stoic,
  StoicArray,
  StoicObject,
};
