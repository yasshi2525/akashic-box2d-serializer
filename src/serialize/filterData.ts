import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { FilterDataParam } from "../param/filterData";
import { Serializable } from "./serializable";

export const filterDataType = Box2DWeb.Dynamics.b2FilterData.name;

export class FilterDataSerializer implements Serializable<Box2DWeb.Dynamics.b2FilterData, FilterDataParam> {
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
}
