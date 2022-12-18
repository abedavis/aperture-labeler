import {AObject, ASerializable} from "./index";
import {Color} from "../math/Color";
import {AHandlesEvents} from "./aobject/AHandlesEvents";
import {v4 as uuidv4} from "uuid";
import {proxy} from "valtio/vanilla";
import {folder} from "leva";




type _GUIControlSpec={[name:string]:any};

export type AppStateValueChangeCallback =(v:any)=>void;

export interface GUIControlSpec extends _GUIControlSpec{
    value:any;
    onChange:AppStateValueChangeCallback;
}
var _appState:AAppState;



export function SetAppState(appState:AAppState):AAppState{
    if(_appState !== undefined){
        throw new Error(`Already set the app state to ${_appState}`);
    }
    _appState = appState;
    _appState.init();
    return _appState;
}

enum AppStateKeys{
    InteractionMode="InteractionMode",
    GUI_KEY="GUI_KEY",
    AmbientLight="ambient"
}

export enum AppStateEvents{
    TRIGGER_CONTROL_PANEL_UPDATE='TRIGGER_CONTROL_PANEL_UPDATE'
}

@ASerializable("AAppState")
export class AAppState extends AHandlesEvents{
    stateValues:{[name:string]:any};
    GUIControlSpecs:{[name:string]:GUIControlSpec}={};
    static AppStateEvents=AppStateEvents
    static AppStateDefaultKeys=AppStateKeys;

    init(){}

    /** Get set guiKey */
    set _guiKey(value){this.stateValues[AAppState.AppStateDefaultKeys.GUI_KEY]=value;}
    get _guiKey(){return this.stateValues[AAppState.AppStateDefaultKeys.GUI_KEY];}

    getState(key:string){
        return this.stateValues[key];
    }

    setState(name:string, value:any){
        this.stateValues[name]=value;
        this.signalEvent(AAppState.GetEventKeyForName(name), value);
    }

    constructor() {
        super();
        this.stateValues=proxy({});
        this.setState(AAppState.AppStateDefaultKeys.GUI_KEY, uuidv4());
        this.setState(AAppState.AppStateDefaultKeys.AmbientLight, 0.1);
    }

    updateControlPanel(){
        this.signalEvent(AAppState.AppStateEvents.TRIGGER_CONTROL_PANEL_UPDATE);
    }

    addControlPanelListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(AAppState.AppStateEvents.TRIGGER_CONTROL_PANEL_UPDATE, callback, handle);
    }


    _GetOnChangeForName(parameterName:string):AppStateValueChangeCallback{
        const self = this;
        return (v:any)=>{
            self.setState(parameterName, v);
        }

    }

    _MakeSliderSpec(name:string, initialValue:any, min?:number, max?:number, step?:number, otherSpecs?:{[name:string]:any}):GUIControlSpec{
        const self = this;
        let specs:GUIControlSpec = {
            value: initialValue,
            onChange: self._GetOnChangeForName(name),
            ...otherSpecs
        }
        if(min!==undefined){
            specs['min']=min;
        }
        if(max!==undefined){
            specs['max']=max;
        }
        if(step!==undefined){
            specs['step']=step;
        }
        return specs;
    }

    _MakeColorPickerSpec(name:string, initialValue:Color, otherSpecs?:{[name:string]:any}):GUIControlSpec{
        const self = this;
        let specs:GUIControlSpec = {
            value: initialValue.toHexString(),
            onChange: (v:string)=>{return self._GetOnChangeForName(name)(Color.FromString(v));},
            ...otherSpecs
        }
        return specs;
    }

    _MakeSelectionSpec(name:string, initialValue:any, options:any[], otherSpecs?:{[name:string]:any}):GUIControlSpec{
        const self = this;
        let specs:GUIControlSpec={
                value: initialValue,
                options: options,
                onChange: (v: any) => {
                self._GetOnChangeForName(name)(v);
            },
            ...otherSpecs
        }
        return specs;
    }


    static GetEventKeyForName(name:string):string{
        return `Parameter_${name}_update_event`;
    }

    setGUIControlSpecKey(name:string, spec:GUIControlSpec){
        this.GUIControlSpecs[name]= spec;
        this.updateControlPanel();
    }

    // setGUIControlSpecKeyGroup(name:string, spec:GUIControlSpec){
    //     this.GUIControlSpecs[name]= folder();
    //     this.updateControlPanel();
    // }

    addSliderControl(name:string, initialValue:any, min?:number, max?:number, step?:number){
        this.setGUIControlSpecKey(name, this._MakeSliderSpec(name, initialValue, min, max, step))
    }

    addColorControl(name:string, initialValue:Color){
        this.setGUIControlSpecKey(name,this._MakeColorPickerSpec(name, initialValue));
    }

    setSelectionControl(name:string, initialValue:any, options:any[], otherSpecs?:{[name:string]:any}){
        this.setGUIControlSpecKey(name,this._MakeSelectionSpec(name, initialValue, options, otherSpecs));
    }


    addStateValueListener(
        stateName: string,
        callback: AppStateValueChangeCallback,
        handle?: string
    ) {
        return this.addEventListener(
            AAppState.GetEventKeyForName(stateName),
            callback,
            handle,
            );
    }

    addControlSpec(controlSpec:{[name:string]:GUIControlSpec}){
        this.GUIControlSpecs = {
            ...this.GUIControlSpecs,
            ...controlSpec
        };
    }

    /**
     * A helper function that will check whether the control panel currently has a given slider control in it.
     * If the control is not there, then we will add it with the provided parameters.
     * @param name
     * @param initialValue: initial value for app state
     * @param min: minimum value of slider
     * @param max: maximum value of slider
     * @param step: step size of slider
     */
    addSliderIfMissing(name:string, initialValue?:number, min?:number, max?:number, step?:number){
        if(this.getState(name)===undefined){
            this.addSliderControl(name, initialValue??1.0, min, max, step);
        }
    }

}

export function CheckAppState():AAppState|undefined{
    return _appState;
}


export function GetAppState():AAppState{
    if(_appState===undefined){
        throw new Error("Must set app state!");
        // _appState = new AAppState();
    }
    return _appState;
}
