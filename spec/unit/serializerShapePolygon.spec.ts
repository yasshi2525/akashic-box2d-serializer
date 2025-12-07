import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { PolygonShapeSerializer, polygonShapeType } from "../../src/serialize/shape";
import { PolygonShapeDeserializer } from "../../src/deserialize/shape";
import { Vec2Serializer } from "../../src/serialize/vec2";
import { Vec2Deserializer } from "../../src/deserialize/vec2";

describe("PolygonShapeSerializer", () => {
    let box2d: Box2D;
    let serializer: PolygonShapeSerializer;
    let deserializer: PolygonShapeDeserializer;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        serializer = new PolygonShapeSerializer({
            vec2: new Vec2Serializer(),
        });
        deserializer = new PolygonShapeDeserializer({
            vec2: new Vec2Deserializer(),
        });
    });

    it("can serialize polygon", () => {
        const polygon = box2d.createPolygonShape([
            new Box2DWeb.Common.Math.b2Vec2(1, 2),
            new Box2DWeb.Common.Math.b2Vec2(3, 4),
            new Box2DWeb.Common.Math.b2Vec2(5, 6),
        ]);
        const json = serializer.serialize(polygon);
        expect(json.type).toBe(polygonShapeType);
        expect(json.param.vertices).toHaveLength(3);
    });

    it("can serialize box", () => {
        const box = box2d.createRectShape(100, 100);
        const json = serializer.serialize(box);
        expect(json.param.vertices).toHaveLength(4);
    });

    it("can deserialize polygon", () => {
        const vertices = [
            new Box2DWeb.Common.Math.b2Vec2(1, 2),
            new Box2DWeb.Common.Math.b2Vec2(3, 4),
            new Box2DWeb.Common.Math.b2Vec2(5, 6),
        ];
        const polygon = box2d.createPolygonShape(vertices);
        const json = serializer.serialize(polygon);
        const object = deserializer.deserialize(json).value;
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_polygonShape);
        expect(object.GetVertexCount()).toBe(3);
        expect(object.GetVertices()).toEqual(vertices);
    });

    it("can deserialize box", () => {
        const box = box2d.createRectShape(100, 100);
        const json = serializer.serialize(box);
        const object = deserializer.deserialize(json).value;
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_polygonShape);
        expect(object.GetVertexCount()).toBe(4);
        expect(object.GetVertices()).toEqual([
            box2d.vec2(-50, -50),
            box2d.vec2(+50, -50),
            box2d.vec2(+50, +50),
            box2d.vec2(-50, +50),
        ]);
    });
});
