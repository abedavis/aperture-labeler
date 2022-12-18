import {AInteraction} from "./AInteraction";
import {HasInteractions} from "../base/amvc/HasInteractions";
import {CallbackType} from "../basictypes";
import {AWheelInteractionCallback} from "./AWheelInteraction";
import {ADragInteractionCallback} from "./ADragInteraction";
import {AClickInteraction} from "./AClickInteraction";

export interface AInteractionModeInterface{
    interactions:AInteraction;
}

export enum BasicInteractionModes{
    Default='Default'
}


export enum PointerLockEvents{
    Lock="PointerLock_Lock",
    Unlock="PointerLock_Unlock",
}


// export interface InteractionModeCallbacks {
//     onKeyDown?:CallbackType|undefined;
//     onKeyUp?:CallbackType|undefined;
//     onMouseMove?:CallbackType|undefined;
//     onWheelMove?:AWheelInteractionCallback|undefined;
//     onDragStart?:ADragInteractionCallback|undefined;
//     onDragMove?:ADragInteractionCallback|undefined;
//     onDragEnd?:ADragInteractionCallback|undefined;
// }
export interface HasInteractionModeCallbacks {
    onKeyDown?:CallbackType|undefined;
    onKeyUp?:CallbackType|undefined;
    onMouseMove?:CallbackType|undefined;
    onWheelMove?:AWheelInteractionCallback|undefined;
    onDragStart?:ADragInteractionCallback|undefined;
    onDragMove?:ADragInteractionCallback|undefined;
    onDragEnd?:ADragInteractionCallback|undefined;
    onClick?:CallbackType|undefined;
    afterActivate?:CallbackType|undefined;
    afterDeactivate?:CallbackType|undefined;
    beforeActivate?:CallbackType|undefined;
    beforeDeactivate?:CallbackType|undefined;
    dispose?:CallbackType|undefined;
}

export function SetInteractionCallbacks(owner:HasInteractionModeCallbacks, interactionCallbacks:HasInteractionModeCallbacks, bind:boolean){
    if ('onKeyDown' in interactionCallbacks && interactionCallbacks.onKeyDown) {
        owner.onKeyDown = interactionCallbacks.onKeyDown;
        if(bind) {
            owner.onKeyDown = owner.onKeyDown.bind(owner);
        }
    }
    if ('onKeyUp' in interactionCallbacks && interactionCallbacks.onKeyUp) {
        owner.onKeyUp = interactionCallbacks.onKeyUp;
        if(bind) {
            owner.onKeyUp = owner.onKeyUp.bind(owner);
        }
    }
    if ('onMouseMove' in interactionCallbacks && interactionCallbacks.onMouseMove) {
        owner.onMouseMove = interactionCallbacks.onMouseMove;
        if(bind) {
            owner.onMouseMove = owner.onMouseMove.bind(owner);
        }
    }
    if ('onWheelMove' in interactionCallbacks && interactionCallbacks.onWheelMove) {
        owner.onWheelMove = interactionCallbacks.onWheelMove;
        if(bind){
            owner.onWheelMove = owner.onWheelMove.bind(owner);
        }
    }
    if ('onDragStart' in interactionCallbacks && interactionCallbacks.onDragStart) {
        owner.onDragStart = interactionCallbacks.onDragStart;
        if(bind){
            owner.onDragStart = owner.onDragStart.bind(owner);
        }
    }
    if ('onDragMove' in interactionCallbacks && interactionCallbacks.onDragMove) {
        owner.onDragMove = interactionCallbacks.onDragMove;
        if(bind){
            owner.onDragMove = owner.onDragMove.bind(owner);
        }
    }
    if ('onDragEnd' in interactionCallbacks && interactionCallbacks.onDragEnd) {
        owner.onDragEnd = interactionCallbacks.onDragEnd;
        if(bind){
            owner.onDragEnd = owner.onDragEnd.bind(owner);
        }
    }

    if('onClick' in interactionCallbacks && interactionCallbacks.onClick){
        owner.onClick = interactionCallbacks.onClick;
        if(bind){
            owner.onClick = owner.onClick.bind(owner);
        }
    }


    if ('afterActivate' in interactionCallbacks && interactionCallbacks.afterActivate) {
        owner.afterActivate = interactionCallbacks.afterActivate;
        if(bind){
            owner.afterActivate = owner.afterActivate.bind(owner);
        }
    }
    if ('afterDeactivate' in interactionCallbacks && interactionCallbacks.afterDeactivate) {
        owner.afterDeactivate = interactionCallbacks.afterDeactivate;
        if(bind){
            owner.afterDeactivate = owner.afterDeactivate.bind(owner);
        }
    }

    if ('beforeActivate' in interactionCallbacks && interactionCallbacks.beforeActivate) {
        owner.beforeActivate = interactionCallbacks.beforeActivate;
        if(bind){
            owner.beforeActivate = owner.beforeActivate.bind(owner);
        }
    }

    if ('beforeDeactivate' in interactionCallbacks && interactionCallbacks.beforeDeactivate) {
        owner.beforeDeactivate = interactionCallbacks.beforeDeactivate;
        if(bind){
            owner.beforeDeactivate = owner.beforeDeactivate.bind(owner);
        }
    }

    if ('dispose' in interactionCallbacks && interactionCallbacks.dispose) {
        owner.dispose = interactionCallbacks.dispose;
        if(bind){
            owner.dispose = owner.dispose.bind(owner);
        }
    }

}


