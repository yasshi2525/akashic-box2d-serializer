import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { ShapeParam, ShapeSerializer } from "./serializerShape";

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
    filter: {
        categoryBits: number;
        groupIndex: number;
        maskBits: number;
    };
    friction: number;
    isSensor: boolean;
    restitution: number;
    shape: ObjectDef<ShapeParam>;
    userData: any;
}

export interface FixtureSerializerObjectParam {
    shapeSerializer: ShapeSerializer;
}

/**
 * B2Fixtureオブジェクトを直列化し、B2FixtureDefオブジェクトに復元します。
 * 非対称な理由は、B2Body を作成するために {@link Box2D#createBody()} に B2FixtureDef を入力する必要があるためです。
 */
export class FixtureSerializer implements ObjectSerializer<Box2DWeb.Dynamics.b2Fixture, FixtureParam[], Box2DWeb.Dynamics.b2FixtureDef[]> {
    readonly shapeSerializer: ShapeSerializer;

    constructor(param: FixtureSerializerObjectParam) {
        this.shapeSerializer = param.shapeSerializer;
    }

    filter(objectType: string): boolean {
        return this.shapeSerializer.filter(objectType);
    }

    /**
     * userData は直列化可能でなければなりません。
     * @inheritdoc
     */
    serialize(object: Box2DWeb.Dynamics.b2Fixture): ObjectDef<FixtureParam[]> {
        const fixtureList: FixtureParam[] = [];
        for (let fixture = object; fixture; fixture = fixture.GetNext()) {
            fixtureList.push({
                density: object.GetDensity(),
                filter: {
                    categoryBits: object.GetFilterData().categoryBits,
                    groupIndex: object.GetFilterData().groupIndex,
                    maskBits: object.GetFilterData().maskBits,
                },
                friction: object.GetFriction(),
                isSensor: object.IsSensor(),
                restitution: object.GetRestitution(),
                shape: this.shapeSerializer.serialize(object.GetShape()),
                userData: object.GetUserData(),
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
            fixture.filter = new Box2DWeb.Dynamics.b2FilterData();
            fixture.filter.categoryBits = param.filter.categoryBits;
            fixture.filter.groupIndex = param.filter.groupIndex;
            fixture.filter.maskBits = param.filter.maskBits;
            fixture.friction = param.friction;
            fixture.isSensor = param.isSensor;
            fixture.restitution = param.restitution;
            fixture.shape = this.shapeSerializer.deserialize(param.shape);
            fixture.userData = param.userData;
            return fixture;
        });
    }
}
