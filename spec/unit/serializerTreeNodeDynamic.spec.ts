import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectMapper } from "../../src/objectMapper";
import { AABBSerializer } from "../../src/serializerAABB";
import { dynamicTreeNodeRefType, DynamicTreeNodeSerializer, dynamicTreeNodeType } from "../../src/serializerTreeNodeDynamic";
import { Vec2Serializer } from "../../src/serializerVec2";
import { fixtureRefType } from "../../src/serializerFixture";

describe("DynamicTreeNodeSerializer", () => {
    let serializer: DynamicTreeNodeSerializer;
    let aabbSerializer: AABBSerializer;
    let selfMapper: ObjectMapper<Box2DWeb.Collision.b2DynamicTreeNode>;
    let userDataMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;

    beforeEach(() => {
        aabbSerializer = new AABBSerializer({
            vec2Serializer: new Vec2Serializer(),
        });
        selfMapper = new ObjectMapper({
            refTypeName: dynamicTreeNodeRefType,
        });
        userDataMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        serializer = new DynamicTreeNodeSerializer({
            aabbSerializer,
            selfMapper,
            userDataMapper,
        });
    });

    it("set matched param", () => {
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        const json = serializer.serialize(node);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize default node", () => {
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        const json = serializer.serialize(node);
        expect(selfMapper.objects()).toHaveLength(1);
        expect(json.type).toBe(dynamicTreeNodeType);
        expect(json.param).toEqual({
            self: selfMapper.refer(node),
            aabb: aabbSerializer.serialize(new Box2DWeb.Collision.b2AABB()),
            child1: undefined,
            child2: undefined,
            userData: undefined,
        });
        expect(selfMapper.objects().length).toBe(1);
    });

    it("can deserialize default node", () => {
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        const json = serializer.serialize(node);
        const object = serializer.deserialize(json);
        expect(selfMapper.objects()).toHaveLength(1);
        expect(object).toEqual(node);
    });

    it("can serialize default node with userData", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        node.userData = fixture;
        fixture.m_proxy = node;
        const json = serializer.serialize(node);
        expect(selfMapper.objects()).toHaveLength(1);
        expect(userDataMapper.objects()).toHaveLength(1);
        expect(json.type).toBe(dynamicTreeNodeType);
        expect(json.param).toEqual({
            self: selfMapper.refer(node),
            aabb: aabbSerializer.serialize(new Box2DWeb.Collision.b2AABB()),
            child1: undefined,
            child2: undefined,
            userData: userDataMapper.refer(fixture),
        });
        expect(selfMapper.objects()).toHaveLength(1);
        expect(userDataMapper.objects()).toHaveLength(1);
    });

    it("can deserialize default node with userData", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        const node = new Box2DWeb.Collision.b2DynamicTreeNode();
        node.userData = fixture;
        fixture.m_proxy = node;
        const json = serializer.serialize(node);
        const object = serializer.deserialize(json);
        expect(selfMapper.objects()).toHaveLength(1);
        expect(userDataMapper.objects()).toHaveLength(1);
        expect(object).toEqual(node);
    });
});
