import { Box2D, Box2DWeb, EBody } from "@akashic-extension/akashic-box2d";
import { EntityParam, EntitySerializer } from "./serializerEntity";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { BodyParam, BodySerializer } from "./serializerBody";
import { FixtureSerializer } from "./serializerFixture";
import { SweepParam, SweepSerializer } from "./serializerSweep";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";
import { TransformParam, TransformSerializer } from "./serializerTransform";
import { ObjectMapper, RefParam } from "./objectMapper";

/**
 * {@link EBody} オブジェクト型の識別子。
 */
export const ebodyType = "EBody";

/**
 * {@link EBody} オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface EBodyParam {
    b2body: {
        def: ObjectDef<BodyParam>;
        sweep: ObjectDef<SweepParam>;
        force: ObjectDef<Vec2Param>;
        torque: number;
        m_xf: ObjectDef<TransformParam>;
    };
    entity: ObjectDef<EntityParam>;
    id: string;
}

export interface EBodySerializerParameterObject {
    box2d: Box2D;
    bodySerializer: BodySerializer;
    entitySerializers: EntitySerializer[];
    fixtureSerializer: FixtureSerializer;
    sweepSerializer: SweepSerializer;
    vec2Serializer: Vec2Serializer;
    transformSerializer: TransformSerializer;
    fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
    fixtureDefMapper: ObjectMapper<Box2DWeb.Dynamics.b2FixtureDef>;
}

/**
 * {@link EBody} オブジェクトを直列化・復元可能にします
 */
export class EBodySerializer implements ObjectSerializer<EBody, EBodyParam> {
    readonly _box2d: Box2D;
    readonly _bodySerializer: BodySerializer;
    readonly _fixtureSerializer: FixtureSerializer;
    readonly _sweepSerializer: SweepSerializer;
    readonly _vec2Serializer: Vec2Serializer;
    readonly _transformSerializer: TransformSerializer;
    readonly _entitySerializers: EntitySerializer[];
    readonly _fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
    readonly _fixtureDefMapper: ObjectMapper<Box2DWeb.Dynamics.b2FixtureDef>;

    constructor(param: EBodySerializerParameterObject) {
        this._box2d = param.box2d;
        this._bodySerializer = param.bodySerializer;
        this._fixtureSerializer = param.fixtureSerializer;
        this._sweepSerializer = param.sweepSerializer;
        this._vec2Serializer = param.vec2Serializer;
        this._transformSerializer = param.transformSerializer;
        this._entitySerializers = param.entitySerializers;
        this._fixtureMapper = param.fixtureMapper;
        this._fixtureDefMapper = param.fixtureDefMapper;
    }

    filter(objectType: string): boolean {
        return objectType === ebodyType;
    }

    serialize(object: EBody): ObjectDef<EBodyParam> {
        return {
            type: ebodyType,
            param: {
                b2body: this._serializeBody(object.b2Body),
                id: object.id,
                entity: this._findEntitySerializer(object.entity.constructor.name).serialize(object.entity),
            },
        };
    }

    _serializeBody(object: EBody["b2Body"]): EBodyParam["b2body"] {
        return {
            def: this._bodySerializer.serialize(object),
            sweep: this._sweepSerializer.serialize(object.m_sweep),
            force: this._vec2Serializer.serialize(object.m_force),
            torque: object.m_torque,
            m_xf: this._transformSerializer.serialize(object.m_xf),
        };
    }

    deserialize(json: ObjectDef<EBodyParam>): EBody {
        const entity = this._findEntitySerializer(json.param.entity.type).deserialize(json.param.entity);
        const ebody = this._box2d.createBody(
            entity,
            this._bodySerializer.deserialize(json.param.b2body.def),
            json.param.b2body.def.param.fixtureList.map(ref => this._fixtureDefMapper.resolve(ref))
        );
        if (!ebody) {
            throw new Error(`Failed to create EBody. Please check entity (id = ${entity.id}, class name = ${entity.constructor.name}) is not registered to current scene.`);
        }
        this._deserializeBody(ebody.b2Body, json.param.b2body);
        this._referFixture(json.param.b2body.def.param.fixtureList, ebody.b2Body.GetFixtureList());
        return ebody;
    }

    _deserializeBody(b2body: EBody["b2Body"], json: Omit<EBodyParam["b2body"], "def">): void {
        b2body.m_sweep.Set(this._sweepSerializer.deserialize(json.sweep));
        b2body.m_force.SetV(this._vec2Serializer.deserialize(json.force));
        b2body.m_torque = json.torque;
        b2body.m_xf.Set(this._transformSerializer.deserialize(json.m_xf));
    }

    _referFixture(defList: ObjectDef<RefParam>[], fixtureList: Box2DWeb.Dynamics.b2Fixture) {
        let i = 0;
        let f = fixtureList;
        while (f) {
            this._fixtureMapper.referStrict(defList[defList.length - 1 - i].param.id, f);
            f = f.GetNext();
            i++;
        }
    }

    _findEntitySerializer(objectType: string): EntitySerializer {
        for (const entitySerializer of this._entitySerializers) {
            if (entitySerializer.filter(objectType)) {
                return entitySerializer;
            }
        }
        throw new Error(`Matched derived entity serializer was not found. (object type = ${objectType})`);
    }
}
