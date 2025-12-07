import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { CircleShapeSerializer, circleShapeType, PolygonShapeSerializer, polygonShapeType, ShapeSerializer } from "../../src/serialize/shape";
import { CircleShapeDeserializer, PolygonShapeDeserializer, ShapeDeserializer } from "../../src/deserialize/shape";
import { Vec2Serializer } from "../../src/serialize/vec2";
import { Vec2Deserializer } from "../../src/deserialize/vec2";

describe("ShapeSerializer", () => {
    let box2d: Box2D;
    let serializer: ShapeSerializer;
    let deserializer: ShapeDeserializer;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        serializer = new ShapeSerializer({
            circle: new CircleShapeSerializer(),
            polygon: new PolygonShapeSerializer({
                vec2: new Vec2Serializer(),
            }),
        });
        deserializer = new ShapeDeserializer({
            circle: new CircleShapeDeserializer(),
            polygon: new PolygonShapeDeserializer({
                vec2: new Vec2Deserializer(),
            }),
        });
    });

    it("can serialize circle", () => {
        const circle = box2d.createCircleShape(10);
        const json = serializer.serialize(circle);
        expect(json.type).toBe(circleShapeType);
        expect("radius" in json.param).toBe(true);
    });

    it("can serialize polygon", () => {
        const rect = box2d.createRectShape(100, 100);
        const json = serializer.serialize(rect);
        expect(json.type).toBe(polygonShapeType);
        expect("vertices" in json.param).toBe(true);
    });

    it("throws for unsupported shape on deserialize", () => {
        const unsupported = new Box2DWeb.Collision.Shapes.b2Shape();
        expect(() => serializer.serialize(unsupported)).toThrow();
    });

    it("can deserialize circle", () => {
        const circle = box2d.createCircleShape(10);
        const json = serializer.serialize(circle);
        const object = deserializer.deserialize(json).value;
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_circleShape);
    });

    it("can deserialize polygon", () => {
        const rect = box2d.createRectShape(50, 50);
        const json = serializer.serialize(rect);
        const object = deserializer.deserialize(json).value;
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_polygonShape);
    });

    it("throws for unsupported shape on deserialize", () => {
        const unknownParam = { type: "unknown", param: { vertices: [] } };
        expect(() => deserializer.deserialize(unknownParam).value).toThrow();
    });
});
