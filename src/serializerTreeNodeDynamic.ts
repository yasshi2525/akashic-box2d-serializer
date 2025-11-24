import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { AABBParam, AABBSerializer } from "./serializerAABB";
import { ObjectMapper, RefParam } from "./objectMapper";

/**
 * B2DynamicTreeNode オブジェクト型の識別子
 */
export const dynamicTreeNodeType = Box2DWeb.Collision.b2DynamicTreeNode.name;

/**
 * B2DynamicTreeNode オブジェクトを復元可能な形式で直列化したJSONです。
 * userData はオブジェクトを表す識別子のみ直列化し、復元時に対応するオブジェクトにマッピングします。
 * parent は復元時に対応するオブジェクトにマッピングします。
 */
export interface DynamicTreeNodeParam {
    /**
     * B2DynamicTreeNode自体に識別子は存在しませんが、
     * B2DynamicTree.freeList から参照されるため、参照解決のために付与します。
     */
    self: ObjectDef<RefParam>;
    aabb: ObjectDef<AABBParam>;
    child1?: ObjectDef<DynamicTreeNodeParam>;
    child2?: ObjectDef<DynamicTreeNodeParam>;
    userData?: ObjectDef<RefParam>;
}

/**
 * B2DynamicTreeNode オブジェクトの識別情報（参照解決用）の識別子。
 */
export const dynamicTreeNodeRefType = Box2DWeb.Collision.b2DynamicTreeNode.name + "Ref";

export interface DynamicTreeNodeParameterObject {
    aabbSerializer: AABBSerializer;
    selfMapper: ObjectMapper<Box2DWeb.Collision.b2DynamicTreeNode>;
    userDataMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
}

/**
 * B2DynamicTreeNode オブジェクトを直列化・復元可能にします。
 * B2DynamicTreeNode は汎用的に作られてますが、実装上 b2Fixture のためにしか使われていないので、その用途限定で実装しています。
 */
export class DynamicTreeNodeSerializer implements ObjectSerializer<Box2DWeb.Collision.b2DynamicTreeNode, DynamicTreeNodeParam> {
    readonly _AABBSerializer: AABBSerializer;
    readonly _selfMapper: ObjectMapper<Box2DWeb.Collision.b2DynamicTreeNode>;
    readonly _userDataMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;

    constructor(param: DynamicTreeNodeParameterObject) {
        this._AABBSerializer = param.aabbSerializer;
        this._selfMapper = param.selfMapper;
        this._userDataMapper = param.userDataMapper;
    }

    filter(objectType: string): boolean {
        return objectType === dynamicTreeNodeType;
    }

    /**
     * userData はオブジェクトを表す識別子のみ直列化し、復元時に対応するオブジェクトにマッピングします。
     * parent は復元時に対応するオブジェクトにマッピングします。
     * @inheritdoc
     */
    serialize(object: Box2DWeb.Collision.b2DynamicTreeNode): ObjectDef<DynamicTreeNodeParam> {
        return {
            type: dynamicTreeNodeType,
            param: {
                self: this._selfMapper.refer(object),
                aabb: this._AABBSerializer.serialize(object.aabb),
                userData: object.userData ? this._userDataMapper.refer(object.userData) : undefined,
                child1: object.child1 ? this.serialize(object.child1) : undefined,
                child2: object.child2 ? this.serialize(object.child2) : undefined,
            },
        };
    }

    deserialize(json: ObjectDef<DynamicTreeNodeParam>): Box2DWeb.Collision.b2DynamicTreeNode {
        const proxy = new Box2DWeb.Collision.b2DynamicTreeNode();
        proxy.aabb = this._AABBSerializer.deserialize(json.param.aabb);
        if (json.param.userData) {
            proxy.userData = this._userDataMapper.resolve(json.param.userData);
            proxy.userData.m_proxy = proxy;
        }
        if (json.param.child1) {
            proxy.child1 = this.deserialize(json.param.child1);
            proxy.child1.parent = proxy;
        }
        if (json.param.child2) {
            proxy.child2 = this.deserialize(json.param.child2);
            proxy.child2.parent = proxy;
        }
        return proxy;
    }
}
