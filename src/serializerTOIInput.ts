import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { DistanceProxyPram, DistanceProxySerializer } from "./serializerDistanceProxy";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { SweepParam, SweepSerializer } from "./serializerSweep";

/**
 * B2TOIInput オブジェクト型の識別子
 */
export const toiInputType = Box2DWeb.Collision.b2TOIInput.name;

/**
 * B2TOIInput オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface TOIInputParam {
    proxyA: ObjectDef<DistanceProxyPram>;
    proxyB: ObjectDef<DistanceProxyPram>;
    sweepA: ObjectDef<SweepParam>;
    sweepB: ObjectDef<SweepParam>;
    tolerance?: number;
}

export interface TOIInputSerializerParameterObject {
    distanceProxySerializer: DistanceProxySerializer;
    sweepSerializer: SweepSerializer;
}

/**
 * B2TOIInput オブジェクトを直列化・復元可能にします
 */
export class TOIInputSerializer implements ObjectSerializer<Box2DWeb.Collision.b2TOIInput, TOIInputParam> {
    readonly _distanceProxySerializer: DistanceProxySerializer;
    readonly _sweepSerializer: SweepSerializer;

    constructor(param: TOIInputSerializerParameterObject) {
        this._distanceProxySerializer = param.distanceProxySerializer;
        this._sweepSerializer = param.sweepSerializer;
    }

    filter(objectType: string): boolean {
        return objectType === toiInputType;
    }

    serialize(object: Box2DWeb.Collision.b2TOIInput): ObjectDef<TOIInputParam> {
        return {
            type: toiInputType,
            param: {
                proxyA: this._distanceProxySerializer.serialize(object.proxyA),
                proxyB: this._distanceProxySerializer.serialize(object.proxyB),
                sweepA: this._sweepSerializer.serialize(object.sweepA),
                sweepB: this._sweepSerializer.serialize(object.sweepB),
                tolerance: object.tolerance,
            },
        };
    }

    deserialize(json: ObjectDef<TOIInputParam>): Box2DWeb.Collision.b2TOIInput {
        const toiInput = new Box2DWeb.Collision.b2TOIInput();
        toiInput.proxyA = this._distanceProxySerializer.deserialize(json.param.proxyA);
        toiInput.proxyB = this._distanceProxySerializer.deserialize(json.param.proxyB);
        toiInput.sweepA = this._sweepSerializer.deserialize(json.param.sweepA);
        toiInput.sweepB = this._sweepSerializer.deserialize(json.param.sweepB);
        if (json.param.tolerance) {
            toiInput.tolerance = json.param.tolerance;
        }
        return toiInput;
    }
}
