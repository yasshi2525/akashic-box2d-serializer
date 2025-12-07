import { entityType } from "../../src/serialize/entityType";
import { EntitySerializer } from "../../src/serializerEntity";
import { PlainMatrixSerializer } from "../../src/serializerMatrixPlain";
import { createDefaultEntityParam, extractSerializedEntityParam } from "./utils";

describe("EntitySerializer", () => {
    let entitySerializers: EntitySerializer[];
    let serializer: EntitySerializer;

    beforeEach(() => {
        entitySerializers = [];
        serializer = new EntitySerializer({
            scene: targetScene,
            entitySerializers,
            plainMatrixSerializer: new PlainMatrixSerializer(),
        });
        entitySerializers.push(serializer);
    });

    const createDefaultEntity = () => {
        const param = createDefaultEntityParam(scene);
        return { param, entity: new g.E({ scene }) };
    };

    const createCustomEntity = () => {
        const parent = new g.E({ scene, parent: scene });
        const { param: grandChildParam, entity: grandChild } = createDefaultEntity();
        const { param: childParam, entity: child } = createDefaultEntity();
        child.append(grandChild);
        const param: g.EParameterObject = {
            scene,
            anchorX: 0.1,
            anchorY: 0.2,
            angle: 1,
            compositeOperation: "copy",
            children: [child],
            height: 100,
            hidden: true,
            local: false,
            opacity: 0.3,
            parent,
            scaleX: 0.4,
            scaleY: 0.5,
            shaderProgram: new g.ShaderProgram({}),
            tag: { foo: "bar" },
            touchable: true,
            width: 200,
            x: 3,
            y: 4,
        };
        const entity = new g.E(param);
        param.id = entity.id;
        return { param, entity, parent, childParam, child, grandChildParam, grandChild };
    };

    it("set matched param", () => {
        const { entity } = createDefaultEntity();
        const json = serializer.serialize(entity);
        expect(serializer.filter(json.type)).toBe(true);
    });

    it("can serialize default entity", () => {
        const { param, entity } = createDefaultEntity();
        const json = serializer.serialize(entity);
        expect(json.type).toBe(entityType);
        expect(json.param).toEqual({
            ...extractSerializedEntityParam(param, entity.id),
            _matrix: entity._matrix,
            state: entity.state,
        });
    });

    it("can serialize entity whose parent is scene", () => {
        const entity = new g.E({ scene, parent: scene });
        const json = serializer.serialize(entity);
        expect(json.param.parent).toBe("scene");
    });

    it("can serialize custom entity (whose parent is another entity)", () => {
        const { entity, param, parent, child, childParam, grandChild, grandChildParam } = createCustomEntity();
        const json = serializer.serialize(entity);
        expect(json.param.children).toHaveLength(1);
        const expected = {
            ...extractSerializedEntityParam(param, entity.id),
            _matrix: entity._matrix,
            state: entity.state,
            parent: parent.id,
            children: [{
                type: g.E.name,
                param: {
                    ...extractSerializedEntityParam(childParam, child.id),
                    _matrix: child._matrix,
                    state: child.state,
                    parent: entity.id,
                    children: [{
                        type: g.E.name,
                        param: {
                            ...extractSerializedEntityParam(grandChildParam, grandChild.id),
                            _matrix: grandChild._matrix,
                            state: grandChild.state,
                            parent: child.id,
                            children: undefined,
                        },
                    }],
                },
            }],
        };
        expect(json.param).toEqual(expected);
    });

    it("cannot serialize local entity", () => {
        const localEntity = new g.E({ scene, local: true });
        expect(() => serializer.serialize(localEntity)).toThrow();
    });

    it("can deserialize default entity", () => {
        const { entity } = createDefaultEntity();
        const json = serializer.serialize(entity);
        const object = serializer.deserialize(json);
        expect(object).toEqual({
            ...entity,
            scene: targetScene,
        });
    });

    it("can deserialize entity whose parent is scene", () => {
        const entity = new g.E({ scene, parent: scene });
        const json = serializer.serialize(entity);
        const object = serializer.deserialize(json);
        expect(object.parent).toBe(targetScene);
    });

    it("can deserialize custom entity (whose parent is another entity)", () => {
        const { entity, parent, child, grandChild } = createCustomEntity();
        const json = serializer.serialize(entity);
        const parentObject = new g.E({ scene: targetScene, id: parent.id, parent: targetScene });
        const object = serializer.deserialize(json);

        expect(object.children).toHaveLength(1);
        const childObject = object.children![0];
        expect(childObject.children).toHaveLength(1);
        const grandChildObject = childObject.children![0];
        expect(grandChildObject.children).toBe(undefined);

        const expectedObject = Object.assign({}, entity);
        const expectedChildObject = Object.assign({}, child);
        const expectedGrandChildObject = Object.assign({}, grandChild);

        // シリアライザ対象外
        expectedObject.shaderProgram = undefined;

        expectedObject.scene = targetScene;
        expectedChildObject.scene = targetScene;
        expectedGrandChildObject.scene = targetScene;

        expectedObject.parent = parentObject;
        expectedChildObject.parent = expectedObject;
        expectedGrandChildObject.parent = expectedChildObject;

        expectedObject.children = [expectedChildObject];
        expectedChildObject.children = [expectedGrandChildObject];

        expect(grandChildObject).toEqual(expectedGrandChildObject);
        expect(childObject).toEqual(expectedChildObject);
        expect(object).toEqual(expectedObject);
    });
});
