import { ObjectDef, RefParam } from "../serializerObject";
import { ReferableObjectDef } from "../serialize/serializable";
import { Deserializable, DeserializedPayload } from "./deserializable";

export class ObjectResolver<P extends DeserializedPayload<O>, O = P["value"]> {
    readonly _table: Map<number, P>;

    constructor(readonly _refTypeName: string) {
        this._table = new Map();
    }

    deserialize<J>(
        json: ReferableObjectDef<J>[],
        deserializer: Deserializable<J, P, O>,
        afterAll?: (payload: P) => () => void,
    ): P[] {
        const result = json.reduce((result, def) => {
            const { payload, postProcess } = this.deserializeElement(def, deserializer, afterAll);
            result.payloads.push(payload);
            if (postProcess) {
                result.postProcessList.push(postProcess);
            }
            return result;
        }, { payloads: [], postProcessList: [] } as { payloads: P[]; postProcessList: (() => void)[] });
        for (const postProcess of result.postProcessList) {
            postProcess();
        }
        return result.payloads;
    }

    deserializeElement<J>(
        json: ReferableObjectDef<J>,
        deserializer: Deserializable<J, P, O>,
        afterAll?: (payload: P) => () => void,
    ) {
        this.validate(json.ref);
        const payload = deserializer.deserialize(json);
        this._table.set(json.ref.param.id, payload);
        return {
            payload,
            postProcess: afterAll ? afterAll(payload) : undefined,
        };
    }

    resolve(ref: ObjectDef<RefParam>): O {
        return this.resolvePayload(ref).value;
    }

    resolvePayload(ref: ObjectDef<RefParam>): P {
        this.validate(ref);
        if (!this._table.has(ref.param.id)) {
            throw new Error(`no ${this._refTypeName} object was resolved. (id = ${ref.param.id})`);
        }
        return this._table.get(ref.param.id)!;
    }

    validate(json: ObjectDef<RefParam>): void {
        if (json.type !== this._refTypeName) {
            throw new Error(`invalid refType. (expected = ${this._refTypeName}, actual = ${json.type})`);
        }
    }

    clear(): void {
        return this._table.clear();
    }
}
