import {
  TypedEmitter
} from "tiny-typed-emitter";
class StatefulObject extends TypedEmitter {
  constructor(_ctx, object, _id) {
    super();
    this._ctx = _ctx;
    this.object = object;
    this._id = _id;
    this._subscribe();
  }
  _unsubscribe = () => {
  };
  get wrappedValue() {
    const val = this._ctx.cache.get(this.object, this._id);
    if (!val) {
      throw new Error(
        "Attempted to access wrapped value of a stateful object that has not been loaded. Do you need to call load()? Was the ID invalid?"
      );
    }
    return val;
  }
  get _cache() {
    return this._ctx.cache;
  }
  get id() {
    return this._id;
  }
  /**
   * Fetches the object into the cache. Does not overwrite the value in the cache if already exists.
   */
  async load(options) {
    await this._ctx.cache.getOrFetch(this.object, this._id, options);
    this._subscribe();
  }
  /**
   * Fetches the object into the cache. Overwrites the value in the cache if already exists.
   */
  async fetch(options) {
    await this._ctx.cache.fetch(this.object, this._id, options);
  }
  /** Re-emit events from the cache that pertain to this object */
  _subscribe() {
    const listeners = {};
    const createListener = (key) => {
      listeners[key] = (id) => {
        if (id === this._id) {
          this.emit(key, ...[this]);
        }
      };
      return listeners[key];
    };
    if (!this._ctx.cache.get(this.object, this.id)) {
      return;
    }
    this._unsubscribe();
    const emitter = this._ctx.cache.emitter(this.object, this.id);
    emitter.addListener("cacheInserted", createListener("cacheInserted"));
    emitter.addListener("cacheRemoved", createListener("cacheRemoved"));
    emitter.addListener("updated", createListener("updated"));
    emitter.addListener("fetched", createListener("fetched"));
    emitter.addListener("created", createListener("created"));
    emitter.addListener("deleted", createListener("deleted"));
    this._unsubscribe = () => {
      for (const key in listeners) {
        emitter.removeListener(
          key,
          listeners[key]
        );
      }
      this._unsubscribe = () => {
      };
    };
  }
  toString() {
    return `${this.object}#${this.id}`;
  }
}
const createWrappedPage = (ctx, page, initializer) => ({
  data: page.data.map((item) => {
    const value = initializer(ctx, item.id);
    ctx.cache.set(value.object, item.id, item);
    return value;
  }),
  getNextPage() {
    return page.getNextPage().then((page2) => createWrappedPage(ctx, page2, initializer));
  },
  hasNextPage: page.hasNextPage,
  async *iterPages() {
    yield await page.iterPages().next().then(
      (page2) => createWrappedPage(ctx, page2.value, initializer)
    );
  },
  nextPageInfo: page.nextPageInfo,
  nextPageParams: page.nextPageParams
});
export {
  StatefulObject,
  createWrappedPage
};
//# sourceMappingURL=utils.mjs.map
