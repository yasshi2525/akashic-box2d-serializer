export interface Scannable<O> {
    scan(object: O): void;
    isScanned(object: O): boolean;
}

export interface SimpleStore<O> {
    add(object: O): void;
    has(object: O): boolean;
}

export interface BaseScannerParameterObject<O> {
    self: SimpleStore<O>;
}

export abstract class BaseScanner<O> implements Scannable<O> {
    readonly _self: SimpleStore<O>;

    protected constructor(param: BaseScannerParameterObject<O>) {
        this._self = param.self;
        this.scan = new Proxy(this.scan, {
            apply: (target, thisArg, argArray: Parameters<BaseScanner<O>["scan"]>) => {
                if (this.isScanned(...argArray)) {
                    return;
                }
                target.bind(thisArg)(...argArray);
            },
        });
    }

    abstract scan(object: O): void;

    isScanned(object: O): boolean {
        return this._self.has(object);
    }
}

export abstract class SingleReferredScanner<O> implements Scannable<O> {
    _isScanned: boolean;

    protected constructor() {
        this._isScanned = false;
        this.scan = new Proxy(this.scan, {
            apply: (target, thisArg, argArray: Parameters<SingleReferredScanner<O>["scan"]>) => {
                if (this.isScanned()) {
                    throw new Error(`scanned singleton object by multiple times. (target = ${argArray[0]?.constructor.name})`);
                }
                target.bind(thisArg)(...argArray);
                this._isScanned = true;
            },
        });
    }

    abstract scan(object: O): void;

    isScanned(): boolean {
        return this._isScanned;
    }

    clear(): void {
        this._isScanned = false;
    }
}
