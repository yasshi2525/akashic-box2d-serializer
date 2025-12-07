import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { AABBParam } from "../param/aabb";
import { aabbType } from "../serialize/aabb";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { Vec2Deserializer } from "./vec2";

export interface AABBDeserializedPayload extends DeserializedPayload<Box2DWeb.Collision.b2AABB> {
}

export interface AABBDeserializerParameterObject {
    vec2: Vec2Deserializer;
}

export class AABBDeserializer extends BaseDeserializer<AABBParam, AABBDeserializedPayload> {
    readonly _vec2: Vec2Deserializer;

    constructor(param: AABBDeserializerParameterObject) {
        super(aabbType);
        this._vec2 = param.vec2;
    }

    deserialize(json: ObjectDef<AABBParam>): AABBDeserializedPayload {
        const aabb = new Box2DWeb.Collision.b2AABB();
        aabb.lowerBound = this._vec2.deserialize(json.param.lowerBound).value;
        aabb.upperBound = this._vec2.deserialize(json.param.upperBound).value;
        return {
            value: aabb,
        };
    }
}
