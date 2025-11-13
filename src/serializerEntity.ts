import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * g.E オブジェクト型の識別子
 */
export const entityType = g.E.constructor.name;

/**
 * 直列化したときの parent の値の型
 */
export type EntityParentParam = number | "scene" | undefined;

/**
 * g.E オブジェクトを復元可能な形式で直列化したJSONです。
 * scene は復元時の現在のシーンとするため、直列化しません。
 * parent は親エンティティのidとして直列化します。
 * children は子エンティティの parent から復元するため、直列化しません。
 * shaderProgram はデータ量が多いため直列化しません。
 * tag は直列化可能でなければなりません。
 */
export interface EntityParam extends Omit<Required<g.EParameterObject>, "scene" | "parent" | "children" | "shaderProgram" | "compositeOperation"> {
    compositeOperation: g.E["compositeOperation"];
    local: false;
    /**
     * 親エンティティのID。シーン直下の場合は "scene"、未所属の場合 `undefined`
     */
    parent: EntityParentParam;
}

export interface EntitySerializerParameterObject {
    /**
     * 復元時に設定する g.Scene
     */
    scene: g.Scene;
}

/**
 * g.E オブジェクトを直列化・復元可能にします
 */
export class EntitySerializer implements ObjectSerializer<g.E, EntityParam> {
    readonly _scene: g.Scene;

    constructor(param: EntitySerializerParameterObject) {
        this._scene = param.scene;
    }

    filter(objectType: string): boolean {
        return objectType === entityType;
    }

    /**
     * scene は復元時の現在のシーンとするため、直列化しません。
     * parent は親エンティティのidとして直列化します。
     * children は子エンティティの parent から復元するため、直列化しません。
     * shaderProgram はデータ量が多いため直列化しません。
     * tag は直列化可能でなければなりません。
     * @inheritdoc
     */
    serialize(object: g.E): ObjectDef<EntityParam> {
        if (object.local) {
            throw new Error("g.E must not be \"local\".");
        }
        return {
            type: entityType,
            param: {
                anchorX: object.anchorX,
                anchorY: object.anchorY,
                angle: object.angle,
                compositeOperation: object.compositeOperation,
                height: object.height,
                hidden: !object.visible(),
                id: object.id,
                local: object.local,
                opacity: object.opacity,
                parent: this._serializeParent(object),
                scaleX: object.scaleX,
                scaleY: object.scaleY,
                tag: object.tag,
                touchable: object.touchable,
                width: object.width,
                x: object.x,
                y: object.y,
            },
        };
    }

    /**
     * scene はコンストラクタで指定したシーンに設定されます。
     * parent は id から解決します。
     * children は該当するエンティティの復元時に解決されます。
     * shaderProgram は復元されません。
     * @inheritdoc
     */
    deserialize(json: ObjectDef<EntityParam>): g.E {
        const entity = new g.E(this._deserializeParameterObject(json.param));
        return entity;
    }

    _serializeParent(object: g.E): EntityParentParam {
        if (object.parent instanceof g.Scene) {
            return "scene";
        }
        else {
            return object.parent?.id;
        }
    }

    _deserializeParameterObject(param: EntityParam) {
        return {
            scene: this._scene,
            anchorX: param.anchorX,
            anchorY: param.anchorY,
            angle: param.angle,
            compositeOperation: param.compositeOperation,
            height: param.height,
            hidden: param.hidden,
            id: param.id,
            local: param.local,
            opacity: param.opacity,
            parent: this._deserializeParent(param.parent),
            scaleX: param.scaleX,
            scaleY: param.scaleY,
            tag: param.tag,
            touchable: param.touchable,
            width: param.width,
            x: param.x,
            y: param.y,
        };
    }

    _deserializeParent(parent: EntityParentParam): g.Scene | g.E | undefined {
        if (parent === "scene") {
            return this._scene;
        }
        else if (typeof parent === "number") {
            return this._findEntityByIdFromScene(this._scene, parent);
        }
        else {
            return undefined;
        }
    }

    _findEntityByIdFromScene(scene: g.Scene, targetID: number): g.E {
        for (const child of scene.children) {
            const found = this._findEntityById(child, targetID);
            if (found) {
                return found;
            }
        }
        throw new Error(`Entity id ${targetID} was not found in current scene.`);
    }

    _findEntityById(entity: g.E, targetID: number): g.E | undefined {
        if (entity.id === targetID) {
            return entity;
        }
        for (const child of entity.children ?? []) {
            const found = this._findEntityById(child, targetID);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
}
