import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { DynamicTreeNodeParam } from "../param/treeNode";
import { ReferableObjectDef } from "../serialize/serializable";
import { dynamicTreeNodeType } from "../serialize/treeNode";
import { ResolvingSiblingBaseDeserializer, ResolvingSiblingBaseDeserializerParameterObject, ResolvingSiblingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { AABBDeserializer } from "./aabb";
import { FixtureDeserializedPayload } from "./fixture";

export interface DynamicTreeNodeDeserializedPayload extends ResolvingSiblingDeserializedPayload<Box2DWeb.Collision.b2DynamicTreeNode> {
    resolve?: ((parent: Box2DWeb.Collision.b2DynamicTreeNode) => void);
    resolveAfter: () => void;
}

export interface DynamicTreeNodeDeserializerParameterObject extends ResolvingSiblingBaseDeserializerParameterObject {
    aabb: AABBDeserializer;
    self: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    fixture: ObjectResolver<FixtureDeserializedPayload>;
}

export class DynamicTreeNodeDeserializer extends ResolvingSiblingBaseDeserializer<DynamicTreeNodeParam, DynamicTreeNodeDeserializedPayload> {
    readonly _aabb: AABBDeserializer;
    readonly _self: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    readonly _fixture: ObjectResolver<FixtureDeserializedPayload>;

    constructor(param: DynamicTreeNodeDeserializerParameterObject) {
        super(dynamicTreeNodeType, param);
        this._aabb = param.aabb;
        this._self = param.self;
        this._fixture = param.fixture;
    }

    deserialize(json: ReferableObjectDef<DynamicTreeNodeParam>): DynamicTreeNodeDeserializedPayload {
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        node.aabb = this._aabb.deserialize(json.param.aabb).value;
        return {
            value: node,
            resolveSibling: () => {
                // NOTE: 親 → 子 の一方的な参照が残っている場合があるので、そのまま再現
                if (json.param.parent) {
                    node.parent = this._self.resolve(json.param.parent);
                }
                if (json.param.child1) {
                    node.child1 = this._self.resolve(json.param.child1);
                }
                if (json.param.child2) {
                    node.child2 = this._self.resolve(json.param.child2);
                }
            },
            resolveAfter: () => {
                if (json.param.userData) {
                    // DestoryProxy すると fixture → node への参照が一方的に切られうるのでそのまま再現
                    node.userData = this._fixture.resolve(json.param.userData);
                }
            },
        };
    }
}
