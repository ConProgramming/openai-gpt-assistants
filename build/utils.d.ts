/// <reference types="node" resolution-mode="require"/>
import { OpenAI } from "openai";
import { CursorPage, CursorPageParams } from "openai/pagination.mjs";
import { DefaultListener, ListenerSignature, TypedEmitter } from "tiny-typed-emitter";
import { ObjectType } from "./cache.js";
import { Context } from "./index.js";
export interface StatefulObjectEvents<T> {
    cacheInserted: (value: T) => void;
    updated: (value: T) => void;
    cacheRemoved: (value: T) => void;
    fetched: (value: T) => void;
    created: (value: T) => void;
    deleted: (value: T) => void;
}
export declare class StatefulObject<Self extends StatefulObject<any, Wrapped, Events>, Wrapped = any, Events extends ListenerSignature<Events> = DefaultListener> extends TypedEmitter<Events & StatefulObjectEvents<Self>> {
    protected _ctx: Context;
    readonly object: ObjectType;
    private readonly _id;
    private _unsubscribe;
    constructor(_ctx: Context, object: ObjectType, _id: string);
    get wrappedValue(): Wrapped;
    protected get _cache(): import("./cache.js").Cache;
    get id(): string;
    /**
     * Fetches the object into the cache. Does not overwrite the value in the cache if already exists.
     */
    load(options?: OpenAI.RequestOptions): Promise<void>;
    /**
     * Fetches the object into the cache. Overwrites the value in the cache if already exists.
     */
    fetch(options?: OpenAI.RequestOptions): Promise<void>;
    /** Re-emit events from the cache that pertain to this object */
    private _subscribe;
    toString(): string;
}
export interface WrappedPage<T> {
    data: T[];
    getNextPage: () => Promise<WrappedPage<T>>;
    iterPages: () => AsyncGenerator<WrappedPage<T>>;
    hasNextPage(): boolean;
    nextPageInfo(): {
        url: URL;
    } | {
        params: Record<string, unknown> | null;
    } | null;
    nextPageParams(): Partial<CursorPageParams> | null;
}
/**
 * Facade on top of the page object that wraps results in StatefulObjects
 * @param ctx
 * @param page openai cursor page
 * @param initializer factory function to create the wrapped object
 */
export declare const createWrappedPage: <Wrapped extends StatefulObject<any, Inner, DefaultListener>, Inner extends {
    id: string;
}>(ctx: Context, page: OpenAI.CursorPage<Inner>, initializer: (ctx: Context, id: string) => Wrapped) => WrappedPage<Wrapped>;
