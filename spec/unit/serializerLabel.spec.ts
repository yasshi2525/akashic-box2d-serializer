import { EntitySerializer } from "../../src/serializerEntity";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { LabelSerializer, labelType } from "../../src/serializerLabel";
import { toExpectedEntity } from "./utils";

describe("LabelSerializer", () => {
    let serializer: LabelSerializer;
    let font: g.Font;
    let labelParam: g.LabelParameterObject;
    let label: g.Label;

    beforeEach(() => {
        font = new g.DynamicFont({
            fontFamily: "sans-serif",
            game: targetScene.game,
            size: 50,
            fontColor: "gray",
        });
        labelParam = {
            scene,
            font,
            text: "dummyText",
        };
        label = new g.Label(labelParam);
        const entitySerializerSet = new Set<EntitySerializer>();
        serializer = new LabelSerializer({
            scene: targetScene,
            plainMatrixSerializer: new PlainMatrixSerializer(),
            entitySerializerSet,
            fontDeserializer: () => font,
        });
        entitySerializerSet.add(serializer);
    });

    it("set matched param", () => {
        const json = serializer.serialize(label);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize g.Label", () => {
        const json = serializer.serialize(label);
        expect(json.type).toBe(labelType);
        expect(json.param).toMatchObject({
            fontSize: label.fontSize,
            maxWidth: label.maxWidth,
            textColor: label.textColor,
            text: label.text,
            textAlign: label.textAlign,
            widthAutoAdjust: label.widthAutoAdjust,
        });
    });

    it("can deserialize g.Label", () => {
        const json = serializer.serialize(label);
        const object = serializer.deserialize(json);
        expect(object).toEqual(toExpectedEntity(label, object));
    });
});
