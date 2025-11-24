import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";
import { ObjectMapper, RefParam } from "./objectMapper";

/**
 * B2Body オブジェクト型の識別子
 */
export const bodyType = Box2DWeb.Dynamics.b2Body.name;

/**
 * B2Body オブジェクトを復元可能な形式で直列化したJSONです。
 * angle, position は Entity の値が使われるため、B2Bodyの値は直列化しません。
 * userData は直列化可能でなければなりません。
 * fixtureList は復元時に対応するオブジェクトにマッピングします。
 */
export interface BodyParam {
    active: boolean;
    allowSleep: boolean;
    angularDamping: number;
    angularVelocity: number;
    awake: boolean;
    bullet: boolean;
    fixedRotation: boolean;
    fixtureList: ObjectDef<RefParam>[];
    inertiaScale: number;
    linearDamping: number;
    linearVelocity: ObjectDef<Vec2Param>;
    type: number;
    userData: any;
}

export interface BodySerializerParameterObject {
    vec2Serializer: Vec2Serializer;
    fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
}

/**
 * B2Bodyオブジェクトを直列化し、B2BodyDefオブジェクトに復元します。
 * 非対称な理由は、B2Body を作成するために {@link Box2D#createBody()} に B2BodyDef を入力する必要があるためです。
 */
export class BodySerializer implements ObjectSerializer<Box2DWeb.Dynamics.b2Body, BodyParam, Box2DWeb.Dynamics.b2BodyDef> {
    readonly _vec2Serializer: Vec2Serializer;
    readonly _fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;

    constructor(param: BodySerializerParameterObject) {
        this._vec2Serializer = param.vec2Serializer;
        this._fixtureMapper = param.fixtureMapper;
    }

    filter(objectType: string): boolean {
        return objectType === bodyType;
    }

    /**
     * angle, position は Entity の値が使われるため、直列化しません。
     * userData は直列化可能でなければなりません。
     * @inheritdoc
     */
    serialize(object: Box2DWeb.Dynamics.b2Body): ObjectDef<BodyParam> {
        const fixtureList: ObjectDef<RefParam>[] = [];
        for (let f = object.GetFixtureList(); f; f = f.GetNext()) {
            fixtureList.push(this._fixtureMapper.refer(f));
        }
        return {
            type: bodyType,
            param: {
                active: object.IsActive(),
                allowSleep: object.IsSleepingAllowed(),
                angularDamping: object.GetAngularDamping(),
                angularVelocity: object.GetAngularVelocity(),
                awake: object.IsAwake(),
                bullet: object.IsBullet(),
                fixedRotation: object.IsFixedRotation(),
                fixtureList,
                inertiaScale: object.GetDefinition().inertiaScale,
                linearDamping: object.GetLinearDamping(),
                linearVelocity: this._vec2Serializer.serialize(object.GetLinearVelocity()),
                type: object.GetType(),
                userData: object.GetUserData(),
            },
        };
    }

    /**
     * angle, position は Entity の値が使われるため、復元されません。
     * @inheritdoc
     */
    deserialize(json: ObjectDef<BodyParam>): Box2DWeb.Dynamics.b2BodyDef {
        const body = new Box2DWeb.Dynamics.b2BodyDef();
        body.active = json.param.active;
        body.allowSleep = json.param.allowSleep;
        body.angularDamping = json.param.angularDamping;
        body.angularVelocity = json.param.angularVelocity;
        body.awake = json.param.awake;
        body.bullet = json.param.bullet;
        body.fixedRotation = json.param.fixedRotation;
        body.inertiaScale = json.param.inertiaScale;
        body.linearDamping = json.param.linearDamping;
        body.linearVelocity = this._vec2Serializer.deserialize(json.param.linearVelocity);
        body.type = json.param.type;
        body.userData = json.param.userData;
        return body;
    }
}
