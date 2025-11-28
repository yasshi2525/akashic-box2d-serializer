import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * PlainMatrix オブジェクト型の識別子。
 */
export const plainMatrixType = "PlainMatrix";

/**
 * PlainMatrix オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface PlainMatrixParam {
    _modified: boolean;
    _matrix: [number, number, number, number, number, number];
}

export class PlainMatrixSerializer implements ObjectSerializer<g.Matrix, PlainMatrixParam, g.PlainMatrix> {
    filter(objectType: string): boolean {
        return objectType === plainMatrixType;
    }

    serialize(object: g.Matrix): ObjectDef<PlainMatrixParam> {
        if (!(object instanceof g.PlainMatrix)) {
            throw new Error(`only g.PlainMatrix can be serialized. (class name = ${object.constructor.name})`);
        }
        return {
            type: plainMatrixType,
            param: {
                _modified: object._modified,
                _matrix: [...object._matrix],
            },
        };
    }

    deserialize(json: ObjectDef<PlainMatrixParam>): g.PlainMatrix {
        const plainMatrix = new g.PlainMatrix();
        plainMatrix._modified = json.param._modified;
        plainMatrix._matrix = [...json.param._matrix];
        return plainMatrix;
    }
}
