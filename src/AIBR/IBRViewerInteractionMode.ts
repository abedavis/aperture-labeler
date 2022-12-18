import { ASceneInteractionMode } from "src/anigraph/scene/interactionmodes";
import {
    ADOMPointerMoveInteraction, ADragInteraction,
    AInteractionEvent,
    AKeyboardInteraction,
    ASceneModel,
    ASerializable, NodeTransform3D, Quaternion, V2, Vec2, Vec3
} from "../anigraph";
import {ASceneModelWithIBRData} from "./ASceneModelWithIBRData";
import type {ASceneControllerWithIBR} from "./ASceneControllerWithIBR";
import type {HasInteractionModeCallbacks} from "../anigraph";
import {AWheelInteraction} from "../anigraph/interaction/AWheelInteraction";
import {IBRDataModel} from "./IBRDataModel";

@ASerializable("ExamplePlayerInteractionMode")
export class IBRViewerInteractionMode extends ASceneInteractionMode{
    cameraMovementSpeed:number=0.1;
    cameraOrbitSpeed:number=3;
    focusAdjustmentSpeed:number=0.01;

    get owner(): ASceneControllerWithIBR {
        return this._owner as ASceneControllerWithIBR;
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

    constructor(owner?:ASceneControllerWithIBR,
                name?:string,
                interactionCallbacks?:HasInteractionModeCallbacks,
                ...args:any[]) {
        super(name, owner, interactionCallbacks, ...args);
    }

    reset(){
    }

    /**
     * This gets called immediately before the interaction mode is activated. For now, we will call reset()
     * @param args
     */
    // beforeActivate(...args:any[]) {
    //     super.beforeActivate(...args);
    //     this.reset();
    // }

    /**
     * Create an instance in a single call, instead of calling new followed by init
     * @param owner
     * @param args
     * @returns {ASceneInteractionMode}
     * @constructor
     */
    static Create(owner: ASceneControllerWithIBR, ...args: any[]) {
        let controls = new this();
        controls.init(owner);
        return controls;
    }

    onWheelMove(event: AInteractionEvent, interaction: AWheelInteraction) {
        let zoom = (event.DOMEvent as WheelEvent).deltaY;
        if(event.shiftKey){
            console.log(zoom);
        }else{
            let focusDepth = this.ibr.focusDistance+zoom*this.focusAdjustmentSpeed;
            this.ibr.setFocusDistance(focusDepth);
        }
    }






    onMouseMove(event:AInteractionEvent, interaction: ADOMPointerMoveInteraction){
    }

    onKeyDown(event:AInteractionEvent, interaction:AKeyboardInteraction){
        if(interaction.keysDownState['w']){
            this.camera.pose.position = this.camera.pose.position.plus(this.camera.forward.times(this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['a']){
            this.camera.pose.position = this.camera.pose.position.plus(this.camera.right.times(-this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['s']){
            this.camera.pose.position = this.camera.pose.position.plus(this.camera.forward.times(-this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['d']){
            this.camera.pose.position = this.camera.pose.position.plus(this.camera.right.times(this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['r']){
            this.camera.pose.position = this.camera.pose.position.plus(this.camera.up.times(this.cameraMovementSpeed));
        }
        if(interaction.keysDownState['f']){
            this.camera.pose.position = this.camera.pose.position.plus(this.camera.up.times(-this.cameraMovementSpeed));
        }

        if (interaction.keysDownState["P"]) {
            console.log(this.camera.pose);
        }
        if (interaction.keysDownState["R"]) {
            this.camera.pose = this.ibr.closestView.pose.clone();
        }
        // if (interaction.keysDownState["P"]) {
        //     appState.framesToRecord = appState.totalFramesToRecord;
        // }
        // if (interaction.keysDownState["M"]) {
        //     appState.printMatrices();
        // }
        if (interaction.keysDownState["H"]) {
            this.ibr.showGUI = !this.ibr.showGUI;
        }
        if (interaction.keysDownState["F"]) {
            this.ibr.showFocusSphere = !this.ibr.showFocusSphere;
        }
        if (interaction.keysDownState["X"]) {
            this.camera.pose.rotation = Quaternion.RotationZ(Math.PI * 0.5).times(
                this.camera.pose.rotation
            );
        }

    }

    onKeyUp(event:AInteractionEvent, interaction:AKeyboardInteraction){
        if(!interaction.keysDownState['w']){
        }
        if(!interaction.keysDownState['a']){
        }
        if(!interaction.keysDownState['s']){
        }
        if(!interaction.keysDownState['d']){
        }
        if(!interaction.keysDownState['r']){
        }
        if(!interaction.keysDownState['f']){
        }
    }

    onDragStart(event: AInteractionEvent, interaction: ADragInteraction): void {
        /**
         * Here we will track some interaction state. Specifically, the last cursor position.
         */
        interaction.setInteractionState('lastCursor', event.ndcCursor);
    }
    onDragMove(event: AInteractionEvent, interaction: ADragInteraction): void {
        if(!event.ndcCursor){
            return;
        }
        let mouseMovement = event.ndcCursor.minus(interaction.getInteractionState('lastCursor'));
        interaction.setInteractionState('lastCursor', event.ndcCursor);

        if (event.shiftKey) {
            // console.log(event.normalizedXY);
            this.ibr.setFocusPointInImagePlane(
                V2(event.ndcCursor.x, event.ndcCursor.y)
            );
        }else {

            let rotationX = -mouseMovement.x * this.cameraOrbitSpeed;
            let rotationY = mouseMovement.y * this.cameraOrbitSpeed;
            let qX = Quaternion.FromAxisAngle(this.camera.up, rotationX);
            let qY = Quaternion.FromAxisAngle(this.camera.right, rotationY);
            let newPose = this.camera.pose.clone();
            newPose = new NodeTransform3D(qX.appliedTo(newPose.position.minus(this.ibr.focusTargetPoint)).plus(this.ibr.focusTargetPoint), newPose.rotation.times(qX));
            newPose = new NodeTransform3D(qY.appliedTo(newPose.position.minus(this.ibr.focusTargetPoint)).plus(this.ibr.focusTargetPoint), newPose.rotation.times(qY));
            this.cameraModel.setPose(newPose);
            this.cameraModel.signalTransformUpdate();
        }
    }
    onDragEnd(event: AInteractionEvent, interaction: ADragInteraction): void {
        let cursorWorldCoordinates:Vec2|null = event.ndcCursor;
        let dragStartWorldCoordinates:Vec2|null = interaction.dragStartEvent.ndcCursor;
    }

    /**
     * This would be a good place to implement the time update of any movement filters
     * @param t
     * @param args
     */
    timeUpdate(t: number, ...args:any[]) {
    }

}
