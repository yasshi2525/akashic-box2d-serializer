import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { CircleShapeParam, CircleShapeSerializer, circleShapeType } from "./serializerShapeCircle";
import { PolygonShapeParam, PolygonShapeSerializer, polygonShapeType } from "./serializerShapePolygon";

export type ShapeParam = CircleShapeParam | PolygonShapeParam;

export interface ShapeSerializerParameterObject {
    circleShapeSerializer: CircleShapeSerializer;
    polygonShapeSerializer: PolygonShapeSerializer;
}

/**
 * Shape定義を直列化・復元可能にします
 */
export class ShapeSerializer implements ObjectSerializer<Box2DWeb.Collision.Shapes.b2Shape, ShapeParam> {
    readonly _circleSerializer: CircleShapeSerializer;
    readonly _polygonSerializer: PolygonShapeSerializer;

    constructor(param: ShapeSerializerParameterObject) {
        this._circleSerializer = param.circleShapeSerializer;
        this._polygonSerializer = param.polygonShapeSerializer;
    }

    filter(objectType: string): boolean {
        return this._circleSerializer.filter(objectType) || this._polygonSerializer.filter(objectType);
    }

    serialize(object: Box2DWeb.Collision.Shapes.b2Shape): ObjectDef<ShapeParam> {
        if (object instanceof Box2DWeb.Collision.Shapes.b2CircleShape) {
            return this._circleSerializer.serialize(object);
        }
        else if (object instanceof Box2DWeb.Collision.Shapes.b2PolygonShape) {
            return this._polygonSerializer.serialize(object);
        }
        throw new Error(`Unsupported shape type: ${object.constructor.name} (supported type: b2Circle or b2Polygon)`);
    }

    deserialize(json: ObjectDef<ShapeParam>): Box2DWeb.Collision.Shapes.b2Shape {
        switch (json.type) {
            case circleShapeType:
                return this._circleSerializer.deserialize(json as ObjectDef<CircleShapeParam>);
            case polygonShapeType:
                return this._polygonSerializer.deserialize(json as ObjectDef<PolygonShapeParam>);
            default:
                throw new Error(`Unsupported shape type: ${json.type} (supported type: shape.circle or shape.polygon)`);
        }
    }
}
