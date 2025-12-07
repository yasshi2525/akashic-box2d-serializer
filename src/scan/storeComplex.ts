import { ObjectDef, RefParam } from "../serializerObject";
import { ReferableObjectDef, ReferableSerializable } from "../serialize/serializable";
import { ObjectStore, toRefTypeName } from "./store";
import { SimpleStore } from "./scannable";

export class ComplexObjectStore<O> implements SimpleStore<O> {
    readonly _refTypeNameList: string[];
    readonly _typeNameResolver: (object: O) => string;
    readonly _storeTable: Map<string, ObjectStore<O>>;

    constructor(
        typeNameList: string[],
        typeNameResolver: (object: O) => string,
    ) {
        this._refTypeNameList = typeNameList.map(typeName => typeName + "Ref");
        this._typeNameResolver = typeNameResolver;
        this._storeTable = new Map();
        for (const typeName of typeNameList) {
            this._storeTable.set(typeName + "Ref", new ObjectStore<O>(typeName));
        }
    }

    has(object: O): boolean {
        return this._resolveStore(object).has(object);
    }

    add(object: O): void {
        this._resolveStore(object).add(object);
    }

    refer(object: O): ObjectDef<RefParam> {
        return this._resolveStore(object).refer(object);
    }

    dump<J>(serializer: ReferableSerializable<O, J>): ReferableObjectDef<J>[] {
        return [...this._storeTable.values()].reduce((arr, store) => arr.concat(store.dump(serializer)), [] as ReferableObjectDef<J>[]);
    }

    clear(): void {
        for (const store of this._storeTable.values()) {
            store.clear();
        }
    }

    _resolveStore(object: O): ObjectStore<O> {
        const refTypeName = toRefTypeName(this._typeNameResolver(object));
        if (!this._storeTable.has(refTypeName)) {
            throw new Error(`unsupported key. (refTypeName = ${refTypeName})`);
        }
        return this._storeTable.get(refTypeName)!;
    }
}
