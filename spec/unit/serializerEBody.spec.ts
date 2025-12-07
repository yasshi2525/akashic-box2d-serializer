import { Box2D, Box2DWeb, EBody, BodyType, Box2DParameter } from "@akashic-extension/akashic-box2d";
import { createDefaultEntityParam, extractSerializedEntityParam, expectToShallowEqualBody, toExpectedEntity, createBox2DWebSerializers, createBox2DWebDeserializers } from "./utils";
import { EntitySerializer } from "../../src/serializerEntity";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { EBodySerializer, ebodyType } from "../../src/serialize/ebody";
import { EBodyScanner } from "../../src/scan/ebody";
import { EBodyDeserializer } from "../../src/deserialize/ebody";

describe("EBodySerializer", () => {
    let box2d: Box2D;
    let targetBox2D: Box2D;
    let serializer: EBodySerializer;
    let deserializer: EBodyDeserializer;
    let entitySerializer: EntitySerializer;
    let scanner: EBodyScanner;
    let ebody: EBody;
    let entityParam: g.EParameterObject;
    let bodyDef: Box2DWeb.Dynamics.b2BodyDef;
    let fixtureDefs: Box2DWeb.Dynamics.b2FixtureDef[];
    let ser: ReturnType<typeof createBox2DWebSerializers>;
    let des: ReturnType<typeof createBox2DWebDeserializers>;

    beforeEach(() => {
        const box2dParam: Box2DParameter = {
            gravity: [0, -9.8],
            scale: 10,
        };
        box2d = new Box2D(box2dParam);
        targetBox2D = new Box2D(box2dParam);
        ser = createBox2DWebSerializers();
        scanner = new EBodyScanner({
            body: ser.scanners.body,
        });
        des = createBox2DWebDeserializers(targetBox2D.world);
        const entitySerializers: EntitySerializer[] = [];
        entitySerializer = new EntitySerializer({
            scene: targetScene,
            entitySerializers,
            plainMatrixSerializer: new PlainMatrixSerializer(),
        });
        entitySerializers.push(entitySerializer);
        serializer = new EBodySerializer({
            entities: entitySerializers,
            body: ser.stores.body,
        });
        deserializer = new EBodyDeserializer({
            checker: des.checker,
            entities: entitySerializers,
            body: des.resolvers.body,
        });
        entityParam = {
            ...createDefaultEntityParam(scene),
            parent: scene,
        };
        bodyDef = box2d.createBodyDef({
            type: BodyType.Dynamic,
        });
        fixtureDefs = [
            box2d.createFixtureDef({
                shape: box2d.createCircleShape(10),
                userData: "1.circle",
            }),
            box2d.createFixtureDef({
                shape: box2d.createRectShape(100, 200),
                userData: "2.rect",
            })];
        ebody = box2d.createBody(new g.E(entityParam), bodyDef, fixtureDefs)!;
    });

    const preDeserialize = () => {
        const bodyJson = ser.stores.body.dump(ser.serializers.body);
        const nodeJson = ser.stores.node.dump(ser.serializers.node);
        const fixtureJson = ser.stores.fixture.dump(ser.serializers.fixture);
        const bps = des.resolvers.body.deserialize(bodyJson, des.deserializers.body, des.deserializers.body.resolveSibling);
        const nps = des.resolvers.node.deserialize(nodeJson, des.deserializers.node, des.deserializers.node.resolveSibling);
        const fps = des.resolvers.fixture.deserialize(fixtureJson, des.deserializers.fixture, des.deserializers.fixture.resolveSibling);
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

    it("can serialize ebody", () => {
        scanner.scan(ebody);
        const json = serializer.serialize(ebody);
        expect(json.type).toBe(ebodyType);
        expect(ser.stores.fixture._store.size).toBe(2);
        expect(json.param).toEqual({
            b2body: ser.stores.body.refer(ebody.b2Body),
            entity: {
                type: g.E.name,
                param: {
                    ...extractSerializedEntityParam(entityParam, ebody.entity.id),
                    _matrix: ebody.entity._matrix,
                    state: ebody.entity.state,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    parent: "scene",
                },
            },
            id: ebody.id,
        });
    });

    it("can serialize interacted ebody", async () => {
        scanner.scan(ebody);
        const initialJson = serializer.serialize(ebody);
        const initialBbodyJson = ser.serializers.body.serialize(ebody.b2Body, ser.stores.body.refer(ebody.b2Body));
        expect(initialJson.param.entity.param.x).toBe(0);
        expect(initialBbodyJson.param.linearVelocity.param.x).toBe(0);
        ebody.b2Body.ApplyForce(box2d.vec2(3, 4), box2d.vec2(0.1, 0.2));
        box2d.step(10);
        await step();
        scanner.scan(ebody);
        const json = serializer.serialize(ebody);
        const bodyJson = ser.serializers.body.serialize(ebody.b2Body, ser.stores.body.refer(ebody.b2Body));
        expect(json.param.entity.param.x).not.toBe(0);
        expect(bodyJson.param.linearVelocity.param.x).not.toBe(0);
    });

    it("can deserialize ebody", () => {
        scanner.scan(ebody);
        const json = serializer.serialize(ebody);
        preDeserialize();
        const { value: object, resolveAfter } = deserializer.deserialize(json);
        resolveAfter();
        expectToShallowEqualBody(object.b2Body, ebody.b2Body);
        expect(object.entity).toEqual(toExpectedEntity(ebody.entity, object.entity));
        expect(() => des.checker.validate()).not.toThrow();
    });

    it("can deserialize interacted ebody", async () => {
        ebody.b2Body.ApplyForce(box2d.vec2(3, 4), box2d.vec2(0.1, 0.2));
        box2d.step(10);
        await step();
        scanner.scan(ebody);
        const json = serializer.serialize(ebody);
        preDeserialize();
        const { value: object, resolveAfter } = deserializer.deserialize(json);
        resolveAfter();
        expectToShallowEqualBody(object.b2Body, ebody.b2Body);
        expect(object.entity).toEqual(toExpectedEntity(ebody.entity, object.entity));
        expect(() => des.checker.validate()).not.toThrow();
    });
});
