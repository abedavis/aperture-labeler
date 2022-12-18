import {
    AClickInteraction,
    ADOMPointerMoveInteraction, ADragInteraction,
    AInteractionEvent,
    AKeyboardInteraction,
    ASerializable
} from "../../../anigraph";
import {AWheelInteraction} from "../../../anigraph/interaction/AWheelInteraction";
import {ASceneInteractionMode} from "../../../anigraph/scene/interactionmodes/ASceneInteractionMode";
import {NodeTransform3D, Quaternion, Vec2, Vec3} from "../../../anigraph";
import type {HasInteractionModeCallbacks} from "../../../anigraph";
import {MainSceneController} from "../Scene/MainSceneController";
import {MainAppInteractionMode} from "../../BaseClasses/MainAppInteractionMode";


@ASerializable("ExamplePlayerInteractionMode")
export class ExamplePlayerInteractionMode extends MainAppInteractionMode{

    /**
     * You may want to define some parameters to adjust the speed of controls...
     */
    mouseMovementSpeed:number=3;
    keyboardMovementSpeed:number=0.25;
    cameraOrbitSpeed:number=3;

    get camera(){
        return this.model.camera;
    }

    constructor(owner?:MainSceneController,
                name?:string,
                interactionCallbacks?:HasInteractionModeCallbacks,
                ...args:any[]) {
        super(name, owner, interactionCallbacks, ...args);
        // this.reset();
    }

    get player(){
        return this.model.player;
    }

    reset(){
        // You can reset the control mode here
        this.camera.pose = NodeTransform3D.LookAt(
            this.player.position.plus(Vec3.UnitZ().times(3)),
            this.player.position,
            Vec3.UnitY()
        )
    }

    /**
     * This gets called immediately before the interaction mode is activated. For now, we will call reset()
     * @param args
     */
    beforeActivate(...args:any[]) {
        super.beforeActivate(...args);
        this.reset();
    }

    /**
     * Create an instance in a single call, instead of calling new followed by init
     * @param owner
     * @param args
     * @returns {ASceneInteractionMode}
     * @constructor
     */
    static Create(owner: MainSceneController, ...args: any[]) {
        let controls = new this();
        controls.init(owner);
        return controls;
    }

    onWheelMove(event: AInteractionEvent, interaction: AWheelInteraction) {
        let zoom = (event.DOMEvent as WheelEvent).deltaY;
        console.log(`Wheel moved! deltaY: ${zoom}`);
    }

    onMouseMove(event:AInteractionEvent, interaction: ADOMPointerMoveInteraction){
        // console.log(`mouse move! ${event}`);
    }

    onKeyDown(event:AInteractionEvent, interaction:AKeyboardInteraction){
        if(interaction.keysDownState['w']){
            this.player.position.y = this.player.position.y+this.keyboardMovementSpeed;
        }
        if(interaction.keysDownState['a']){
            this.player.position.x = this.player.position.x-this.keyboardMovementSpeed;
        }
        if(interaction.keysDownState['s']){
            this.player.position.y = this.player.position.y-this.keyboardMovementSpeed;

        }
        if(interaction.keysDownState['d']){
            this.player.position.x = this.player.position.x+this.keyboardMovementSpeed;
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

        let movementX = mouseMovement.x*this.mouseMovementSpeed;
        let movementY = mouseMovement.y*this.mouseMovementSpeed;
        this.player.position = this.player.position.plus(new Vec3(movementX, movementY, 0));
        this.camera.transform.position = this.camera.position.plus(new Vec3(movementX, movementY, 0));
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
