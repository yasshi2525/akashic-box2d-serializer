import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { CircleShapeSerializer, circleShapeType } from "../../src/serializerShapeCircle";

describe("CircleShapeSerializer", () => {
    let box2d: Box2D;
    let serializer: CircleShapeSerializer;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        serializer = new CircleShapeSerializer();
    });

    it("set matched param", () => {
        const shape = new Box2DWeb.Collision.Shapes.b2CircleShape(10);
        const json = serializer.serialize(shape);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize circle", () => {
        const circle = box2d.createCircleShape(10);
        const json = serializer.serialize(circle);
        expect(json.type).toBe(circleShapeType);
        expect(json.param.radius).toBe(circle.GetRadius());
    });

    it("can deserialize circle", () => {
        const circle = box2d.createCircleShape(20);
        const json = serializer.serialize(circle);
        const object = serializer.deserialize(json);
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_circleShape);
        expect(object.GetRadius()).toBe(circle.GetRadius());
    });
});
