import { ObjectDef } from "../serializerObject";
import { FeaturesParam } from "./features";

export interface ContactIDParam {
    features: ObjectDef<FeaturesParam>;
    key?: number;
}
