import { OpenAI } from "openai";
import { Assistant, Context } from "./index.js";
import { Thread } from "./thread.js";
import { StatefulObject } from "./utils.js";
export interface RunEvents {
    statusChanged: (status: RunStatus) => void;
    actionRequired: (action: OpenAI.Beta.Threads.Runs.Run["required_action"]) => void;
    finished: (err: unknown, status: RunStatus | null) => void;
}
export type RunStatus = OpenAI.Beta.Threads.Runs.Run["status"];
export declare class Run extends StatefulObject<Run, OpenAI.Beta.Threads.Runs.Run, RunEvents> {
    thread: Thread;
    private _pollInterval;
    private _pollStartTime;
    constructor(ctx: Context, thread: Thread, id: string);
    static readonly object = "run";
    readonly object = "run";
    /** Retrieves from cache or fetches if missing, then begins polling. */
    load(options?: OpenAI.RequestOptions): Promise<void>;
    /** Creates a Run and begins a polling process to check its status. */
    static create(ctx: Context, thread: Thread, params: RunCreateParams, options?: OpenAI.RequestOptions): Promise<Run>;
    /** Constructs a new Run object by fetching by id or returning from cache if already present. */
    static load(ctx: Context, thread: Thread, id: string, options?: OpenAI.RequestOptions): Promise<Run>;
    /**
     * Returns a list of Runs from a Thread.
     */
    static list(ctx: Context, thread: Thread, options?: OpenAI.RequestOptions): Promise<import("./utils.js").WrappedPage<Run>>;
    /** Modifies this Run */
    update(params: OpenAI.Beta.Threads.RunUpdateParams, options?: OpenAI.RequestOptions): Promise<this>;
    /** Cancels this Run */
    cancel(options?: OpenAI.RequestOptions): Promise<this>;
    /**
     * Submits tool outputs to this Run.
     */
    submitToolOutputs(params: OpenAI.Beta.Threads.RunSubmitToolOutputsParams, options?: OpenAI.RequestOptions): Promise<this>;
    /**
     * Returns a list of steps from this Run. Steps aren't cached.
     */
    listSteps(options?: OpenAI.RequestOptions): Promise<OpenAI.Beta.Threads.Runs.Steps.RunStepsPage>;
    /**
     * Gets a step by id. Steps aren't cached.
     */
    fetchStep(id: string, options?: OpenAI.RequestOptions): Promise<OpenAI.Beta.Threads.Runs.Steps.RunStep>;
    /**
     * Waits until this emitter emits a finished event, then returns the status.
     */
    waitUntilFinished(): Promise<"queued" | "in_progress" | "requires_action" | "cancelling" | "cancelled" | "failed" | "completed" | "expired">;
    /**
     * Polls the Run until it has finished. Emits events when the status changes.
     *
     * Note - for requires_action status, the actionRequired event will be emitted, then you can call submitToolOutputs()
     */
    beginPolling(options?: OpenAI.RequestOptions): void;
    endPolling(): void;
}
export interface RunCreateParams extends Omit<OpenAI.Beta.Threads.RunCreateParams, "assistant_id"> {
    assistant: Assistant;
}
