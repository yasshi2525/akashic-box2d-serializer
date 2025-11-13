import { ObjectDef, ObjectSerializer } from "./serializerObject";

export const imageAssetType = "ImageAsset";

/**
 * g.ImageAsset オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface ImageAssetParam {
    id: string;
}

export interface ImageAssetSerializerParameterObject {
    /**
     * 復元時に設定する g.Scene
     */
    scene: g.Scene;
}

/**
 * g.ImageAsset オブジェクトを直列化・復元可能にします
 */
export class ImageAssetSerializer implements ObjectSerializer<g.ImageAsset, ImageAssetParam> {
    readonly _scene: g.Scene;

    constructor(param: ImageAssetSerializerParameterObject) {
        this._scene = param.scene;
    }

    filter(objectType: string): boolean {
        return objectType === imageAssetType;
    }

    serialize(object: g.ImageAsset): ObjectDef<ImageAssetParam> {
        return {
            type: imageAssetType,
            param: {
                id: object.id,
            },
        };
    }

    /**
     * コンストラクタで指定したシーンを使ってアセットを復元します。
     * @inheritdoc
     */
    deserialize(json: ObjectDef<ImageAssetParam>): g.ImageAsset {
        const imageAsset = this._scene.asset.getImageById(json.param.id);
        return imageAsset;
    }
}
