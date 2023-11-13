import { createWrappedPage, StatefulObject } from "./utils.js";
const POLL_INTERVAL_MS = 750;
const POLL_TIMEOUT_MS = 1e3 * 60 * 2;
class Run extends StatefulObject {
  constructor(ctx, thread, id) {
    super(ctx, Run.object, id);
    this.thread = thread;
  }
  _pollInterval = null;
  _pollStartTime = 0;
  static object = "run";
  object = Run.object;
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
    const created = new Run(ctx, thread, run.id);
    created.beginPolling();
    return created;
  }
  /** Constructs a new Run object by fetching by id or returning from cache if already present. */
  static async load(ctx, thread, id, options) {
    const run = new Run(ctx, thread, id);
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
    return createWrappedPage(ctx, page, (ctx2, id) => new Run(ctx2, thread, id));
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
          Run.object,
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
}
export {
  Run
};
//# sourceMappingURL=run.mjs.map
