import { EntityParam, EntitySerializer } from "./serializerEntity";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * g.FilledRect オブジェクト型の識別子
 */
export const filledRectType = "FilledRect";

/**
 * g.FilledRect オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface FilledRectParam extends EntityParam, Required<Omit<g.FilledRectParameterObject, keyof g.EParameterObject>> {
}

/**
 * g.FilledRect オブジェクトを直列化・復元可能にします
 */
export class FilledRectSerializer extends EntitySerializer implements ObjectSerializer<g.FilledRect, FilledRectParam> {
    override filter(objectType: string): boolean {
        return objectType === filledRectType;
    }

    override serialize(object: g.FilledRect): ObjectDef<FilledRectParam> {
        return {
            type: filledRectType,
            param: {
                ...super.serialize(object).param,
                cssColor: object.cssColor,
            },
        };
    }

    override deserialize(json: ObjectDef<FilledRectParam>): g.FilledRect {
        const rect = new g.FilledRect(this._deserializeParameterObject(json.param));
        return rect;
    }

    override _deserializeParameterObject(param: FilledRectParam) {
        return {
            ...super._deserializeParameterObject(param),
            cssColor: param.cssColor,
        };
    }
}
