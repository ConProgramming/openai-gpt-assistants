import { OpenAI } from "openai";
import { Cache } from "./cache.js";
export * from "./assistant.js";
export * from "./cache.js";
export * from "./message.js";
export * from "./run.js";
export * from "./thread.js";
type GlobalRequestOptions = Exclude<OpenAI.RequestOptions, "method" | "body" | "query" | "path">;
export declare class Context {
    readonly client: OpenAI;
    requestOptions: GlobalRequestOptions;
    cache: Cache;
    constructor(client: OpenAI, requestOptions?: GlobalRequestOptions);
    _opts(options: OpenAI.RequestOptions): OpenAI.RequestOptions;
}
