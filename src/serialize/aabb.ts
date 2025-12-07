import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { AABBParam } from "../param/aabb";
import { Serializable } from "./serializable";
import { Vec2Serializer } from "./vec2";

export const aabbType = Box2DWeb.Collision.b2AABB.name;

export interface AABBSerializerParameterObject {
    vec2: Vec2Serializer;
}

export class AABBSerializer implements Serializable<Box2DWeb.Collision.b2AABB, AABBParam> {
    readonly _vec2: Vec2Serializer;

    constructor(param: AABBSerializerParameterObject) {
        this._vec2 = param.vec2;
    }

    serialize(object: Box2DWeb.Collision.b2AABB): ObjectDef<AABBParam> {
        return {
            type: aabbType,
            param: {
                lowerBound: this._vec2.serialize(object.lowerBound),
                upperBound: this._vec2.serialize(object.upperBound),
            },
        };
    }
}
