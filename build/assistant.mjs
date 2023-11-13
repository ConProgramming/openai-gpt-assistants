import { createWrappedPage, StatefulObject } from "./utils.js";
class Assistant extends StatefulObject {
  constructor(ctx, id) {
    super(ctx, Assistant.object, id);
  }
  static object = "assistant";
  object = Assistant.object;
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
    const created = new Assistant(ctx, assistant.id);
    return created;
  }
  /** Constructs a new assistant object by fetching by id or returning from cache if already present. */
  static async load(ctx, id, options) {
    const assistant = new Assistant(ctx, id);
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
      (ctx2, id) => new Assistant(ctx2, id)
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
}
export {
  Assistant
};
//# sourceMappingURL=assistant.mjs.map
