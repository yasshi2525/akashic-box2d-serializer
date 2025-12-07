import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { WorldParam } from "../param/world";
import { worldType } from "../serialize/world";
import { ObjectResolver } from "../deserialize/resolver";
import { ComplexObjectResolver } from "../deserialize/resolverComplex";
import { ContactDeserializedPayload } from "../deserialize/contact";
import { BodyDeserializedPayload } from "../deserialize/body";
import { ResolvingBaseMerger, ResolvingBaseMergerParameterObject, ResolvingMergedPayload } from "./mergable";
import { ContactManagerMerger } from "./contactManager";

export interface WorldMergedPayload extends ResolvingMergedPayload {
}

export interface WorldMergerParameterObject extends ResolvingBaseMergerParameterObject {
    contactManager: ContactManagerMerger;
    body: ObjectResolver<BodyDeserializedPayload>;
    contact: ComplexObjectResolver<ContactDeserializedPayload>;
}

export class WorldMerger extends ResolvingBaseMerger<WorldParam, Box2DWeb.Dynamics.b2World, WorldMergedPayload> {
    readonly _contactManager: ContactManagerMerger;
    readonly _body: ObjectResolver<BodyDeserializedPayload>;
    readonly _contact: ComplexObjectResolver<ContactDeserializedPayload>;

    constructor(param: WorldMergerParameterObject) {
        super(worldType, param);
        this._contactManager = param.contactManager;
        this._body = param.body;
        this._contact = param.contact;
    }

    merge(json: ObjectDef<WorldParam>, world: Box2DWeb.Dynamics.b2World): WorldMergedPayload {
        const { resolveAfter } = this._contactManager.merge(json.param.contactManager, world.m_contactManager);
        world.m_bodyCount = json.param.bodyCount;
        world.m_contactCount = json.param.contactCount;
        world.m_inv_dt0 = json.param.inv_dt0;
        world.m_flags = json.param.flags;
        return {
            resolveAfter: () => {
                resolveAfter();
                world.s_stack = json.param.stack.map(s => s ? this._body.resolve(s) : null);
                world.m_bodyList = json.param.bodyList ? this._body.resolve(json.param.bodyList) : null;
                world.m_groundBody = this._body.resolve(json.param.groundBody);
                world.m_contactList = json.param.contactList ? this._contact.resolve(json.param.contactList) : null;
            },
        };
    }
}
