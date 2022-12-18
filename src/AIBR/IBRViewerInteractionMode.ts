import { ASceneInteractionMode } from "src/anigraph/scene/interactionmodes";
import {
    ADOMPointerMoveInteraction, ADragInteraction,
    AInteractionEvent,
    AKeyboardInteraction,
    ASceneModel,
    ASerializable, NodeTransform3D, Quaternion, Vec2, Vec3
} from "../anigraph";
import {ASceneModelWithIBR} from "./ASceneModelWithIBR";
import type {ASceneControllerWithIBR} from "./ASceneControllerWithIBR";
import type {HasInteractionModeCallbacks} from "../anigraph";
import {AWheelInteraction} from "../anigraph/interaction/AWheelInteraction";

@ASerializable("ExamplePlayerInteractionMode")
export class IBRViewerInteractionMode extends ASceneInteractionMode{
    cameraMovementSpeed:number=0.02;
    cameraOrbitSpeed:number=3;

    get owner(): ASceneControllerWithIBR {
        return this._owner as ASceneControllerWithIBR;
    }

    get model(): ASceneModelWithIBR {
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
        console.log(`Wheel moved! deltaY: ${zoom}`);
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
        let rotationX = -mouseMovement.x*this.cameraOrbitSpeed;
        let rotationY = mouseMovement.y*this.cameraOrbitSpeed;
        let qX = Quaternion.FromAxisAngle(this.camera.up, rotationX);
        let qY = Quaternion.FromAxisAngle(this.camera.right, rotationY);
        let newPose = this.camera.pose.clone();
        newPose = new NodeTransform3D(qX.appliedTo(newPose.position), newPose.rotation.times(qX));
        newPose = new NodeTransform3D(qY.appliedTo(newPose.position), newPose.rotation.times(qY));
        this.cameraModel.setPose(newPose);
        this.cameraModel.signalTransformUpdate();
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
