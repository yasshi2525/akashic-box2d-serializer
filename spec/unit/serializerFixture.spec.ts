import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { FixtureSerializer, fixtureType } from "../../src/serializerFixture";
import { ShapeSerializer } from "../../src/serializerShape";
import { CircleShapeSerializer } from "../../src/serializerShapeCircle";
import { PolygonShapeSerializer } from "../../src/serializerShapePolygon";
import { FilterDataSerializer } from "../../src/serializerFilterData";
import { Vec2Serializer } from "../../src/serializerVec2";
import { DynamicTreeNodeSerializer } from "../../src/serializerTreeNodeDynamic";
import { AABBSerializer } from "../../src/serializerAABB";

describe("FixtureSerializer", () => {
    let box2d: Box2D;
    let serializer: FixtureSerializer;
    let filterDataSerializer: FilterDataSerializer;
    let shapeSerializer: ShapeSerializer;
    let dynamicTreeNodeSerializer: DynamicTreeNodeSerializer;
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
        dynamicTreeNodeSerializer = new DynamicTreeNodeSerializer({
            aabbSerializer: new AABBSerializer({
                vec2Serializer,
            }),
        }),
        serializer = new FixtureSerializer({
            filterDataSerializer,
            shapeSerializer,
            dynamicTreeNodeSerializer,
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
        expect(json.param).toHaveLength(1);
        expect(json.param[0]).toEqual({
            ...{
                ...defaultFixtureDef,
                filter: filterDataSerializer.serialize(defaultFixtureDef.filter),
                m_proxy: defaultFixture.m_proxy ? dynamicTreeNodeSerializer.serialize(defaultFixture.m_proxy) : undefined,
            },
            shape: shapeSerializer.serialize(defaultFixtureDef.shape),
        });
    });

    it ("can serialize all properties value", () => {
        const { customFixture, customFixtureDef } = createCustomFixture();
        const json = serializer.serialize(customFixture);
        expect(json.param).toHaveLength(1);
        expect(json.param[0]).toEqual({
            ...{
                ...customFixtureDef,
                filter: filterDataSerializer.serialize(customFixtureDef.filter),
                m_proxy: customFixture.m_proxy ? dynamicTreeNodeSerializer.serialize(customFixture.m_proxy) : undefined,
            },
            shape: shapeSerializer.serialize(customFixtureDef.shape),
        });
    });

    it ("can serialize multiple fixtures", () => {
        const { defaultFixture, defaultFixtureDef } = createDefaultFixture();
        const { customFixture, customFixtureDef } = createCustomFixture();
        const json = serializer.serialize(body.GetFixtureList());
        // NOTE: fixture は unshift される。
        expect(json.param).toEqual([{
            ...{
                ...defaultFixtureDef,
                filter: filterDataSerializer.serialize(defaultFixtureDef.filter),
                m_proxy: defaultFixture.m_proxy ? dynamicTreeNodeSerializer.serialize(defaultFixture.m_proxy) : undefined,
            },
            shape: shapeSerializer.serialize(defaultFixtureDef.shape),
        }, {
            ...{
                ...customFixtureDef,
                filter: filterDataSerializer.serialize(customFixtureDef.filter),
                m_proxy: customFixture.m_proxy ? dynamicTreeNodeSerializer.serialize(customFixture.m_proxy) : undefined,
            },
            shape: shapeSerializer.serialize(customFixtureDef.shape),
        }].reverse());
    });

    it("can deserialize default fixture", () => {
        const { defaultFixture, defaultFixtureDef } = createDefaultFixture();
        const json = serializer.serialize(defaultFixture);
        const object = serializer.deserialize(json);
        expect(object).toHaveLength(1);
        expect(object[0]).toEqual(defaultFixtureDef);
    });

    it ("can deserialize all properties value", () => {
        const { customFixture, customFixtureDef } = createCustomFixture();
        const json = serializer.serialize(customFixture);
        const object = serializer.deserialize(json);
        expect(object).toHaveLength(1);
        expect(object[0]).toEqual(customFixtureDef);
    });

    it("can deserialize multiple fixtures", () => {
        const { defaultFixtureDef } = createDefaultFixture();
        const { customFixtureDef } = createCustomFixture();
        const json = serializer.serialize(body.GetFixtureList());
        const object = serializer.deserialize(json);
        expect(object).toHaveLength(2);
        // NOTE: fixture は unshift される。
        expect(object).toEqual([defaultFixtureDef, customFixtureDef].reverse());
    });

    it("can deserialize after body interaction", () => {
        const { defaultFixture, defaultFixtureDef } = createDefaultFixture();
        const json = serializer.serialize(defaultFixture);
        body.ApplyForce(box2d.vec2(10, 10), box2d.vec2(0, 0));
        box2d.step(10);
        const object = serializer.deserialize(json);
        expect(object).toHaveLength(1);
        expect(object[0]).toEqual(defaultFixtureDef);
    });
});
