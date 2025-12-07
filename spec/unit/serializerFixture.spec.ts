import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { WorldScanner } from "../../src/scan/world";
import { ObjectStore, toRefTypeName } from "../../src/scan/store";
import { FixtureSerializer, fixtureType } from "../../src/serialize/fixture";
import { FilterDataSerializer } from "../../src/serialize/filterData";
import { ShapeSerializer } from "../../src/serialize/shape";
import { BodySerializer } from "../../src/serialize/body";
import { DynamicTreeNodeSerializer } from "../../src/serialize/treeNode";
import { ObjectResolver } from "../../src/deserialize/resolver";
import { FixtureDeserializedPayload, FixtureDeserializer } from "../../src/deserialize/fixture";
import { BodyDeserializedPayload, BodyDeserializer } from "../../src/deserialize/body";
import { DynamicTreeNodeDeserializedPayload, DynamicTreeNodeDeserializer } from "../../src/deserialize/treeNode";
import { createBox2DWebDeserializers, createBox2DWebSerializers, expectToShallowEqualFixture } from "./utils";
import { UnresolverChecker } from "../../src/deserialize/checker";
import { FixtureScanner } from "../../src/scan/fixture";

describe("FixtureSerializer", () => {
    let box2d: Box2D;
    let serializer: FixtureSerializer;
    let bodySerializer: BodySerializer;
    let nodeSerializer: DynamicTreeNodeSerializer;
    let filterDataSerializer: FilterDataSerializer;
    let shapeSerializer: ShapeSerializer;
    let store: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    let bodyStore: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    let nodeStore: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    let scanner: FixtureScanner;
    let worldScanner: WorldScanner;
    let bodydef: Box2DWeb.Dynamics.b2BodyDef;
    let body: Box2DWeb.Dynamics.b2Body;
    let circle: Box2DWeb.Collision.Shapes.b2CircleShape;
    let deserializer: FixtureDeserializer;
    let bodyDeserializer: BodyDeserializer;
    let nodeDeserializer: DynamicTreeNodeDeserializer;
    let resolver: ObjectResolver<FixtureDeserializedPayload>;
    let bodyResolver: ObjectResolver<BodyDeserializedPayload>;
    let nodeResolver: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    let checker: UnresolverChecker;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        bodydef = new Box2DWeb.Dynamics.b2BodyDef();
        body = box2d.world.CreateBody(bodydef);
        circle = box2d.createCircleShape(10);
        const ser = createBox2DWebSerializers();
        store = ser.stores.fixture;
        bodyStore = ser.stores.body;
        nodeStore = ser.stores.node;
        scanner = ser.scanners.fixture;
        worldScanner = ser.scanners.world;
        serializer = ser.serializers.fixture;
        bodySerializer = ser.serializers.body;
        nodeSerializer = ser.serializers.node;
        filterDataSerializer = ser.serializers.filterData;
        shapeSerializer = ser.serializers.shape;
        const des = createBox2DWebDeserializers(box2d.world);
        deserializer = des.deserializers.fixture;
        bodyDeserializer = des.deserializers.body;
        nodeDeserializer = des.deserializers.node;
        resolver = des.resolvers.fixture;
        bodyResolver = des.resolvers.body;
        nodeResolver = des.resolvers.node;
        checker = des.checker;
    });

    const createDefaultFixture = () => {
        const defaultFixtureDef = new Box2DWeb.Dynamics.b2FixtureDef();
        // NOTE: shape が null だと fixture 生成できない
        defaultFixtureDef.shape = box2d.createPolygonShape([
            box2d.vec2(1, 2),
            box2d.vec2(3, 4),
        ]);
        const defaultFixture = body.CreateFixture(defaultFixtureDef);
        return {
            defaultFixtureDef,
            defaultFixture,
        };
    };

    const createCustomFixture = () => {
        const customFixtureDef = box2d.createFixtureDef({
            density: 1,
            filter: {
                categoryBits: 2,
                maskBits: 3,
            },
            friction: 4,
            isSensor: true,
            restitution: 5,
            shape: circle,
            userData: {
                foo: "bar",
            },
        });
        const customFixture = body.CreateFixture(customFixtureDef);
        return {
            customFixtureDef,
            customFixture,
        };
    };

    const preDeserialize = () => {
        const bodyJson = bodyStore.dump(bodySerializer);
        const nodeJson = nodeStore.dump(nodeSerializer);
        const fixtureJson = store.dump(serializer);
        const bps = bodyResolver.deserialize(bodyJson, bodyDeserializer, bodyDeserializer.resolveSibling);
        const nps = nodeResolver.deserialize(nodeJson, nodeDeserializer, nodeDeserializer.resolveSibling);
        const fps = resolver.deserialize(fixtureJson, deserializer, deserializer.resolveSibling);
        for (const bp of bps) {
            bp.resolveAfter();
        }
        for (const np of nps) {
            np.resolveAfter();
        }
        for (const fp of fps) {
            fp.resolveAfter();
        }
    };

    it("can serialize default fixture", () => {
        const { defaultFixture, defaultFixtureDef } = createDefaultFixture();
        worldScanner.scan(box2d.world);
        const json = serializer.serialize(defaultFixture, store.refer(defaultFixture));
        expect(json.type).toBe(fixtureType);
        expect(json.ref.type).toBe(toRefTypeName(fixtureType));
        expect(json.param).toMatchObject({
            ...defaultFixtureDef,
            filter: filterDataSerializer.serialize(defaultFixtureDef.filter),
            shape: shapeSerializer.serialize(defaultFixtureDef.shape),
        });
    });

    it ("can serialize all properties value", () => {
        const { customFixture, customFixtureDef } = createCustomFixture();
        worldScanner.scan(box2d.world);
        const json = serializer.serialize(customFixture, store.refer(customFixture));
        expect(json.param).toMatchObject({
            ...customFixtureDef,
            filter: filterDataSerializer.serialize(customFixtureDef.filter),
            shape: shapeSerializer.serialize(customFixtureDef.shape),
        });
    });

    it("can deserialize default fixture", () => {
        const { defaultFixture } = createDefaultFixture();
        worldScanner.scan(box2d.world);
        const json = serializer.serialize(defaultFixture, store.refer(defaultFixture));
        preDeserialize();
        expectToShallowEqualFixture(resolver.resolve(json.ref), defaultFixture);
        expect(() => checker.validate()).not.toThrow();
    });

    it ("can deserialize all properties value", () => {
        const { customFixture } = createCustomFixture();
        worldScanner.scan(box2d.world);
        const json = serializer.serialize(customFixture, store.refer(customFixture));
        preDeserialize();
        expectToShallowEqualFixture(resolver.resolve(json.ref), customFixture);
        expect(() => checker.validate()).not.toThrow();
    });

    it("can deserialize after body interaction", () => {
        const { defaultFixture } = createDefaultFixture();
        body.ApplyForce(box2d.vec2(10, 10), box2d.vec2(0, 0));
        box2d.step(10);
        worldScanner.scan(box2d.world);
        const json = serializer.serialize(defaultFixture, store.refer(defaultFixture));
        preDeserialize();
        expectToShallowEqualFixture(resolver.resolve(json.ref), defaultFixture);

        expect(() => checker.validate()).not.toThrow();
    });

    it("can serialize shapeless fixture", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        expect(fixture.GetShape()).toBeFalsy();
        scanner.scan(fixture);
        const json = serializer.serialize(fixture, store.refer(fixture));
        expect(json.param.shape).toBeUndefined();
    });

    it("can deserialize shapeless fixture", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        scanner.scan(fixture);
        const json = serializer.serialize(fixture, store.refer(fixture));
        const { value: object, resolveSibling, resolveAfter } = deserializer.deserialize(json);
        resolveSibling();
        resolveAfter();
        expect(object.m_shape).toBeFalsy();
        expect(() => checker.validate()).not.toThrow();
    });
});
