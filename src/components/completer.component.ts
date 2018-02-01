'use strict';
import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    ViewChild,
    forwardRef,
    AfterViewInit,
    ElementRef,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CtrCompleter } from '../directives/ctr-completer';
import { CompleterData } from '../services/completer-data';
import { CompleterDataService } from '../services/completer-data.service';
import { CompleterItem } from './completer-item';
import { MAX_CHARS, MIN_SEARCH_LENGTH, PAUSE, TEXT_SEARCHING, TEXT_NO_RESULTS, isNil, noop } from '../globals';

import 'rxjs/add/operator/catch';

const COMPLETER_CONTROL_VALUE_ACCESSOR = {
    multi: true,
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CompleterComponent),
};

@Component({
    encapsulation: ViewEncapsulation.None,
    providers: [COMPLETER_CONTROL_VALUE_ACCESSOR],
    selector: 'ctr-completer',
    styles: [`
    .ctr-autocomplete {
        border-color: #ececec;
        border-width: 1px;
        border-style: solid;
        border-radius: 2px;
        padding: 6px;
        cursor: pointer;
        background-color: #ffffff;
    }

    .completer-row {
        padding: 5px;
        color: #000000;
        margin-bottom: 4px;
        clear: both;
        display: inline-block;
        width: 103%;
    }

    .completer-selected-row {
        background-color: lightblue;
        color: #ffffff;
    }

    .completer-description {
        font-size: 14px;
    }

    .completer-image-default {
        width: 16px;
        height: 16px;
        background-image: url("demo/res/img/default.png");
    }

    .completer-image-holder {
        float: left;
        width: 10%;
    }
    .completer-item-text-image {
        float: right;
        width: 90%;
    }
    `],
    template: `
        <ctr-container>
            <input ctrInput/>
            <div class="ctr-autocomplete">
                <div>Cake</div>
                <div>Cake</div>
                <div>Cake</div>
                <div>Cake</div>
                <div>Cake</div>
            </div>
        </ctr-container>
    `
})
export class CompleterComponent implements OnInit, ControlValueAccessor, AfterViewChecked, AfterViewInit {
    @Input() public inputName = '';
    @Input() public inputId: string = '';
    @Input() public pause = PAUSE;
    @Input() public minSearchLength = MIN_SEARCH_LENGTH;
    @Input() public maxChars = MAX_CHARS;
    @Input() public overrideSuggested = false;
    @Input() public clearSelected = false;
    @Input() public clearUnselected = false;
    @Input() public fillHighlighted = true;
    @Input() public placeholder = '';
    @Input() public matchClass: string;
    @Input() public fieldTabindex: number;
    @Input() public autoMatch = false;
    @Input() public disableInput = false;
    @Input() public inputClass: string;
    @Input() public autofocus = false;
    @Input() public openOnFocus = false;
    @Input() public openOnClick = false;
    @Input() public selectOnClick = false;
    @Input() public selectOnFocus = false;
    @Input() public initialValue: any;
    @Input() public autoHighlight = false;

    @Output() public selected = new EventEmitter<CompleterItem>();
    @Output() public highlighted = new EventEmitter<CompleterItem>();
    @Output('blur') public blurEvent = new EventEmitter<void>();
    @Output() public click = new EventEmitter<void>();
    @Output('focus') public focusEvent = new EventEmitter<void>();
    @Output() public opened = new EventEmitter<boolean>();
    @Output() public keyup: EventEmitter<any> = new EventEmitter();
    @Output() public keydown: EventEmitter<any> = new EventEmitter();

    @ViewChild(CtrCompleter) public completer: CtrCompleter;
    @ViewChild('ctrInput') public ctrInput: ElementRef;

    public control = new FormControl('');
    public displaySearching = true;
    public displayNoResults = true;
    public _textNoResults = TEXT_NO_RESULTS;
    public _textSearching = TEXT_SEARCHING;

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;
    private _focus: boolean = false;
    private _open: boolean = false;
    private _searchStr = '';
    private dataService: CompleterData;

    constructor(private completerService: CompleterDataService, private cdr: ChangeDetectorRef) { }

    public get value(): any {
        return '';
        // return this.searchStr;
    }

    public set value(v: any) {
        // if (v !== this.searchStr) {
        //     this.searchStr = v;
        // }
        // // Propagate the change in any case
        // this._onChangeCallback(v);
    }

    // public get searchStr() {
    //     return this._searchStr;
    // }

    // public set searchStr(value: string) {
    //     if (typeof value === 'string' || isNil(value)) {
    //         this._searchStr = value;
    //     } else {
    //         this._searchStr = JSON.stringify(value);
    //     }
    // }

    public ngAfterViewInit() {
    //     if (this.autofocus) {
    //         this._focus = true;
    //     }
    }

    public ngAfterViewChecked(): void {
    //     if (this._focus) {
    //         setTimeout(
    //             () => {
    //                 this.ctrInput.nativeElement.focus();
    //                 this._focus = false;
    //             },
    //             0
    //         );
    //     }
    }

    public onTouched() {
        this._onTouchedCallback();
    }

    public writeValue(value: any) {
        // this.searchStr = value;
    }

    public registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disableInput = isDisabled;
    }

    @Input()
    public set datasource(source: CompleterData | string | any[]) {
        if (source) {
            if (source instanceof Array) {
                this.dataService = this.completerService.local(source);
            } else if (typeof (source) === 'string') {
                this.dataService = this.completerService.remote(source);
            } else {
                this.dataService = source as CompleterData;
            }
        }
    }

    @Input()
    public set textNoResults(text: string) {
        // if (this._textNoResults !== text) {
        //     this._textNoResults = text;
        //     this.displayNoResults = !!this._textNoResults && this._textNoResults !== 'false';
        // }
    }

    @Input()
    public set textSearching(text: string) {
        // if (this._textSearching !== text) {
        //     this._textSearching = text;
        //     this.displaySearching = !!this._textSearching && this._textSearching !== 'false';
        // }
    }

    public ngOnInit() {
    // this.completer.selected.subscribe((item: CompleterItem) => {
        // this.selected.emit(item);
    // });
    // this.completer.highlighted.subscribe((item: CompleterItem) => {
    //     this.highlighted.emit(item);
    // });
    // this.completer.opened.subscribe((isOpen: boolean) => {
    //     this._open = isOpen;
    //     this.opened.emit(isOpen);
    // });
    }

    // public onBlur() {
    //     this.blurEvent.emit();
    //     this.onTouched();
    //     this.cdr.detectChanges();
    // }

    // public onFocus() {
    //     this.focusEvent.emit();
    //     this.onTouched();
    // }

    // public onClick(event: any) {
    //     this.click.emit(event);
    //     this.onTouched();
    // }

    // public onKeyup(event: any) {
    //     this.keyup.emit(event);
    //     event.stopPropagation();
    // }

    // public onKeydown(event: any) {
    //     this.keydown.emit(event);
    //     event.stopPropagation();
    // }

    // public onChange(value: string) {
    //     this.value = value;
    // }

    // public open() {
    //     this.completer.open();
    // }

    // public close() {
    //     this.completer.clear();
    // }

    // public focus(): void {
    //     if (this.ctrInput) {
    //         this.ctrInput.nativeElement.focus();
    //     } else {
    //         this._focus = true;
    //     }
    // }

    // public blur(): void {
    //     if (this.ctrInput) {
    //         this.ctrInput.nativeElement.blur();
    //     } else {
    //         this._focus = false;
    //     }
    // }

    // public isOpen() {
    //     return this._open;
    // }
}