import { filledRectType } from "../../src/serialize/entityType";
import { EntitySerializer } from "../../src/serializerEntity";
import { FilledRectSerializer } from "../../src/serializerFilledRect";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { toExpectedEntity } from "./utils";

describe("FilledRectSerializer", () => {
    let serializer: FilledRectSerializer;
    let rect: g.FilledRect;

    beforeEach(() => {
        rect = new g.FilledRect({
            scene,
            width: 100,
            height: 100,
            cssColor: "blue",
        });
        const entitySerializers: EntitySerializer[] = [];
        serializer = new FilledRectSerializer({
            scene: targetScene,
            entitySerializers,
            plainMatrixSerializer: new PlainMatrixSerializer(),
        });
        entitySerializers.push(serializer);
    });

    it("set matched param", () => {
        const json = serializer.serialize(rect);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize g.FilledRect", () => {
        const json = serializer.serialize(rect);
        expect(json.type).toBe(filledRectType);
        expect(json.param).toMatchObject({
            cssColor: "blue",
        });
    });

    it("can deserialize g.FilledRect", () => {
        const json = serializer.serialize(rect);
        const object = serializer.deserialize(json);
        expect(object).toEqual(toExpectedEntity(rect, object));
    });
});
