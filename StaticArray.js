import StaticObject from "./StaticObject.js";

/**
 * Represents an immutable, fixed-length array-like structure.
 * 
 * The `StaticArray` class enforces immutability by preventing modifications to its elements
 * and length after creation. It only accepts primitive values or nested `StaticArray` instances 
 * (no functions or arbitrary objects allowed). The length property and all elements are defined 
 * as non-writable, non-configurable properties, and the entire instance is frozen.
 * 
 * @class
 * @example
 * const arr = new StaticArray(1, 2, 3);
 * console.log(arr.length); // 3
 * console.log(arr[0]); // 1
 * console.log([...arr]); // [1, 2, 3]
 * 
 * @throws {TypeError} If an object argument is not a StaticArray and not serializable.
 * 
 * @param {...*} values - The elements of the StaticArray.
 * 
 * @property {number} length - The fixed length of the StaticArray (read-only).
 * 
 * @method includes
 * @description Checks if a value is present in the StaticArray.
 * @param {*} value - The value to search for.
 * @returns {boolean} True if the value is found, otherwise false.
 * 
 * @method indexOf
 * @description Returns the first index at which a given value can be found in the StaticArray.
 * @param {*} value - The value to locate in the array.
 * @returns {number} The index of the value, or -1 if not found.
 * 
 * @method toString
 * @description Returns a string representing the elements of the StaticArray.
 * @returns {string} A string representing the array.
 * 
 * @method [Symbol.iterator]
 * @description Enables iteration over the elements of the StaticArray using `for...of`.
 * @yields {*} The next value in the StaticArray.
 * 
 * @note The StaticArray instance and its contents are deeply immutable.
 * @note Objects are converted to StaticObject unless StaticArray.
 * @note Functions lose their binding in StaticArray.
 */
class StaticArray {
  constructor() {
    Object.defineProperty(
      this,
      'length',
      {
        value: arguments.length,
        writable: false,
        enumerable: false,
        configurable: false,
      }
    );

    Array.from(arguments).forEach((value, index) => {
      if (typeof value === 'object' && !(value instanceof StaticArray)) {
        return new StaticObject(value);
      }

      if (typeof value === 'function') {
        return eval(`(${value.toString()})`);
      };

      Object.defineProperty(this, index, {
        value,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    });

    Object.freeze(this);
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  }

  includes = Array.prototype.includes;
  indexOf = Array.prototype.indexOf;
  toString = Array.prototype.toString;
}

export default StaticArray;
