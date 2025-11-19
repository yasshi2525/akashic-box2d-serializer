import { Box2D, Box2DBodyDef, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { FixtureSerializer } from "../../src/serializerFixture";
import { FilterDataSerializer } from "../../src/serializerFilterData";
import { ShapeSerializer } from "../../src/serializerShape";
import { BodyParam, BodySerializer, bodyType } from "../../src/serializerBody";
import { CircleShapeSerializer } from "../../src/serializerShapeCircle";
import { PolygonShapeSerializer } from "../../src/serializerShapePolygon";
import { Vec2Serializer } from "../../src/serializerVec2";
import { DynamicTreeNodeSerializer } from "../../src/serializerTreeNodeDynamic";
import { AABBSerializer } from "../../src/serializerAABB";

describe("BodySerializer", () => {
    let box2d: Box2D;
    let vec2Serializer: Vec2Serializer;
    let fixtureSerializer: FixtureSerializer;
    let serializer: BodySerializer;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
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
            dynamicTreeNodeSerializer: new DynamicTreeNodeSerializer({
                aabbSerializer: new AABBSerializer({
                    vec2Serializer,
                }),
            }),
        });
        serializer = new BodySerializer({
            fixtureSerializer,
            vec2Serializer,
        });
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

    it("set match param", () => {
        const { defaultBody } = createDefaultBody();
        const json = serializer.serialize(defaultBody);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize default body", () => {
        const { defaultBody, defaultBodyDef } = createDefaultBody();
        const json = serializer.serialize(defaultBody);
        expect(json.type).toEqual(bodyType);
        const expectedRaw = {
            ...defaultBodyDef,
            linearVelocity: vec2Serializer.serialize(defaultBodyDef.linearVelocity),
            fixtureList: fixtureSerializer.serialize(defaultBody.GetFixtureList()),
        };
        // 不必要パラメタを消去するためRequired parameter を optional parameter に変換
        const expected: Partial<typeof expectedRaw> = expectedRaw;
        delete expected.angle;
        delete expected.position;
        expect(json.param).toEqual(expected);
    });

    it("can serialize custom body", () => {
        const { customBody, customBodyDef } = createCustomBody();
        const json = serializer.serialize(customBody);
        const expectedRaw = {
            ...customBodyDef,
            linearVelocity: vec2Serializer.serialize(customBodyDef.linearVelocity),
            fixtureList: fixtureSerializer.serialize(customBody.GetFixtureList()),
        };
        // 不必要パラメタを消去するためRequired parameter を optional parameter に変換
        const expected: Partial<typeof expectedRaw> = expectedRaw;
        delete expected.angle;
        delete expected.position;
        expect(json.param).toEqual(expected);
    });

    it("can deserialize default body", () => {
        const { defaultBodyDef, defaultBody } = createDefaultBody();
        const json = serializer.serialize(defaultBody);
        const object = serializer.deserialize(json);
        expect(object).toEqual(defaultBodyDef);
    });

    it("can deserialize custom body", () => {
        const { customBodyDef, customBody } = createCustomBody();
        const json = serializer.serialize(customBody);
        const object = serializer.deserialize(json);
        expect(object).toEqual(customBodyDef);
    });

    it("can deseralize interacted body", () => {
        const bodyDef = new Box2DWeb.Dynamics.b2BodyDef();
        bodyDef.position = box2d.vec2(1, 2);
        bodyDef.angle = 1;
        const body = box2d.world.CreateBody(bodyDef);
        body.ApplyForce(box2d.vec2(1, 1), box2d.vec2(0, 0));
        box2d.step(10);
        const json = serializer.serialize(body);
        const object = serializer.deserialize(json);
        // equal except angle, position
        expect({
            ...object,
            angle: undefined,
            position: undefined,
        }).toEqual({
            ...bodyDef,
            angle: undefined,
            position: undefined,
        });
    });
});
