import { PlainMatrixParam, PlainMatrixSerializer } from "./serializerMatrixPlain";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * g.E オブジェクト型の識別子
 */
export const entityType = g.E.name;

/**
 * 直列化したときの parent の値の型
 */
export type EntityParentParam = number | "scene" | undefined;

/**
 * g.E オブジェクトを復元可能な形式で直列化したJSONです。
 * scene は復元時の現在のシーンとするため、直列化しません。
 * parent は親エンティティのidとして直列化します。
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
    children?: ObjectDef<EntityParam>[];
    _matrix?: ObjectDef<PlainMatrixParam>;
    state: g.EntityStateFlags;
}

export interface EntitySerializerParameterObject {
    /**
     * 復元時に設定する g.Scene
     */
    scene: g.Scene;
    /**
     * 子エンティティを直列化・復元するためのシリアライザセット
     */
    entitySerializers: EntitySerializer[];
    plainMatrixSerializer: PlainMatrixSerializer;
}

/**
 * g.E オブジェクトを直列化・復元可能にします
 */
export class EntitySerializer implements ObjectSerializer<g.E, EntityParam> {
    readonly _scene: g.Scene;
    readonly _entitySerializers: EntitySerializer[];
    readonly _plainMatrixSerializer: PlainMatrixSerializer;

    constructor(param: EntitySerializerParameterObject) {
        this._scene = param.scene;
        this._entitySerializers = param.entitySerializers;
        this._plainMatrixSerializer = param.plainMatrixSerializer;
    }

    filter(objectType: string): boolean {
        return objectType === entityType;
    }

    /**
     * scene は復元時の現在のシーンとするため、直列化しません。
     * parent は親エンティティのidとして直列化します。
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
                children: this._serializeChildren(object.children),
                scaleX: object.scaleX,
                scaleY: object.scaleY,
                tag: object.tag,
                touchable: object.touchable,
                width: object.width,
                x: object.x,
                y: object.y,
                _matrix: object._matrix ? this._plainMatrixSerializer.serialize(object._matrix) : undefined,
                state: object.state,
            },
        };
    }

    /**
     * scene はコンストラクタで指定したシーンに設定されます。
     * parent は id から解決します。
     * shaderProgram は復元されません。
     * @inheritdoc
     */
    deserialize(json: ObjectDef<EntityParam>): g.E {
        const entity = new g.E(this._deserializeParameterObject(json.param));
        if (json.param._matrix) {
            entity._matrix = this._plainMatrixSerializer.deserialize(json.param._matrix);
        }
        entity.state = json.param.state;
        entity.children = this._deserializeChildren(json.param.children);
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

    _serializeChildren(children: g.E["children"]): undefined | ObjectDef<EntityParam>[] {
        if (children) {
            return children.map(c => this._findEntitySerializer(c.constructor.name).serialize(c));
        }
        return undefined;
    }

    /**
     * children は子エンティティのデシリアライズ時に解決されます。
     */
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

    _deserializeChildren(children: EntityParam["children"]): g.E["children"] {
        if (children) {
            return children.map(c => this._findEntitySerializer(c.type).deserialize(c));
        }
        return undefined;
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

    _findEntitySerializer(objectType: string): EntitySerializer {
        for (const entitySerializer of this._entitySerializers) {
            if (entitySerializer.filter(objectType)) {
                return entitySerializer;
            }
        }
        throw new Error(`Matched entity serializer was not found. (object type = ${objectType})`);
    }
}
