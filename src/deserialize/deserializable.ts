import { ObjectDef } from "../serializerObject";
import { ResolvedResult, UnresolverChecker } from "./checker";

export interface DeserializedPayload<O> {
    value: O;
}

export interface Deserializable<J, P extends DeserializedPayload<O>, O = P["value"]> {
    deserialize(json: ObjectDef<J>): P;
}

export abstract class BaseDeserializer<J, P extends DeserializedPayload<O>, O = P["value"]> implements Deserializable<J, P, O> {
    protected constructor(targetType: string);
    protected constructor(targetTypeList: string[]);
    protected constructor(target: string | string[]);
    protected constructor(readonly _target: string | string[]) {
        this.deserialize = new Proxy(this.deserialize, {
            apply: (target, thisArg, argArray: Parameters<BaseDeserializer<J, P, O>["deserialize"]>) => {
                this._validate(...argArray);
                return target.bind(thisArg)(...argArray);
            },
        });
    }

    abstract deserialize(json: ObjectDef<J>): P;

    _validate(json: ObjectDef<J>): void {
        if (typeof this._target === "string"
            ? json.type !== this._target
            : this._target.indexOf(json.type) === -1
        ) {
            throw new Error(`invalid type. (expected = ${this._target}, actual = ${json.type})`);
        }
    }
}

export interface ResolvingBaseDeserializerParameterObject {
    checker: UnresolverChecker;
}

export interface ResolvingDeserializedPayload<O> extends DeserializedPayload<O> {
    resolve?: Function;
    resolveAfter?: () => void;
}

export abstract class ResolvingBaseDeserializer<J, P extends ResolvingDeserializedPayload<O>, O = P["value"]> extends BaseDeserializer<J, P, O> {
    readonly _checker: UnresolverChecker;

    protected constructor(targetType: string, param: ResolvingBaseDeserializerParameterObject);
    protected constructor(targetTypeList: string[], param: ResolvingBaseDeserializerParameterObject);
    protected constructor(target: string | string[], param: ResolvingBaseDeserializerParameterObject);
    protected constructor(target: string | string[], param: ResolvingBaseDeserializerParameterObject) {
        super(target);
        this._checker = param.checker;
        this.deserialize = new Proxy(this.deserialize, {
            apply: (target, thisArg, argArray: Parameters<ResolvingBaseDeserializer<J, P, O>["deserialize"]>) => {
                const result = target.bind(thisArg)(...argArray);
                this._checker.add(result.value, this._getInitailResolvedResult(result));
                this._postDeserialize(result);
                return result;
            },
        });
    }

    _getInitailResolvedResult(result: P): ResolvedResult {
        return {
            dependency: result.resolve ? false : undefined,
            peerDependency: result.resolveAfter ? false : undefined,
        };
    }

    _postDeserialize(result: P): void {
        if (result.resolve) {
            result.resolve = new Proxy(result.resolve, {
                apply: (target, thisArg, argArray) => {
                    const ret = target.bind(thisArg)(...argArray);
                    this._checker.resolve(result.value, { dependency: true });
                    return ret;
                },
            });
        }
        if (result.resolveAfter) {
            result.resolveAfter = new Proxy(result.resolveAfter, {
                apply: (target, thisArg, argArray: Parameters<NonNullable<ResolvingDeserializedPayload<O>["resolveAfter"]>>) => {
                    const ret = target.bind(thisArg)(...argArray);
                    this._checker.resolve(result.value, { peerDependency: true });
                    return ret;
                },
            });
        }
    }
}

export interface ResolvingSiblingBaseDeserializerParameterObject extends ResolvingBaseDeserializerParameterObject {
}

export interface ResolvingSiblingDeserializedPayload<O> extends ResolvingDeserializedPayload<O> {
    resolveSibling: () => void;
}

export abstract class ResolvingSiblingBaseDeserializer<J, P extends ResolvingSiblingDeserializedPayload<O>, O = P["value"]> extends ResolvingBaseDeserializer<J, P, O> {
    override _postDeserialize(result: P): void {
        super._postDeserialize(result);
        result.resolveSibling = new Proxy(result.resolveSibling, {
            apply: (target, thisArg, argArray: Parameters<ResolvingSiblingDeserializedPayload<O>["resolveSibling"]>) => {
                const ret = target.bind(thisArg)(...argArray);
                this._checker.resolve(result.value, { sibling: true });
                return ret;
            },
        });
    }

    override _getInitailResolvedResult(result: P): ResolvedResult {
        return {
            ...super._getInitailResolvedResult(result),
            sibling: false,
        };
    }

    resolveSibling(p: P) {
        return p.resolveSibling;
    }
}
