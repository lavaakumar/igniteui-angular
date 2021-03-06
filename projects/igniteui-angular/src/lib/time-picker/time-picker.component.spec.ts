import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxTimePickerComponent, IgxTimePickerModule } from './time-picker.component';
import { HelperUtils } from '../test-utils/helper-utils.spec';

describe('IgxTimePicker', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTimePickerTestComponent,
                IgxTimePickerWithPassedTimeComponent,
                IgxTimePickerWithPmTimeComponent,
                IgxTimePickerWithMInMaxTimeValueComponent,
                IgxTimePickerWith24HTimeComponent,
                IgxTimePickerWithAMPMLeadingZerosTimeComponent,
                IgxTimePickerWithSpinLoopFalseValueComponent,
                IgxTimePickerWithItemsDeltaValueComponent
            ],
            imports: [IgxTimePickerModule, FormsModule, BrowserAnimationsModule]
        })
        .compileComponents();
    }));

    afterEach(() => {
        HelperUtils.clearOverlay();
    });

    it('Initialize a TimePicker component', () => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const domTimePicker = fixture.debugElement.query(By.css('igx-time-picker')).nativeElement;
        const result = '';

        expect(fixture.componentInstance).toBeDefined();
        expect(timePicker.displayTime).toEqual(result);
        expect(timePicker.id).toContain('igx-time-picker-');
        expect(domTimePicker.id).toContain('igx-time-picker-');

        timePicker.id = 'customTimePicker';
        fixture.detectChanges();

        expect(timePicker.id).toBe('customTimePicker');
        expect(domTimePicker.id).toBe('customTimePicker');
    });

    it('@Input properties', () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        expect(timePicker.value).toEqual(new Date(2017, 7, 7, 3, 24));
    });

    it('TimePicker DOM input value', () => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const currentTime = new Date(2017, 7, 7, 3, 24);
        const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()} ${currentTime.getHours() > 12 ? 'PM' : 'AM'}`;

        const dom = fixture.debugElement;

        const getValueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(getValueFromInput).toEqual(formattedTime);
    });

    it('Dialog header value', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        // get time-picker value
        const testElementTIme = fixture.componentInstance.dateValue;
        const formatedTestElementTime =
         `${testElementTIme.getHours()}:${testElementTIme.getMinutes()} ${testElementTIme.getHours() >= 12 ? 'PM' : 'AM'}`;

        openInput(fixture);

        // get time from dialog header
        const getTimeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
         `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${getTimeFromPopupHeader[0].innerText}`;

        expect(formatedTimeFromPopupHeader).toBe(formatedTestElementTime);
    }));

    it('Dialog selected element position', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        openInput(fixture);

        const expectedColumnElements = 7;
        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList')).nativeElement.children;
        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList')).nativeElement.children;
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList')).nativeElement.children;

        // check element count
        expect(getHourColumn.length).toBe(expectedColumnElements);
        expect(getMinuteColumn.length).toBe(expectedColumnElements);
        expect(getAMPMColumn.length).toBe(expectedColumnElements);

        // verify selected's position to be in the middle
        expect(getHourColumn[3].classList).toContain('igx-time-picker__item--selected');
        expect(getMinuteColumn[3].classList).toContain('igx-time-picker__item--selected');
        expect(getAMPMColumn[3].classList).toContain('igx-time-picker__item--selected');

    }));

    it('TimePicker open event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const target = dom.query(By.directive(IgxInputDirective));

        spyOn(timePicker.onOpen, 'emit');

        target.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        tick();

        expect(timePicker.onOpen.emit).toHaveBeenCalled();
    }));

    it('TimePicker Validation Failed event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithMInMaxTimeValueComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        openInput(fixture);

        selectTimeDifference(fixture, -3, -3);

        const getOkButton = dom.queryAll(By.css('.igx-button--flat'))[1];
        spyOn(timePicker.onValidationFailed, 'emit');
        getOkButton.triggerEventHandler('click', {});
        fixture.detectChanges();
        tick();

        expect(timePicker.onValidationFailed.emit).toHaveBeenCalled();
    }));

    it('TimePicker cancel button', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPmTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        openInput(fixture);

        selectTimeDifference(fixture, 2, -3, 'AM');

        const getCancelButton = dom.queryAll(By.css('.igx-button--flat'))[0];
        getCancelButton.triggerEventHandler('click', {});
        fixture.detectChanges();
        tick();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);
    }));

    it('TimePicker ValueChanged event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        openInput(fixture);

        const getHourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = getHourColumn.children[5];
        const hourValue = selectHour.nativeElement.innerText;

        const getMinutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
        const selectMinutes = getMinutesColumn.children[2];
        const minuteValue = selectMinutes.nativeElement.innerText;

        const getAMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = getAMPMColumn.children[4];
        const aMPMValue = selectAMPM.nativeElement.innerText;

        selectHour.triggerEventHandler('click', {});
        fixture.detectChanges();
        tick();
        selectMinutes.triggerEventHandler('click', {});
        fixture.detectChanges();
        tick();
        selectAMPM.triggerEventHandler('click', {});
        fixture.detectChanges();
        tick();

        const getOkButton = dom.queryAll(By.css('.igx-button--flat'))[1];
        spyOn(timePicker.onValueChanged, 'emit');
        getOkButton.triggerEventHandler('click', {});
        fixture.detectChanges();
        tick();

        expect(timePicker.onValueChanged.emit).toHaveBeenCalled();

        const getValueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        const selectedTime = `${hourValue}:${minuteValue} ${aMPMValue}`;

        expect(getValueFromInput).toEqual(selectedTime);
    }));

    it('TimePicker UP Down Keyboard navigation', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        getHourColumn.nativeElement.focus();
        // move arrows several times with hour column
        let args = { key: 'ArrowUp', bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        args = { key: 'ArrowDown', bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        args = { key: 'ArrowUp', bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        getMinuteColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        // move arrows several times with minute column
        args = { key: 'ArrowDown', bubbles: true };
        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        args = { key: 'ArrowUp', bubbles: true };
        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        args = { key: 'ArrowDown', bubbles: true };
        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        getAMPMColumn.nativeElement.focus();
        tick();

        // move arrows several times with ampm column
        args = { key: 'ArrowUp', bubbles: true };
        getAMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        args = { key: 'ArrowDown', bubbles: true };
        getAMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        // get time from dialog header
        const getTimeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
         `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${getTimeFromPopupHeader[0].innerText}`;

        args = { key: 'Enter', bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        const getValueFromInput = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        expect(formatedTimeFromPopupHeader).toBe(getValueFromInput);
    }));

    it('TimePicker Left Right Keyboard navigation', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const initialTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;

        let args = { key: 'ArrowRight', bubbles: true };
        openInput(fixture);

        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        getHourColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        args = { key: 'ArrowLeft', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        args = { key: 'ArrowRight', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        args = { key: 'ArrowUp', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('23');

        args = { key: 'ArrowRight', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        args = { key: 'ArrowDown', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        expect(document.activeElement.children[3].innerHTML.trim()).toBe('PM');

        args = { key: 'ArrowLeft', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        // get time from dialog header
        const getTimeFromPopupHeader: any = dom.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
        `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${getTimeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('3:23 PM');

        args = { key: 'Escape', bubbles: true };
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        const selectedTime = dom.query(By.directive(IgxInputDirective)).nativeElement.value;
        expect(initialTime).toEqual(selectedTime);
    }));

    it('TimePicker Mouse Over', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        openInput(fixture);

        // const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        getHourColumn.triggerEventHandler('focus', {});
        fixture.detectChanges();
        tick();

        getHourColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        tick();
        expect(document.activeElement.classList).toContain('igx-time-picker__hourList');

        getMinuteColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        tick();
        expect(document.activeElement.classList).toContain('igx-time-picker__minuteList');

        getAMPMColumn.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        tick();
        expect(document.activeElement.classList).toContain('igx-time-picker__ampmList');
    }));

    it('TimePicker Mouse Wheel', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        openInput(fixture);

        // const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        let event = new WheelEvent('wheel', {deltaX: 0, deltaY: 0});

        // focus hours
        getHourColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getHourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});
        getHourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();
        // move the mouse wheel up and expect the selected element to be 2
        expect(getHourColumn.nativeElement.children[3].innerText).toBe('2');

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        getHourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();
        // move the mouse wheel down and expect the selected element to be 3 again
        expect(getHourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        getMinuteColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});
        getMinuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();
        // move the mouse wheel up and expect the selected element to be 23
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe('23');

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        getMinuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();
        // move the mouse wheel down and expect the selected element to be 24 again
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus ampm
        getAMPMColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        getAMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();
        // move the mouse wheel down and expect the selected element to be PM
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});
        getAMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();
        // move the mouse wheel up and expect the selected element to be AM again
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker Pan Move', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithPassedTimeComponent);
        fixture.detectChanges();

        openInput(fixture);

        // const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;
        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        // panmove is in reverse direction of mouse wheel
        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: 0});
        const eventUp = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});
        const eventDown = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});

        // focus hours
        getHourColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getHourColumn.triggerEventHandler('panmove', event);
        fixture.detectChanges();
        tick();

        getHourColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();
        tick();
        // swipe up and expect the selected element to be 4
        expect(getHourColumn.nativeElement.children[3].innerText).toBe('4');

        getHourColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();
        tick();
        // swipe down and expect the selected element to be 3 again
        expect(getHourColumn.nativeElement.children[3].innerText).toBe('3');

        // focus minutes
        getMinuteColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getMinuteColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();
        tick();
        // swipe up and expect the selected element to be 25
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe('25');

        getMinuteColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();
        tick();
        // swipe down and expect the selected element to be 24 again
        expect(getMinuteColumn.nativeElement.children[3].innerText).toBe('24');

        // focus ampm
        getAMPMColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getAMPMColumn.triggerEventHandler('panmove', eventDown);
        fixture.detectChanges();
        tick();
        // swipe up and expect the selected element to be PM
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe('PM');

        getAMPMColumn.triggerEventHandler('panmove', eventUp);
        fixture.detectChanges();
        tick();
        // move the swipe up and expect the selected element to be AM again
        expect(getAMPMColumn.nativeElement.children[3].innerText).toBe('AM');
    }));

    it('TimePicker 24 hour format', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWith24HTimeComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;

        openInput(fixture);

        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        expect(getAMPMColumn.children.length).toBe(0);

        const getHourColumn = dom.query(By.css('.igx-time-picker__hourList'));
        const selectHour = getHourColumn.children[3];
        expect(selectHour.nativeElement.innerText).toBe('00');
    }));

    it('TimePicker Items in view', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithAMPMLeadingZerosTimeComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;

        openInput(fixture);

        const getHoursInview = timePicker.hoursInView();
        const getMinutessInview = timePicker.minutesInView();
        const getAMPMInview = timePicker.ampmInView();

        expect(getHoursInview).toEqual(['08', '09', '10', '11', '12', '01', '02']);
        expect(getMinutessInview).toEqual([ '24', '25', '26', '27', '28', '29', '30' ]);
        expect(getAMPMInview).toEqual([ 'AM', 'PM' ]);
    }));

    it('TimePicker scroll to end', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithSpinLoopFalseValueComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;
        const initialTime = fixture.componentInstance.dateValue;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        getHourColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        spyOn(console, 'error');

        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: -100});

        getHourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        getMinuteColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getMinuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        getAMPMColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getAMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        // check console for error
        expect(console.error).not.toHaveBeenCalled();

        const formatedHours = initialTime.getHours() < 10 ? '0' + initialTime.getHours() : initialTime.getHours();
        const formatedMinutes = initialTime.getMinutes() < 10 ? '0' + initialTime.getMinutes() : initialTime.getMinutes();

        const formatedTestElementTime =
           `${formatedHours}:${formatedMinutes} ${initialTime.getHours() >= 12 ? 'PM' : 'AM'}`;

        // get time from dialog header
        const getTimeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
        `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${getTimeFromPopupHeader[0].innerText}`;

        expect(formatedTestElementTime).toBe(formatedTimeFromPopupHeader);
    }));

    it('TimePicker check isSpinLoop with Items Delta', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerWithItemsDeltaValueComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;
        const timePicker = fixture.componentInstance.timePicker;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));
        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));

        const event = new WheelEvent('wheel', {deltaX: 0, deltaY: 100});

        // check scrolling each element
        getHourColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getHourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        getMinuteColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getMinuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        getAMPMColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getAMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        const getTimeFromPopupHeader: any = fixture.debugElement.query(By.css('.igx-time-picker__header')).nativeElement.children;
        const formatedTimeFromPopupHeader =
        `${getTimeFromPopupHeader[1].innerText.replace(/\n/g, '')} ${getTimeFromPopupHeader[0].innerText}`;
        expect(formatedTimeFromPopupHeader).toBe('12:58 PM');

        // check scrolling again up not to throw error
        spyOn(console, 'error');

        getHourColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        getMinuteColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getMinuteColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();

        getAMPMColumn.nativeElement.focus();
        fixture.detectChanges();
        tick();

        getAMPMColumn.triggerEventHandler('wheel', event);
        fixture.detectChanges();
        tick();
        expect(console.error).not.toHaveBeenCalled();
    }));

    it('TimePicker with not valid element arrow up', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const notValidHour = '700';
        timePicker.selectedHour = notValidHour;

        openInput(fixture);

        const getHourColumn: any = dom.query(By.css('.igx-time-picker__hourList'));

        const args = { key: 'ArrowUp', bubbles: true };
        getHourColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        expect(getHourColumn.nativeElement.children[3].innerText).not.toBe(notValidHour);
    }));

    it('TimePicker with not valid element arrow down', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();

        const timePicker = fixture.componentInstance.timePicker;
        const dom = fixture.debugElement;

        const notValidValue = '700';
        timePicker.selectedMinute = notValidValue;

        openInput(fixture);

        const getMinuteColumn: any = dom.query(By.css('.igx-time-picker__minuteList'));
        const getAMPMColumn: any = dom.query(By.css('.igx-time-picker__ampmList'));
        const args = { key: 'ArrowDown', bubbles: true };

        getMinuteColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        getAMPMColumn.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        fixture.detectChanges();
        tick();

        expect(getMinuteColumn.nativeElement.children[3].innerText).not.toBe(notValidValue);
    }));

    it('TimePicker vertical', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxTimePickerTestComponent);
        fixture.detectChanges();
        const dom = fixture.debugElement;

        const timePicker = fixture.componentInstance.timePicker;
        timePicker.vertical = true;

        openInput(fixture);

        expect(dom.query(By.css('.igx-time-picker--vertical'))).not.toBeNull();

        const dialog = dom.query(By.css('.igx-dialog__window')).nativeElement;

        expect(dialog.offsetWidth).toBeGreaterThan(dialog.offsetHeight);
    }));
});

