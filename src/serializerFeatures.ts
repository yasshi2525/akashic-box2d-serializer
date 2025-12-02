import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * Features オブジェクト型の識別子
 */
export const featuresType = Box2DWeb.Collision.Features.name;

/**
 * Features オブジェクトを復元可能な形式で直列化したJSONです。
 * _m_id は直列化しません。復元時にマッピングされます。
 */
export interface FeaturesParam {
    flip: number;
    incidentEdge: number;
    incidentVertex: number;
    referenceEdge: number;
}

/**
 * Features オブジェクトを直列化・復元可能にします
 */
export class FeaturesSerializer implements ObjectSerializer<Box2DWeb.Collision.Features, FeaturesParam> {
    filter(objectType: string): boolean {
        return objectType === featuresType;
    }

    /**
     * _m_id は直列化しません。復元時にマッピングされます。
     * @inheritdoc
     */
    serialize(object: Box2DWeb.Collision.Features): ObjectDef<FeaturesParam> {
        return {
            type: featuresType,
            param: {
                flip: object._flip,
                incidentEdge: object._incidentEdge,
                incidentVertex: object._incidentVertex,
                referenceEdge: object._referenceEdge,
            },
        };
    }

    /**
     * _m_id インスタンス化後に解決します
     * @inheritdoc
     */
    deserialize(json: ObjectDef<FeaturesParam>): Box2DWeb.Collision.Features {
        const features = new Box2DWeb.Collision.Features();
        features._flip = json.param.flip;
        features._incidentEdge = json.param.incidentEdge;
        features._incidentVertex = json.param.incidentVertex;
        features._referenceEdge = json.param.referenceEdge;
        return features;
    }
}
