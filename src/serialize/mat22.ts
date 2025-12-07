import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { Mat22Param } from "../param/mat22";
import { Serializable } from "./serializable";
import { Vec2Serializer } from "./vec2";

export const mat22Type = Box2DWeb.Common.Math.b2Mat22.name;

export interface Mat22SerializerParameterObject {
    vec2: Vec2Serializer;
}

export class Mat22Serializer implements Serializable<Box2DWeb.Common.Math.b2Mat22, Mat22Param> {
    readonly _vec2: Vec2Serializer;

    constructor(param: Mat22SerializerParameterObject) {
        this._vec2 = param.vec2;
    }

    serialize(object: Box2DWeb.Common.Math.b2Mat22): ObjectDef<Mat22Param> {
        return {
            type: mat22Type,
            param: {
                col1: this._vec2.serialize(object.col1),
                col2: this._vec2.serialize(object.col2),
            },
        };
    }
}