@Component({
    template: `
        <igx-time-picker></igx-time-picker>
    `
})
export class IgxTimePickerTestComponent {
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPassedTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 3, 24);
    public customFormat = 'h:mm tt';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithPmTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 12, 27);
    public customFormat = 'h:mm tt';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithAMPMLeadingZerosTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 23, 27);
    public customFormat = 'hh:mm tt';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWith24HTimeComponent {
    public dateValue: Date = new Date(2017, 7, 7, 24, 27);
    public customFormat = 'HH:mm';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [minValue]="myMinValue" [maxValue]="myMaxValue"
         [value]="dateValue" [format]="'h:mm tt'"></igx-time-picker>
    `
})
export class IgxTimePickerWithMInMaxTimeValueComponent {
    public dateValue: Date = new Date(2017, 7, 7, 4, 27);
    public myMinValue = '3:24 AM';
    public myMaxValue = '5:24 AM';
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [isSpinLoop]=false
         [value]="dateValue" [format]="customFormat"></igx-time-picker>
    `
})
export class IgxTimePickerWithSpinLoopFalseValueComponent {
    public dateValue: Date = new Date(2017, 7, 7, 1, 0);
    public customFormat = 'hh:mm tt';
    public customitemsDelta: any = {hours: 2, minutes: 2};
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

@Component({
    template: `
        <igx-time-picker [isSpinLoop]=false
         [value]="dateValue" [format]="customFormat" [itemsDelta]="customitemsDelta"></igx-time-picker>
    `
})
export class IgxTimePickerWithItemsDeltaValueComponent {
    public dateValue: Date = new Date(2017, 7, 7, 10, 56);
    public customFormat = 'hh:mm tt';
    public customitemsDelta: any = {hours: 2, minutes: 2};
    @ViewChild(IgxTimePickerComponent) public timePicker: IgxTimePickerComponent;
}

// helper functions
function openInput(fixture) {
    const dom = fixture.debugElement;
    const timePickerTarget = dom.query(By.directive(IgxInputDirective));
    timePickerTarget.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    tick();
}

// the time difference should be plus or minus 3 hours or minutes
function selectTimeDifference(fixture, hour, minute, aMPM = null) {
    const dom = fixture.debugElement;
    const middlePos = 3;

    const getHourColumn = dom.query(By.css('.igx-time-picker__hourList'));
    const selectHour = getHourColumn.children[middlePos + hour];

    const getMinutesColumn = dom.query(By.css('.igx-time-picker__minuteList'));
    const selectMinutes = getMinutesColumn.children[middlePos + minute];

    selectHour.triggerEventHandler('click', {});
    fixture.detectChanges();
    tick();

    selectMinutes.triggerEventHandler('click', {});
    fixture.detectChanges();
    tick();

    if (aMPM && (aMPM.toUpperCase() === 'AM' || aMPM.toUpperCase() === 'PM')) {
        const getAMPMColumn = dom.query(By.css('.igx-time-picker__ampmList'));
        const selectAMPM = findByInnerText(getAMPMColumn.children, aMPM.toUpperCase());

        selectAMPM.triggerEventHandler('click', {});
        fixture.detectChanges();
        tick();
    }
}

function findByInnerText(collection, searchText) {
    for (const element of collection) {
        if (element.nativeElement.innerText === searchText) {
            return element;
        }
    }
}
