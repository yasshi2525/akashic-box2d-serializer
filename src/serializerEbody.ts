import { Box2D, EBody } from "@akashic-extension/akashic-box2d";
import { EntityParam, EntitySerializer } from "./serializerEntity";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { BodyParam, BodySerializer } from "./serializerBody";
import { FixtureSerializer } from "./serializerFixture";

/**
 * {@link EBody} オブジェクト型の識別子。
 */
export const ebodyType = "EBody";

/**
 * {@link EBody} オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface EBodyParam {
    b2body: ObjectDef<BodyParam>;
    entity: ObjectDef<EntityParam>;
    id: string;
}

export interface EBodySerializerParameterObject {
    box2d: Box2D;
    bodySerializer: BodySerializer;
    entitySerializerSet: Set<EntitySerializer>;
    fixtureSerializer: FixtureSerializer;
}

/**
 * {@link EBody} オブジェクトを直列化・復元可能にします
 */
export class EBodySerializer implements ObjectSerializer<EBody, EBodyParam> {
    readonly _box2d: Box2D;
    readonly _bodySerializer: BodySerializer;
    readonly _fixtureSerializer: FixtureSerializer;
    readonly _entitySerializerSet: Set<EntitySerializer>;

    constructor(param: EBodySerializerParameterObject) {
        this._box2d = param.box2d;
        this._bodySerializer = param.bodySerializer;
        this._fixtureSerializer = param.fixtureSerializer;
        this._entitySerializerSet = param.entitySerializerSet;
    }

    filter(objectType: string): boolean {
        return objectType === ebodyType;
    }

    serialize(object: EBody): ObjectDef<EBodyParam> {
        return {
            type: ebodyType,
            param: {
                b2body: this._bodySerializer.serialize(object.b2Body),
                id: object.id,
                entity: this._findEntitySerializer(object.entity.constructor.name).serialize(object.entity),
            },
        };
    }

    deserialize(json: ObjectDef<EBodyParam>): EBody {
        const entity = this._findEntitySerializer(json.param.entity.type).deserialize(json.param.entity);
        const ebody = this._box2d.createBody(
            entity,
            this._bodySerializer.deserialize(json.param.b2body),
            this._fixtureSerializer.deserialize(json.param.b2body.param.fixtureList)
        );
        if (!ebody) {
            throw new Error(`Failed to create EBody. Please check entity (id = ${entity.id}, class name = ${entity.constructor.name}) is not registered to current scene.`);
        }
        return ebody;
    }

    _findEntitySerializer(objectType: string): EntitySerializer {
        for (const entitySerializer of this._entitySerializerSet.values()) {
            if (entitySerializer.filter(objectType)) {
                return entitySerializer;
            }
        }
        throw new Error(`Matched derived entity serializer was not found. (object type = ${objectType})`);
    }
}
