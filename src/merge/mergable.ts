import { ObjectDef } from "../serializerObject";
import { UnresolverChecker } from "../deserialize/checker";

export interface ResolvingMergedPayload {
    resolveAfter: () => void;
}

export interface Mergable<J, O, P extends ResolvingMergedPayload> {
    merge(json: ObjectDef<J>, object: O): P;
}

export interface ResolvingBaseMergerParameterObject {
    checker: UnresolverChecker;
}

export abstract class ResolvingBaseMerger<J, O, P extends ResolvingMergedPayload> implements Mergable<J, O, P> {
    readonly _checker: UnresolverChecker;

    protected constructor(readonly _targetType: string, param: ResolvingBaseMergerParameterObject) {
        this._checker = param.checker;
        this.merge = new Proxy(this.merge, {
            apply: (target, thisArg, argArray: Parameters<ResolvingBaseMerger<J, O, P>["merge"]>) => {
                this._validate(argArray[0]);
                const result = target.bind(thisArg)(...argArray);
                this._checker.add(argArray[1], { peerDependency: true });
                this._postDeserialize(result, argArray[1]);
                return result;
            },
        });
    }

    abstract merge(json: ObjectDef<J>, object: O): P;

    _validate(json: ObjectDef<J>): void {
        if (json.type !== this._targetType) {
            throw new Error(`invalid type. (expected = ${this._targetType}, actual = ${json.type})`);
        }
    }

    _postDeserialize(result: P, object: O): void {
        result.resolveAfter = new Proxy(result.resolveAfter, {
            apply: (target, thisArg, argArray: Parameters<ResolvingMergedPayload["resolveAfter"]>) => {
                const ret = target.bind(thisArg)(...argArray);
                this._checker.resolve(object, { peerDependency: true });
                return ret;
            },
        });
    }
}
