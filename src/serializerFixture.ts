import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { ShapeParam, ShapeSerializer } from "./serializerShape";
import { FilterDataParam, FilterDataSerializer } from "./serializerFilterData";
import { ObjectMapper, RefParam } from "./objectMapper";

/**
 * B2Fixure オブジェクト型の識別子。
 */
export const fixtureType = Box2DWeb.Dynamics.b2Fixture.name;

/**
 * B2Fixure オブジェクトを復元可能な形式で直列化したJSONです。
 * userData は直列化可能でなければなりません。
 * m_proxy は直列化しません。復元時に対応するオブジェクトをマッピングします。
 */
export interface FixtureParam {
    /**
     * B2Fixture自体には識別子は存在しませんが、
     * ContactManager と B2Body から参照されるため、参照解決のために付与します。
     */
    self: ObjectDef<RefParam>;
    density: number;
    filter: ObjectDef<FilterDataParam>;
    friction: number;
    isSensor: boolean;
    restitution: number;
    shape: ObjectDef<ShapeParam>;
    userData: any;
}

/**
 * B2Fixure オブジェクトの識別情報（参照解決用）の識別子。
 */
export const fixtureRefType = Box2DWeb.Dynamics.b2Fixture.name + "Ref";

export interface FixtureSerializerParameterObject {
    filterDataSerializer: FilterDataSerializer;
    shapeSerializer: ShapeSerializer;
    selfMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
}

/**
 * B2Fixtureオブジェクトを直列化し、B2FixtureDefオブジェクトに復元します。
 * 非対称な理由は、B2Body を作成するために {@link Box2D#createBody()} に B2FixtureDef を入力する必要があるためです。
 */
export class FixtureSerializer implements ObjectSerializer<Box2DWeb.Dynamics.b2Fixture, FixtureParam, Box2DWeb.Dynamics.b2FixtureDef> {
    readonly filterDataSerializer: FilterDataSerializer;
    readonly shapeSerializer: ShapeSerializer;
    readonly selfMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;

    constructor(param: FixtureSerializerParameterObject) {
        this.filterDataSerializer = param.filterDataSerializer;
        this.shapeSerializer = param.shapeSerializer;
        this.selfMapper = param.selfMapper;
    }

    filter(objectType: string): boolean {
        return objectType === fixtureType;
    }

    /**
     * userData は直列化可能でなければなりません。
     * @inheritdoc
     */
    serialize(object: Box2DWeb.Dynamics.b2Fixture): ObjectDef<FixtureParam> {
        return {
            type: fixtureType,
            param: {
                self: this.selfMapper.refer(object),
                density: object.GetDensity(),
                filter: this.filterDataSerializer.serialize(object.GetFilterData()),
                friction: object.GetFriction(),
                isSensor: object.IsSensor(),
                restitution: object.GetRestitution(),
                shape: this.shapeSerializer.serialize(object.GetShape()),
                userData: object.GetUserData(),
            },
        };
    }

    deserialize(json: ObjectDef<FixtureParam>): Box2DWeb.Dynamics.b2FixtureDef {
        const fixture = new Box2DWeb.Dynamics.b2FixtureDef();
        fixture.density = json.param.density;
        fixture.filter = this.filterDataSerializer.deserialize(json.param.filter);
        fixture.friction = json.param.friction;
        fixture.isSensor = json.param.isSensor;
        fixture.restitution = json.param.restitution;
        fixture.shape = this.shapeSerializer.deserialize(json.param.shape);
        fixture.userData = json.param.userData;
        return fixture;
    }
}
