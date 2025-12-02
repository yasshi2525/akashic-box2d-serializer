import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { ObjectMapper, RefParam } from "./objectMapper";
import { ManifoldParam, ManifoldSerializer } from "./serializerManifold";
import { ContactObjectMapper } from "./objectMapperContact";

/**
 * B2Contact オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface ContactParam {
    self: ObjectDef<RefParam>;
    /**
     * ref b2ContactEdge
     */
    nodeA: ObjectDef<RefParam>;
    /**
     * ref b2ContactEdge
     */
    nodeB: ObjectDef<RefParam>;
    manifold: ObjectDef<ManifoldParam>;
    oldManifold: ObjectDef<ManifoldParam>;
    flags: number;
    /**
     * ref b2Fixture
     */
    fixtureA: ObjectDef<RefParam>;
    /**
     * ref b2Fixture
     */
    fixtureB: ObjectDef<RefParam>;
    /**
     * ref b2Contact
     */
    prev?: ObjectDef<RefParam>;
    /**
     * ref b2Contact
     */
    next?: ObjectDef<RefParam>;
}

export interface ContactSerializerParameterObject {
    manifoldSerialilzer: ManifoldSerializer;
    contactEdgeMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
    selfMapper: ContactObjectMapper;
}

/**
 * B2Contact オブジェクトを直列化・復元可能にします
 */
export class ContactSerializer implements ObjectSerializer<Box2DWeb.Dynamics.Contacts.b2Contact, ContactParam> {
    readonly _manifoldSerialilzer: ManifoldSerializer;
    readonly _contactEdgeMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    readonly _fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
    readonly _selfMapper: ContactObjectMapper;

    constructor(param: ContactSerializerParameterObject) {
        this._manifoldSerialilzer = param.manifoldSerialilzer;
        this._contactEdgeMapper = param.contactEdgeMapper;
        this._fixtureMapper = param.fixtureMapper;
        this._selfMapper = param.selfMapper;
    }

    filter(objectType: string): boolean {
        return this._selfMapper.filter(objectType);
    }

    serialize(object: Box2DWeb.Dynamics.Contacts.b2Contact): ObjectDef<ContactParam> {
        return {
            type: this._selfMapper.resolveType(object),
            param: {
                self: this._selfMapper.refer(object),
                nodeA: this._contactEdgeMapper.refer(object.m_nodeA),
                nodeB: this._contactEdgeMapper.refer(object.m_nodeB),
                manifold: this._manifoldSerialilzer.serialize(object.m_manifold),
                oldManifold: this._manifoldSerialilzer.serialize(object.m_oldManifold),
                flags: object.m_flags,
                fixtureA: this._fixtureMapper.refer(object.m_fixtureA),
                fixtureB: this._fixtureMapper.refer(object.m_fixtureB),
                prev: object.m_prev ? this._selfMapper.refer(object.m_prev) : undefined,
                next: object.m_next ? this._selfMapper.refer(object.m_next) : undefined,
            },
        };
    }

    /**
     * m_prev, m_next は インスタンス化後に解決します
     * @inheritdoc
     */
    deserialize(json: ObjectDef<ContactParam>): Box2DWeb.Dynamics.Contacts.b2Contact {
        const contact = this._selfMapper.newInstance(json.param.self);
        contact.m_nodeA = this._contactEdgeMapper.resolve(json.param.nodeA);
        contact.m_nodeB = this._contactEdgeMapper.resolve(json.param.nodeB);
        contact.m_manifold = this._manifoldSerialilzer.deserialize(json.param.manifold);
        contact.m_oldManifold = this._manifoldSerialilzer.deserialize(json.param.oldManifold);
        contact.m_flags = json.param.flags;
        contact.m_fixtureA = this._fixtureMapper.resolve(json.param.fixtureA);
        contact.m_fixtureB = this._fixtureMapper.resolve(json.param.fixtureB);
        return contact;
    }
}
