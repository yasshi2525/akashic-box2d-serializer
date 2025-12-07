import { EBody } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { EntitySerializer } from "../serializerEntity";
import { EBodyParam } from "../param/ebody";
import { ebodyType } from "../serialize/ebody";
import { ResolvingBaseDeserializer, ResolvingBaseDeserializerParameterObject, ResolvingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { BodyDeserializedPayload } from "./body";

export interface EBodyDeserializedPayload extends ResolvingDeserializedPayload<EBody> {
    resolveAfter: () => void;
}

export interface EBodyDeserializerParameterObject extends ResolvingBaseDeserializerParameterObject {
    entities: EntitySerializer[];
    body: ObjectResolver<BodyDeserializedPayload>;
}

export class EBodyDeserializer extends ResolvingBaseDeserializer<EBodyParam, EBodyDeserializedPayload> {
    readonly _entities: EntitySerializer[];
    readonly _body: ObjectResolver<BodyDeserializedPayload>;

    constructor(param: EBodyDeserializerParameterObject) {
        super(ebodyType, param);
        this._entities = param.entities;
        this._body = param.body;
    }

    deserialize(json: ObjectDef<EBodyParam>): EBodyDeserializedPayload {
        const ebody: EBody = {
            entity: this._resolveEntitySerializer(json.param.entity.type).deserialize(json.param.entity),
            b2Body: undefined as any,
            id: json.param.id,
        };
        return {
            value: ebody,
            resolveAfter: () => {
                ebody.b2Body = this._body.resolve(json.param.b2body);
            },
        };
    }

    _resolveEntitySerializer(objectType: string): EntitySerializer {
        for (const serializer of this._entities) {
            if (serializer.filter(objectType)) {
                return serializer;
            }
        }
        throw new Error(`Matched derived entity serializer was not found. (object type = ${objectType})`);
    }
}
