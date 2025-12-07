import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ContactIDParam } from "../param/contactID";
import { contactIDType } from "../serialize/contactID";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { FeaturesDeserializer } from "./features";

export interface ContactIDDeserializedPayload extends DeserializedPayload<Box2DWeb.Collision.b2ContactID> {
}

export interface ContactIDDeserializerParameterObject {
    features: FeaturesDeserializer;
}

export class ContactIDDeserializer extends BaseDeserializer<ContactIDParam, ContactIDDeserializedPayload> {
    readonly _features: FeaturesDeserializer;

    constructor(param: ContactIDDeserializerParameterObject) {
        super(contactIDType);
        this._features = param.features;
    }

    deserialize(json: ObjectDef<ContactIDParam>): ContactIDDeserializedPayload {
        const contantID = new Box2DWeb.Collision.b2ContactID();
        const { value, resolve } = this._features.deserialize(json.param.features);
        resolve(contantID);
        contantID.features = value;
        if (json.param.key !== undefined) {
            contantID._key = json.param.key;
        }
        return {
            value: contantID,
        };
    }
}
