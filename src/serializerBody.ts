import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { FixtureParam, FixtureSerializer } from "./serializerFixture";

/**
 * B2Body オブジェクト型の識別子
 */
export const bodyType = Box2DWeb.Dynamics.b2Body.name;

/**
 * B2Body オブジェクトを復元可能な形式で直列化したJSONです。
 * angle, position は Entity の値が使われるため、B2Bodyの値は直列化しません。
 * userData は直列化可能でなければなりません。
 */
export interface BodyParam {
    active: boolean;
    allowSleep: boolean;
    angularDamping: number;
    angularVelocity: number;
    awake: boolean;
    bullet: boolean;
    fixedRotation: boolean;
    fixtureList: ObjectDef<FixtureParam[]>;
    inertiaScale: number;
    linearDamping: number;
    linearVelocity: { x: number; y: number };
    type: number;
    userData: any;
}

export interface BodySerializerParameterObject {
    fixtureSerializer: FixtureSerializer;
}

/**
 * B2Bodyオブジェクトを直列化し、B2BodyDefオブジェクトに復元します。
 * 非対称な理由は、B2Body を作成するために {@link Box2D#createBody()} に B2BodyDef を入力する必要があるためです。
 */
export class BodySerializer implements ObjectSerializer<Box2DWeb.Dynamics.b2Body, BodyParam, Box2DWeb.Dynamics.b2BodyDef> {
    readonly _fixtureSerializer: FixtureSerializer;

    constructor(param: BodySerializerParameterObject) {
        this._fixtureSerializer = param.fixtureSerializer;
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
                fixtureList: this._fixtureSerializer.serialize(object.GetFixtureList()),
                inertiaScale: object.GetDefinition().inertiaScale,
                linearDamping: object.GetLinearDamping(),
                linearVelocity: {
                    x: object.GetLinearVelocity().x,
                    y: object.GetLinearVelocity().y,
                },
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
        body.linearVelocity = new Box2DWeb.Common.Math.b2Vec2(
            json.param.linearVelocity.x,
            json.param.linearVelocity.y
        );
        body.type = json.param.type;
        body.userData = json.param.userData;
        return body;
    }
}
