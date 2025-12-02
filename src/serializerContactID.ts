import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { FeaturesParam, FeaturesSerializer } from "./serializerFeatures";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * B2ContactID オブジェクト型の識別子
 */
export const contactIDType = Box2DWeb.Collision.b2ContactID.name;

/**
 * B2ContactID オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface ContactIDParam {
    features: ObjectDef<FeaturesParam>;
    key?: number;
}

export interface ContactIDSerializerParameterObject {
    featuresSerializer: FeaturesSerializer;
}

/**
 * Features オブジェクトを直列化・復元可能にします
 */
export class ContactIDSerializer implements ObjectSerializer<Box2DWeb.Collision.b2ContactID, ContactIDParam> {
    readonly _featuresSerializer: FeaturesSerializer;

    constructor(param: ContactIDSerializerParameterObject) {
        this._featuresSerializer = param.featuresSerializer;
    }

    filter(objectType: string): boolean {
        return objectType === contactIDType;
    }

    serialize(object: Box2DWeb.Collision.b2ContactID): ObjectDef<ContactIDParam> {
        return {
            type: contactIDType,
            param: {
                features: this._featuresSerializer.serialize(object.features),
                key: object._key,
            },
        };
    }

    deserialize(json: ObjectDef<ContactIDParam>): Box2DWeb.Collision.b2ContactID {
        const contantID = new Box2DWeb.Collision.b2ContactID();
        contantID.features = this._featuresSerializer.deserialize(json.param.features);
        contantID.features._m_id = contantID;
        if (json.param.key) {
            contantID._key = json.param.key;
        }
        return contantID;
    }
}
