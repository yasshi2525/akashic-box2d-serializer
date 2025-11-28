import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { fixtureRefType, FixtureSerializer, fixtureType } from "../../src/serializerFixture";
import { ShapeSerializer } from "../../src/serializerShape";
import { CircleShapeSerializer } from "../../src/serializerShapeCircle";
import { PolygonShapeSerializer } from "../../src/serializerShapePolygon";
import { FilterDataSerializer } from "../../src/serializerFilterData";
import { Vec2Serializer } from "../../src/serializerVec2";
import { ObjectMapper } from "../../src/objectMapper";

describe("FixtureSerializer", () => {
    let box2d: Box2D;
    let serializer: FixtureSerializer;
    let filterDataSerializer: FilterDataSerializer;
    let shapeSerializer: ShapeSerializer;
    let selfMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
    let bodydef: Box2DWeb.Dynamics.b2BodyDef;
    let body: Box2DWeb.Dynamics.b2Body;
    let circle: Box2DWeb.Collision.Shapes.b2CircleShape;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        const vec2Serializer = new Vec2Serializer();
        shapeSerializer = new ShapeSerializer({
            circleShapeSerializer: new CircleShapeSerializer(),
            polygonShapeSerializer: new PolygonShapeSerializer({
                vec2Serializer,
            }),
        });
        filterDataSerializer = new FilterDataSerializer();
        selfMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        serializer = new FixtureSerializer({
            filterDataSerializer,
            shapeSerializer,
            selfMapper,
        });
        bodydef = new Box2DWeb.Dynamics.b2BodyDef();
        body = box2d.world.CreateBody(bodydef);
        circle = box2d.createCircleShape(10);
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

    it("set matched param", () => {
        const { defaultFixture } = createDefaultFixture();
        const json = serializer.serialize(defaultFixture);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize default fixture", () => {
        const { defaultFixture, defaultFixtureDef } = createDefaultFixture();
        const json = serializer.serialize(defaultFixture);
        expect(json.type).toBe(fixtureType);
        expect(json.param).toEqual({
            ...defaultFixtureDef,
            self: selfMapper.refer(defaultFixture),
            filter: filterDataSerializer.serialize(defaultFixtureDef.filter),
            shape: shapeSerializer.serialize(defaultFixtureDef.shape),
        });
    });

    it ("can serialize all properties value", () => {
        const { customFixture, customFixtureDef } = createCustomFixture();
        const json = serializer.serialize(customFixture);
        expect(json.param).toEqual({
            ...customFixtureDef,
            self: selfMapper.refer(customFixture),
            filter: filterDataSerializer.serialize(customFixtureDef.filter),
            shape: shapeSerializer.serialize(customFixtureDef.shape),
        });
    });

    it("can deserialize default fixture", () => {
        const { defaultFixture, defaultFixtureDef } = createDefaultFixture();
        const json = serializer.serialize(defaultFixture);
        const object = serializer.deserialize(json);
        expect(object).toEqual(defaultFixtureDef);
    });

    it ("can deserialize all properties value", () => {
        const { customFixture, customFixtureDef } = createCustomFixture();
        const json = serializer.serialize(customFixture);
        const object = serializer.deserialize(json);
        expect(object).toEqual(customFixtureDef);
    });

    it("can deserialize after body interaction", () => {
        const { defaultFixture, defaultFixtureDef } = createDefaultFixture();
        const json = serializer.serialize(defaultFixture);
        body.ApplyForce(box2d.vec2(10, 10), box2d.vec2(0, 0));
        box2d.step(10);
        const object = serializer.deserialize(json);
        expect(object).toEqual(defaultFixtureDef);
    });

    it("can serialize shapeless fixture", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        expect(fixture.GetShape()).toBeFalsy();
        const json = serializer.serialize(fixture);
        expect(json.param.shape).toBeUndefined();
    });

    it("can deserialize shapeless fixture", () => {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        const json = serializer.serialize(fixture);
        const object = serializer.deserialize(json);
        expect(object.shape).toBeFalsy();
    });
});
