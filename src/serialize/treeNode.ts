import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, RefParam } from "../serializerObject";
import { DynamicTreeNodeParam } from "../param/treeNode";
import { ObjectStore } from "../scan/store";
import { ReferableObjectDef, ReferableSerializable } from "./serializable";
import { AABBSerializer } from "./aabb";

export const dynamicTreeNodeType = Box2DWeb.Collision.b2DynamicTreeNode.name;

export interface DynamicTreeNodeSerializerParameterObject {
    aabb: AABBSerializer;
    self: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    fixture: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
}

export class DynamicTreeNodeSerializer implements ReferableSerializable<Box2DWeb.Collision.b2DynamicTreeNode, DynamicTreeNodeParam> {
    readonly _aabb: AABBSerializer;
    readonly _self: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    readonly _fixture: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;

    constructor(param: DynamicTreeNodeSerializerParameterObject) {
        this._aabb = param.aabb;
        this._self = param.self;
        this._fixture = param.fixture;
    }

    serialize(object: Box2DWeb.Collision.b2DynamicTreeNode, ref: ObjectDef<RefParam>): ReferableObjectDef<DynamicTreeNodeParam> {
        return {
            type: dynamicTreeNodeType,
            ref,
            param: {
                aabb: this._aabb.serialize(object.aabb),
                parent: object.parent ? this._self.refer(object.parent) : undefined,
                userData: object.userData ? this._fixture.refer(object.userData) : undefined,
                child1: object.child1 ? this._self.refer(object.child1) : undefined,
                child2: object.child2 ? this._self.refer(object.child2) : undefined,
            },
        };
    }
}
