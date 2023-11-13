"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/tiny-typed-emitter/lib/index.js
var require_lib = __commonJS({
  "node_modules/tiny-typed-emitter/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypedEmitter = require("events").EventEmitter;
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Assistant: () => Assistant,
  Cache: () => Cache,
  Context: () => Context2,
  Message: () => Message,
  Run: () => Run,
  Thread: () => Thread
});
module.exports = __toCommonJS(src_exports);

// src/cache.ts
var import_tiny_typed_emitter = __toESM(require_lib(), 1);
var Cache = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  _emitter = new import_tiny_typed_emitter.TypedEmitter();
  _cache = {
    assistant: {
      data: {},
      emitter: new import_tiny_typed_emitter.TypedEmitter()
    },
    thread: {
      data: {},
      emitter: new import_tiny_typed_emitter.TypedEmitter()
    },
    message: {
      data: {},
      emitter: new import_tiny_typed_emitter.TypedEmitter()
    },
    run: {
      data: {},
      emitter: new import_tiny_typed_emitter.TypedEmitter()
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
        emitter: new import_tiny_typed_emitter.TypedEmitter()
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
};

// src/utils.ts
var import_tiny_typed_emitter2 = __toESM(require_lib(), 1);
var StatefulObject = class extends import_tiny_typed_emitter2.TypedEmitter {
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
};
var createWrappedPage = (ctx, page, initializer) => ({
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

// src/assistant.ts
var Assistant = class _Assistant extends StatefulObject {
  constructor(ctx, id) {
    super(ctx, _Assistant.object, id);
  }
  static object = "assistant";
  object = _Assistant.object;
  get name() {
    return this.wrappedValue.name;
  }
  get description() {
    return this.wrappedValue.description;
  }
  get instructions() {
    return this.wrappedValue.instructions;
  }
  get model() {
    return this.wrappedValue.model;
  }
  get fileIds() {
    return this.wrappedValue.file_ids;
  }
  get createdAt() {
    return new Date(this.wrappedValue.created_at * 1e3);
  }
  get metadata() {
    return this.wrappedValue.metadata;
  }
  get tools() {
    return this.wrappedValue.tools;
  }
  /**
   * Create an assistant with a model and instructions.
   */
  static async create(ctx, params, options = {}) {
    const assistant = await ctx.client.beta.assistants.create(
      params,
      ctx._opts(options)
    );
    ctx.cache.set(this.object, assistant.id, assistant);
    ctx.cache._emit("created", this.object, assistant.id, assistant);
    const created = new _Assistant(ctx, assistant.id);
    return created;
  }
  /** Constructs a new assistant object by fetching by id or returning from cache if already present. */
  static async load(ctx, id, options) {
    const assistant = new _Assistant(ctx, id);
    await assistant.load(options);
    return assistant;
  }
  /**
   * Deletes this assistant.
   */
  async delete(options = {}) {
    const deleted = await this._ctx.client.beta.assistants.del(
      this.wrappedValue.id,
      this._ctx._opts(options)
    );
    if (deleted.deleted) {
      this._cache._emit("deleted", this.object, this.wrappedValue.id);
      this._cache.remove(this.object, this.wrappedValue.id);
    }
    return deleted;
  }
  /**
   * Returns a list of assistants.
   */
  static async list(ctx, options = {}) {
    const page = await ctx.client.beta.assistants.list(ctx._opts(options));
    const wrapped = createWrappedPage(
      ctx,
      page,
      (ctx2, id) => new _Assistant(ctx2, id)
    );
    return wrapped;
  }
  /**
   * Modifies this assistant.
   */
  async update(params, options = {}) {
    const assistant = await this._ctx.client.beta.assistants.update(
      this.wrappedValue.id,
      params,
      this._ctx._opts(options)
    );
    this._cache.set(this.object, assistant.id, assistant);
    return this;
  }
};

// src/run.ts
var POLL_INTERVAL_MS = 750;
var POLL_TIMEOUT_MS = 1e3 * 60 * 2;
var Run = class _Run extends StatefulObject {
  constructor(ctx, thread, id) {
    super(ctx, _Run.object, id);
    this.thread = thread;
  }
  _pollInterval = null;
  _pollStartTime = 0;
  static object = "run";
  object = _Run.object;
  /** Retrieves from cache or fetches if missing, then begins polling. */
  async load(options) {
    await super.load(options);
    this.beginPolling();
  }
  /** Creates a Run and begins a polling process to check its status. */
  static async create(ctx, thread, params, options = {}) {
    const { assistant, ...rest } = params;
    const runParams = { ...rest, assistant_id: assistant.id };
    const run = await ctx.client.beta.threads.runs.create(
      thread.id,
      runParams,
      options
    );
    ctx.cache.set(this.object, run.id, run);
    ctx.cache._emit("created", this.object, run.id, run);
    const created = new _Run(ctx, thread, run.id);
    created.beginPolling();
    return created;
  }
  /** Constructs a new Run object by fetching by id or returning from cache if already present. */
  static async load(ctx, thread, id, options) {
    const run = new _Run(ctx, thread, id);
    await run.load(options);
    return run;
  }
  /**
   * Returns a list of Runs from a Thread.
   */
  static async list(ctx, thread, options = {}) {
    const page = await ctx.client.beta.threads.runs.list(
      thread.id,
      ctx._opts(options)
    );
    return createWrappedPage(ctx, page, (ctx2, id) => new _Run(ctx2, thread, id));
  }
  /** Modifies this Run */
  async update(params, options = {}) {
    const result = await this._ctx.client.beta.threads.runs.update(
      this.thread.id,
      this.id,
      params,
      options
    );
    this._cache.set(this.object, this.id, result);
    return this;
  }
  /** Cancels this Run */
  async cancel(options = {}) {
    const result = await this._ctx.client.beta.threads.runs.cancel(
      this.thread.id,
      this.id,
      options
    );
    this._cache.set(this.object, this.id, result);
    return this;
  }
  /**
   * Submits tool outputs to this Run.
   */
  async submitToolOutputs(params, options = {}) {
    const result = await this._ctx.client.beta.threads.runs.submitToolOutputs(
      this.thread.id,
      this.id,
      params,
      options
    );
    this._cache.set(this.object, this.id, result);
    return this;
  }
  /**
   * Returns a list of steps from this Run. Steps aren't cached.
   */
  async listSteps(options = {}) {
    const page = await this._ctx.client.beta.threads.runs.steps.list(
      this.thread.id,
      this.id,
      options
    );
    return page;
  }
  /**
   * Gets a step by id. Steps aren't cached.
   */
  async fetchStep(id, options = {}) {
    const step = await this._ctx.client.beta.threads.runs.steps.retrieve(
      this.thread.id,
      this.id,
      id,
      options
    );
    return step;
  }
  /**
   * Waits until this emitter emits a finished event, then returns the status.
   */
  async waitUntilFinished() {
    if (this._pollInterval === null) {
      this.beginPolling();
    }
    return new Promise((resolve, reject) => {
      this.once("finished", (err, status) => {
        if (err)
          reject(err);
        else
          resolve(status);
      });
    });
  }
  /**
   * Polls the Run until it has finished. Emits events when the status changes.
   *
   * Note - for requires_action status, the actionRequired event will be emitted, then you can call submitToolOutputs()
   */
  beginPolling(options = {}) {
    this.endPolling();
    this._pollStartTime = Date.now();
    this._pollInterval = setInterval(async () => {
      const elapsed = Date.now() - this._pollStartTime;
      if (elapsed > POLL_TIMEOUT_MS) {
        this.endPolling();
        this.emit(
          "finished",
          new Error(
            `Polling for Run id ${this.id} timed out after ${POLL_TIMEOUT_MS / 1e3} seconds`
          ),
          null
        );
        return;
      }
      const oldRun = this.wrappedValue;
      let run;
      try {
        run = await this._ctx.cache.fetch(
          _Run.object,
          { id: this.id, threadId: this.thread.id },
          options
        );
      } catch (err) {
        console.error(`Error fetching Run id ${this.id} during polling:`, err);
        this.emit("finished", err, null);
        this.endPolling();
        return;
      }
      if (run.status !== oldRun.status)
        this.emit("statusChanged", run.status);
      if (run.status === "requires_action") {
        this.emit("actionRequired", run.required_action);
      }
      const exitStatuses = [
        "cancelled",
        "expired",
        "completed",
        "failed"
      ];
      if (exitStatuses.includes(run.status)) {
        this.endPolling();
        await this.thread.fetch();
        this.emit("finished", null, run.status);
        return;
      }
    }, POLL_INTERVAL_MS);
  }
  endPolling() {
    clearInterval(this._pollInterval);
    this._pollInterval = null;
    this._pollStartTime = 0;
  }
};

// src/message.ts
var Message = class _Message extends StatefulObject {
  constructor(ctx, thread, id) {
    super(ctx, _Message.object, id);
    this.thread = thread;
  }
  static object = "message";
  object = _Message.object;
  get createdAt() {
    return new Date(this.wrappedValue.created_at * 1e3);
  }
  get content() {
    return this.wrappedValue.content;
  }
  get assistant() {
    return this.wrappedValue.assistant_id ? new Assistant(this._ctx, this.wrappedValue.assistant_id) : null;
  }
  get fileIds() {
    return this.wrappedValue.file_ids;
  }
  get metadata() {
    return this.wrappedValue.metadata;
  }
  get role() {
    return this.wrappedValue.role;
  }
  get run() {
    return this.wrappedValue.run_id ? new Run(this._ctx, this.thread, this.wrappedValue.run_id) : null;
  }
  /** Creates a message */
  static async create(ctx, thread, params, options = {}) {
    const message = await ctx.client.beta.threads.messages.create(
      thread.id,
      params,
      options
    );
    ctx.cache.set(this.object, message.id, message);
    ctx.cache._emit("created", this.object, message.id, message);
    const created = new _Message(ctx, thread, message.id);
    return created;
  }
  /** Constructs a new Message object by fetching by id or returning from cache if already present. */
  static async load(ctx, thread, id, options) {
    const message = new _Message(ctx, thread, id);
    await message.load(options);
    return message;
  }
  /** Modifies a message */
  async update(params, options = {}) {
    const result = await this._ctx.client.beta.threads.messages.update(
      this.thread.id,
      this.id,
      params,
      options
    );
    this._cache.set(this.object, this.id, result);
    return this;
  }
  /**
   * Returns a list of messages from a thread.
   */
  static async list(ctx, thread, options = {}) {
    const page = await ctx.client.beta.threads.messages.list(
      thread.id,
      ctx._opts(options)
    );
    return createWrappedPage(
      ctx,
      page,
      (ctx2, id) => new _Message(ctx2, thread, id)
    );
  }
  /**
   * Returns a list of files from a message. Files aren't cached.
   */
  async listFiles(query, options = {}) {
    const page = await this._ctx.client.beta.threads.messages.files.list(
      this.thread.id,
      this.id,
      query,
      this._ctx._opts(options)
    );
    return page;
  }
  /**
   * Gets a file by id. Files aren't cached.
   */
  async fetchFile(id, options = {}) {
    const file = await this._ctx.client.beta.threads.messages.files.retrieve(
      this.thread.id,
      this.id,
      id,
      this._ctx._opts(options)
    );
    return file;
  }
};

// src/thread.ts
var Thread = class _Thread extends StatefulObject {
  constructor(ctx, id) {
    super(ctx, _Thread.object, id);
  }
  static object = "thread";
  object = _Thread.object;
  get createdAt() {
    return new Date(this.wrappedValue.created_at * 1e3);
  }
  get metadata() {
    return this.wrappedValue.metadata;
  }
  /** Constructs a new Thread object by fetching by id or returning from cache if already present. */
  static async load(ctx, id, options) {
    const thread = new _Thread(ctx, id);
    await thread.load(options);
    return thread;
  }
  /** Creates a Thread. */
  static async create(ctx, params, options = {}) {
    const thread = await ctx.client.beta.threads.create(
      params,
      ctx._opts(options)
    );
    ctx.cache.set(this.object, thread.id, thread);
    ctx.cache._emit("created", this.object, thread.id, thread);
    return new _Thread(ctx, thread.id);
  }
  /** Creates a Thread and runs it (creates a Run also). */
  static async createAndRun(ctx, params, options = {}) {
    const { assistant, ...rest } = params;
    const runParams = { ...rest, assistant_id: assistant.id };
    const _run = await ctx.client.beta.threads.createAndRun(
      runParams,
      ctx._opts(options)
    );
    ctx.cache.set(Run.object, _run.id, _run);
    const run = new Run(
      ctx,
      await _Thread.load(ctx, _run.thread_id, options),
      _run.id
    );
    run.beginPolling();
    ctx.cache._emit(
      "created",
      _Thread.object,
      _run.thread_id,
      ctx.cache.get(_Thread.object, _run.thread_id)
    );
    ctx.cache._emit("created", Run.object, _run.id, _run);
    return run;
  }
  /** Runs the thread. */
  async run(assistant, options) {
    const run = await Run.create(this._ctx, this, { assistant }, options);
    return run;
  }
  /** Modifies this Thread. */
  async update(params, options = {}) {
    const updated = await this._ctx.client.beta.threads.update(
      this.wrappedValue.id,
      params,
      this._ctx._opts(options)
    );
    this._cache.set(this.object, updated.id, updated);
    return this;
  }
  /* Creates a new message and a new run which will auto-poll for status changes. Returns a tuple. */
  async createMessageAndRun(msgParams, runParams, options = {}) {
    const message = await Message.create(this._ctx, this, msgParams, options);
    const run = await Run.create(this._ctx, this, runParams, options);
    return [message, run];
  }
  async messages(options = {}) {
    return await Message.list(this._ctx, this, options);
  }
};

// src/index.ts
var Context2 = class {
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
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Assistant,
  Cache,
  Context,
  Message,
  Run,
  Thread
});
//# sourceMappingURL=index.cjs.map
