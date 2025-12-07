import { Box2D } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { Box2DParam } from "../param/box2d";
import { Serializable } from "./serializable";
import { EBodySerializer } from "./ebody";
import { WorldSerializer } from "./world";
import { ReferredStoreSerializer } from "./referred";

export const box2DType = Box2D.name;

export interface BaseBox2DSerializerParameterObject {
    world: WorldSerializer;
    ebody: EBodySerializer;
    referred: ReferredStoreSerializer;
}

export class BaseBox2DSerializer implements Serializable<Box2D, Box2DParam> {
    readonly _world: WorldSerializer;
    readonly _ebody: EBodySerializer;
    readonly _referred: ReferredStoreSerializer;

    constructor(param: BaseBox2DSerializerParameterObject) {
        this._world = param.world;
        this._ebody = param.ebody;
        this._referred = param.referred;
    }

    serialize(object: Box2D): ObjectDef<Box2DParam> {
        return {
            type: box2DType,
            param: {
                world: this._world.serialize(object.world),
                bodies: object.bodies.map(b => this._ebody.serialize(b)),
                createBodyCount: (object as any)._createBodyCount,
                pool: this._referred.serialize(),
            },
        };
    }
}
