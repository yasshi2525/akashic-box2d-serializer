import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ShapeSerializer } from "../../src/serializerShape";
import { CircleShapeSerializer, circleShapeType } from "../../src/serializerShapeCircle";
import { PolygonShapeSerializer, polygonShapeType } from "../../src/serializerShapePolygon";
import { Vec2Serializer } from "../../src/serializerVec2";

describe("ShapeSerializer", () => {
    let box2d: Box2D;
    let serializer: ShapeSerializer;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        serializer = new ShapeSerializer({
            circleShapeSerializer: new CircleShapeSerializer(),
            polygonShapeSerializer: new PolygonShapeSerializer({
                vec2Serializer: new Vec2Serializer(),
            }),
        });
    });

    it("set matched param (circle)", () => {
        const circle = new Box2DWeb.Collision.Shapes.b2CircleShape(10);
        const json = serializer.serialize(circle);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("set matched param (polygon)", () => {
        const polygon = new Box2DWeb.Collision.Shapes.b2PolygonShape();
        const json = serializer.serialize(polygon);
        expect(serializer.filter(json.type)).toBe(true);
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
        const object = serializer.deserialize(json);
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_circleShape);
    });

    it("can deserialize polygon", () => {
        const rect = box2d.createRectShape(50, 50);
        const json = serializer.serialize(rect);
        const object = serializer.deserialize(json);
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_polygonShape);
    });

    it("throws for unsupported shape on deserialize", () => {
        const unknownParam = { type: "unknown", param: { vertices: [] } };
        expect(() => serializer.deserialize(unknownParam)).toThrow();
    });
});
