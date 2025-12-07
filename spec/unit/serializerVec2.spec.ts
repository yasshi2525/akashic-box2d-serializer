import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { Vec2Serializer, vec2Type } from "../../src/serialize/vec2";
import { Vec2Deserializer } from "../../src/deserialize/vec2";

describe("Vec2Serializer", () => {
    let serializer: Vec2Serializer;
    let deserializer: Vec2Deserializer;

    beforeEach(() => {
        serializer = new Vec2Serializer();
        deserializer = new Vec2Deserializer();
    });

    it("can serialize default vec2", () => {
        const vec2 = new Box2DWeb.Common.Math.b2Vec2();
        const json = serializer.serialize(vec2);
        expect(json.type).toBe(vec2Type);
        expect(json.param).toEqual({ x: 0, y: 0 });
    });

    it("can serialize custom vec2", () => {
        const vec2 = new Box2DWeb.Common.Math.b2Vec2(1, 2);
        const json = serializer.serialize(vec2);
        expect(json.param).toEqual({ x: 1, y: 2 });
    });

    it("can deserialize default vec2", () => {
        const vec2 = new Box2DWeb.Common.Math.b2Vec2();
        const json = serializer.serialize(vec2);
        const object = deserializer.deserialize(json).value;
        expect(object).toEqual(vec2);
    });

    it("can deserialize custom vec2", () => {
        const vec2 = new Box2DWeb.Common.Math.b2Vec2(1, 2);
        const json = serializer.serialize(vec2);
        const object = deserializer.deserialize(json).value;
        expect(object).toEqual(vec2);
    });
});
