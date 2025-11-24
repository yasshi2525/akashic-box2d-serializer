import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { fixtureRefType } from "../../src/serializerFixture";
import { BodySerializer, bodyType } from "../../src/serializerBody";
import { Vec2Serializer } from "../../src/serializerVec2";
import { ObjectMapper, RefParam } from "../../src/objectMapper";
import { ObjectDef } from "../../src/serializerObject";

describe("BodySerializer", () => {
    let box2d: Box2D;
    let vec2Serializer: Vec2Serializer;
    let serializer: BodySerializer;
    let fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        fixtureMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        vec2Serializer = new Vec2Serializer();
        serializer = new BodySerializer({
            vec2Serializer,
            fixtureMapper,
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
        expect(fixtureMapper.objects()).toHaveLength(0);
        const fixtureList: ObjectDef<RefParam>[] = [];
        for (let f = defaultBody.GetFixtureList(); f; f = f.GetNext()) {
            fixtureList.push(fixtureMapper.refer(f));
        }
        const expectedRaw = {
            ...defaultBodyDef,
            linearVelocity: vec2Serializer.serialize(defaultBodyDef.linearVelocity),
            fixtureList,
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
        expect(fixtureMapper.objects()).toHaveLength(2);
        const fixtureList: ObjectDef<RefParam>[] = [];
        for (let f = customBody.GetFixtureList(); f; f = f.GetNext()) {
            fixtureList.push(fixtureMapper.refer(f));
        }
        const expectedRaw = {
            ...customBodyDef,
            linearVelocity: vec2Serializer.serialize(customBodyDef.linearVelocity),
            fixtureList,
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
