import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * Polygon Shapeオブジェクト型の識別子。
 */
export const polygonShapeType = Box2DWeb.Collision.Shapes.b2PolygonShape.name;

/**
 * Polygon Shapeオブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface PolygonShapeParam {
    /**
     * 各頂点の座標リスト。座標系は box2d (m) であり、Akashicのエンティティ系 (px) ではない。
     */
    vertices: { x: number; y: number }[];
}

/**
 * Polygon Shape定義を直列化・復元可能にします
 */
export class PolygonShapeSerializer implements ObjectSerializer<Box2DWeb.Collision.Shapes.b2PolygonShape, PolygonShapeParam> {
    filter(objectType: string): boolean {
        return objectType === polygonShapeType;
    }

    serialize(object: Box2DWeb.Collision.Shapes.b2PolygonShape): ObjectDef<PolygonShapeParam> {
        return {
            type: polygonShapeType,
            param: {
                vertices: object.GetVertices().map(v => ({ x: v.x, y: v.y })),
            },
        };
    }

    deserialize(json: ObjectDef<PolygonShapeParam>): Box2DWeb.Collision.Shapes.b2PolygonShape {
        const shape = new Box2DWeb.Collision.Shapes.b2PolygonShape();
        shape.SetAsArray(
            json.param.vertices.map(p => new Box2DWeb.Common.Math.b2Vec2(p.x, p.y)),
            json.param.vertices.length
        );
        return shape;
    }
}
