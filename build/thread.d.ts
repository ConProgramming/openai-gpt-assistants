import { OpenAI } from "openai";
import { Assistant, Context } from "./index.js";
import { Message } from "./message.js";
import { Run, RunCreateParams } from "./run.js";
import { StatefulObject } from "./utils.js";
export interface ThreadEvents {
}
export declare class Thread extends StatefulObject<Thread, OpenAI.Beta.Thread, ThreadEvents> {
    constructor(ctx: Context, id: string);
    static readonly object = "thread";
    readonly object = "thread";
    get createdAt(): Date;
    get metadata(): unknown;
    /** Constructs a new Thread object by fetching by id or returning from cache if already present. */
    static load(ctx: Context, id: string, options?: OpenAI.RequestOptions): Promise<Thread>;
    /** Creates a Thread. */
    static create(ctx: Context, params: OpenAI.Beta.ThreadCreateParams, options?: OpenAI.RequestOptions): Promise<Thread>;
    /** Creates a Thread and runs it (creates a Run also). */
    static createAndRun(ctx: Context, params: ThreadCreateAndRunParams, options?: OpenAI.RequestOptions): Promise<Run>;
    /** Runs the thread. */
    run(assistant: Assistant, options?: OpenAI.RequestOptions): Promise<Run>;
    /** Modifies this Thread. */
    update(params: OpenAI.Beta.ThreadUpdateParams, options?: OpenAI.RequestOptions): Promise<this>;
    createMessageAndRun(msgParams: OpenAI.Beta.Threads.MessageCreateParams, runParams: RunCreateParams, options?: OpenAI.RequestOptions): Promise<[Message, Run]>;
    messages(options?: OpenAI.RequestOptions): Promise<import("./utils.js").WrappedPage<Message>>;
}
export interface ThreadCreateAndRunParams extends Omit<OpenAI.Beta.ThreadCreateAndRunParams, "assistant_id"> {
    assistant: Assistant;
}
