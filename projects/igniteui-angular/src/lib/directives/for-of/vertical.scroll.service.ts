import { Injectable } from '@angular/core';

@Injectable()
export class IgxVerticallScrollService {
    private _state: boolean;
    private _width: number;

    public get needsVerticalScroll(): boolean {
        return this._state;
    }
    public set needsVerticalScroll(val: boolean) {
        this._state = val;
    }

    public get Width(): number {
        return this._width;
    }
    public set Width(val: number) {
        this._width = val;
    }
}
