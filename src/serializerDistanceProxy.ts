import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";

/**
 * B2DistanceProxy オブジェクト型の識別子
 */
export const distanceProxyType = Box2DWeb.Collision.b2DistanceProxy.name;

/**
 * B2DistanceProxy オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface DistanceProxyPram {
    m_count: number;
    m_radius: number;
    m_vertices: ObjectDef<Vec2Param>[];
}

export interface DistanceProxyParameterObject {
    vecSerializer: Vec2Serializer;
}

/**
 * B2DistanceProxy オブジェクトを直列化・復元可能にします
 */
export class DistanceProxySerializer implements ObjectSerializer<Box2DWeb.Collision.b2DistanceProxy, DistanceProxyPram> {
    readonly _vecSerializer: Vec2Serializer;

    constructor(param: DistanceProxyParameterObject) {
        this._vecSerializer = param.vecSerializer;
    }

    filter(objectType: string): boolean {
        return objectType === distanceProxyType;
    }

    serialize(object: Box2DWeb.Collision.b2DistanceProxy): ObjectDef<DistanceProxyPram> {
        return {
            type: distanceProxyType,
            param: {
                m_count: object.m_count,
                m_radius: object.m_radius,
                m_vertices: object.m_vertices.map(v => this._vecSerializer.serialize(v)),
            },
        };
    }

    deserialize(json: ObjectDef<DistanceProxyPram>): Box2DWeb.Collision.b2DistanceProxy {
        const distanceProxy = new Box2DWeb.Collision.b2DistanceProxy();
        distanceProxy.m_count = json.param.m_count;
        distanceProxy.m_radius = json.param.m_radius;
        distanceProxy.m_vertices = json.param.m_vertices.map(v => this._vecSerializer.deserialize(v));
        return distanceProxy;
    }
}
