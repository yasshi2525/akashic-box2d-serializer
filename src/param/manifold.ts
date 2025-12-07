import { ObjectDef } from "../serializerObject";
import { ManifoldPointParam } from "./manifoldPoint";
import { Vec2Param } from "./vec2";

export interface ManifoldParam {
    m_localPlaneNormal: ObjectDef<Vec2Param>;
    m_localPoint: ObjectDef<Vec2Param>;
    m_pointCount: number;
    m_points: ObjectDef<ManifoldPointParam>[];
    m_type: number;
}
