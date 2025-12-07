import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { SweepParam } from "../param/sweep";
import { Serializable } from "./serializable";
import { Vec2Serializer } from "./vec2";

export const sweepType = Box2DWeb.Common.Math.b2Sweep.name;

export interface SweepSerializerParameterObject {
    vec2: Vec2Serializer;
}

export class SweepSerializer implements Serializable<Box2DWeb.Common.Math.b2Sweep, SweepParam> {
    readonly _vec2: Vec2Serializer;

    constructor(param: SweepSerializerParameterObject) {
        this._vec2 = param.vec2;
    }

    serialize(object: Box2DWeb.Common.Math.b2Sweep): ObjectDef<SweepParam> {
        return {
            type: sweepType,
            param: {
                a: object.a,
                a0: object.a0,
                c: this._vec2.serialize(object.c),
                c0: this._vec2.serialize(object.c0),
                localCenter: this._vec2.serialize(object.localCenter),
                t0: object.t0,
            },
        };
    }
}
