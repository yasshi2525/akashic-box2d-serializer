import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectMapper, RefParam } from "./objectMapper";
import { ObjectDef } from "./serializerObject";

/**
 * B2Contact オブジェクト型の識別子
 */
export const contactType = Box2DWeb.Dynamics.Contacts.b2Contact.name + "Ref";
export const circleContactType = Box2DWeb.Dynamics.Contacts.b2CircleContact.name + "Ref";
export const edgeAndCircleContactType = Box2DWeb.Dynamics.Contacts.b2EdgeAndCircleContact.name + "Ref";
export const nullContactType = Box2DWeb.Dynamics.Contacts.b2NullContact.name + "Ref";
export const polyAndCircleContactType = Box2DWeb.Dynamics.Contacts.b2PolyAndCircleContact.name + "Ref";
export const polyAndEdgeContactType = Box2DWeb.Dynamics.Contacts.b2PolyAndEdgeContact.name + "Ref";
export const polygonContactType = Box2DWeb.Dynamics.Contacts.b2PolygonContact.name + "Ref";

export const contactTypes = [
    circleContactType,
    edgeAndCircleContactType,
    nullContactType,
    polyAndCircleContactType,
    polyAndEdgeContactType,
    polygonContactType,
    contactType,
] as const;

export type ContactType = typeof contactTypes[number];

export class ContactObjectMapper {
    readonly _baseMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2Contact>;
    readonly _circleMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2CircleContact>;
    readonly _edgeAndCircleMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2EdgeAndCircleContact>;
    readonly _nullMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2NullContact>;
    readonly _polyAndCircleMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2PolyAndCircleContact>;
    readonly _polyAndEdgeMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2PolyAndEdgeContact>;
    readonly _polygonMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2PolygonContact>;
    readonly _mappers: Map<ContactType, ObjectMapper<Box2DWeb.Dynamics.Contacts.b2Contact>>;

    constructor() {
        this._baseMapper = new ObjectMapper({ refTypeName: contactType });
        this._circleMapper = new ObjectMapper({ refTypeName: circleContactType });
        this._edgeAndCircleMapper = new ObjectMapper({ refTypeName: edgeAndCircleContactType });
        this._nullMapper = new ObjectMapper({ refTypeName: nullContactType });
        this._polyAndCircleMapper = new ObjectMapper({ refTypeName: polyAndCircleContactType });
        this._polyAndEdgeMapper = new ObjectMapper({ refTypeName: polyAndEdgeContactType });
        this._polygonMapper = new ObjectMapper({ refTypeName: polygonContactType });
        this._mappers = new Map();
        this._mappers.set(this._baseMapper._refTypeName, this._baseMapper);
        this._mappers.set(this._circleMapper._refTypeName, this._circleMapper);
        this._mappers.set(this._edgeAndCircleMapper._refTypeName, this._edgeAndCircleMapper);
        this._mappers.set(this._nullMapper._refTypeName, this._nullMapper);
        this._mappers.set(this._polyAndCircleMapper._refTypeName, this._polyAndCircleMapper);
        this._mappers.set(this._polyAndEdgeMapper._refTypeName, this._polyAndEdgeMapper);
        this._mappers.set(this._polygonMapper._refTypeName, this._polygonMapper);
    }

    filter(objectType: string): boolean {
        return contactTypes.indexOf(objectType) !== -1;
    }

    resolveType(object: Box2DWeb.Dynamics.Contacts.b2Contact): ContactType {
        if (object instanceof Box2DWeb.Dynamics.Contacts.b2CircleContact) {
            return circleContactType;
        }
        if (object instanceof Box2DWeb.Dynamics.Contacts.b2EdgeAndCircleContact) {
            return edgeAndCircleContactType;
        }
        if (object instanceof Box2DWeb.Dynamics.Contacts.b2NullContact) {
            return nullContactType;
        }
        if (object instanceof Box2DWeb.Dynamics.Contacts.b2PolyAndCircleContact) {
            return polyAndCircleContactType;
        }
        if (object instanceof Box2DWeb.Dynamics.Contacts.b2PolyAndEdgeContact) {
            return polyAndEdgeContactType;
        }
        if (object instanceof Box2DWeb.Dynamics.Contacts.b2PolygonContact) {
            return polygonContactType;
        }
        if (object instanceof Box2DWeb.Dynamics.Contacts.b2Contact) {
            return contactType;
        }
        throw new Error(`unsupported contact class. (object = ${(object as Object)?.toString()})`);
    }

    refer(object: Box2DWeb.Dynamics.Contacts.b2Contact): ObjectDef<RefParam> {
        const type = this.resolveType(object);
        const mapper = this._mappers.get(type);
        if (!mapper) {
            throw new Error(`unsupported contact class. (classname = ${type})`);
        }
        return mapper.refer(object);
    }

    referStrict(id: number, object: Box2DWeb.Dynamics.Contacts.b2Contact): ObjectDef<RefParam> {
        const type = this.resolveType(object);
        const mapper = this._mappers.get(type);
        if (!mapper) {
            throw new Error(`unsupported contact class. (classname = ${type})`);
        }
        return mapper.referStrict(id, object);
    }

    resolve(ref: ObjectDef<RefParam>): Box2DWeb.Dynamics.Contacts.b2Contact {
        const mapper = this._mappers.get(ref.type);
        if (!mapper) {
            throw new Error(`unsupported contact class. (classname = ${ref.type})`);
        }
        return mapper.resolve(ref);
    }

    newInstance(ref: ObjectDef<RefParam>): Box2DWeb.Dynamics.Contacts.b2Contact {
        switch (ref.type) {
            case circleContactType:
                return new Box2DWeb.Dynamics.Contacts.b2CircleContact();
            case edgeAndCircleContactType:
                return new Box2DWeb.Dynamics.Contacts.b2EdgeAndCircleContact();
            case nullContactType:
                return new Box2DWeb.Dynamics.Contacts.b2NullContact();
            case polyAndCircleContactType:
                return new Box2DWeb.Dynamics.Contacts.b2PolyAndCircleContact();
            case polyAndEdgeContactType:
                return new Box2DWeb.Dynamics.Contacts.b2PolyAndEdgeContact();
            case polygonContactType:
                return new Box2DWeb.Dynamics.Contacts.b2PolygonContact();
            case contactType:
                return new Box2DWeb.Dynamics.Contacts.b2Contact();
            default:
                throw new Error(`unsupported contact class. (classname = ${ref.type})`);
        }
    }

    clear(): void {
        for (const mappers of this._mappers.values()) {
            mappers.clear();
        }
    }
}
