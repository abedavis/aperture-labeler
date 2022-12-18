/**
 * @file Main scene controller for your application
 * @description This is where you connect models to views.
 * This is done mainly by defining your model view spec and interaction modes.
 */


import {
    AGLContext, ASceneController, Color,
} from "../../../anigraph";
import {ATriangleMeshModel, ATriangleMeshView} from "../../../anigraph/scene/nodes";
import {ADebugInteractionMode} from "../../../anigraph/scene/interactionmodes/ADebugInteractionMode";
import {MainSceneModel} from "./MainSceneModel";
import {AppConfigs} from "../../AppConfigs";
import * as THREE from "three";
import {ASceneControllerWithIBR} from "../../../AIBR/ASceneControllerWithIBR";



export class MainSceneController extends ASceneController implements ASceneControllerWithIBR{
    get model():MainSceneModel{
        return this._model as MainSceneModel;
    }

    /**
     * This is where you specify the mapping from model classes to view classes.
     */
    initModelViewSpecs(): void {
        this.addModelViewSpec(ATriangleMeshModel, ATriangleMeshView);
    }

    async initScene(): Promise<void> {
        this.view.setBackgroundColor(Color.FromString("#000000"));
    }

    initInteractions() {
        let debugInteractionMode = new ADebugInteractionMode(this);
        this.defineInteractionMode("Debug", debugInteractionMode);
        this.setCurrentInteractionMode("Debug")
    }

    onAnimationFrameCallback(context:AGLContext) {
        // let's update the model
        let time = this.time;
        this.model.timeUpdate(time);

        /**
         * And the interaction mode... This is important for things like camera motion filtering.
         */
        this.interactionMode.timeUpdate(time)

        // clear the rendering context
        context.renderer.clear();
        // this.renderer.clear(false, true);

        // render the scene view
        context.renderer.render(this.view.threejs, this._threeCamera);
    }

}



