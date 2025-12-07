import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { Mat22Param } from "../param/mat22";
import { mat22Type } from "../serialize/mat22";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { Vec2Deserializer } from "./vec2";

export interface Mat22DeserializedPayload extends DeserializedPayload<Box2DWeb.Common.Math.b2Mat22> {
}

export interface Mat22DeserializerParameterObject {
    vec2: Vec2Deserializer;
}

export class Mat22Deserializer extends BaseDeserializer<Mat22Param, Mat22DeserializedPayload> {
    readonly _vec2: Vec2Deserializer;

    constructor(param: Mat22DeserializerParameterObject) {
        super(mat22Type);
        this._vec2 = param.vec2;
    }

    deserialize(json: ObjectDef<Mat22Param>): Mat22DeserializedPayload {
        const mat22 = new Box2DWeb.Common.Math.b2Mat22();
        mat22.SetVV(
            this._vec2.deserialize(json.param.col1).value,
            this._vec2.deserialize(json.param.col2).value,
        );
        return {
            value: mat22,
        };
    }
}
