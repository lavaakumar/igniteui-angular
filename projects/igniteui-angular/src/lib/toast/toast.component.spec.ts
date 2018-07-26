import {Component, ViewChild} from '@angular/core';
import {async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {IgxToastComponent, IgxToastModule, IgxToastPosition} from './toast.component';

const oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe('IgxToast', () => {
    let fixture;
    beforeEach(async(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
        TestBed.configureTestingModule({
            declarations: [
                ToastInitializeTestComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxToastModule
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(ToastInitializeTestComponent);
            fixture.detectChanges();
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
    });
    it('should properly initialize properties', () => {
        fixture.componentInstance.toast.isVisible = true;
        fixture.detectChanges();
        const domToast = fixture.debugElement.query(By.css('igx-toast')).nativeElement;
        const element = fixture.debugElement.query(By.css('.igx-toast--bottom'));

        expect(fixture.componentInstance.toast.id).toContain('igx-toast-');
        expect(domToast.id).toContain('igx-toast-');
        expect(fixture.componentInstance.toast.message).toBeUndefined();
        expect(fixture.componentInstance.toast.displayTime).toBe(4000);
        expect(fixture.componentInstance.toast.autoHide).toBeTruthy();
        expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
        expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBeTruthy();

        fixture.componentInstance.toast.id = 'customToast';
        fixture.detectChanges();

        expect(fixture.componentInstance.toast.id).toBe('customToast');
        expect(domToast.id).toBe('customToast');
    });

    it('should change toast position to middle', () => {
        fixture.componentInstance.toast.position = IgxToastPosition.Middle;
        fixture.componentInstance.toast.isVisible = true;
        fixture.detectChanges();

        const element = fixture.debugElement.query(By.css('.igx-toast--middle'));
        expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_MIDDLE]).toBeTruthy();
    });

    it('should change toast position to top', () => {
        fixture.componentInstance.toast.position = IgxToastPosition.Top;
        fixture.componentInstance.toast.isVisible = true;
        fixture.detectChanges();
        const element = fixture.debugElement.query(By.css('.igx-toast--top'));

        expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_TOP]).toBeTruthy();
    });

    it('should change toast position something else should be undefined', () => {
        fixture.componentInstance.toast.position = IgxToastPosition.Bottom;
        fixture.componentInstance.toast.isVisible = true;
        fixture.detectChanges();

        const element = fixture.debugElement.query(By.css('.igx-toast--bottom'));

        expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_TOP] &&
            element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_MIDDLE] &&
            element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBeUndefined();

    });

    it('should auto hide 10 seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        fixture.componentInstance.toast.displayTime = displayTime;

        fixture.componentInstance.toast.show();

        expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
        expect(fixture.componentInstance.toast.autoHide).toBeTruthy();

        tick(displayTime);
        fixture.detectChanges();

        expect(fixture.componentInstance.toast.isVisible).toBeFalsy();
    }));

    it('should not auto hide seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        fixture.componentInstance.toast.displayTime = displayTime;
        fixture.componentInstance.toast.autoHide = false;

        fixture.componentInstance.toast.show();

        expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
        expect(fixture.componentInstance.toast.autoHide).toBeFalsy();

        tick(displayTime);
        fixture.detectChanges();
        expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
    }));
});
@Component({
    template: `<igx-toast #toast>
               </igx-toast>`
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent) public toast: IgxToastComponent;
}
