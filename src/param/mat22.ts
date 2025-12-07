import { ObjectDef } from "../serializerObject";
import { Vec2Param } from "./vec2";

export interface Mat22Param {
    col1: ObjectDef<Vec2Param>;
    col2: ObjectDef<Vec2Param>;
}
