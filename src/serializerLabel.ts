import { EntityParam, EntitySerializer, EntitySerializerParameterObject } from "./serializerEntity";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * g.Label オブジェクト型の識別子
 */
export const labelType = "Label";

/**
 * g.Label オブジェクトを復元可能な形式で直列化したJSONです。
 * font は直列化しません。
 */
export interface LabelParam extends EntityParam, Required<Omit<g.LabelParameterObject, keyof g.EParameterObject | "font" | "maxWidth" | "textColor">> {
    maxWidth: g.LabelParameterObject["maxWidth"];
    textColor: g.LabelParameterObject["textColor"];
}

/**
 * 直列化した g.Label のJSONから、対応する g.Font を作成する関数。
 * @param param 復元対象の g.Label オブジェクト情報
 * @returns font に設定される g.Font
 */
export type LabelFontDeserializer = (param: LabelParam) => g.Font;

export interface LabelSerializerParameterObject extends EntitySerializerParameterObject {
    /**
     * g.Label 定義に応じて対応する g.Font を返却する関数
     */
    fontDeserializer: LabelFontDeserializer;
}

/**
 * g.Label オブジェクトを直列化・復元可能にします
 */
export class LabelSerializer extends EntitySerializer implements ObjectSerializer<g.Label, LabelParam> {
    readonly _fontDeserializer: LabelFontDeserializer;

    constructor(param: LabelSerializerParameterObject) {
        super(param);
        this._fontDeserializer = param.fontDeserializer;
    }

    override filter(objectType: string): boolean {
        return objectType === labelType;
    }

    /**
     * font は直列化しません。
     * @inheritdoc
     */
    override serialize(object: g.Label): ObjectDef<LabelParam> {
        return {
            type: labelType,
            param: {
                ...super.serialize(object).param,
                fontSize: object.fontSize,
                maxWidth: object.maxWidth,
                text: object.text,
                textAlign: object.textAlign,
                textColor: object.textColor,
                widthAutoAdjust: object.widthAutoAdjust,
            },
        };
    }

    override deserialize(json: ObjectDef<LabelParam>): g.Label {
        const label = new g.Label(this._deserializeParameterObject(json.param));
        return label;
    }

    override _deserializeParameterObject(param: LabelParam) {
        return {
            ...super._deserializeParameterObject(param),
            font: this._fontDeserializer(param),
            fontSize: param.fontSize,
            maxWidth: param.maxWidth,
            text: param.text,
            textAlign: param.textAlign,
            textColor: param.textColor,
            widthAutoAdjust: param.widthAutoAdjust,
        };
    }
}
