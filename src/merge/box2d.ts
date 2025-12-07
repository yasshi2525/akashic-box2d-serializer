import { Box2D } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { Box2DParam } from "../param/box2d";
import { ObjectResolver } from "../deserialize/resolver";
import { EBodyDeserializer } from "../deserialize/ebody";
import { BodyDeserializedPayload } from "../deserialize/body";
import { box2DType } from "../serialize/box2d";
import { ResolvingBaseMerger, ResolvingBaseMergerParameterObject, ResolvingMergedPayload } from "./mergable";
import { WorldMerger, WorldMergedPayload } from "./world";

export interface Box2DMergedPayload extends ResolvingMergedPayload {
}

export interface Box2DMergerParameterObject extends ResolvingBaseMergerParameterObject {
    world: WorldMerger;
    ebody: EBodyDeserializer;
    body: ObjectResolver<BodyDeserializedPayload>;
}

export class Box2DMerger extends ResolvingBaseMerger<Box2DParam, Box2D, Box2DMergedPayload> {
    readonly _world: WorldMerger;
    readonly _ebody: EBodyDeserializer;
    readonly _body: ObjectResolver<BodyDeserializedPayload>;

    constructor(param: Box2DMergerParameterObject) {
        super(box2DType, param);
        this._world = param.world;
        this._ebody = param.ebody;
        this._body = param.body;
    }

    merge(json: ObjectDef<Box2DParam>, box2d: Box2D): WorldMergedPayload {
        const { resolveAfter } = this._world.merge(json.param.world, box2d.world);
        const payloads = json.param.bodies.map(e => this._ebody.deserialize(e));
        for (const { value } of payloads) {
            box2d.bodies.push(value);
        }
        (box2d as any)._createBodyCount = json.param.createBodyCount;
        return {
            resolveAfter: () => {
                resolveAfter();
                for (const fn of payloads.map(p => p.resolveAfter)) {
                    fn();
                }
            },
        };
    }
}
