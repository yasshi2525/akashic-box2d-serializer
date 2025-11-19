import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { Vec2Serializer, vec2Type } from "../../src/serializerVec2";

describe("Vec2Serializer", () => {
    let serializer: Vec2Serializer;

    beforeEach(() => {
        serializer = new Vec2Serializer();
    });

    it("set matched param", () => {
        const vec2 = new Box2DWeb.Common.Math.b2Vec2();
        const json = serializer.serialize(vec2);
        expect(serializer.filter(json.type)).toBe(true);
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
        const object = serializer.deserialize(json);
        expect(object).toEqual(vec2);
    });

    it("can deserialize custom vec2", () => {
        const vec2 = new Box2DWeb.Common.Math.b2Vec2(1, 2);
        const json = serializer.serialize(vec2);
        const object = serializer.deserialize(json);
        expect(object).toEqual(vec2);
    });
});
