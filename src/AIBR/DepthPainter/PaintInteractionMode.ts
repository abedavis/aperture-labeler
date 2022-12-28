import { ASceneInteractionMode } from "src/anigraph/scene/interactionmodes";
import {
    ADOMPointerMoveInteraction, ADragInteraction,
    AInteractionEvent,
    AKeyboardInteraction,
    ASceneModel,
    ASerializable, NodeTransform3D, Quaternion, V2, Vec2, Vec3
} from "../../anigraph";
import type {HasInteractionModeCallbacks} from "../../anigraph";
import * as ASceneControllerWithIBR from "../ASceneControllerWithIBR";
import { IBRDataModel } from "../IBRDataModel";
import { ASceneModelWithIBRData } from "../ASceneModelWithIBRData";
import { AWheelInteraction } from "src/anigraph/interaction/AWheelInteraction";

@ASerializable("PaintInteractionMode")
export class PaintInteractionMode extends ASceneInteractionMode{
    cameraMovementSpeed:number=0.1;
    cameraOrbitSpeed:number=3;
    focusAdjustmentSpeed:number=0.01;

    get owner(): ASceneControllerWithIBR.ASceneControllerWithIBR {
        return this._owner as ASceneControllerWithIBR.ASceneControllerWithIBR;
    }

    get ibr():IBRDataModel{
        return this.owner.model.ibr;
    }

    get model(): ASceneModelWithIBRData {
        return this.owner.model;
    }
    get camera(){
        return this.model.camera;
    }
    get threeJSCamera(){
        return this.owner.getCameraView(this.cameraModel).threejs;
    }
    get focalPlane(){
        return this.ibr;
    }

    constructor(owner?:ASceneControllerWithIBR.ASceneControllerWithIBR,
                name?:string,
                interactionCallbacks?:HasInteractionModeCallbacks,
                ...args:any[]) {
        super(name, owner, interactionCallbacks, ...args);
    }

    /**
     * Create an instance in a single call, instead of calling new followed by init
     * @param owner
     * @param args
     * @returns {ASceneInteractionMode}
     * @constructor
     */
    static Create(owner: ASceneControllerWithIBR.ASceneControllerWithIBR, ...args: any[]) {
        let controls = new this();
        controls.init(owner);
        return controls;
    }

    onDragStart(event: AInteractionEvent, interaction: ADragInteraction): void {
        if(!event.ndcCursor){
            return;
        }
        this.ibr.updateRaycaster(event.ndcCursor, this.threeJSCamera);
        this.ibr.signalEvent("paintBrushMoved");
    }

    onDragMove(event: AInteractionEvent, interaction: ADragInteraction): void {
        if(!event.ndcCursor){
            return;
        }
        this.ibr.updateRaycaster(event.ndcCursor, this.threeJSCamera);
        this.ibr.signalEvent("paintBrushMoved");
    }

    onWheelMove(event: AInteractionEvent, interaction: AWheelInteraction) {
        let zoom = (event.DOMEvent as WheelEvent).deltaY;
        if(event.shiftKey){
            console.log(zoom);
        }else{
            let focusDepth = this.ibr.focusDistance+zoom*this.focusAdjustmentSpeed;
            this.ibr.setFocusDistance(focusDepth);
        }
        this.ibr.clearPaintMarks();
    }

    /**
     * This would be a good place to implement the time update of any movement filters
     * @param t
     * @param args
     */
    timeUpdate(t: number, ...args:any[]) {
    }

}