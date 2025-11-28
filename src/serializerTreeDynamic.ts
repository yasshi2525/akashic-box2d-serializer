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
    root?: ObjectDef<RefParam>;
    freeList?: ObjectDef<RefParam>;
    path: number;
    insertionCount: number;
    nodeList: ObjectDef<DynamicTreeNodeParam>[];
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
        if (object.m_root) {
            this._referNode(object.m_root);
        }
        return {
            type: dynamicTreeType,
            param: {
                root: object.m_root ? this._nodeMapper.refer(object.m_root) : undefined,
                freeList: object.m_freeList ? this._nodeMapper.refer(object.m_freeList) : undefined,
                path: object.m_path,
                insertionCount: object.m_insertionCount,
                nodeList: this._nodeMapper.objects().map(n => this._nodeSerializer.serialize(n)),
            },
        };
    }

    _referNode(object: Box2DWeb.Collision.b2DynamicTreeNode) {
        this._nodeMapper.refer(object);
        if (object.child1) {
            this._referNode(object.child1);
        }
        if (object.child2) {
            this._referNode(object.child2);
        }
    }

    deserialize(json: ObjectDef<DynamicTreeParam>): Box2DWeb.Collision.b2DynamicTree {
        for (const node of json.param.nodeList.map(param => this._nodeSerializer.deserialize(param))) {
            this._nodeMapper.refer(node);
        }
        for (const { param } of json.param.nodeList) {
            const node = this._nodeMapper.resolve(param.self);
            if (param.child1) {
                node.child1 = this._nodeMapper.resolve(param.child1);
                node.child1.parent = node;
            }
            if (param.child2) {
                node.child2 = this._nodeMapper.resolve(param.child2);
                node.child2.parent = node;
            }
        }
        const tree = new Box2DWeb.Collision.b2DynamicTree();
        if (json.param.root) {
            tree.m_root = this._nodeMapper.resolve(json.param.root);
        }
        if (json.param.freeList) {
            tree.m_freeList = this._nodeMapper.resolve(json.param.freeList);
        }
        tree.m_path = json.param.path;
        tree.m_insertionCount = json.param.insertionCount;
        return tree;
    }
}
