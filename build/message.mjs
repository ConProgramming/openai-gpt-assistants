import { Assistant } from "./index.js";
import { Run } from "./run.js";
import { createWrappedPage, StatefulObject } from "./utils.js";
class Message extends StatefulObject {
  constructor(ctx, thread, id) {
    super(ctx, Message.object, id);
    this.thread = thread;
  }
  static object = "message";
  object = Message.object;
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
    const created = new Message(ctx, thread, message.id);
    return created;
  }
  /** Constructs a new Message object by fetching by id or returning from cache if already present. */
  static async load(ctx, thread, id, options) {
    const message = new Message(ctx, thread, id);
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
      (ctx2, id) => new Message(ctx2, thread, id)
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
}
export {
  Message
};
//# sourceMappingURL=message.mjs.map
