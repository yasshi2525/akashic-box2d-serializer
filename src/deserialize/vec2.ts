import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { Vec2Param } from "../param/vec2";
import { vec2Type } from "../serialize/vec2";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";

export interface Vec2DeserializedPayload extends DeserializedPayload<Box2DWeb.Common.Math.b2Vec2> {
}

export class Vec2Deserializer extends BaseDeserializer<Vec2Param, Vec2DeserializedPayload> {
    constructor() {
        super(vec2Type);
    }

    deserialize(json: ObjectDef<Vec2Param>): Vec2DeserializedPayload {
        const vec2 = new Box2DWeb.Common.Math.b2Vec2(
            json.param.x,
            json.param.y
        );
        return {
            value: vec2,
        };
    }
}
