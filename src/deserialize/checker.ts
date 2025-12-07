export interface ResolvedResult {
    dependency?: boolean;
    sibling?: boolean;
    peerDependency?: boolean;
}

export class UnresolverChecker {
    _store: Map<any, ResolvedResult>;

    constructor() {
        this._store = new Map();
    }

    add(object: any, initial: ResolvedResult): void {
        if (this._store.has(object)) {
            throw new Error(`${object} was already stored.`);
        }
        this._store.set(object, initial);
    }

    resolve(object: any, diff: ResolvedResult): void {
        if (!this._store.has(object)) {
            throw new Error(`${object} was not stored.`);
        }
        const result = this._store.get(object)!;
        for (const key of Object.keys(diff) as (keyof ResolvedResult)[]) {
            if (!(key in result) || result[key] === undefined) {
                throw new Error(`${key} was not listed up in resolving requirement.`);
            }
            result[key] = diff[key];
        }
    }

    validate(): void {
        for (const [object, result] of this._store) {
            for (const key of Object.keys(result) as (keyof ResolvedResult)[]) {
                if (result[key] === false) {
                    throw new Error(`${object.toString()} (${object.constructor.name}) was not resolved. (key = ${key})`);
                }
            }
        }
    }

    clear(): void {
        this._store.clear();
    }
}
