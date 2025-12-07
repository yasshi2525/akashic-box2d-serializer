export const entityType = "E";
export const filledRectType = "FilledRect";
export const spriteType = "Sprite";
export const frameSpriteType = "FrameSprite";
export const labelType = "Label";
export const paneType = "Pane";

const nameToType: Map<string, string> = new Map();
nameToType.set(g.E.name, entityType);
nameToType.set(g.FilledRect.name, filledRectType);
nameToType.set(g.Sprite.name, spriteType);
nameToType.set(g.FrameSprite.name, frameSpriteType);
nameToType.set(g.Label.name, labelType);
nameToType.set(g.Pane.name, paneType);

/**
 * g.E 関係クラスは minify されてクラス名が環境によって変わる。
 */
export const resolveEntityName = (object: g.E): string => {
    if (nameToType.has(object.constructor.name)) {
        return nameToType.get(object.constructor.name)!;
    }
    return object.constructor.name;
};
