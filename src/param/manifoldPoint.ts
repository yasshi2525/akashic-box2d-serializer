import { ObjectDef } from "../serializerObject";
import { ContactIDParam } from "./contactID";
import { Vec2Param } from "./vec2";

export interface ManifoldPointParam {
    m_id: ObjectDef<ContactIDParam>;
    m_localPoint: ObjectDef<Vec2Param>;
    m_normalImpulse: number;
    m_tangentImpulse: number;
}
