import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ManifoldPointParam } from "../param/manifoldPoint";
import { manifoldPointType } from "../serialize/manifoldPoint";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { Vec2Deserializer } from "./vec2";
import { ContactIDDeserializer } from "./contactID";

export interface ManifoldPointDeserializedPayload extends DeserializedPayload<Box2DWeb.Collision.b2ManifoldPoint> {
}

export interface ManifoldPointDeserializerParameterObject {
    contactID: ContactIDDeserializer;
    vec2: Vec2Deserializer;
}

export class ManifoldPointDeserializer extends BaseDeserializer<ManifoldPointParam, ManifoldPointDeserializedPayload> {
    readonly _contactID: ContactIDDeserializer;
    readonly _vec2: Vec2Deserializer;

    constructor(param: ManifoldPointDeserializerParameterObject) {
        super(manifoldPointType);
        this._contactID = param.contactID;
        this._vec2 = param.vec2;
    }

    deserialize(json: ObjectDef<ManifoldPointParam>): ManifoldPointDeserializedPayload {
        const manifoldPoint = new Box2DWeb.Collision.b2ManifoldPoint();
        manifoldPoint.m_id = this._contactID.deserialize(json.param.m_id).value;
        manifoldPoint.m_localPoint = this._vec2.deserialize(json.param.m_localPoint).value;
        manifoldPoint.m_normalImpulse = json.param.m_normalImpulse;
        manifoldPoint.m_tangentImpulse = json.param.m_tangentImpulse;
        return {
            value: manifoldPoint,
        };
    }
}
