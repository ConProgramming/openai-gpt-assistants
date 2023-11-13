import { OpenAI } from "openai/index.mjs";
import { Context } from "./index.js";
import { StatefulObject } from "./utils.js";
export interface AssistantEvents {
}
export declare class Assistant extends StatefulObject<Assistant, OpenAI.Beta.Assistant, AssistantEvents> {
    constructor(ctx: Context, id: string);
    static readonly object = "assistant";
    readonly object = "assistant";
    get name(): string | null;
    get description(): string | null;
    get instructions(): string | null;
    get model(): string;
    get fileIds(): string[];
    get createdAt(): Date;
    get metadata(): unknown;
    get tools(): (OpenAI.Beta.Assistants.Assistant.CodeInterpreter | OpenAI.Beta.Assistants.Assistant.Retrieval | OpenAI.Beta.Assistants.Assistant.Function)[];
    /**
     * Create an assistant with a model and instructions.
     */
    static create(ctx: Context, params: OpenAI.Beta.AssistantCreateParams, options?: OpenAI.RequestOptions): Promise<Assistant>;
    /** Constructs a new assistant object by fetching by id or returning from cache if already present. */
    static load(ctx: Context, id: string, options?: OpenAI.RequestOptions): Promise<Assistant>;
    /**
     * Deletes this assistant.
     */
    delete(options?: OpenAI.RequestOptions): Promise<OpenAI.Beta.Assistants.AssistantDeleted>;
    /**
     * Returns a list of assistants.
     */
    static list(ctx: Context, options?: OpenAI.RequestOptions): Promise<import("./utils.js").WrappedPage<Assistant>>;
    /**
     * Modifies this assistant.
     */
    update(params: OpenAI.Beta.AssistantUpdateParams, options?: OpenAI.RequestOptions): Promise<this>;
}
