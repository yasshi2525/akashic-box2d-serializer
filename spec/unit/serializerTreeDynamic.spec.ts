import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectMapper, RefParam } from "../../src/objectMapper";
import { AABBSerializer } from "../../src/serializerAABB";
import { DynamicTreeSerializer, dynamicTreeType } from "../../src/serializerTreeDynamic";
import { DynamicTreeNodeParam, dynamicTreeNodeRefType, DynamicTreeNodeSerializer } from "../../src/serializerTreeNodeDynamic";
import { Vec2Serializer } from "../../src/serializerVec2";
import { fixtureRefType } from "../../src/serializerFixture";
import { ObjectDef } from "../../src/serializerObject";

describe("DynamicTreeNodeSerializer", () => {
    let serializer: DynamicTreeSerializer;
    let deserializer: DynamicTreeSerializer;
    let nodeMapper: ObjectMapper<Box2DWeb.Collision.b2DynamicTreeNode>;
    let nodeSerializer: DynamicTreeNodeSerializer;
    let userDataMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;

    beforeEach(() => {
        nodeMapper = new ObjectMapper({
            refTypeName: dynamicTreeNodeRefType,
        });
        userDataMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        nodeSerializer = new DynamicTreeNodeSerializer({
            aabbSerializer: new AABBSerializer({
                vec2Serializer: new Vec2Serializer(),
            }),
            selfMapper: nodeMapper,
            userDataMapper,
        });
        serializer = new DynamicTreeSerializer({
            nodeSerializer,
            nodeMapper,
        });
        // serializer を つかって deserialize すると nodeMapper を共有するため、結果に不整合がでる
        deserializer = new DynamicTreeSerializer({
            nodeSerializer,
            nodeMapper: new ObjectMapper({
                refTypeName: dynamicTreeNodeRefType,
            }),
        });
    });

    const createCustomTree = () => {
        const tree = new Box2DWeb.Collision.b2DynamicTree();
        const nodes = ([
            [[1, 2], [3, 4], "fixture1"],
            [[5, 6], [7, 8], "fixture2"],
            [[9, 10], [11, 12], "fixture3"],
        ] as [[number, number], [number, number], string][]).map((def) => {
            const aabb = new Box2DWeb.Collision.b2AABB();
            const fixture = new Box2DWeb.Dynamics.b2Fixture();
            fixture.SetUserData(def[2]);
            aabb.lowerBound = new Box2DWeb.Common.Math.b2Vec2(def[0][0], def[0][1]);
            aabb.upperBound = new Box2DWeb.Common.Math.b2Vec2(def[1][0], def[1][1]);
            const node = tree.CreateProxy(aabb, fixture);
            fixture.m_proxy = node;
            return node;
        });
        return { tree, nodes };
    };

    const expectToEqualsNodeRef = (list: ObjectDef<DynamicTreeNodeParam>[], expectedRef: ObjectDef<RefParam>, object: Box2DWeb.Collision.b2DynamicTreeNode) => {
        const expected = list.find(n => n.param.self.param.id === expectedRef.param.id)!;
        expect(expected.param.self).toEqual(nodeMapper.refer(object));
        if (object.userData) {
            expect(expected.param.userData).toEqual(userDataMapper.refer(object.userData));
        }
        if (object.child1) {
            expect(expected.param.child1).toBeDefined();
            expect(expected.param.child1).toEqual(nodeMapper.refer(object.child1));
            expectToEqualsNodeRef(list, expected.param.child1!, object.child1);
        }
        if (object.child2) {
            expect(expected.param.child2).toBeDefined();
            expect(expected.param.child2).toEqual(nodeMapper.refer(object.child2));
            expectToEqualsNodeRef(list, expected.param.child2!, object.child2);
        }
    };

    const expectToEqualsNode = (received: Box2DWeb.Collision.b2DynamicTreeNode, expected: Box2DWeb.Collision.b2DynamicTreeNode) => {
        expect(received.aabb).toEqual(expected.aabb);
        // userData.m_proxy があると tree を辿ってしまい、toEquals() で fail してしまうので一時的に消す
        const receivedProxy = received.userData?.m_proxy;
        const expectedProxy = expected.userData?.m_proxy;
        if (received.userData) {
            expect(expected.userData).toBeTruthy();
            delete received.userData.m_proxy;
            delete expected.userData!.m_proxy;
            expect(received.userData).toEqual(expected.userData);
            received.userData.m_proxy = receivedProxy;
            expected.userData!.m_proxy = expectedProxy;
        }
        if (received.child1) {
            expectToEqualsNode(received.child1, expected.child1!);
            expect(received.child1.parent).toBe(received);
        }
        if (received.child2) {
            expectToEqualsNode(received.child2, expected.child2!);
            expect(received.child2.parent).toBe(received);
        }
    };

    it("set matched param", () => {
        const tree = new Box2DWeb.Collision.b2DynamicTree();
        const json = serializer.serialize(tree);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize tree", () => {
        const { tree, nodes } = createCustomTree();
        expect(tree.m_root).toBeTruthy();
        expect(tree.m_root).toMatchObject({
            userData: null,
            parent: null,
        });
        const json = serializer.serialize(tree);
        expect(json.type).toBe(dynamicTreeType);
        expect(json.param).toMatchObject({
            freeList: tree.m_freeList ?? undefined,
            path: tree.m_path,
            insertionCount: tree.m_insertionCount,
        });
        expect(json.param.root).toEqual(nodeMapper.refer(tree.m_root!));
        expectToEqualsNodeRef(json.param.nodeList, json.param.root!, tree.m_root!);
        expect(nodeMapper.objects()).toHaveLength(nodes.length + 2);
    });

    it("can deserialize tree", () => {
        const { tree, nodes } = createCustomTree();
        for (const node of nodes) {
            if (node.userData) {
                expect(node.userData?.m_proxy).toBeDefined();
            }
        }
        const json = serializer.serialize(tree);
        const object = deserializer.deserialize(json);
        expect(object).toMatchObject({
            m_freeList: tree.m_freeList,
            m_path: tree.m_path,
            m_insertionCount: tree.m_insertionCount,
        });
        expectToEqualsNode(object.m_root!, tree.m_root!);
    });

    it("can deserialize tree with freeList", () => {
        const { tree, nodes } = createCustomTree();
        tree.m_freeList = nodes[nodes.length - 1];
        const json = serializer.serialize(tree);
        const object = deserializer.deserialize(json);
        expect(object.m_freeList).toBeTruthy();
        expectToEqualsNode(object.m_freeList!, tree.m_freeList!);
    });
});
