import { ObjectDef } from "../serializerObject";
import { Mat22Param } from "./mat22";
import { Vec2Param } from "./vec2";

export interface TransformParam {
    position: ObjectDef<Vec2Param>;
    R: ObjectDef<Mat22Param>;
}
