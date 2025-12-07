import { ObjectDef, RefParam } from "../serializerObject";

export interface ReferableObjectDef<T> extends ObjectDef<T> {
    ref: ObjectDef<RefParam>;
}

export interface Serializable<O, J> {
    serialize(object: O): ObjectDef<J>;
}

export interface ReferableSerializable<O, J> {
    serialize(object: O, ref: ObjectDef<RefParam>): ReferableObjectDef<J>;
}
