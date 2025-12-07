import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ManifoldParam } from "../param/manifold";
import { Serializable } from "./serializable";
import { Vec2Serializer } from "./vec2";
import { ManifoldPointSerializer } from "./manifoldPoint";

export const manifoldType = Box2DWeb.Collision.b2Manifold.name;

export interface ManifoldSerializerParameterObject {
    vec2: Vec2Serializer;
    manifoldPoint: ManifoldPointSerializer;
}

export class ManifoldSerializer implements Serializable<Box2DWeb.Collision.b2Manifold, ManifoldParam> {
    readonly _vec2: Vec2Serializer;
    readonly _manifoldPoint: ManifoldPointSerializer;

    constructor(param: ManifoldSerializerParameterObject) {
        this._vec2 = param.vec2;
        this._manifoldPoint = param.manifoldPoint;
    }

    serialize(object: Box2DWeb.Collision.b2Manifold): ObjectDef<ManifoldParam> {
        return {
            type: manifoldType,
            param: {
                m_localPlaneNormal: this._vec2.serialize(object.m_localPlaneNormal),
                m_localPoint: this._vec2.serialize(object.m_localPoint),
                m_pointCount: object.m_pointCount,
                m_points: object.m_points.map(p => this._manifoldPoint.serialize(p)),
                m_type: object.m_type,
            },
        };
    }
}
