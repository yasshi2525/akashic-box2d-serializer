import { EBody } from "@akashic-extension/akashic-box2d";
import { Scannable } from "./scannable";
import { BodyScanner } from "./body";

export interface EBodyScannerParameterObject {
    body: BodyScanner;
}

export class EBodyScanner implements Scannable<EBody> {
    readonly _body: BodyScanner;

    constructor(param: EBodyScannerParameterObject) {
        this._body = param.body;
    }

    scan(object: EBody): void {
        this._body.scan(object.b2Body);
    }

    isScanned(object: EBody): boolean {
        return this._body.isScanned(object.b2Body);
    }
}
