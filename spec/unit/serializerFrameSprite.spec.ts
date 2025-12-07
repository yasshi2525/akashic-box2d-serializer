import { GameClientCreateImageAssetParameterObject } from "@akashic/headless-akashic";
import { EntitySerializer } from "../../src/serializerEntity";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { ImageAssetSerializer, imageAssetType } from "../../src/serializerImageAsset";
import { FrameSpriteSerializer } from "../../src/serializerFrameSprite";
import { toExpectedEntity } from "./utils";
import { frameSpriteType } from "../../src/serialize/entityType";

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
        const entitySerializers: EntitySerializer[] = [];
        serializer = new FrameSpriteSerializer({
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

    it("keep stopped g.FrameSprite", async () => {
        const frameSprite = new g.FrameSprite({
            scene,
            src: imageAsset,
            frameNumber: 0,
            frames: [0, 1, 2],
            width: imageAsset.width / 3,
            height: imageAsset.height,
        });
        frameSprite.start();
        expect(frameSprite.frameNumber).toBe(0);
        await step();
        frameSprite.stop();
        expect(frameSprite.frameNumber).toBe(1);
        const json = serializer.serialize(frameSprite);
        const object = serializer.deserialize(json);
        expect(object.frameNumber).toBe(1);
        await step();
        expect(frameSprite.frameNumber).toBe(1);
        expect(object.frameNumber).toBe(1);
    });

    it("keep animatied g.FrameSprite", async () => {
        const frameSprite = new g.FrameSprite({
            scene,
            src: imageAsset,
            frameNumber: 0,
            frames: [0, 1, 2],
            width: imageAsset.width / 3,
            height: imageAsset.height,
        });
        frameSprite.start();
        expect(frameSprite.frameNumber).toBe(0);
        await step();
        expect(frameSprite.frameNumber).toBe(1);
        const json = serializer.serialize(frameSprite);
        const object = serializer.deserialize(json);
        expect(object.frameNumber).toBe(1);
        await step();
        expect(frameSprite.frameNumber).toBe(2);
        expect(object.frameNumber).toBe(2);
    });

    it("keep autostop g.FrameSprite", async () => {
        let expectedFinished = false;
        let actualFinished = false;
        const frameSprite = new g.FrameSprite({
            scene,
            src: imageAsset,
            frameNumber: 2,
            frames: [0, 1, 2],
            width: imageAsset.width / 3,
            height: imageAsset.height,
            loop: false,
        });
        frameSprite.onFinish.addOnce(() => {
            expectedFinished = true;
        });
        frameSprite.start();
        expect(frameSprite._timer).toBeTruthy();
        expect(frameSprite.frameNumber).toBe(2);
        expect(expectedFinished).toBe(false);
        const json = serializer.serialize(frameSprite);
        const object = serializer.deserialize(json);
        object.onFinish.addOnce(() => {
            actualFinished = true;
        });
        expect(object._timer).toBeTruthy();
        expect(object.frameNumber).toBe(2);
        expect(actualFinished).toBe(false);
        await step();
        expect(frameSprite.frameNumber).toBe(2);
        expect(object.frameNumber).toBe(2);
        expect(frameSprite._timer).toBeFalsy();
        expect(object._timer).toBeFalsy();
        expect(expectedFinished).toBe(true);
        expect(actualFinished).toBe(true);
    });

    it("keep stop autostopped g.FrameSprite", async () => {
        let expectedFinishedCount = 0;
        let actualFinishedCount = 0;
        const frameSprite = new g.FrameSprite({
            scene,
            src: imageAsset,
            frameNumber: 2,
            frames: [0, 1, 2],
            width: imageAsset.width / 3,
            height: imageAsset.height,
            loop: false,
        });
        frameSprite.onFinish.add(() => {
            expectedFinishedCount++;
        });
        frameSprite.start();
        expect(expectedFinishedCount).toBe(0);
        const json = serializer.serialize(frameSprite);
        const object = serializer.deserialize(json);
        object.onFinish.add(() => {
            actualFinishedCount++;
        });
        expect(actualFinishedCount).toBe(0);
        await step();
        expect(expectedFinishedCount).toBe(1);
        expect(actualFinishedCount).toBe(1);
        await step();
        expect(frameSprite.frameNumber).toBe(2);
        expect(object.frameNumber).toBe(2);
        expect(frameSprite._timer).toBeFalsy();
        expect(object._timer).toBeFalsy();
        expect(expectedFinishedCount).toBe(1);
        expect(actualFinishedCount).toBe(1);
    });
});
