import { GameClientCreateImageAssetParameterObject } from "@akashic/headless-akashic";
import { EntitySerializer } from "../../src/serializerEntity";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { ImageAssetSerializer, imageAssetType } from "../../src/serializerImageAsset";
import { PaneSerializer } from "../../src/serializerPane";
import { paneType } from "../../src/serialize/entityType";

describe("PaneSerializer", () => {
    let serializer: PaneSerializer;
    let paneParam: g.PaneParameterObject;
    let pane: g.Pane;
    let imageAssetParam: GameClientCreateImageAssetParameterObject;
    let imageAsset: g.ImageAsset;
    let imagePaneParam: g.PaneParameterObject;
    let imagePane: g.Pane;
    let surface: g.Surface;
    let surfacePaneParam: g.PaneParameterObject;
    let surfacePane: g.Pane;

    beforeEach(() => {
        paneParam = {
            scene,
            width: 300,
            height: 400,
        };
        pane = new g.Pane(paneParam);
        imageAssetParam = {
            id: "dummy",
            width: 100,
            height: 200,
            path: "/dummyPath",
        };
        imageAsset = client.createDummyImageAsset(imageAssetParam);
        imagePaneParam = {
            scene,
            width: 300,
            height: 400,
            backgroundImage: imageAsset,
        };
        imagePane = new g.Pane(imagePaneParam);
        surface = g.game.resourceFactory.createSurface(300, 400);
        surfacePaneParam = {
            scene,
            width: 300,
            height: 400,
            backgroundImage: surface,
            tag: "surface",
        };
        surfacePane = new g.Pane(surfacePaneParam);
        const entitySerializers: EntitySerializer[] = [];
        serializer = new PaneSerializer({
            scene: targetScene,
            plainMatrixSerializer: new PlainMatrixSerializer(),
            imageAssetSerializer: new ImageAssetSerializer({
                scene: targetScene,
            }),
            entitySerializers,
            surfaceDeserializer: param => param.tag === surfacePaneParam.tag ? surface : undefined,
        });
        entitySerializers.push(serializer);
        targetScene._sceneAssetHolder._assetManager._assets[imageAssetParam.id!] = imageAsset;
    });

    it("set matched param", () => {
        const json = serializer.serialize(pane);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize g.Pane", () => {
        const json = serializer.serialize(pane);
        expect(json.param).toMatchObject({
            backgroundImage: undefined,
        });
    });

    it("can deserialize g.Pane", () => {
        const json = serializer.serialize(pane);
        const object = serializer.deserialize(json);
        expect(object).toMatchObject({
            backgroundImage: undefined,
        });
    });

    it("can serialize g.Pane (backgroundImage = g.ImageAsset)", () => {
        const json = serializer.serialize(imagePane);
        expect(json.type).toBe(paneType);
        expect(json.param).toMatchObject({
            backgroundImage: {
                type: imageAssetType,
                param: {
                    id: imageAssetParam.id,
                },
            },
        });
    });

    it("can deserialize g.Pane (backgroundImage = g.ImageAsset)", () => {
        const json = serializer.serialize(imagePane);
        const object = serializer.deserialize(json);
        expect(object).toMatchObject({
            backgroundImage: imageAsset,
        });
    });

    it("can serialize g.Pane (backgroundImage = g.Surface)", () => {
        const json = serializer.serialize(surfacePane);
        expect(json.param).toMatchObject({
            backgroundImage: undefined,
        });
    });

    it("can deserialize g.Pane (backgroundImage = g.Surface)", () => {
        const json = serializer.serialize(surfacePane);
        const object = serializer.deserialize(json);
        expect(object).toMatchObject({
            backgroundImage: surface,
        });
    });
});
