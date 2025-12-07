import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, RefParam } from "../serializerObject";
import { ContactEdgeParam } from "../param/contactEdge";
import { ObjectStore } from "../scan/store";
import { ComplexObjectStore } from "../scan/storeComplex";
import { ReferableObjectDef, ReferableSerializable } from "./serializable";

export const contactEdgeType = Box2DWeb.Dynamics.Contacts.b2ContactEdge.name;

export interface ContactEdgeSerializerParameterObject {
    self: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    body: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    contact: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
}

export class ContactEdgeSerializer implements ReferableSerializable<Box2DWeb.Dynamics.Contacts.b2ContactEdge, ContactEdgeParam> {
    readonly _self: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    readonly _body: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    readonly _contact: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;

    constructor(param: ContactEdgeSerializerParameterObject) {
        this._self = param.self;
        this._body = param.body;
        this._contact = param.contact;
    }

    serialize(object: Box2DWeb.Dynamics.Contacts.b2ContactEdge, ref: ObjectDef<RefParam>): ReferableObjectDef<ContactEdgeParam> {
        return {
            type: contactEdgeType,
            ref,
            param: {
                contact: object.contact ? this._contact.refer(object.contact) : undefined,
                other: object.other ? this._body.refer(object.other) : undefined,
                prev: object.prev ? this._self.refer(object.prev) : undefined,
                next: object.next ? this._self.refer(object.next) : undefined,
            },
        };
    }
}