export class AInteractionMode{
    public name!:string;
    public _owner!:HasInteractions;

    get owner(){
        return this._owner;
    }


    protected interactions:AInteraction[]=[];
    // protected _afterActivate!:(...args:any[])=>any;
    // protected _afterDeactivate!:(...args:any[])=>any
    // protected _beforeActivate!:(...args:any[])=>any;
    // protected _beforeDeactivate!:(...args:any[])=>any

    public modeState:{[name:string]:any}={};
    setModeState(name:string, value:any){this.modeState[name]=value;}
    getModeState(name:string){return this.modeState[name];}
    clearModeState(){this.modeState={};}



    afterActivate(...args:any[]){}
    afterDeactivate(...args:any[]){}
    beforeActivate(...args:any[]){}
    beforeDeactivate(...args:any[]){}
    // afterActivate(...args:any[]){if(this._afterActivate) {this._afterActivate(...args);}}
    // afterDeactivate(...args:any[]){if(this._afterDeactivate) {this._afterDeactivate(...args);}}
    // beforeActivate(...args:any[]){
    //     if(this._beforeActivate) {
    //         this._beforeActivate(...args);
    //     }
    // }
    // beforeDeactivate(...args:any[]){if(this._beforeDeactivate) {this._beforeDeactivate(...args);}}

    // bindMethods(){
    //     this.afterActivate = this.afterActivate.bind(this);
    //     this.afterDeactivate = this.afterDeactivate.bind(this);
    //     this.beforeActivate = this.beforeActivate.bind(this);
    //     this.beforeDeactivate = this.beforeDeactivate.bind(this);
    // }

    public active:boolean=false;
    public isGUISelectable:boolean=true;

    constructor(name?:string, owner?:HasInteractions, ...args:any[]){
        if(name) this.name = name;
        if(owner) this._owner = owner;
        // this.bindMethods();
    }

    /**
     * adds interaction, and sets its owner to be this owner
     * @param interaction
     */
    addInteraction(interaction:AInteraction){
        // if(this.active){
        //     throw new Error("Cannot add interactions to an active interaction mode!");
        // }
        this.interactions.push(interaction);
        if(this.active && !interaction.active){
            interaction.activate();
        }
        if(!this.active && interaction.active){
            interaction.deactivate();
        }
        if(interaction.owner){
            throw new Error('interaction already has owner!');
        }
        interaction.owner = this.owner;
    }

    deactivate(){
        this.beforeDeactivate();
        for (let interaction of this.interactions) {
            interaction.deactivate();
        }
        this.clearModeState();
        this.afterDeactivate();
        this.active=false;
    }

    activate(){
        this.beforeActivate();
        for (let interaction of this.interactions) {
            interaction.activate();
        }
        this.afterActivate();
        this.active=true;
    }

    timeUpdate(t:number, ...args:any[]){
    }
}


