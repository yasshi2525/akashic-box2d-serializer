/**
 * オブジェクトを直列化したJSON。
 */
export interface ObjectDef<T> {
    /**
     * オブジェクトの型識別子
     */
    type: string;
    /**
     * オブジェクトの属性情報。直列化可能でなければならない。
     */
    param: T;
}

export interface RefParam {
    id: number;
}

/**
 * 特定のオブジェクトをJSONに直列化したり、直列化したJSONから復元したりします。
 * @template O 直列化対象のオブジェクト型
 * @template J 直列化後の復元可能なJSON型
 * @template OO 復元後のオブジェクト型（デフォルトはO）
 */
export interface ObjectSerializer<O, J, OO = O> {
    /**
     * 直列化したJSON中に含まれるオブジェクト型識別子を参照し、対象の要素を復元するか指定します。
     * @param objectType オブジェクトの型識別子
     * @returns 対象の要素 ({@link ObjectDef}) をオブジェクトに復元するか
     */
    filter(objectType: string): boolean;
    /**
     * オブジェクトを直列化します。
     * @param object 直列化するオブジェクト
     * @returns 直列化したJSON
     */
    serialize(object: O): ObjectDef<J>;
    /**
     * オブジェクトを復元します。
     * @param json 直列化されたJSON
     * @returns 復元したオブジェクト
     */
    deserialize(json: ObjectDef<J>): OO;
}
