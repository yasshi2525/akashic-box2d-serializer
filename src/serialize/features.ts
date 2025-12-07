import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { FeaturesParam } from "../param/features";
import { Serializable } from "./serializable";

export const featuresType = Box2DWeb.Collision.Features.name;

export class FeaturesSerializer implements Serializable<Box2DWeb.Collision.Features, FeaturesParam> {
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
}
