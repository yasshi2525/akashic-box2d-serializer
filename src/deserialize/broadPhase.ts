import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { DynamicTreeBroadPhaseParam } from "../param/broadPhase";
import { dynamicTreeBroadPhaseType } from "../serialize/broadPhase";
import { ResolvingBaseDeserializer, ResolvingBaseDeserializerParameterObject, ResolvingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { DynamicTreeNodeDeserializedPayload } from "./treeNode";
import { DynamicTreePairDeserializer } from "./treePair";
import { DynamicTreeDeserializer } from "./tree";

export interface DynamicTreeBroadPhaseDeserializedPayload extends ResolvingDeserializedPayload<Box2DWeb.Collision.b2DynamicTreeBroadPhase> {
    resolveAfter: () => void;
}

export interface DynamicTreeBroadPhaseDeserializerParameterObject extends ResolvingBaseDeserializerParameterObject {
    tree: DynamicTreeDeserializer;
    pair: DynamicTreePairDeserializer;
    node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
}

export class DynamicTreeBroadPhaseDeserializer extends ResolvingBaseDeserializer<DynamicTreeBroadPhaseParam, DynamicTreeBroadPhaseDeserializedPayload> {
    readonly _tree: DynamicTreeDeserializer;
    readonly _pair: DynamicTreePairDeserializer;
    readonly _node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;

    constructor(param: DynamicTreeBroadPhaseDeserializerParameterObject) {
        super(dynamicTreeBroadPhaseType, param);
        this._tree = param.tree;
        this._pair = param.pair;
        this._node = param.node;
    }

    deserialize(json: ObjectDef<DynamicTreeBroadPhaseParam>): DynamicTreeBroadPhaseDeserializedPayload {
        const broadPhase = new Box2DWeb.Collision.b2DynamicTreeBroadPhase();
        const { value, resolveAfter } = this._tree.deserialize(json.param.tree);
        broadPhase.m_tree = value;
        const pairPayloads = json.param.pairBuffer.map(p => this._pair.deserialize(p));
        broadPhase.m_pairBuffer = pairPayloads.map(p => p.value);
        broadPhase.m_pairCount = json.param.pairCount;
        broadPhase.m_proxyCount = json.param.proxyCount;
        return {
            value: broadPhase,
            resolveAfter: () => {
                resolveAfter();
                for (const p of pairPayloads) {
                    p.resolveAfter();
                }
                broadPhase.m_moveBuffer = json.param.moveBuffer.map(n => this._node.resolve(n));
            },
        };
    }
}
