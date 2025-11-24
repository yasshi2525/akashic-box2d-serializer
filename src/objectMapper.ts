import { ObjectDef } from "./serializerObject";

export interface RefParam {
    id: number;
}

export interface ObjectMapperParameterObject {
    refTypeName: string;
}

export class ObjectMapper<O> {
    _nextRefID: number;
    readonly _refTypeName: string;
    readonly _refToObject: Map<number, O>;
    readonly _objectToRef: Map<O, number>;

    constructor(param: ObjectMapperParameterObject) {
        this._nextRefID = 1;
        this._refTypeName = param.refTypeName;
        this._objectToRef = new Map();
        this._refToObject = new Map();
    }

    refer(object: O): ObjectDef<RefParam> {
        if (this._objectToRef.has(object)) {
            return {
                type: this._refTypeName,
                param: {
                    id: this._objectToRef.get(object)!,
                },
            };
        }
        else {
            const ref: ObjectDef<RefParam> = {
                type: this._refTypeName,
                param: {
                    id: this._nextRefID,
                },
            };
            this._objectToRef.set(object, ref.param.id);
            this._refToObject.set(ref.param.id, object);
            this._nextRefID++;
            return ref;
        }
    }

    resolve(ref: ObjectDef<RefParam>): O {
        if (ref.type !== this._refTypeName) {
            throw new Error(`unmatched type (expected = ${this._refTypeName}, actual = ${ref.type})`);
        }
        const object = this._refToObject.get(ref.param.id);
        if (object === undefined) {
            throw new Error(`no ${this._refTypeName} object was exists (id = ${ref.param.id})`);
        }
        return object;
    }

    objects(): O[] {
        return [...this._objectToRef.keys()];
    }
}
