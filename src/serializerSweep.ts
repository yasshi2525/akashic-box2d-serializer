import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";

/**
 * B2Sweep オブジェクト型の識別子
 */
export const sweepType = Box2DWeb.Common.Math.b2Sweep.name;

/**
 * B2Sweep オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface SweepParam {
    a: number;
    a0: number;
    c: ObjectDef<Vec2Param>;
    c0: ObjectDef<Vec2Param>;
    localCenter: ObjectDef<Vec2Param>;
    t0: number;
}

export interface SweepSerializerParameterObject {
    vec2Serializer: Vec2Serializer;
}

/**
 * B2Sweep オブジェクトを直列化・復元可能にします
 */
export class SweepSerializer implements ObjectSerializer<Box2DWeb.Common.Math.b2Sweep, SweepParam> {
    readonly _vec2Serializer: Vec2Serializer;

    constructor(param: SweepSerializerParameterObject) {
        this._vec2Serializer = param.vec2Serializer;
    }

    filter(objectType: string): boolean {
        return objectType === sweepType;
    }

    serialize(object: Box2DWeb.Common.Math.b2Sweep): ObjectDef<SweepParam> {
        return {
            type: sweepType,
            param: {
                a: object.a,
                a0: object.a0,
                c: this._vec2Serializer.serialize(object.c),
                c0: this._vec2Serializer.serialize(object.c0),
                localCenter: this._vec2Serializer.serialize(object.localCenter),
                t0: object.t0,
            },
        };
    }

    deserialize(json: ObjectDef<SweepParam>): Box2DWeb.Common.Math.b2Sweep {
        const sweep = new Box2DWeb.Common.Math.b2Sweep();
        sweep.a = json.param.a;
        sweep.a0 = json.param.a0;
        sweep.c = this._vec2Serializer.deserialize(json.param.c);
        sweep.c0 = this._vec2Serializer.deserialize(json.param.c0);
        sweep.localCenter = this._vec2Serializer.deserialize(json.param.localCenter);
        sweep.t0 = json.param.t0;
        return sweep;
    }
}
