import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ContactIDParam } from "../param/contactID";
import { Serializable } from "./serializable";
import { FeaturesSerializer } from "./features";

export const contactIDType = Box2DWeb.Collision.b2ContactID.name;

export interface ContactIDSerializerParameterObject {
    features: FeaturesSerializer;
}

export class ContactIDSerializer implements Serializable<Box2DWeb.Collision.b2ContactID, ContactIDParam> {
    readonly _features: FeaturesSerializer;

    constructor(param: ContactIDSerializerParameterObject) {
        this._features = param.features;
    }

    serialize(object: Box2DWeb.Collision.b2ContactID): ObjectDef<ContactIDParam> {
        return {
            type: contactIDType,
            param: {
                features: this._features.serialize(object.features),
                key: object._key,
            },
        };
    }
}
