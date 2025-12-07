import { ObjectDef } from "../serializerObject";
import { ReferredStoreParam } from "../param/referred";
import { referredStoreType } from "../serialize/referred";
import { DeserializedPayload, ResolvingBaseDeserializer, ResolvingBaseDeserializerParameterObject } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { ComplexObjectResolver } from "./resolverComplex";
import { DynamicTreeNodeDeserializer, DynamicTreeNodeDeserializedPayload } from "./treeNode";
import { BodyDeserializer, BodyDeserializedPayload } from "./body";
import { FixtureDeserializer, FixtureDeserializedPayload } from "./fixture";
import { ContactDeserializer, ContactDeserializedPayload } from "./contact";
import { ContactEdgeDeserializer, ContactEdgeDeserializedPayload } from "./contactEdge";

export interface ReferredStoreDeserializedPayload extends DeserializedPayload<void> {
}

export interface ReferredStoreDeserializerParameterObject extends ResolvingBaseDeserializerParameterObject {
    body: BodyDeserializer;
    fixture: FixtureDeserializer;
    node: DynamicTreeNodeDeserializer;
    contact: ContactDeserializer;
    contactEdge: ContactEdgeDeserializer;
    bodyResolver: ObjectResolver<BodyDeserializedPayload>;
    fixtureResolver: ObjectResolver<FixtureDeserializedPayload>;
    nodeResolver: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    contactResolver: ComplexObjectResolver<ContactDeserializedPayload>;
    contactEdgeResolver: ObjectResolver<ContactEdgeDeserializedPayload>;
}

export class ReferredStoreDeserializer extends ResolvingBaseDeserializer<ReferredStoreParam, ReferredStoreDeserializedPayload> {
    readonly _body: BodyDeserializer;
    readonly _fixture: FixtureDeserializer;
    readonly _node: DynamicTreeNodeDeserializer;
    readonly _contact: ContactDeserializer;
    readonly _contactEdge: ContactEdgeDeserializer;
    readonly _bodyResolver: ObjectResolver<BodyDeserializedPayload>;
    readonly _fixtureResolver: ObjectResolver<FixtureDeserializedPayload>;
    readonly _nodeResolver: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    readonly _contactResolver: ComplexObjectResolver<ContactDeserializedPayload>;
    readonly _contactEdgeResolver: ObjectResolver<ContactEdgeDeserializedPayload>;

    constructor(param: ReferredStoreDeserializerParameterObject) {
        super(referredStoreType, param);
        this._body = param.body;
        this._fixture = param.fixture;
        this._node = param.node;
        this._contact = param.contact;
        this._contactEdge = param.contactEdge;
        this._bodyResolver = param.bodyResolver;
        this._fixtureResolver = param.fixtureResolver;
        this._nodeResolver = param.nodeResolver;
        this._contactResolver = param.contactResolver;
        this._contactEdgeResolver = param.contactEdgeResolver;
    }

    deserialize(json: ObjectDef<ReferredStoreParam>): ReferredStoreDeserializedPayload {
        const bodies = this._bodyResolver.deserialize(json.param.bodies, this._body, this._body.resolveSibling);
        const fixtures = this._fixtureResolver.deserialize(json.param.fixtures, this._fixture, this._fixture.resolveSibling);
        const nodes = this._nodeResolver.deserialize(json.param.nodes, this._node, this._node.resolveSibling);
        const contacts = this._contactResolver.deserialize(json.param.contacts, this._contact, this._contact.resolveSibling);
        const contactEdges = this._contactEdgeResolver.deserialize(json.param.contactEdges, this._contactEdge, this._contactEdge.resolveSibling);
        for (const b of bodies) {
            b.resolveAfter();
        }
        for (const f of fixtures) {
            f.resolveAfter();
        }
        for (const n of nodes) {
            n.resolveAfter();
        }
        for (const c of contacts) {
            c.resolveAfter();
        }
        for (const ce of contactEdges) {
            ce.resolveAfter();
        }
        return {
            value: undefined,
        };
    }
}
