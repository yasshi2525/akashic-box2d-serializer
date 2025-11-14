import { Box2D, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { ShapeParam, ShapeSerializer } from "./serializerShape";
import { FilterDataParam, FilterDataSerializer } from "./serializerFilterData";

/**
 * B2Fixure オブジェクト型の識別子。
 */
export const fixtureType = Box2DWeb.Dynamics.b2Fixture.name;

/**
 * B2Fixure オブジェクトを復元可能な形式で直列化したJSONです。
 * userData は直列化可能でなければなりません。
 */
export interface FixtureParam {
    density: number;
    filter: ObjectDef<FilterDataParam>;
    friction: number;
    isSensor: boolean;
    restitution: number;
    shape: ObjectDef<ShapeParam>;
    userData: any;
}

export interface FixtureSerializerObjectParam {
    filterDataSerializer: FilterDataSerializer;
    shapeSerializer: ShapeSerializer;
}

/**
 * B2Fixtureオブジェクトを直列化し、B2FixtureDefオブジェクトに復元します。
 * 非対称な理由は、B2Body を作成するために {@link Box2D#createBody()} に B2FixtureDef を入力する必要があるためです。
 */
export class FixtureSerializer implements ObjectSerializer<Box2DWeb.Dynamics.b2Fixture, FixtureParam[], Box2DWeb.Dynamics.b2FixtureDef[]> {
    readonly filterDataSerializer: FilterDataSerializer;
    readonly shapeSerializer: ShapeSerializer;

    constructor(param: FixtureSerializerObjectParam) {
        this.filterDataSerializer = param.filterDataSerializer;
        this.shapeSerializer = param.shapeSerializer;
    }

    filter(objectType: string): boolean {
        return objectType === fixtureType;
    }

    /**
     * userData は直列化可能でなければなりません。
     * @inheritdoc
     */
    serialize(object: Box2DWeb.Dynamics.b2Fixture): ObjectDef<FixtureParam[]> {
        const fixtureList: FixtureParam[] = [];
        for (let fixture = object; fixture; fixture = fixture.GetNext()) {
            fixtureList.push({
                density: fixture.GetDensity(),
                filter: this.filterDataSerializer.serialize(fixture.GetFilterData()),
                friction: fixture.GetFriction(),
                isSensor: fixture.IsSensor(),
                restitution: fixture.GetRestitution(),
                shape: this.shapeSerializer.serialize(fixture.GetShape()),
                userData: fixture.GetUserData(),
            });
        }
        return {
            type: fixtureType,
            param: fixtureList,
        };
    }

    deserialize(json: ObjectDef<FixtureParam[]>): Box2DWeb.Dynamics.b2FixtureDef[] {
        return json.param.map((param) => {
            const fixture = new Box2DWeb.Dynamics.b2FixtureDef();
            fixture.density = param.density;
            fixture.filter = this.filterDataSerializer.deserialize(param.filter);
            fixture.friction = param.friction;
            fixture.isSensor = param.isSensor;
            fixture.restitution = param.restitution;
            fixture.shape = this.shapeSerializer.deserialize(param.shape);
            fixture.userData = param.userData;
            return fixture;
        });
    }
}
