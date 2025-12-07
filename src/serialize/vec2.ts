import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { Vec2Param } from "../param/vec2";
import { Serializable } from "./serializable";

export const vec2Type = Box2DWeb.Common.Math.b2Vec2.name;

export class Vec2Serializer implements Serializable<Box2DWeb.Common.Math.b2Vec2, Vec2Param> {
    serialize(object: Box2DWeb.Common.Math.b2Vec2): ObjectDef<Vec2Param> {
        return {
            type: vec2Type,
            param: {
                x: object.x,
                y: object.y,
            },
        };
    }
}
