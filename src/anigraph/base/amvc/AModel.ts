import {ASerializable} from "../aserial";
// import {ACallbackSwitch} from "../aevents";
import {AObjectState, AObjectNode, AObjectNodeEvents} from "../aobject";
import {AppStateValueChangeCallback, GetAppState} from "../AAppState";
import {CallbackType} from "../../basictypes";

export interface AModelInterface extends AObjectNode {
    uid: string;
    name: string;
    parent: AObjectNode | null;
    serializationLabel: string;
    // addEventListener(eventName:string, callback:(...args:any[])=>void, handle?:string):ACallbackSwitch;
}

enum AModelEvents {
    RELEASE = 'RELEASE'
}

@ASerializable("AModel")
export abstract class AModel extends AObjectNode implements AModelInterface {
    @AObjectState public name!: string;
    static AModelEvents = AModelEvents;


    addNewParentListener(callback:(newParent?:AModel, oldParent?:AModel)=>void, handle?:string, synchronous:boolean=true){
        return this.addEventListener(AObjectNodeEvents.NewParent, callback, handle);
    }

    signalNewParent(newParent?:AModel, oldParent?:AModel){
        this.signalEvent(AObjectNodeEvents.NewParent, newParent, oldParent);
    }

    constructor(name?: string) {
        super();
        this.name = name ? name : this.serializationLabel;
    }

    release() {
        super.release();
        this.signalEvent(AModel.AModelEvents.RELEASE);
    }



}
