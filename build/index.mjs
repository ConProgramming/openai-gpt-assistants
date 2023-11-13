import { Cache } from "./cache.js";
export * from "./assistant.js";
export * from "./cache.js";
export * from "./message.js";
export * from "./run.js";
export * from "./thread.js";
class Context {
  constructor(client, requestOptions = {}) {
    this.client = client;
    this.requestOptions = requestOptions;
    this.cache = new Cache(this);
  }
  cache;
  _opts(options) {
    const opts = {
      ...this.requestOptions,
      ...options
    };
    for (const key in opts) {
      const casted = key;
      if (opts[casted] === void 0) {
        delete opts[casted];
      }
    }
    return opts;
  }
}
export {
  Context
};
//# sourceMappingURL=index.mjs.map
