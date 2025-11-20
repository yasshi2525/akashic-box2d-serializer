import { Box2D, Box2DWeb, EBody, BodyType, Box2DParameter } from "@akashic-extension/akashic-box2d";
import { EBodySerializer, ebodyType } from "../../src/serializerEbody";
import { createDefaultEntityParam, extractSerializedEntityParam, toExpectedBody, toExpectedEntity } from "./utils";
import { EntitySerializer } from "../../src/serializerEntity";
import { BodySerializer } from "../../src/serializerBody";
import { FixtureSerializer } from "../../src/serializerFixture";
import { FilterDataSerializer } from "../../src/serializerFilterData";
import { ShapeSerializer } from "../../src/serializerShape";
import { CircleShapeSerializer } from "../../src/serializerShapeCircle";
import { PolygonShapeSerializer } from "../../src/serializerShapePolygon";
import { Vec2Serializer } from "../../src/serializerVec2";
import { SweepSerializer } from "../../src/serializerSweep";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { TransformSerializer } from "../../src/serializerTransform";
import { Mat22Serializer } from "../../src/serializerMat22";
import { DynamicTreeNodeSerializer } from "../../src/serializerTreeNodeDynamic";
import { AABBSerializer } from "../../src/serializerAABB";

describe("EBodySerializer", () => {
    let box2d: Box2D;
    let targetBox2D: Box2D;
    let serializer: EBodySerializer;
    let bodySerializer: BodySerializer;
    let entitySerializer: EntitySerializer;
    let sweepSerializer: SweepSerializer;
    let vec2Serializer: Vec2Serializer;
    let transformSerializer: TransformSerializer;
    let ebody: EBody;
    let entityParam: g.EParameterObject;
    let bodyDef: Box2DWeb.Dynamics.b2BodyDef;
    let fixtureDef: Box2DWeb.Dynamics.b2FixtureDef;
    beforeEach(() => {
        const box2dParam: Box2DParameter = {
            gravity: [0, -9.8],
            scale: 10,
        };
        box2d = new Box2D(box2dParam);
        targetBox2D = new Box2D(box2dParam);
        const entitySerializerSet = new Set<EntitySerializer>();
        entitySerializer = new EntitySerializer({
            scene: targetScene,
            entitySerializerSet,
            plainMatrixSerializer: new PlainMatrixSerializer(),
        });
        entitySerializerSet.add(entitySerializer);
        vec2Serializer = new Vec2Serializer();
        const dynamicTreeNodeSerializer = new DynamicTreeNodeSerializer({
            aabbSerializer: new AABBSerializer({
                vec2Serializer,
            }),
        });
        const fixtureSerializer = new FixtureSerializer({
            filterDataSerializer: new FilterDataSerializer(),
            shapeSerializer: new ShapeSerializer({
                circleShapeSerializer: new CircleShapeSerializer(),
                polygonShapeSerializer: new PolygonShapeSerializer({
                    vec2Serializer,
                }),
            }),
            dynamicTreeNodeSerializer,
        });
        bodySerializer = new BodySerializer({
            vec2Serializer,
            fixtureSerializer,
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
            entitySerializerSet,
            bodySerializer,
            fixtureSerializer,
            sweepSerializer,
            vec2Serializer,
            transformSerializer,
            dynamicTreeNodeSerializer,
        });
        entityParam = {
            ...createDefaultEntityParam(),
            parent: scene,
        };
        bodyDef = box2d.createBodyDef({
            type: BodyType.Dynamic,
        });
        fixtureDef = box2d.createFixtureDef({
            shape: box2d.createCircleShape(10),
        });
        ebody = box2d.createBody(new g.E(entityParam), bodyDef, fixtureDef)!;
    });

    it("set matched param", () => {
        const json = serializer.serialize(ebody);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize ebody", () => {
        const json = serializer.serialize(ebody);
        expect(json.type).toBe(ebodyType);
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
        const object = serializer.deserialize(json);
        expect(object).toEqual({
            id: ebody.id,
            b2Body: toExpectedBody(ebody.b2Body, object.b2Body),
            entity: toExpectedEntity(ebody.entity, object.entity),
        });
    });

    it("can deserialize interacted ebody", async () => {
        ebody.b2Body.ApplyForce(box2d.vec2(3, 4), box2d.vec2(0.1, 0.2));
        box2d.step(10);
        await step();
        const json = serializer.serialize(ebody);
        const object = serializer.deserialize(json);
        expect(object).toEqual({
            id: ebody.id,
            b2Body: toExpectedBody(ebody.b2Body, object.b2Body),
            entity: toExpectedEntity(ebody.entity, object.entity),
        });
    });
});
