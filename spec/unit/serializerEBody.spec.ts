import { Box2D, Box2DWeb, EBody, BodyType, Box2DParameter } from "@akashic-extension/akashic-box2d";
import { EBodySerializer, ebodyType } from "../../src/serializerEbody";
import { createDefaultEntityParam, extractSerializedEntityParam, expectToShallowEqualBody, toExpectedEntity } from "./utils";
import { EntitySerializer } from "../../src/serializerEntity";
import { BodySerializer } from "../../src/serializerBody";
import { fixtureRefType, FixtureSerializer } from "../../src/serializerFixture";
import { FilterDataSerializer } from "../../src/serializerFilterData";
import { ShapeSerializer } from "../../src/serializerShape";
import { CircleShapeSerializer } from "../../src/serializerShapeCircle";
import { PolygonShapeSerializer } from "../../src/serializerShapePolygon";
import { Vec2Serializer } from "../../src/serializerVec2";
import { SweepSerializer } from "../../src/serializerSweep";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { TransformSerializer } from "../../src/serializerTransform";
import { Mat22Serializer } from "../../src/serializerMat22";
import { ObjectMapper } from "../../src/objectMapper";

describe("EBodySerializer", () => {
    let box2d: Box2D;
    let targetBox2D: Box2D;
    let serializer: EBodySerializer;
    let bodySerializer: BodySerializer;
    let entitySerializer: EntitySerializer;
    let sweepSerializer: SweepSerializer;
    let vec2Serializer: Vec2Serializer;
    let transformSerializer: TransformSerializer;
    let fixtureSerializer: FixtureSerializer;
    let fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
    let fixtureDefMapper: ObjectMapper<Box2DWeb.Dynamics.b2FixtureDef>;
    let ebody: EBody;
    let entityParam: g.EParameterObject;
    let bodyDef: Box2DWeb.Dynamics.b2BodyDef;
    let fixtureDefs: Box2DWeb.Dynamics.b2FixtureDef[];
    beforeEach(() => {
        const box2dParam: Box2DParameter = {
            gravity: [0, -9.8],
            scale: 10,
        };
        box2d = new Box2D(box2dParam);
        targetBox2D = new Box2D(box2dParam);

        const entitySerializers: EntitySerializer[] = [];
        entitySerializer = new EntitySerializer({
            scene: targetScene,
            entitySerializers,
            plainMatrixSerializer: new PlainMatrixSerializer(),
        });
        entitySerializers.push(entitySerializer);
        fixtureMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        fixtureDefMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        vec2Serializer = new Vec2Serializer();
        fixtureSerializer = new FixtureSerializer({
            filterDataSerializer: new FilterDataSerializer(),
            shapeSerializer: new ShapeSerializer({
                circleShapeSerializer: new CircleShapeSerializer(),
                polygonShapeSerializer: new PolygonShapeSerializer({
                    vec2Serializer,
                }),
            }),
            selfMapper: fixtureMapper,
        });
        bodySerializer = new BodySerializer({
            vec2Serializer,
            fixtureMapper,
        });
        sweepSerializer = new SweepSerializer({
            vec2Serializer,
        });
        transformSerializer = new TransformSerializer({
            mat22Serializer: new Mat22Serializer({
                vec2Serializer,
            }),
            vec2Serializer,
        });
        serializer = new EBodySerializer({
            box2d: targetBox2D,
            entitySerializers,
            bodySerializer,
            fixtureSerializer,
            sweepSerializer,
            vec2Serializer,
            transformSerializer,
            fixtureMapper,
            fixtureDefMapper,
        });
        entityParam = {
            ...createDefaultEntityParam(),
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

    it("set matched param", () => {
        const json = serializer.serialize(ebody);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize ebody", () => {
        const json = serializer.serialize(ebody);
        expect(json.type).toBe(ebodyType);
        expect(fixtureMapper.objects()).toHaveLength(2);
        expect(fixtureDefMapper.objects()).toHaveLength(0);
        expect(json.param).toEqual({
            b2body: {
                def: bodySerializer.serialize(ebody.b2Body),
                sweep: sweepSerializer.serialize(ebody.b2Body.m_sweep),
                force: vec2Serializer.serialize(ebody.b2Body.m_force),
                torque: ebody.b2Body.m_torque,
                m_xf: transformSerializer.serialize(ebody.b2Body.m_xf),
            },
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
        const initialJson = serializer.serialize(ebody);
        expect(initialJson.param.entity.param.x).toBe(0);
        expect(initialJson.param.b2body.def.param.linearVelocity.param.x).toBe(0);
        ebody.b2Body.ApplyForce(box2d.vec2(3, 4), box2d.vec2(0.1, 0.2));
        box2d.step(10);
        await step();
        const json = serializer.serialize(ebody);
        expect(json.param.entity.param.x).not.toBe(0);
        expect(json.param.b2body.def.param.linearVelocity.param.x).not.toBe(0);
    });

    it("can deserialize ebody", () => {
        const json = serializer.serialize(ebody);
        for (const [id, f] of fixtureMapper._refToObject.entries()) {
            fixtureDefMapper.referStrict(id, fixtureSerializer.deserialize(fixtureSerializer.serialize(f)));
        }
        const object = serializer.deserialize(json);
        expectToShallowEqualBody(object.b2Body, ebody.b2Body);
        expect(object.entity).toEqual(toExpectedEntity(ebody.entity, object.entity));
    });

    it("can deserialize interacted ebody", async () => {
        ebody.b2Body.ApplyForce(box2d.vec2(3, 4), box2d.vec2(0.1, 0.2));
        box2d.step(10);
        await step();
        const json = serializer.serialize(ebody);
        for (const param of fixtureMapper.objects().map(f => fixtureSerializer.serialize(f))) {
            fixtureDefMapper.refer(fixtureSerializer.deserialize(param));
        }
        const object = serializer.deserialize(json);
        expectToShallowEqualBody(object.b2Body, ebody.b2Body);
        expect(object.entity).toEqual(toExpectedEntity(ebody.entity, object.entity));
    });
});
