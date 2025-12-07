import { ObjectDef, RefParam } from "../serializerObject";
import { EntityParam } from "../serializerEntity";

export interface EBodyParam {
    /**
     * refer to b2Body
     */
    b2body: ObjectDef<RefParam>;
    entity: ObjectDef<EntityParam>;
    id: string;
}
