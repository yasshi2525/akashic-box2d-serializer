import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { TransformParam } from "../param/transform";
import { transformType } from "../serialize/transform";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { Vec2Deserializer } from "./vec2";
import { Mat22Deserializer } from "./mat22";

export interface TransformDeserializedPayload extends DeserializedPayload<Box2DWeb.Common.Math.b2Transform> {
}

export interface TransformDeserializerParameterObject {
    vec2: Vec2Deserializer;
    mat22: Mat22Deserializer;
}

export class TransformDeserializer extends BaseDeserializer<TransformParam, TransformDeserializedPayload> {
    readonly _vec2: Vec2Deserializer;
    readonly _mat22: Mat22Deserializer;

    constructor(param: TransformDeserializerParameterObject) {
        super(transformType);
        this._vec2 = param.vec2;
        this._mat22 = param.mat22;
    }

    deserialize(json: ObjectDef<TransformParam>): TransformDeserializedPayload {
        const transform = new Box2DWeb.Common.Math.b2Transform(
            this._vec2.deserialize(json.param.position).value,
            this._mat22.deserialize(json.param.R).value
        );
        return {
            value: transform,
        };
    }
}
