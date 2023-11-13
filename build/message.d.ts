import { OpenAI } from "openai";
import { Assistant, Context } from "./index.js";
import { Run } from "./run.js";
import { Thread } from "./thread.js";
import { StatefulObject } from "./utils.js";
export interface MessageEvents {
}
export declare class Message extends StatefulObject<Message, OpenAI.Beta.Threads.Messages.ThreadMessage, MessageEvents> {
    thread: Thread;
    constructor(ctx: Context, thread: Thread, id: string);
    static readonly object = "message";
    readonly object = "message";
    get createdAt(): Date;
    get content(): (OpenAI.Beta.Threads.Messages.MessageContentImageFile | OpenAI.Beta.Threads.Messages.MessageContentText)[];
    get assistant(): Assistant | null;
    get fileIds(): string[];
    get metadata(): unknown;
    get role(): "assistant" | "user";
    get run(): Run | null;
    /** Creates a message */
    static create(ctx: Context, thread: Thread, params: OpenAI.Beta.Threads.MessageCreateParams, options?: OpenAI.RequestOptions): Promise<Message>;
    /** Constructs a new Message object by fetching by id or returning from cache if already present. */
    static load(ctx: Context, thread: Thread, id: string, options?: OpenAI.RequestOptions): Promise<Message>;
    /** Modifies a message */
    update(params: OpenAI.Beta.Threads.MessageUpdateParams, options?: OpenAI.RequestOptions): Promise<this>;
    /**
     * Returns a list of messages from a thread.
     */
    static list(ctx: Context, thread: Thread, options?: OpenAI.RequestOptions): Promise<import("./utils.js").WrappedPage<Message>>;
    /**
     * Returns a list of files from a message. Files aren't cached.
     */
    listFiles(query?: OpenAI.Beta.Threads.Messages.Files.FileListParams, options?: OpenAI.RequestOptions): Promise<OpenAI.Beta.Threads.Messages.Files.MessageFilesPage>;
    /**
     * Gets a file by id. Files aren't cached.
     */
    fetchFile(id: string, options?: OpenAI.RequestOptions): Promise<OpenAI.Beta.Threads.Messages.Files.MessageFile>;
}
