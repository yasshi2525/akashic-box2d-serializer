/**
 * B2DynamicTreeNode オブジェクト型の識別子
 */

import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { AABBParam, AABBSerializer } from "./serializerAABB";

export const dynamicTreeNodeType = Box2DWeb.Collision.b2DynamicTreeNode.name;

/**
 * B2DynamicTreeNode オブジェクトを復元可能な形式で直列化したJSONです。
 * 再帰防止のため userData は直列化対象外です。
 * これは B2DynamicTreeNode が Proxy 用途で使われることを考慮しているためです。
 */
export interface DynamicTreeNodeParam {
    aabb: ObjectDef<AABBParam>;
}

export interface DynamicTreeNodeParameterObject {
    aabbSerializer: AABBSerializer;
}

/**
 * B2DynamicTreeNode オブジェクトを直列化・復元可能にします
 */
export class DynamicTreeNodeSerializer implements ObjectSerializer<Box2DWeb.Collision.b2DynamicTreeNode, DynamicTreeNodeParam> {
    readonly _AABBSerializer: AABBSerializer;

    constructor(param: DynamicTreeNodeParameterObject) {
        this._AABBSerializer = param.aabbSerializer;
    }

    filter(objectType: string): boolean {
        return objectType === dynamicTreeNodeType;
    }

    /**
     * 再帰防止のため userData は直列化対象外です。
     * @inheritdoc
     */
    serialize(object: Box2DWeb.Collision.b2DynamicTreeNode): ObjectDef<DynamicTreeNodeParam> {
        return {
            type: dynamicTreeNodeType,
            param: {
                aabb: this._AABBSerializer.serialize(object.aabb),
            },
        };
    }

    /**
     * 再帰防止のため userData は復元されません。
     * @inheritdoc
     */
    deserialize(json: ObjectDef<DynamicTreeNodeParam>): Box2DWeb.Collision.b2DynamicTreeNode {
        const proxy = new Box2DWeb.Collision.b2DynamicTreeNode();
        proxy.aabb = this._AABBSerializer.deserialize(json.param.aabb);
        return proxy;
    }
}
