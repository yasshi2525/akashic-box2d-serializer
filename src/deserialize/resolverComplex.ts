import { ObjectDef, RefParam } from "../serializerObject";
import { ReferableObjectDef } from "../serialize/serializable";
import { Deserializable, DeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";

export class ComplexObjectResolver<P extends DeserializedPayload<O>, O = P["value"]> {
    readonly _resolverTable: Map<string, ObjectResolver<P>>;

    constructor(readonly _refTypeNameList: string[]) {
        this._resolverTable = new Map();
        for (const refTypeName of _refTypeNameList) {
            this._resolverTable.set(refTypeName, new ObjectResolver<P>(refTypeName));
        }
    }

    deserialize<J>(
        json: ReferableObjectDef<J>[],
        deserializer: Deserializable<J, P, O>,
        afterAll?: (payload: P) => () => void,
    ): P[] {
        const result = json.reduce((result, def) => {
            const resolver = this._resolveResolver(this._resolveRefType(def));
            const { payload, postProcess } = resolver.deserializeElement(def, deserializer, afterAll);
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

    resolve(ref: ObjectDef<RefParam>): O {
        return this._resolveResolver(ref.type).resolve(ref);
    }

    resolvePayload(ref: ObjectDef<RefParam>): P {
        return this._resolveResolver(ref.type).resolvePayload(ref);
    }

    clear(): void {
        for (const resolver of this._resolverTable.values()) {
            resolver.clear();
        }
    }

    _resolveRefType<J>(json: ReferableObjectDef<J>): string {
        return json.ref.type;
    }

    _resolveResolver(refType: string): ObjectResolver<P> {
        if (!this._resolverTable.has(refType)) {
            throw new Error(`unsupported refType (refType = ${refType})`);
        }
        return this._resolverTable.get(refType)!;
    }
}
