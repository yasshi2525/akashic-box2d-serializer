import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, RefParam } from "../../src/serializerObject";
import { ReferableObjectDef } from "../../src/serialize/serializable";
import { FixtureSerializer } from "../../src/serialize/fixture";
import { DynamicTreeNodeSerializer } from "../../src/serialize/treeNode";
import { DynamicTreeSerializer, dynamicTreeType } from "../../src/serialize/tree";
import { ObjectStore } from "../../src/scan/store";
import { DynamicTreeScanner } from "../../src/scan/tree";
import { DynamicTreeNodeParam } from "../../src/param/treeNode";
import { UnresolverChecker } from "../../src/deserialize/checker";
import { ObjectResolver } from "../../src/deserialize/resolver";
import { DynamicTreeDeserializer } from "../../src/deserialize/tree";
import { DynamicTreeNodeDeserializedPayload, DynamicTreeNodeDeserializer } from "../../src/deserialize/treeNode";
import { FixtureDeserializedPayload, FixtureDeserializer } from "../../src/deserialize/fixture";
import { createBox2DWebDeserializers, createBox2DWebSerializers, createEmptyWorld, expectToShallowEqualDynamicTree } from "./utils";

describe("DynamicTreeNodeSerializer", () => {
    let scanner: DynamicTreeScanner;
    let serializer: DynamicTreeSerializer;
    let nodeSerializer: DynamicTreeNodeSerializer;
    let fixtureSerializer: FixtureSerializer;
    let nodeStore: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    let fixtureStore: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    let deserializer: DynamicTreeDeserializer;
    let nodeDeserializer: DynamicTreeNodeDeserializer;
    let fixtureDeserializer: FixtureDeserializer;
    let nodeResolver: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    let fixtureResolver: ObjectResolver<FixtureDeserializedPayload>;
    let checker: UnresolverChecker;

    beforeEach(() => {
        const ser = createBox2DWebSerializers();
        scanner = ser.scanners.tree;
        serializer = ser.serializers.tree;
        nodeSerializer = ser.serializers.node;
        fixtureSerializer = ser.serializers.fixture;
        nodeStore = ser.stores.node;
        fixtureStore = ser.stores.fixture;
        const des = createBox2DWebDeserializers(createEmptyWorld());
        checker = des.checker;
        deserializer = des.deserializers.tree;
        nodeDeserializer = des.deserializers.node;
        fixtureDeserializer = des.deserializers.fixture;
        nodeResolver = des.resolvers.node;
        fixtureResolver = des.resolvers.fixture;
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

    const expectToEqualsNodeRef = (list: ReferableObjectDef<DynamicTreeNodeParam>[], expectedRef: ObjectDef<RefParam>, object: Box2DWeb.Collision.b2DynamicTreeNode) => {
        const expected = list.find(n => n.ref.param.id === expectedRef.param.id)!;
        expect(expected.ref).toEqual(nodeStore.refer(object));
        if (object.userData) {
            expect(expected.param.userData).toEqual(fixtureStore.refer(object.userData));
        }
        if (object.child1) {
            expect(expected.param.child1).toBeDefined();
            expect(expected.param.child1).toEqual(nodeStore.refer(object.child1));
            expectToEqualsNodeRef(list, expected.param.child1!, object.child1);
        }
        if (object.child2) {
            expect(expected.param.child2).toBeDefined();
            expect(expected.param.child2).toEqual(nodeStore.refer(object.child2));
            expectToEqualsNodeRef(list, expected.param.child2!, object.child2);
        }
    };

    const preDeserialize = () => {
        const nodeJSON = nodeStore.dump(nodeSerializer);
        const fixtureJSON = fixtureStore.dump(fixtureSerializer);
        const nps = nodeResolver.deserialize(nodeJSON, nodeDeserializer, nodeDeserializer.resolveSibling);
        const fps = fixtureResolver.deserialize(fixtureJSON, fixtureDeserializer, fixtureDeserializer.resolveSibling);
        for (const np of nps) {
            np.resolveAfter();
        }
        for (const fp of fps) {
            fp.resolveAfter();
        }
    };

    it("can serialize tree", () => {
        const { tree, nodes } = createCustomTree();
        expect(tree.m_root).toBeTruthy();
        expect(tree.m_root).toMatchObject({
            userData: null,
            parent: null,
        });
        scanner.scan(tree);
        const json = serializer.serialize(tree);
        expect(json.type).toBe(dynamicTreeType);
        expect(json.param).toMatchObject({
            freeList: tree.m_freeList ?? undefined,
            path: tree.m_path,
            insertionCount: tree.m_insertionCount,
        });
        expect(json.param.root).toEqual(nodeStore.refer(tree.m_root!));
        const nodeList = [...nodeStore._store.keys()].map(n => nodeSerializer.serialize(n, nodeStore.refer(n)));
        expectToEqualsNodeRef(nodeList, json.param.root!, tree.m_root!);
        expect(nodeStore._store.size).toBe(nodes.length + 2);
    });

    it("can deserialize tree", () => {
        const { tree, nodes } = createCustomTree();
        for (const node of nodes) {
            if (node.userData) {
                expect(node.userData?.m_proxy).toBeDefined();
            }
        }
        scanner.scan(tree);
        const json = serializer.serialize(tree);
        preDeserialize();
        const { value: object, resolveAfter } = deserializer.deserialize(json);
        resolveAfter();
        expect(object).toMatchObject({
            m_freeList: tree.m_freeList,
            m_path: tree.m_path,
            m_insertionCount: tree.m_insertionCount,
        });
        expectToShallowEqualDynamicTree(object, tree);
        expect(() => checker.validate()).not.toThrow();
    });

    it("can deserialize tree with freeList", () => {
        const { tree, nodes } = createCustomTree();
        tree.m_freeList = nodes[nodes.length - 1];
        scanner.scan(tree);
        const json = serializer.serialize(tree);
        preDeserialize();
        const { value: object, resolveAfter } = deserializer.deserialize(json);
        resolveAfter();
        expect(object.m_freeList).toBeTruthy();
        expectToShallowEqualDynamicTree(object, tree);
        expect(() => checker.validate()).not.toThrow();
    });
});
