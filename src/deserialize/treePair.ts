import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { DynamicTreePairParam } from "../param/treePair";
import { dynamicTreePairType } from "../serialize/treePair";
import { ResolvingBaseDeserializer, ResolvingBaseDeserializerParameterObject, ResolvingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { DynamicTreeNodeDeserializedPayload } from "./treeNode";

export interface DynamicTreePairDeserializedPayload extends ResolvingDeserializedPayload<Box2DWeb.Collision.b2DynamicTreePair> {
    resolveAfter: () => void;
}

export interface DynamicTreePairDeserializerParameterObject extends ResolvingBaseDeserializerParameterObject {
    node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
}

export class DynamicTreePairDeserializer extends ResolvingBaseDeserializer<DynamicTreePairParam, DynamicTreePairDeserializedPayload> {
    readonly _node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;

    constructor(param: DynamicTreePairDeserializerParameterObject) {
        super(dynamicTreePairType, param);
        this._node = param.node;
    }

    deserialize(json: ObjectDef<DynamicTreePairParam>): DynamicTreePairDeserializedPayload {
        const pair = new Box2DWeb.Collision.b2DynamicTreePair();
        return {
            value: pair,
            resolveAfter: () => {
                pair.proxyA = this._node.resolve(json.param.proxyA);
                pair.proxyB = this._node.resolve(json.param.proxyB);
            },
        };
    }
}
