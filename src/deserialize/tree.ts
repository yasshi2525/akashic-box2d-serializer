import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { DynamicTreeParam } from "../param/tree";
import { dynamicTreeType } from "../serialize/tree";
import { ResolvingBaseDeserializer, ResolvingBaseDeserializerParameterObject, ResolvingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { DynamicTreeNodeDeserializedPayload } from "./treeNode";

export interface DynamicTreeDeserializedPayload extends ResolvingDeserializedPayload<Box2DWeb.Collision.b2DynamicTree> {
    resolveAfter: () => void;
}

export interface DynamicTreeDeserializerParameterObject extends ResolvingBaseDeserializerParameterObject {
    node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
}

export class DynamicTreeDeserializer extends ResolvingBaseDeserializer<DynamicTreeParam, DynamicTreeDeserializedPayload> {
    readonly _node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;

    constructor(param: DynamicTreeDeserializerParameterObject) {
        super(dynamicTreeType, param);
        this._node = param.node;
    }

    deserialize(json: ObjectDef<DynamicTreeParam>): DynamicTreeDeserializedPayload {
        const tree = new Box2DWeb.Collision.b2DynamicTree();
        tree.m_insertionCount = json.param.insertionCount;
        tree.m_path = json.param.path;
        return {
            value: tree,
            resolveAfter: () => {
                if (json.param.root) {
                    tree.m_root = this._node.resolve(json.param.root);
                }
                if (json.param.freeList) {
                    tree.m_freeList = this._node.resolve(json.param.freeList);
                }
            },
        };
    }
}
