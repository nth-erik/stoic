class StaticObject {
  static #freezeFunction(fn) {
    const frozenFn = function (...args) {
      return fn.apply(this, args);
    };

    Object.defineProperties(frozenFn, Object.getOwnPropertyDescriptors(fn));
    Object.freeze(frozenFn);

    return frozenFn;
  }
  
  static #deepFreeze(value) {
    if (typeof value === "object") return new StaticObject(value);
    return typeof value === "function" ? StaticObject.#freezeFunction(value) : value;
  }
  
  constructor(sample) {
    const copy = Object.create(null);

    if (sample === null || typeof sample !== "object") return copy;

    for (const key of Reflect.ownKeys(sample)) {
      const value = sample[key];
      copy[key] = StaticObject.#deepFreeze(value);
    }

    Object.freeze(copy);
    return copy;
  }
}

export default StaticObject;
