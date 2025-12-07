import { ObjectDef } from "../serializerObject";
import { Vec2Param } from "./vec2";

export interface AABBParam {
    lowerBound: ObjectDef<Vec2Param>;
    upperBound: ObjectDef<Vec2Param>;
}
