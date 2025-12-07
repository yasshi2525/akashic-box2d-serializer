import { ObjectDef, RefParam } from "../serializerObject";
import { ReferableObjectDef, ReferableSerializable } from "../serialize/serializable";
import { SimpleStore } from "./scannable";

export const toRefTypeName = (typeName: string) => typeName + "Ref";

export class ObjectStore<O> implements SimpleStore<O> {
    readonly _refTypeName: string;
    readonly _store: Map<O, number>;
    _nextRefID: number;

    constructor(typeName: string) {
        this._refTypeName = toRefTypeName(typeName);
        this._store = new Map();
        this._nextRefID = 1;
    }

    has(object: O): boolean {
        return this._store.has(object);
    }

    add(object: O): void {
        if (this.has(object)) {
            return;
        }
        this._store.set(object, this._nextRefID);
        this._nextRefID++;
    }

    refer(object: O): ObjectDef<RefParam> {
        if (!this.has(object)) {
            throw new Error(`no ${this._refTypeName} object exists in store.`);
        }
        return this._toRef(this._store.get(object)!);
    }

    dump<J>(serializer: ReferableSerializable<O, J>): ReferableObjectDef<J>[] {
        return [...this._store.entries()].map(([o, id]) => serializer.serialize(o, this._toRef(id)));
    }

    clear(): void {
        this._store.clear();
    }

    _toRef(id: number): ObjectDef<RefParam> {
        return {
            type: this._refTypeName,
            param: {
                id,
            },
        };
    }
}
