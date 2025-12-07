import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { TransformParam } from "../param/transform";
import { Serializable } from "./serializable";
import { Vec2Serializer } from "./vec2";
import { Mat22Serializer } from "./mat22";

export const transformType = Box2DWeb.Common.Math.b2Transform.name;

export interface TransformSerializerParameterObject {
    vec2: Vec2Serializer;
    mat22: Mat22Serializer;
}

export class TransformSerializer implements Serializable<Box2DWeb.Common.Math.b2Transform, TransformParam> {
    readonly _vec2: Vec2Serializer;
    readonly _mat22: Mat22Serializer;

    constructor(param: TransformSerializerParameterObject) {
        this._vec2 = param.vec2;
        this._mat22 = param.mat22;
    }

    serialize(object: Box2DWeb.Common.Math.b2Transform): ObjectDef<TransformParam> {
        return {
            type: transformType,
            param: {
                position: this._vec2.serialize(object.position),
                R: this._mat22.serialize(object.R),
            },
        };
    }
}
