import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ManifoldPointParam } from "../param/manifoldPoint";
import { Serializable } from "./serializable";
import { Vec2Serializer } from "./vec2";
import { ContactIDSerializer } from "./contactID";

export const manifoldPointType = Box2DWeb.Collision.b2ManifoldPoint.name;

export interface ManifoldPointSerializerParameterObject {
    contactID: ContactIDSerializer;
    vec2: Vec2Serializer;
}

export class ManifoldPointSerializer implements Serializable<Box2DWeb.Collision.b2ManifoldPoint, ManifoldPointParam> {
    readonly _contactID: ContactIDSerializer;
    readonly _vec2: Vec2Serializer;

    constructor(param: ManifoldPointSerializerParameterObject) {
        this._contactID = param.contactID;
        this._vec2 = param.vec2;
    }

    serialize(object: Box2DWeb.Collision.b2ManifoldPoint): ObjectDef<ManifoldPointParam> {
        return {
            type: manifoldPointType,
            param: {
                m_id: this._contactID.serialize(object.m_id),
                m_localPoint: this._vec2.serialize(object.m_localPoint),
                m_normalImpulse: object.m_normalImpulse,
                m_tangentImpulse: object.m_tangentImpulse,
            },
        };
    }
}
