import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { DynamicTreePairParam } from "../param/treePair";
import { ObjectStore } from "../scan/store";
import { Serializable } from "./serializable";

export const dynamicTreePairType = Box2DWeb.Collision.b2DynamicTreePair.name;

export interface DynamicTreePairSerializerParameterObject {
    node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
}

export class DynamicTreePairSerializer implements Serializable<Box2DWeb.Collision.b2DynamicTreePair, DynamicTreePairParam> {
    readonly _node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;

    constructor(param: DynamicTreePairSerializerParameterObject) {
        this._node = param.node;
    }

    serialize(object: Box2DWeb.Collision.b2DynamicTreePair): ObjectDef<DynamicTreePairParam> {
        return {
            type: dynamicTreePairType,
            param: {
                proxyA: this._node.refer(object.proxyA),
                proxyB: this._node.refer(object.proxyB),
            },
        };
    }
}
