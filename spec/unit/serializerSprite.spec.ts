import { GameClientCreateImageAssetParameterObject } from "@akashic/headless-akashic";
import { EntitySerializer } from "../../src/serializerEntity";
import { SpriteSerializer, spriteType } from "../../src/serializerSprite";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { ImageAssetSerializer, imageAssetType } from "../../src/serializerImageAsset";
import { toExpectedEntity } from "./utils";

describe("SpriteSerializer", () => {
    let serializer: SpriteSerializer;
    let imageAssetParam: GameClientCreateImageAssetParameterObject;
    let imageAsset: g.ImageAsset;
    let imageSpriteParam: g.SpriteParameterObject;
    let imageSprite: g.Sprite;
    let surface: g.Surface;
    let surfaceSpriteParam: g.SpriteParameterObject;
    let surfaceSprite: g.Sprite;

    beforeEach(() => {
        imageAssetParam = {
            id: "dummy",
            width: 100,
            height: 200,
            path: "/dummyPath",
        };
        imageAsset = client.createDummyImageAsset(imageAssetParam);
        imageSpriteParam = {
            scene,
            src: imageAsset,
        };
        imageSprite = new g.Sprite(imageSpriteParam);
        surface = g.game.resourceFactory.createSurface(300, 400);
        surfaceSpriteParam = {
            scene,
            src: surface,
        };
        surfaceSprite = new g.Sprite(surfaceSpriteParam);
        const entitySerializers: EntitySerializer[] = [];
        serializer = new SpriteSerializer({
            scene: targetScene,
            plainMatrixSerializer: new PlainMatrixSerializer(),
            imageAssetSerializer: new ImageAssetSerializer({
                scene: targetScene,
            }),
            entitySerializers,
            surfaceDeserializer: () => surface,
        });
        entitySerializers.push(serializer);
        targetScene._sceneAssetHolder._assetManager._assets[imageAssetParam.id!] = imageAsset;
    });

    it("set matched param", () => {
        const json = serializer.serialize(imageSprite);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize g.Sprite (src = g.ImageAsset)", () => {
        const json = serializer.serialize(imageSprite);
        expect(json.type).toBe(spriteType);
        expect(json.param).toMatchObject({
            width: imageAssetParam.width,
            height: imageAssetParam.height,
            srcWidth: imageAssetParam.width,
            srcHeight: imageAssetParam.height,
            src: {
                type: imageAssetType,
                param: {
                    id: imageAssetParam.id,
                },
            },
        });
    });

    it("can deserialize g.Sprite (src = g.ImageAsset)", () => {
        const json = serializer.serialize(imageSprite);
        const object = serializer.deserialize(json);
        expect(object).toEqual(toExpectedEntity(imageSprite, object));
    });

    it("can serialize g.Sprite (src = g.Surface)", () => {
        const json = serializer.serialize(surfaceSprite);
        expect(json.param).toMatchObject({
            width: surface.width,
            height: surface.height,
            srcWidth: surface.width,
            srcHeight: surface.height,
            src: undefined,
        });
    });

    it("can deserialize g.Sprite (src = g.Surface)", () => {
        const json = serializer.serialize(surfaceSprite);
        const object = serializer.deserialize(json);
        expect(object).toEqual(toExpectedEntity(surfaceSprite, object));
    });
});
