import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { FilterDataParam } from "../param/filterData";
import { filterDataType } from "../serialize/filterData";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";

export interface FilterDeserializedDataPayload extends DeserializedPayload<Box2DWeb.Dynamics.b2FilterData> {
}

export class FilterDataDeserializer extends BaseDeserializer<FilterDataParam, FilterDeserializedDataPayload> {
    constructor() {
        super(filterDataType);
    }

    deserialize(json: ObjectDef<FilterDataParam>): FilterDeserializedDataPayload {
        const filterData = new Box2DWeb.Dynamics.b2FilterData();
        filterData.categoryBits = json.param.categoryBits;
        filterData.groupIndex = json.param.groupIndex;
        filterData.maskBits = json.param.maskBits;
        return {
            value: filterData,
        };
    }
}
