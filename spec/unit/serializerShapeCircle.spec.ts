import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { CircleShapeSerializer, circleShapeType } from "../../src/serialize/shape";
import { CircleShapeDeserializer } from "../../src/deserialize/shape";

describe("CircleShapeSerializer", () => {
    let box2d: Box2D;
    let serializer: CircleShapeSerializer;
    let deserializer: CircleShapeDeserializer;

    beforeEach(() => {
        box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        serializer = new CircleShapeSerializer();
        deserializer = new CircleShapeDeserializer();
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
        const object = deserializer.deserialize(json).value;
        expect(object.GetType()).toBe(Box2DWeb.Collision.Shapes.b2Shape.e_circleShape);
        expect(object.GetRadius()).toBe(circle.GetRadius());
    });
});
