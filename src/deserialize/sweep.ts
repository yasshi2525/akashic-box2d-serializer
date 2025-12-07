import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { SweepParam } from "../param/sweep";
import { sweepType } from "../serialize/sweep";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { Vec2Deserializer } from "./vec2";

export interface SweepDeserializedPayload extends DeserializedPayload<Box2DWeb.Common.Math.b2Sweep> {
}

export interface SweepDeserializerParameterObject {
    vec2: Vec2Deserializer;
}

export class SweepDeserializer extends BaseDeserializer<SweepParam, SweepDeserializedPayload> {
    readonly _vec2: Vec2Deserializer;

    constructor(param: SweepDeserializerParameterObject) {
        super(sweepType);
        this._vec2 = param.vec2;
    }

    deserialize(json: ObjectDef<SweepParam>): SweepDeserializedPayload {
        const sweep = new Box2DWeb.Common.Math.b2Sweep();
        sweep.a = json.param.a;
        sweep.a0 = json.param.a0;
        sweep.c = this._vec2.deserialize(json.param.c).value;
        sweep.c0 = this._vec2.deserialize(json.param.c0).value;
        sweep.localCenter = this._vec2.deserialize(json.param.localCenter).value;
        sweep.t0 = json.param.t0;
        return {
            value: sweep,
        };
    }
}
