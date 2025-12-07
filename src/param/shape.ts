import { ObjectDef } from "../serializerObject";
import { Vec2Param } from "./vec2";

export interface CircleShapeParam {
    radius: number;
}

export interface PolygonShapeParam {
    vertices: ObjectDef<Vec2Param>[];
}

export type ShapeParam = CircleShapeParam | PolygonShapeParam;
