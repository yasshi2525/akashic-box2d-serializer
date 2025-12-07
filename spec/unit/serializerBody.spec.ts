import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { BodySerializer, bodyType } from "../../src/serialize/body";
import { Vec2Serializer } from "../../src/serialize/vec2";
import { FixtureSerializer } from "../../src/serialize/fixture";
import { DynamicTreeNodeSerializer } from "../../src/serialize/treeNode";
import { ObjectStore, toRefTypeName } from "../../src/scan/store";
import { BodyScanner } from "../../src/scan/body";
import { WorldScanner } from "../../src/scan/world";
import { FixtureDeserializedPayload, FixtureDeserializer } from "../../src/deserialize/fixture";
import { BodyDeserializedPayload, BodyDeserializer } from "../../src/deserialize/body";
import { ObjectResolver } from "../../src/deserialize/resolver";
import { DynamicTreeNodeDeserializedPayload, DynamicTreeNodeDeserializer } from "../../src/deserialize/treeNode";
import { UnresolverChecker } from "../../src/deserialize/checker";
import { createBox2DWebDeserializers, createBox2DWebSerializers, expectToShallowEqualBody } from "./utils";

describe("BodySerializer", () => {
    let box2d: Box2D;
    let serializer: BodySerializer;
    let vec2Serializer: Vec2Serializer;
    let fixtureSerializer: FixtureSerializer;
    let nodeSerializer: DynamicTreeNodeSerializer;
    let store: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    let fixtureStore: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    let nodeStore: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    let scanner: BodyScanner;
    let worldScanner: WorldScanner;
    let deserializer: BodyDeserializer;
    let fixtureDeserializer: FixtureDeserializer;
    let nodeDeserializer: DynamicTreeNodeDeserializer;
    let resolver: ObjectResolver<BodyDeserializedPayload>;
    let fixtureResolver: ObjectResolver<FixtureDeserializedPayload>;
    let nodeResolver: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    let checker: UnresolverChecker;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        const ser = createBox2DWebSerializers();
        store = ser.stores.body;
        fixtureStore = ser.stores.fixture;
        nodeStore = ser.stores.node;
        scanner = ser.scanners.body;
        worldScanner = ser.scanners.world;
        serializer = ser.serializers.body;
        vec2Serializer = ser.serializers.vec2;
        fixtureSerializer = ser.serializers.fixture;
        nodeSerializer = ser.serializers.node;
        const des = createBox2DWebDeserializers(box2d.world);
        deserializer = des.deserializers.body;
        fixtureDeserializer = des.deserializers.fixture;
        nodeDeserializer = des.deserializers.node;
        resolver = des.resolvers.body;
        fixtureResolver = des.resolvers.fixture;
        nodeResolver = des.resolvers.node;
        checker = des.checker;
    });

    const createDefaultBody = () => {
        const defaultBodyDef = new Box2DWeb.Dynamics.b2BodyDef();
        const defaultBody = box2d.world.CreateBody(defaultBodyDef);
        return { defaultBody, defaultBodyDef };
    };

    const createCustomBody = () => {
        const customBodyDef = box2d.createBodyDef({
            active: false,
            allowSleep: false,
            angularDamping: 1,
            angularVelocity: 2,
            awake: false,
            bullet: true,
            fixedRotation: true,
            gravityScale: 3,
            linearDamping: 4,
            linearVelocity: box2d.vec2(5, 6),
            type: Box2DWeb.Dynamics.b2Body.b2_dynamicBody,
            userData: "foo",
        });
        const customBody = box2d.world.CreateBody(customBodyDef);
        customBody.CreateFixture2(box2d.createCircleShape(10), 1);
        customBody.CreateFixture2(box2d.createPolygonShape([
            box2d.vec2(1, 2),
            box2d.vec2(3, 4),
        ]), 2);
        return { customBody, customBodyDef };
    };

    const preDeserialize = () => {
        const bodyJson = store.dump(serializer);
        const nodeJson = nodeStore.dump(nodeSerializer);
        const fixtureJson = fixtureStore.dump(fixtureSerializer);
        const bps = resolver.deserialize(bodyJson, deserializer, deserializer.resolveSibling);
        const nps = nodeResolver.deserialize(nodeJson, nodeDeserializer, nodeDeserializer.resolveSibling);
        const fps = fixtureResolver.deserialize(fixtureJson, fixtureDeserializer, fixtureDeserializer.resolveSibling);
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

    const toBodyParam = (object: Box2DWeb.Dynamics.b2Body) => {
        return (Object.keys(object) as (keyof Box2DWeb.Dynamics.b2Body)[]).reduce((prev, key) => {
            if (key !== "m_controllerCount") {
                if (typeof object[key] !== "object") {
                    prev[key.substring(2)] = object[key];
                }
            }
            return prev;
        }, {} as Record<string, any>);
    };

    it("can serialize default body", () => {
        const { defaultBody, defaultBodyDef } = createDefaultBody();
        scanner.scan(defaultBody);
        const json = serializer.serialize(defaultBody, store.refer(defaultBody));
        expect(json.type).toEqual(bodyType);
        expect(json.ref.type).toEqual(toRefTypeName(bodyType));
        expect(fixtureStore._store.size).toBe(0);
        expect(json.param).toMatchObject(toBodyParam(defaultBody));
    });

    it("can serialize custom body", () => {
        const { customBody, customBodyDef } = createCustomBody();
        scanner.scan(customBody);
        const json = serializer.serialize(customBody, store.refer(customBody));
        expect(fixtureStore._store.size).toBe(2);
        expect(json.param).toMatchObject(toBodyParam(customBody));
    });

    it("can deserialize default body", () => {
        const { defaultBody } = createDefaultBody();
        scanner.scan(defaultBody);
        const json = serializer.serialize(defaultBody, store.refer(defaultBody));
        preDeserialize();
        expectToShallowEqualBody(resolver.resolve(json.ref), defaultBody);
        expect(() => checker.validate()).not.toThrow();
    });

    it("can deserialize custom body", () => {
        const { customBody } = createCustomBody();
        scanner.scan(customBody);
        const json = serializer.serialize(customBody, store.refer(customBody));
        preDeserialize();
        expectToShallowEqualBody(resolver.resolve(json.ref), customBody);
        expect(() => checker.validate()).not.toThrow();
    });

    it("can deseralize interacted body", () => {
        const bodyDef = new Box2DWeb.Dynamics.b2BodyDef();
        bodyDef.position = box2d.vec2(1, 2);
        bodyDef.angle = 1;
        const body = box2d.world.CreateBody(bodyDef);
        body.ApplyForce(box2d.vec2(1, 1), box2d.vec2(0, 0));
        box2d.step(10);
        scanner.scan(body);
        const json = serializer.serialize(body, store.refer(body));
        preDeserialize();
        expectToShallowEqualBody(resolver.resolve(json.ref), body);
        expect(() => checker.validate()).not.toThrow();
    });
});
