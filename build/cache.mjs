import { TypedEmitter } from "tiny-typed-emitter";
class Cache {
  constructor(ctx) {
    this.ctx = ctx;
  }
  _emitter = new TypedEmitter();
  _cache = {
    assistant: {
      data: {},
      emitter: new TypedEmitter()
    },
    thread: {
      data: {},
      emitter: new TypedEmitter()
    },
    message: {
      data: {},
      emitter: new TypedEmitter()
    },
    run: {
      data: {},
      emitter: new TypedEmitter()
    }
  };
  emitter(object, id) {
    if (!object)
      return this._emitter;
    const cache = this._cache[object];
    if (!cache)
      throw new Error(`Invalid object type ${object} to get emitter`);
    if (!id)
      return cache.emitter;
    const item = cache.data[id];
    if (!item)
      throw new Error(`Cannot get emitter when cache is empty for id ${id}`);
    return item.emitter;
  }
  /**
   * Emits an event for an item in the cache, the object type, and the entire cache.
   */
  _emit(event, object, id, value) {
    this.emitter().emit(event, object, id, value);
    this.emitter(object).emit(event, id, value);
    this.emitter(object, id).emit(event, id, value);
  }
  /**
   * Fetches an object from the API and caches it.
   * First emits either 'cacheInserted' or 'updated' events, then emits a 'fetched' event.
   * @param object ObjectType to fetch
   * @param id Id of the object to fetch. For 'message' and 'run' objects, this is an object with a threadId and id property.
   * @param options OpenAI.OpenAI.RequestOptions to pass to the fetch
   * @throws If the object type is invalid
   * @returns The fetched object
   */
  async fetch(object, id, options = {}) {
    let result;
    const opts = this.ctx._opts(options);
    switch (object) {
      case "assistant":
        if (typeof id !== "string")
          throw new Error(`Invalid id type ${typeof id} to fetch an ${object}`);
        result = await this.ctx.client.beta.assistants.retrieve(
          id,
          opts
        );
        break;
      case "thread":
        if (typeof id !== "string")
          throw new Error(`Invalid id type ${typeof id} to fetch an ${object}`);
        result = await this.ctx.client.beta.threads.retrieve(id, opts);
        break;
      case "message":
        if (typeof id !== "object")
          throw new Error(`Invalid id type ${typeof id} to fetch an ${object}`);
        result = await this.ctx.client.beta.threads.messages.retrieve(
          id.threadId,
          id.id,
          opts
        );
        break;
      case "run":
        if (typeof id !== "object")
          throw new Error(`Invalid id type ${typeof id} to fetch an ${object}`);
        result = await this.ctx.client.beta.threads.runs.retrieve(
          id.threadId,
          id.id,
          opts
        );
        break;
      default:
        throw new Error(`Invalid object type ${object} to fetch`);
    }
    const stringId = typeof id === "object" ? id.id : id;
    this.set(object, stringId, result);
    this._emit("fetched", object, stringId, result);
    return result;
  }
  /**
   * Returns an object from the cache, or fetches it from the API if it's not in the cache, emitting events in the process.
   * @param object Object type
   * @param id Object id
   * @throws If the object type is invalid
   */
  async getOrFetch(object, id, options) {
    const cache = this._cache[object];
    if (!cache)
      throw new Error(`Invalid object type ${object} to getOrFetch`);
    const existing = cache.data[id];
    if (existing)
      return existing.value;
    return await this.fetch(object, id, options);
  }
  /**
   * Gets an object from the cache
   * @param object Object type
   * @param id Object id
   * @throws If the object type is invalid
   * @returns The object or undefined if it's not in the cache
   */
  get(object, id) {
    const cache = this._cache[object];
    if (!cache)
      throw new Error(`Invalid object type ${object} to get`);
    return this._cache[object].data[id]?.value;
  }
  /**
   * Sets an object in the cache. If it already exists, emits an 'updated' event, otherwise emits an 'cacheInserted' event.
   * @param object Object type
   * @param id Object id
   * @param value Value to insert
   * @throws If the object type is invalid
   */
  set(object, id, value) {
    const cache = this._cache[object];
    if (!cache)
      throw new Error(`Invalid object type ${object} to set`);
    if (cache.data[id]) {
      const data = cache.data[id];
      if (data.value === value)
        return;
      data.value = value;
      this._emit("updated", object, id, value);
    } else {
      cache.data[id] = {
        value,
        emitter: new TypedEmitter()
      };
      this._emit("cacheInserted", object, id, value);
    }
  }
  /** Removes an item from the cache. Emits a 'cacheRemoved' event. */
  remove(object, id) {
    const cache = this._cache[object];
    if (!cache)
      throw new Error(`Invalid object type ${object} to remove`);
    if (cache.data[id]) {
      const data = cache.data[id];
      this._emit("cacheRemoved", object, id);
      data.emitter.removeAllListeners();
      delete cache.data[id];
    }
  }
}
export {
  Cache
};
//# sourceMappingURL=cache.mjs.map
