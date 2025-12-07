import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { FeaturesParam } from "../param/features";
import { featuresType } from "../serialize/features";
import { ResolvingBaseDeserializer, ResolvingBaseDeserializerParameterObject, ResolvingDeserializedPayload } from "./deserializable";

export interface FeaturesDeserializedPayload extends ResolvingDeserializedPayload<Box2DWeb.Collision.Features> {
    resolve: (id: Box2DWeb.Collision.b2ContactID) => void;
}

export interface FeaturesDeserializerParameterObject extends ResolvingBaseDeserializerParameterObject {
}

export class FeaturesDeserializer extends ResolvingBaseDeserializer<FeaturesParam, FeaturesDeserializedPayload> {
    constructor(param: FeaturesDeserializerParameterObject) {
        super(featuresType, param);
    }

    deserialize(json: ObjectDef<FeaturesParam>): FeaturesDeserializedPayload {
        const features = new Box2DWeb.Collision.Features();
        features._flip = json.param.flip;
        features._incidentEdge = json.param.incidentEdge;
        features._incidentVertex = json.param.incidentVertex;
        features._referenceEdge = json.param.referenceEdge;
        return {
            value: features,
            resolve: (id) => {
                features._m_id = id;
            },
        };
    }
}
