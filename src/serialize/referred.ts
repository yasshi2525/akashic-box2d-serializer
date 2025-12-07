import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ReferredStoreParam } from "../param/referred";
import { ObjectStore } from "../scan/store";
import { ComplexObjectStore } from "../scan/storeComplex";
import { Serializable } from "./serializable";
import { BodySerializer } from "./body";
import { FixtureSerializer } from "./fixture";
import { DynamicTreeNodeSerializer } from "./treeNode";
import { ContactSerializer } from "./contact";
import { ContactEdgeSerializer } from "./contactEdge";

export const referredStoreType = "referredStore";

export interface ReferredStoreSerializerParameterObject {
    body: BodySerializer;
    fixture: FixtureSerializer;
    node: DynamicTreeNodeSerializer;
    contact: ContactSerializer;
    contactEdge: ContactEdgeSerializer;
    bodyStore: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    fixtureStore: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    nodeStore: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    contactStore: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
    contactEdgeStore: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
}

export class ReferredStoreSerializer implements Serializable<void, ReferredStoreParam> {
    readonly _body: BodySerializer;
    readonly _fixture: FixtureSerializer;
    readonly _node: DynamicTreeNodeSerializer;
    readonly _contact: ContactSerializer;
    readonly _contactEdge: ContactEdgeSerializer;
    readonly _bodyStore: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    readonly _fixtureStore: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    readonly _nodeStore: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    readonly _contactStore: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
    readonly _contactEdgeStore: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;

    constructor(param: ReferredStoreSerializerParameterObject) {
        this._body = param.body;
        this._fixture = param.fixture;
        this._node = param.node;
        this._contact = param.contact;
        this._contactEdge = param.contactEdge;
        this._bodyStore = param.bodyStore;
        this._fixtureStore = param.fixtureStore;
        this._nodeStore = param.nodeStore;
        this._contactStore = param.contactStore;
        this._contactEdgeStore = param.contactEdgeStore;
    }

    serialize(): ObjectDef<ReferredStoreParam> {
        return {
            type: referredStoreType,
            param: {
                bodies: this._bodyStore.dump(this._body),
                fixtures: this._fixtureStore.dump(this._fixture),
                nodes: this._nodeStore.dump(this._node),
                contacts: this._contactStore.dump(this._contact),
                contactEdges: this._contactEdgeStore.dump(this._contactEdge),
            },
        };
    }
}
