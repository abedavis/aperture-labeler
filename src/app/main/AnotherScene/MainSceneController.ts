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
import {MainSceneRootModel} from "./MainSceneRootModel";
import {AppConfigs} from "../../AppConfigs";
import * as THREE from "three";
import {ASceneControllerWithIBR} from "../../../AIBR/ASceneControllerWithIBR";
import {IBRDataModel, IBRSceneView} from "../../../AIBR";
import {IBRViewerInteractionMode} from "../../../AIBR/IBRViewerInteractionMode";
import { PaintInteractionMode } from "src/AIBR/DepthPainter/PaintInteractionMode";
import { DepthGridModel } from "src/AIBR/DepthGrid/DepthGridModel";
import { DepthGridView } from "src/AIBR/DepthGrid/DepthGridView";



export class MainSceneController extends ASceneController implements ASceneControllerWithIBR{
    get model():MainSceneRootModel{
        return this._model as MainSceneRootModel;
    }

    /**
     * This is where you specify the mapping from model classes to view classes.
     */
    initModelViewSpecs(): void {
        this.addModelViewSpec(DepthGridModel, DepthGridView);
    }

    async initScene(): Promise<void> {
        this.view.setBackgroundColor(Color.FromString("#000000"));
    }

    initInteractions() {
        let debugInteractionMode = new ADebugInteractionMode(this);
        this.defineInteractionMode("Debug", debugInteractionMode);

        let ibrInteractionMode = new IBRViewerInteractionMode(this);
        this.defineInteractionMode("IBR", ibrInteractionMode);

        let paintInteractionMode = new PaintInteractionMode(this);
        this.defineInteractionMode("DepthPainter", paintInteractionMode);

        this.setCurrentInteractionMode("IBR")
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



