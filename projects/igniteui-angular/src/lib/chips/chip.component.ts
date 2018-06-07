import {
    Component,
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    Inject,
    NgModule,
    Output,
    Provider,
    ViewChild,
    OnInit,
    AfterContentInit,
    AfterViewInit
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';

@Component({
    selector: 'igx-chip',
    templateUrl: 'chip.component.html',
    styles: [
        `:host {
            display: flex;
            align-items: center;
            position: relative;
            transition-property: top, left;
            touch-action: none;
        }
        `
    ]
})
export class IgxChipComponent {

    @Input()
    public id;

    @Input()
    public removable = true;

    @HostBinding('style.top.px')
    public top = 0;

    @HostBinding('style.left.px')
    public left = 0;

    @HostBinding('style.transitionDuration')
    public transitionTime = '0.5s';

    @Input()
    public set color(newColor) {
        this.chipArea.nativeElement.style.backgroundColor = newColor;
    }

    public get color() {
        return this.chipArea.nativeElement.style.backgroundColor;
    }

    @Output()
    public onChipDragOver = new EventEmitter<any>();

    @Output()
    public onMoveStart = new EventEmitter<any>();

    @Output()
    public onMoveEnd = new EventEmitter<any>();

    @Output()
    public onInteractionStart = new EventEmitter<any>();

    @Output()
    public onInteractionEnd = new EventEmitter<any>();

    @Output()
    public onRemove = new EventEmitter<any>();

    @ViewChild('chipArea', { read: ElementRef })
    public chipArea: ElementRef;

    public defaultTransitionTime = '0.5s';
    public areaMovingPerforming = false;

    public get isFirstChip() {
        return !this.elementRef.nativeElement.previousElementSibling;
    }

    public get isLastChip() {
        return !this.elementRef.nativeElement.nextElementSibling;
    }

    private bInteracting = false;
    private bInteracted = false;
    private bMoved = false;
    private oldMouseX = 0;
    private oldMouseY = 0;
    private initialOffsetX = 0;
    private initialOffsetY = 0;
    private outEventEmmited = false;

    constructor(public cdr: ChangeDetectorRef,
                private elementRef: ElementRef) {
    }

    
    public onChipDragStart(event) {
        this.areaMovingPerforming = true;
        this.onInteractionStart.emit();
        this.onMoveStart.emit();
    }
    public onChipDragEnd(event) {
        this.areaMovingPerforming = false;
        this.onInteractionEnd.emit({
            owner: this,
            moved: this.bMoved
        });
        this.onMoveEnd.emit();
    }
    
    public onChipRemove() {
        const eventData = {
            owner: this
        };
        this.onRemove.emit(eventData);
    }
    public onChipDragEnterHandler($event) {
        console.log("chip drag");
        const eventArgs = {
            targetChip: this,
            detail: $event.detail
        }
        this.onChipDragOver.emit(eventArgs)
    }
    public onChipDrop($event) {
        console.log("chip drop")
    }
}
