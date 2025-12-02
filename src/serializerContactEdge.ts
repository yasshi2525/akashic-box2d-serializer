import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectMapper, RefParam } from "./objectMapper";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { ContactObjectMapper } from "./objectMapperContact";

/**
 * B2ContactEdge オブジェクト型の識別子
 */
export const contactEdgeType = Box2DWeb.Dynamics.Contacts.b2ContactEdge.name;

/**
 * B2ContactEdge オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface ContactEdgeParam {
    /**
     * ref ContactEdge
     */
    self: ObjectDef<RefParam>;
    /**
     * ref b2Contact
     */
    contact?: ObjectDef<RefParam>;
    /**
     * ref b2ContactEdge
     */
    next?: ObjectDef<RefParam>;
    /**
     * ref b2Body
     */
    other?: ObjectDef<RefParam>;
    /**
     * ref b2ContactEdge
     */
    prev?: ObjectDef<RefParam>;
}

/**
 * B2ContactEdge オブジェクトの識別情報（参照解決用）の識別子。
 */
export const contactEdgeRefType = Box2DWeb.Dynamics.Contacts.b2ContactEdge.name + "Ref";

export interface ContactEdgeSerializerParameterObject {
    contactMapper: ContactObjectMapper;
    selfMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    bodyMapper: ObjectMapper<Box2DWeb.Dynamics.b2Body>;
}

/**
 * B2ContactEdge オブジェクトを直列化・復元可能にします
 */
export class ContactEdgeSerializer implements ObjectSerializer<Box2DWeb.Dynamics.Contacts.b2ContactEdge, ContactEdgeParam> {
    readonly _contactMapper: ContactObjectMapper;
    readonly _selfMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    readonly _bodyMapper: ObjectMapper<Box2DWeb.Dynamics.b2Body>;

    constructor(param: ContactEdgeSerializerParameterObject) {
        this._contactMapper = param.contactMapper;
        this._selfMapper = param.selfMapper;
        this._bodyMapper = param.bodyMapper;
    }

    filter(objectType: string): boolean {
        return objectType === contactEdgeType;
    }

    serialize(object: Box2DWeb.Dynamics.Contacts.b2ContactEdge): ObjectDef<ContactEdgeParam> {
        return {
            type: contactEdgeType,
            param: {
                self: this._selfMapper.refer(object),
                contact: object.contact ? this._contactMapper.refer(object.contact) : undefined,
                prev: object.prev ? this._selfMapper.refer(object.prev) : undefined,
                other: object.other ? this._bodyMapper.refer(object.other) : undefined,
                next: object.next ? this._selfMapper.refer(object.next) : undefined,
            },
        };
    }

    /**
     * contact, prev, next は インスタンス化後に解決します
     * @inheritdoc
     */
    deserialize(json: ObjectDef<ContactEdgeParam>): Box2DWeb.Dynamics.Contacts.b2ContactEdge {
        const contactEdge = new Box2DWeb.Dynamics.Contacts.b2ContactEdge();
        if (json.param.other) {
            contactEdge.other = this._bodyMapper.resolve(json.param.other);
        }
        return contactEdge;
    }
}
