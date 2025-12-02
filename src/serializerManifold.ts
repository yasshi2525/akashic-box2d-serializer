import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ManifoldPointParam, ManifoldPointSerializer } from "./serializerManifoldPoint";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";

/**
 * B2Manifold オブジェクト型の識別子
 */
export const manifoldType = Box2DWeb.Collision.b2Manifold.name;

/**
 * B2Manifold オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface ManifoldParam {
    m_localPlaneNormal: ObjectDef<Vec2Param>;
    m_localPoint: ObjectDef<Vec2Param>;
    m_pointCount: number;
    m_points: ObjectDef<ManifoldPointParam>[];
    m_type: number;
}

export interface ManifoldSerializerParameterObject {
    vec2serializer: Vec2Serializer;
    manifoldPointSerializer: ManifoldPointSerializer;
}

/**
 * B2Manifold オブジェクトを直列化・復元可能にします
 */
export class ManifoldSerializer implements ObjectSerializer<Box2DWeb.Collision.b2Manifold, ManifoldParam> {
    readonly _vec2serializer: Vec2Serializer;
    readonly _manifoldPointSerializer: ManifoldPointSerializer;

    constructor(param: ManifoldSerializerParameterObject) {
        this._vec2serializer = param.vec2serializer;
        this._manifoldPointSerializer = param.manifoldPointSerializer;
    }

    filter(objectType: string): boolean {
        return objectType === manifoldType;
    }

    serialize(object: Box2DWeb.Collision.b2Manifold): ObjectDef<ManifoldParam> {
        return {
            type: manifoldType,
            param: {
                m_localPlaneNormal: this._vec2serializer.serialize(object.m_localPlaneNormal),
                m_localPoint: this._vec2serializer.serialize(object.m_localPoint),
                m_pointCount: object.m_pointCount,
                m_points: object.m_points.map(p => this._manifoldPointSerializer.serialize(p)),
                m_type: object.m_type,
            },
        };
    }

    deserialize(json: ObjectDef<ManifoldParam>): Box2DWeb.Collision.b2Manifold {
        const manifold = new Box2DWeb.Collision.b2Manifold();
        manifold.m_localPlaneNormal = this._vec2serializer.deserialize(json.param.m_localPlaneNormal);
        manifold.m_localPoint = this._vec2serializer.deserialize(json.param.m_localPoint);
        manifold.m_pointCount = json.param.m_pointCount;
        manifold.m_points = json.param.m_points.map(p => this._manifoldPointSerializer.deserialize(p));
        manifold.m_type = json.param.m_type;
        return manifold;
    }
}
