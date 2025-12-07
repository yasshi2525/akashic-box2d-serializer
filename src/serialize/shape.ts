import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { CircleShapeParam, PolygonShapeParam, ShapeParam } from "../param/shape";
import { Serializable } from "./serializable";
import { Vec2Serializer } from "./vec2";

export const circleShapeType = Box2DWeb.Collision.Shapes.b2CircleShape.name;
export const polygonShapeType = Box2DWeb.Collision.Shapes.b2PolygonShape.name;

export const shapeTypes = [
    circleShapeType,
    polygonShapeType,
] as const;

export interface ShapeSerializerParameterObject {
    circle: CircleShapeSerializer;
    polygon: PolygonShapeSerializer;
}

export class ShapeSerializer implements Serializable<Box2DWeb.Collision.Shapes.b2Shape, ShapeParam> {
    readonly _circle: CircleShapeSerializer;
    readonly _polygon: PolygonShapeSerializer;

    constructor(param: ShapeSerializerParameterObject) {
        this._circle = param.circle;
        this._polygon = param.polygon;
    }

    serialize(object: Box2DWeb.Collision.Shapes.b2Shape): ObjectDef<ShapeParam> {
        if (object instanceof Box2DWeb.Collision.Shapes.b2CircleShape) {
            return this._circle.serialize(object);
        }
        else if (object instanceof Box2DWeb.Collision.Shapes.b2PolygonShape) {
            return this._polygon.serialize(object);
        }
        throw new Error(`Unsupported shape type: ${object.constructor.name} (supported type: b2Circle or b2Polygon)`);
    }
}

export class CircleShapeSerializer implements Serializable<Box2DWeb.Collision.Shapes.b2CircleShape, CircleShapeParam> {
    serialize(object: Box2DWeb.Collision.Shapes.b2CircleShape): ObjectDef<CircleShapeParam> {
        return {
            type: circleShapeType,
            param: {
                radius: object.GetRadius(),
            },
        };
    }
}

export interface PolygonShapeSerializerParameterObject {
    vec2: Vec2Serializer;
}

export class PolygonShapeSerializer implements Serializable<Box2DWeb.Collision.Shapes.b2PolygonShape, PolygonShapeParam> {
    readonly _vec2: Vec2Serializer;

    constructor(param: PolygonShapeSerializerParameterObject) {
        this._vec2 = param.vec2;
    }

    serialize(object: Box2DWeb.Collision.Shapes.b2PolygonShape): ObjectDef<PolygonShapeParam> {
        return {
            type: polygonShapeType,
            param: {
                vertices: object.GetVertices().map(v => this._vec2.serialize(v)),
            },
        };
    }
}
