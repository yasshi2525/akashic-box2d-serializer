import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectStore, toRefTypeName } from "../../src/scan/store";
import { DynamicTreeNodeScanner } from "../../src/scan/treeNode";
import { DynamicTreeNodeSerializer, dynamicTreeNodeType } from "../../src/serialize/treeNode";
import { FixtureSerializer } from "../../src/serialize/fixture";
import { AABBSerializer } from "../../src/serialize/aabb";
import { ObjectResolver } from "../../src/deserialize/resolver";
import { FixtureDeserializedPayload, FixtureDeserializer } from "../../src/deserialize/fixture";
import { DynamicTreeNodeDeserializedPayload, DynamicTreeNodeDeserializer } from "../../src/deserialize/treeNode";
import { createBox2DWebDeserializers, createBox2DWebSerializers, createEmptyWorld } from "./utils";
import { UnresolverChecker } from "../../src/deserialize/checker";

describe("DynamicTreeNodeSerializer", () => {
    let store: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    let fixtureStore: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    let scanner: DynamicTreeNodeScanner;
    let serializer: DynamicTreeNodeSerializer;
    let aabbSerializer: AABBSerializer;
    let fixtureSerializer: FixtureSerializer;

    let checker: UnresolverChecker;
    let resolver: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    let fixtureResolver: ObjectResolver<FixtureDeserializedPayload>;
    let deserializer: DynamicTreeNodeDeserializer;
    let fixtureDeserializer: FixtureDeserializer;

    beforeEach(() => {
        const ser = createBox2DWebSerializers();
        store = ser.stores.node;
        fixtureStore = ser.stores.fixture;
        scanner = ser.scanners.node;
        serializer = ser.serializers.node;
        aabbSerializer = ser.serializers.aabb;
        fixtureSerializer = ser.serializers.fixture;
        const des = createBox2DWebDeserializers(createEmptyWorld());
        checker = des.checker;
        resolver = des.resolvers.node;
        fixtureResolver = des.resolvers.fixture;
        deserializer = des.deserializers.node;
        fixtureDeserializer = des.deserializers.fixture;
    });

    it("can serialize default node", () => {
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        scanner.scan(node);
        const json = serializer.serialize(node, store.refer(node));
        expect(store._store.size).toBe(1);
        expect(json.type).toBe(dynamicTreeNodeType);
        expect(json.ref.type).toBe(toRefTypeName(dynamicTreeNodeType));
        expect(json.ref).toEqual(store.refer(node));
        expect(json.param).toEqual({
            aabb: aabbSerializer.serialize(new Box2DWeb.Collision.b2AABB()),
            parent: undefined,
            child1: undefined,
            child2: undefined,
            userData: undefined,
        });
    });

    it("can deserialize default node", () => {
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        scanner.scan(node);
        const json = serializer.serialize(node, store.refer(node));
        const [{ value: object, resolveAfter }] = resolver.deserialize([json], deserializer, deserializer.resolveSibling);
        resolveAfter();
        expect(store._store.size).toBe(1);
        expect(resolver._table.size).toBe(1);
        expect(object).toEqual(node);
        expect(() => checker.validate()).not.toThrow();
    });

    it("can serialize default node with userData", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        node.userData = fixture;
        fixture.m_proxy = node;
        scanner.scan(node);
        const json = serializer.serialize(node, store.refer(node));
        expect(store._store.size).toBe(1);
        expect(fixtureStore._store.size).toBe(1);
        expect(json.type).toBe(dynamicTreeNodeType);
        expect(json.ref.type).toBe(toRefTypeName(dynamicTreeNodeType));
        expect(json.param).toEqual({
            aabb: aabbSerializer.serialize(new Box2DWeb.Collision.b2AABB()),
            parent: undefined,
            child1: undefined,
            child2: undefined,
            userData: fixtureStore.refer(fixture),
        });
    });

    it("can deserialize default node with userData", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        node.userData = fixture;
        fixture.m_proxy = node;
        scanner.scan(node);
        const json = serializer.serialize(node, store.refer(node));
        const fixtureJson = fixtureSerializer.serialize(fixture, fixtureStore.refer(fixture));
        const [{ resolveAfter: resolveAfterFixture }] = fixtureResolver.deserialize([fixtureJson], fixtureDeserializer, fixtureDeserializer.resolveSibling);
        const [{ value: object, resolveAfter }] = resolver.deserialize([json], deserializer, deserializer.resolveSibling);
        resolveAfterFixture();
        resolveAfter();
        expect(store._store.size).toBe(1);
        expect(fixtureStore._store.size).toBe(1);
        expect(resolver._table.size).toBe(1);
        expect(fixtureResolver._table.size).toBe(1);
        expect(object).toEqual(node);
        expect(() => checker.validate()).not.toThrow();
    });
});
