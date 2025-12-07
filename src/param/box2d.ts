import { ObjectDef } from "../serializerObject";
import { EBodyParam } from "./ebody";
import { WorldParam } from "./world";
import { ReferredStoreParam } from "./referred";

export interface Box2DParam {
    world: ObjectDef<WorldParam>;
    bodies: ObjectDef<EBodyParam>[];
    createBodyCount: number;
    pool: ObjectDef<ReferredStoreParam>;
}
