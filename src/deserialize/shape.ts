import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { CircleShapeParam, PolygonShapeParam, ShapeParam } from "../param/shape";
import { circleShapeType, polygonShapeType, shapeTypes } from "../serialize/shape";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { Vec2Deserializer } from "./vec2";

export interface ShapeDeserializedPayload extends DeserializedPayload<Box2DWeb.Collision.Shapes.b2Shape> {
}
export interface CircleShapeDeserializedPayload extends DeserializedPayload<Box2DWeb.Collision.Shapes.b2CircleShape> {
}
export interface PolygonShapeDeserializedPayload extends DeserializedPayload<Box2DWeb.Collision.Shapes.b2PolygonShape> {
}

export interface ShapeDeserializerParameterObject {
    circle: CircleShapeDeserializer;
    polygon: PolygonShapeDeserializer;
}

export class ShapeDeserializer extends BaseDeserializer<ShapeParam, ShapeDeserializedPayload> {
    readonly _circle: CircleShapeDeserializer;
    readonly _polygon: PolygonShapeDeserializer;

    constructor(param: ShapeDeserializerParameterObject) {
        super([...shapeTypes]);
        this._circle = param.circle;
        this._polygon = param.polygon;
    }

    deserialize(json: ObjectDef<ShapeParam>): ShapeDeserializedPayload {
        switch (json.type) {
            case circleShapeType:
                return this._circle.deserialize(json as ObjectDef<CircleShapeParam>);
            case polygonShapeType:
                return this._polygon.deserialize(json as ObjectDef<PolygonShapeParam>);
            default:
                throw new Error(`Unsupported shape type: ${json.type} (supported type: shape.circle or shape.polygon)`);
        }
    }
}

export class CircleShapeDeserializer extends BaseDeserializer<CircleShapeParam, CircleShapeDeserializedPayload> {
    constructor() {
        super(circleShapeType);
    }

    deserialize(json: ObjectDef<CircleShapeParam>): CircleShapeDeserializedPayload {
        const shape = new Box2DWeb.Collision.Shapes.b2CircleShape(json.param.radius);
        return {
            value: shape,
        };
    }
}

export interface PolygonShapeDeserializerParameterObject {
    vec2: Vec2Deserializer;
}

export class PolygonShapeDeserializer extends BaseDeserializer<PolygonShapeParam, PolygonShapeDeserializedPayload> {
    readonly _vec2: Vec2Deserializer;

    constructor(param: PolygonShapeDeserializerParameterObject) {
        super(polygonShapeType);
        this._vec2 = param.vec2;
    }

    deserialize(json: ObjectDef<PolygonShapeParam>): PolygonShapeDeserializedPayload {
        const shape = new Box2DWeb.Collision.Shapes.b2PolygonShape();
        shape.SetAsArray(
            json.param.vertices.map(p => this._vec2.deserialize(p).value),
            json.param.vertices.length
        );
        return {
            value: shape,
        };
    }
}
