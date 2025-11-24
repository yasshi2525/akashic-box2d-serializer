import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { DynamicTreeNodeParam, DynamicTreeNodeSerializer } from "./serializerTreeNodeDynamic";
import { ObjectMapper, RefParam } from "./objectMapper";

/**
 * B2DynamicTree オブジェクト型の識別子
 */
export const dynamicTreeType = Box2DWeb.Collision.b2DynamicTree.name;

/**
 * B2DynamicTree オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface DynamicTreeParam {
    root?: ObjectDef<DynamicTreeNodeParam>;
    freeList?: ObjectDef<RefParam>;
    path: number;
    insertionCount: number;
}

export interface DynamicTreeParameterObject {
    nodeSerializer: DynamicTreeNodeSerializer;
    nodeMapper: ObjectMapper<Box2DWeb.Collision.b2DynamicTreeNode>;
}

/**
 * B2DynamicTree オブジェクトを直列化・復元可能にします
 */
export class DynamicTreeSerializer implements ObjectSerializer<Box2DWeb.Collision.b2DynamicTree, DynamicTreeParam> {
    readonly _nodeSerializer: DynamicTreeNodeSerializer;
    readonly _nodeMapper: ObjectMapper<Box2DWeb.Collision.b2DynamicTreeNode>;

    constructor(param: DynamicTreeParameterObject) {
        this._nodeSerializer = param.nodeSerializer;
        this._nodeMapper = param.nodeMapper;
    }

    filter(objectType: string): boolean {
        return objectType === dynamicTreeType;
    }

    serialize(object: Box2DWeb.Collision.b2DynamicTree): ObjectDef<DynamicTreeParam> {
        return {
            type: dynamicTreeType,
            param: {
                root: object.m_root ? this._nodeSerializer.serialize(object.m_root) : undefined,
                freeList: object.m_freeList ? this._nodeMapper.refer(object.m_freeList) : undefined,
                path: object.m_path,
                insertionCount: object.m_insertionCount,
            },
        };
    }

    deserialize(json: ObjectDef<DynamicTreeParam>): Box2DWeb.Collision.b2DynamicTree {
        const tree = new Box2DWeb.Collision.b2DynamicTree();
        if (json.param.root) {
            tree.m_root = this._nodeSerializer.deserialize(json.param.root);
        }
        if (json.param.freeList) {
            tree.m_freeList = this._nodeMapper.resolve(json.param.freeList);
        }
        tree.m_path = json.param.path;
        tree.m_insertionCount = json.param.insertionCount;
        return tree;
    }
}
