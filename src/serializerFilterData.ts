import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * B2FilterData オブジェクト型の識別子。
 */
export const filterDataType = Box2DWeb.Dynamics.b2FilterData.name;

/**
 * B2FilterData オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface FilterDataParam extends Omit<Box2DWeb.Dynamics.b2FilterData, "Copy"> {

}

/**
 * B2FilterDataオブジェクトを直列化・復元可能にします
 */
export class FilterDataSerializer implements ObjectSerializer<Box2DWeb.Dynamics.b2FilterData, FilterDataParam> {
    filter(objectType: string): boolean {
        return objectType === filterDataType;
    }

    serialize(object: Box2DWeb.Dynamics.b2FilterData): ObjectDef<FilterDataParam> {
        return {
            type: filterDataType,
            param: {
                categoryBits: object.categoryBits,
                groupIndex: object.groupIndex,
                maskBits: object.maskBits,
            },
        };
    }

    deserialize(json: ObjectDef<FilterDataParam>): Box2DWeb.Dynamics.b2FilterData {
        const filterData = new Box2DWeb.Dynamics.b2FilterData();
        filterData.categoryBits = json.param.categoryBits;
        filterData.groupIndex = json.param.groupIndex;
        filterData.maskBits = json.param.maskBits;
        return filterData;
    }
}
