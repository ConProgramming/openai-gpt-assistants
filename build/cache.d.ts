import { OpenAI } from "openai";
import { TypedEmitter } from "tiny-typed-emitter";
import { Context } from "./index.js";
export type ObjectType = "assistant" | "thread" | "message" | "run";
export type Id = string;
interface CacheEvents<T> {
    cacheInserted: (object: ObjectType, id: Id, value: T) => void;
    updated: (object: ObjectType, id: Id, value: T) => void;
    cacheRemoved: (object: ObjectType, id: Id, value: T) => void;
    fetched: (object: ObjectType, id: Id, value: T) => void;
    created: (object: ObjectType, id: Id, value: T) => void;
    deleted: (object: ObjectType, id: Id, value: T) => void;
}
export interface CacheItemEvents<T> {
    cacheInserted: (id: Id, value: T) => void;
    updated: (id: Id, value: T) => void;
    cacheRemoved: (id: Id, value: T) => void;
    fetched: (id: Id, value: T) => void;
    created: (id: Id, value: T) => void;
    deleted: (id: Id, value: T) => void;
}
export declare class Cache {
    private ctx;
    private _emitter;
    private _cache;
    constructor(ctx: Context);
    /**
     * Returns the emitter for the entire cache; emits events for all objects.
     */
    emitter<T = any>(): TypedEmitter<CacheEvents<T>>;
    /**
     * Returns the emitter for a specific object type; emits events for all items of that type.
     * @param object The object type to get the emitter for.
     * @throws If the object type is invalid
     */
    emitter<T = any>(object: ObjectType): TypedEmitter<CacheItemEvents<T>>;
    /**
     * Returns the emitter for a specific object type and id; emits events for that specific item.
     * @param object The object type
     * @param id The id of the object
     * @throws If the object type is invalid or the cache is empty for that id
     */
    emitter<T = any>(object: ObjectType, id: Id): TypedEmitter<CacheItemEvents<T>>;
    /**
     * Emits an event for an item in the cache, the object type, and the entire cache.
     */
    _emit<T>(event: keyof CacheEvents<T>, object: ObjectType, id: Id, value?: T): void;
    /**
     * Fetches an object from the API and caches it.
     * First emits either 'cacheInserted' or 'updated' events, then emits a 'fetched' event.
     * @param object ObjectType to fetch
     * @param id Id of the object to fetch. For 'message' and 'run' objects, this is an object with a threadId and id property.
     * @param options OpenAI.OpenAI.RequestOptions to pass to the fetch
     * @throws If the object type is invalid
     * @returns The fetched object
     */
    fetch<T>(object: ObjectType, id: Id | {
        threadId: Id;
        id: Id;
    }, options?: OpenAI.RequestOptions): Promise<T>;
    /**
     * Returns an object from the cache, or fetches it from the API if it's not in the cache, emitting events in the process.
     * @param object Object type
     * @param id Object id
     * @throws If the object type is invalid
     */
    getOrFetch<T = any>(object: ObjectType, id: Id, options?: OpenAI.RequestOptions): Promise<T>;
    /**
     * Gets an object from the cache
     * @param object Object type
     * @param id Object id
     * @throws If the object type is invalid
     * @returns The object or undefined if it's not in the cache
     */
    get<T = any>(object: ObjectType, id: Id): T | undefined;
    /**
     * Sets an object in the cache. If it already exists, emits an 'updated' event, otherwise emits an 'cacheInserted' event.
     * @param object Object type
     * @param id Object id
     * @param value Value to insert
     * @throws If the object type is invalid
     */
    set<T>(object: ObjectType, id: Id, value: T): void;
    /** Removes an item from the cache. Emits a 'cacheRemoved' event. */
    remove<T>(object: ObjectType, id: Id): void;
}
export {};
