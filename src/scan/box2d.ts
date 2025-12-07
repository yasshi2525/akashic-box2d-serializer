import { Box2D } from "@akashic-extension/akashic-box2d";
import { SingleReferredScanner } from "./scannable";
import { EBodyScanner } from "./ebody";
import { WorldScanner } from "./world";

export interface Box2DScannerParameterObject {
    world: WorldScanner;
    ebody: EBodyScanner;
}

export class Box2DScanner extends SingleReferredScanner <Box2D> {
    readonly _world: WorldScanner;
    readonly _ebody: EBodyScanner;

    constructor(param: Box2DScannerParameterObject) {
        super();
        this._world = param.world;
        this._ebody = param.ebody;
    }

    scan(object: Box2D): void {
        this._world.scan(object.world);
        for (const ebody of object.bodies) {
            this._ebody.scan(ebody);
        }
    }
}
