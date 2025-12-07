import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { DynamicTreeParam } from "../param/tree";
import { ObjectStore } from "../scan/store";
import { Serializable } from "./serializable";

export const dynamicTreeType = Box2DWeb.Collision.b2DynamicTree.name;

export interface DynamicTreeSerializerParameterObject {
    node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
}

export class DynamicTreeSerializer implements Serializable<Box2DWeb.Collision.b2DynamicTree, DynamicTreeParam> {
    readonly _node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;

    constructor(param: DynamicTreeSerializerParameterObject) {
        this._node = param.node;
    }

    serialize(object: Box2DWeb.Collision.b2DynamicTree): ObjectDef<DynamicTreeParam> {
        return {
            type: dynamicTreeType,
            param: {
                root: object.m_root ? this._node.refer(object.m_root) : undefined,
                freeList: object.m_freeList ? this._node.refer(object.m_freeList) : undefined,
                insertionCount: object.m_insertionCount,
                path: object.m_path,
            },
        };
    }
}
