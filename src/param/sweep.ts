import { ObjectDef } from "../serializerObject";
import { Vec2Param } from "./vec2";

export interface SweepParam {
    a: number;
    a0: number;
    c: ObjectDef<Vec2Param>;
    c0: ObjectDef<Vec2Param>;
    localCenter: ObjectDef<Vec2Param>;
    t0: number;
}
