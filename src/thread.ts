import OpenAI from "openai";
import { Assistant, Context } from "./index.js";
import { Message } from "./message.js";
import { Run, RunCreateParams } from "./run.js";
import { StatefulObject } from "./utils.js";

export interface ThreadEvents {
}

export class Thread extends StatefulObject<Thread, OpenAI.Beta.Thread, ThreadEvents> {
  constructor(ctx: Context, id: string) {
    super(ctx, Thread.object, id);
  }
  
  static readonly object = 'thread';
  readonly object = Thread.object;
  get createdAt() { return new Date(this.wrappedValue.created_at * 1000); }
  get metadata() { return this.wrappedValue.metadata; }

  /** Creates a Thread. */
  static async create(ctx: Context, params: OpenAI.Beta.ThreadCreateParams, options: OpenAI.RequestOptions = {}) {
    const thread = await ctx.client.beta.threads.create(params, ctx._opts(options));
    ctx.cache.set(this.object, thread.id, thread);
    ctx.cache._emit('created', this.object, thread.id, thread);
    return new Thread(ctx, thread.id);
  }

  /** Creates a Thread and runs it (creates a Run also). */
  static async createAndRun(ctx: Context, params: ThreadCreateAndRunParams, options: OpenAI.RequestOptions = {}) {
    const { assistant, ...rest } = params;
    const runParams = { ...rest, assistant_id: assistant.id };

    // Create the run and thread
    const _run = await ctx.client.beta.threads.createAndRun(runParams, ctx._opts(options));
    ctx.cache.set(Run.object, _run.id, _run);
    const run = new Run(ctx, new Thread(ctx, _run.thread_id), _run.id);

    // Fetch the thread too and load it into the cache
    const thread = await ctx.cache.fetch(Thread.object, _run.thread_id, ctx._opts({
      headers: options.headers,
      idempotencyKey: options.idempotencyKey,
      signal: options.signal,
      httpAgent: options.httpAgent,
      timeout: options.timeout
    }));

    // Emit the created events
    ctx.cache._emit('created', Thread.object, _run.thread_id, thread);
    ctx.cache._emit('created', Run.object, _run.id, _run);

    return run;
  }

  /** Modifies this Thread. */
  async update(params: OpenAI.Beta.ThreadUpdateParams, options: OpenAI.RequestOptions = {}) {
    const updated = await this._ctx.client.beta.threads.update(this.wrappedValue.id, params, this._ctx._opts(options));
    this._cache.set(this.object, updated.id, updated);
    return this;
  }

  async createMessageAndRun(msgParams: OpenAI.Beta.Threads.MessageCreateParams, runParams: RunCreateParams, options: OpenAI.RequestOptions = {}) {
    const message = await Message.create(this._ctx, this, msgParams, options);
    const run = await Run.create(this._ctx, this, runParams, options);
    return [message, run] satisfies [Message, Run];
  }
}

export interface ThreadCreateAndRunParams extends Omit<OpenAI.Beta.ThreadCreateAndRunParams, 'assistant_id'> {
  assistant: Assistant;
}