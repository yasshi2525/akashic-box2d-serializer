import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { DynamicTreeBroadPhaseParam } from "../param/broadPhase";
import { ObjectStore } from "../scan/store";
import { Serializable } from "./serializable";
import { DynamicTreeSerializer } from "./tree";
import { DynamicTreePairSerializer } from "./treePair";

export const dynamicTreeBroadPhaseType = Box2DWeb.Collision.b2DynamicTreeBroadPhase.name;

export interface DynamicTreeBroadPhaseSerializerParameterObject {
    tree: DynamicTreeSerializer;
    pair: DynamicTreePairSerializer;
    node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
}

export class DynamicTreeBroadPhaseSerializer implements Serializable<Box2DWeb.Collision.b2DynamicTreeBroadPhase, DynamicTreeBroadPhaseParam> {
    readonly _tree: DynamicTreeSerializer;
    readonly _pair: DynamicTreePairSerializer;
    readonly _node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;

    constructor(param: DynamicTreeBroadPhaseSerializerParameterObject) {
        this._tree = param.tree;
        this._pair = param.pair;
        this._node = param.node;
    }

    serialize(object: Box2DWeb.Collision.b2DynamicTreeBroadPhase): ObjectDef<DynamicTreeBroadPhaseParam> {
        return {
            type: dynamicTreeBroadPhaseType,
            param: {
                tree: this._tree.serialize(object.m_tree),
                moveBuffer: object.m_moveBuffer.map(n => this._node.refer(n)),
                pairBuffer: object.m_pairBuffer.map(p => this._pair.serialize(p)),
                pairCount: object.m_pairCount,
                proxyCount: object.m_proxyCount,
            },
        };
    }
}
