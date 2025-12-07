import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ContactEdgeParam } from "../param/contactEdge";
import { contactEdgeType } from "../serialize/contactEdge";
import { ResolvingSiblingBaseDeserializer, ResolvingSiblingBaseDeserializerParameterObject, ResolvingSiblingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { ComplexObjectResolver } from "./resolverComplex";
import { BodyDeserializedPayload } from "./body";
import { ContactDeserializedPayload } from "./contact";

export interface ContactEdgeDeserializedPayload extends ResolvingSiblingDeserializedPayload<Box2DWeb.Dynamics.Contacts.b2ContactEdge> {
    resolve?: (contact: Box2DWeb.Dynamics.Contacts.b2Contact) => void;
    resolveAfter: () => void;
}

export interface ContactEdgeDeserializerParameterObject extends ResolvingSiblingBaseDeserializerParameterObject {
    self: ObjectResolver<ContactEdgeDeserializedPayload>;
    body: ObjectResolver<BodyDeserializedPayload>;
    contact: ComplexObjectResolver<ContactDeserializedPayload>;
}

export class ContactEdgeDeserializer extends ResolvingSiblingBaseDeserializer<ContactEdgeParam, ContactEdgeDeserializedPayload> {
    readonly _self: ObjectResolver<ContactEdgeDeserializedPayload>;
    readonly _body: ObjectResolver<BodyDeserializedPayload>;
    readonly _contact: ComplexObjectResolver<ContactDeserializedPayload>;

    constructor(param: ContactEdgeDeserializerParameterObject) {
        super(contactEdgeType, param);
        this._self = param.self;
        this._body = param.body;
        this._contact = param.contact;
    }

    deserialize(json: ObjectDef<ContactEdgeParam>): ContactEdgeDeserializedPayload {
        const contactEdge = new Box2DWeb.Dynamics.Contacts.b2ContactEdge();
        const result: ContactEdgeDeserializedPayload = {
            value: contactEdge,
            resolveSibling: () => {
                if (json.param.prev) {
                    contactEdge.prev = this._self.resolve(json.param.prev);
                }
                if (json.param.next) {
                    contactEdge.next = this._self.resolve(json.param.next);
                }
            },
            resolveAfter: () => {
                // contactEdge 側から contact の参照を一方的に切られることがあるので、そのまま再現
                if (json.param.contact) {
                    contactEdge.contact = this._contact.resolve(json.param.contact);
                }
                if (json.param.other) {
                    contactEdge.other = this._body.resolve(json.param.other);
                }
            },
        };
        return result;
    }
}
