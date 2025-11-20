import { GameClientCreateImageAssetParameterObject } from "@akashic/headless-akashic";
import { EntitySerializer } from "../../src/serializerEntity";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { ImageAssetSerializer, imageAssetType } from "../../src/serializerImageAsset";
import { FrameSpriteSerializer, frameSpriteType } from "../../src/serializerFrameSprite";
import { toExpectedEntity } from "./utils";

describe("FrameSpriteSerializer", () => {
    let serializer: FrameSpriteSerializer;
    let imageAssetParam: GameClientCreateImageAssetParameterObject;
    let imageAsset: g.ImageAsset;
    let imageFrameSpriteParam: g.FrameSpriteParameterObject;
    let imageFrameSprite: g.FrameSprite;
    let surface: g.Surface;
    let surfaceFrameSpriteParam: g.FrameSpriteParameterObject;
    let surfaceFrameSprite: g.FrameSprite;

    beforeEach(() => {
        imageAssetParam = {
            id: "dummy",
            width: 100,
            height: 200,
            path: "/dummyPath",
        };
        imageAsset = client.createDummyImageAsset(imageAssetParam);
        imageFrameSpriteParam = {
            scene,
            src: imageAsset,
            width: 100,
            height: 200,
        };
        imageFrameSprite = new g.FrameSprite(imageFrameSpriteParam);
        surface = g.game.resourceFactory.createSurface(300, 400);
        surfaceFrameSpriteParam = {
            scene,
            src: surface,
            width: 100,
            height: 200,
        };
        surfaceFrameSprite = new g.FrameSprite(surfaceFrameSpriteParam);
        const entitySerializerSet = new Set<EntitySerializer>();
        serializer = new FrameSpriteSerializer({
            scene: targetScene,
            plainMatrixSerializer: new PlainMatrixSerializer(),
            imageAssetSerializer: new ImageAssetSerializer({
                scene: targetScene,
            }),
            entitySerializerSet,
            surfaceDeserializer: () => surface,
        });
        entitySerializerSet.add(serializer);
        targetScene._sceneAssetHolder._assetManager._assets[imageAssetParam.id!] = imageAsset;
    });

    it("set matched param", () => {
        const json = serializer.serialize(imageFrameSprite);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize g.FrameSprite (src = g.ImageAsset)", () => {
        const json = serializer.serialize(imageFrameSprite);
        expect(json.type).toBe(frameSpriteType);
        expect(json.param).toMatchObject({
            interval: imageFrameSprite.interval,
            frameNumber: imageFrameSprite.frameNumber,
            frames: imageFrameSprite.frames,
            loop: imageFrameSprite.loop,
            src: {
                type: imageAssetType,
                param: {
                    id: imageAssetParam.id,
                },
            },
        });
    });

    it("can deserialize g.FrameSprite (src = g.ImageAsset)", () => {
        const json = serializer.serialize(imageFrameSprite);
        const object = serializer.deserialize(json);
        expect(object).toEqual(toExpectedEntity(imageFrameSprite, object));
    });

    it("can serialize g.FrameSprite (src = g.Surface)", () => {
        const json = serializer.serialize(surfaceFrameSprite);
        expect(json.param).toMatchObject({
            interval: imageFrameSprite.interval,
            frameNumber: imageFrameSprite.frameNumber,
            frames: imageFrameSprite.frames,
            loop: imageFrameSprite.loop,
            src: undefined,
        });
    });

    it("can deserialize g.FrameSprite (src = g.Surface)", () => {
        const json = serializer.serialize(surfaceFrameSprite);
        const object = serializer.deserialize(json);
        expect(object).toEqual(toExpectedEntity(surfaceFrameSprite, object));
    });
});
