import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ContactIDParam, ContactIDSerializer } from "./serializerContactID";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";

/**
 * B2ManifoldPoint オブジェクト型の識別子
 */
export const manifoldPointType = Box2DWeb.Collision.b2ManifoldPoint.name;

/**
 * B2ManifoldPoint オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface ManifoldPointParam {
    m_id: ObjectDef<ContactIDParam>;
    m_localpoint: ObjectDef<Vec2Param>;
    m_normalImpulse: number;
    m_tangentImpulse: number;
}

export interface ManifoldPointSerializerParameterObject {
    contactIDSerializer: ContactIDSerializer;
    vec2Serializer: Vec2Serializer;
}

/**
 * B2ManifoldPoint オブジェクトを直列化・復元可能にします
 */
export class ManifoldPointSerializer implements ObjectSerializer<Box2DWeb.Collision.b2ManifoldPoint, ManifoldPointParam> {
    readonly _contactIDSerializer: ContactIDSerializer;
    readonly _vec2Serializer: Vec2Serializer;

    constructor(param: ManifoldPointSerializerParameterObject) {
        this._contactIDSerializer = param.contactIDSerializer;
        this._vec2Serializer = param.vec2Serializer;
    }

    filter(objectType: string): boolean {
        return objectType === manifoldPointType;
    }

    serialize(object: Box2DWeb.Collision.b2ManifoldPoint): ObjectDef<ManifoldPointParam> {
        return {
            type: manifoldPointType,
            param: {
                m_id: this._contactIDSerializer.serialize(object.m_id),
                m_localpoint: this._vec2Serializer.serialize(object.m_localPoint),
                m_normalImpulse: object.m_normalImpulse,
                m_tangentImpulse: object.m_tangentImpulse,
            },
        };
    }

    deserialize(json: ObjectDef<ManifoldPointParam>): Box2DWeb.Collision.b2ManifoldPoint {
        const manifoldPoint = new Box2DWeb.Collision.b2ManifoldPoint();
        manifoldPoint.m_id = this._contactIDSerializer.deserialize(json.param.m_id);
        manifoldPoint.m_localPoint = this._vec2Serializer.deserialize(json.param.m_localpoint);
        manifoldPoint.m_normalImpulse = json.param.m_normalImpulse;
        manifoldPoint.m_tangentImpulse = json.param.m_tangentImpulse;
        return manifoldPoint;
    }
}
