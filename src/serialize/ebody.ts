import { Box2DWeb, EBody } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { EntitySerializer } from "../serializerEntity";
import { ObjectStore } from "../scan/store";
import { EBodyParam } from "../param/ebody";
import { Serializable } from "./serializable";
import { resolveEntityName } from "./entityType";

export const ebodyType = "EBody";

export interface EBodySerializerParameterObject {
    entities: EntitySerializer[];
    body: ObjectStore<Box2DWeb.Dynamics.b2Body>;
}

export class EBodySerializer implements Serializable<EBody, EBodyParam> {
    readonly _entities: EntitySerializer[];
    readonly _body: ObjectStore<Box2DWeb.Dynamics.b2Body>;

    constructor(param: EBodySerializerParameterObject) {
        this._entities = param.entities;
        this._body = param.body;
    }

    serialize(object: EBody): ObjectDef<EBodyParam> {
        return {
            type: ebodyType,
            param: {
                b2body: this._body.refer(object.b2Body),
                id: object.id,
                entity: this._resolveEntity(object.entity).serialize(object.entity),
            },
        };
    }

    _resolveEntity(object: g.E): EntitySerializer {
        const typeName = resolveEntityName(object);
        for (const entity of this._entities) {
            if (entity.filter(typeName)) {
                return entity;
            }
        }
        throw new Error(`Matched derived entity serializer was not found. (object type = ${typeName})`);
    }
}
