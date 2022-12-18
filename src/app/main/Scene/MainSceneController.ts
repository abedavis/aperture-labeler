/**
 * @file Main scene controller for your application
 * @description This is where you connect models to views.
 * This is done mainly by defining your model view spec and interaction modes.
 */


import {BaseSceneController} from "../../BaseClasses";
import {
    AGLContext,
} from "../../../anigraph";
import {ATriangleMeshModel, ATriangleMeshView} from "../../../anigraph/scene/nodes";
import {ADebugInteractionMode} from "../../../anigraph/scene/interactionmodes/ADebugInteractionMode";
import {TerrainModel, TerrainView} from "../Nodes/Terrain";

import {APointLightModel, APointLightView} from "../../../anigraph/scene/lights";
import {PlayerModel, PlayerView} from "../Nodes/PlayerNode";
import {MainSceneModel} from "./MainSceneModel";
import {ExamplePlayerInteractionMode} from "../InteractionModes/ExamplePlayerInteractionMode";
import {BotModel} from "../Nodes/CharacterNodes/BotModel";
import {BotView} from "../Nodes/CharacterNodes/BotView";
import {ExampleThreeJSNodeModel, ExampleThreeJSNodeView} from "../Nodes/ExampleNodes/ExampleThreeJSNode";
import {ExampleParticleSystemModel} from "../Nodes/ExampleNodes/ExampleParticleSystemNode/ExampleParticleSystemModel";
import {ExampleParticleSystemView} from "../Nodes/ExampleNodes/ExampleParticleSystemNode/ExampleParticleSystemView";
import {AppConfigs} from "../../AppConfigs";
import * as THREE from "three";
import {ExamplePointerLockInteractionMode} from "../InteractionModes/ExamplePointerLockInteractionMode";

export class MainSceneController extends BaseSceneController{
    get model():MainSceneModel{
        return this._model as MainSceneModel;
    }

    /**
     * This is where you specify the mapping from model classes to view classes.
     */
    initModelViewSpecs(): void {
        this.addModelViewSpec(APointLightModel, APointLightView);
        this.addModelViewSpec(ATriangleMeshModel, ATriangleMeshView);
        this.addModelViewSpec(TerrainModel, TerrainView);
        this.addModelViewSpec(PlayerModel, PlayerView);
        this.addModelViewSpec(BotModel, BotView);
        this.addModelViewSpec(ExampleThreeJSNodeModel, ExampleThreeJSNodeView);
        this.addModelViewSpec(ExampleParticleSystemModel, ExampleParticleSystemView);
    }

    async initScene(): Promise<void> {
        /**
         * Set up the skybox background
         */
        await super.initScene();
        let path = './images/cube/MilkyWay/dark-s_';
        let format = '.jpg'
        const urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        /**
         * If you want to change the skybox, you will need to provide the appropriate urls to the corresponding textures
         * from a cube map
         */
        const reflectionCube = new THREE.CubeTextureLoader().load( urls );
        reflectionCube.rotation = Math.PI*0.25;
        this.view.threejs.background = reflectionCube;
    }

    initInteractions() {

        /**
         * We will define the debug interaction mode here.
         * The debug mode is offered mainly to provide camera controls for developing and debugging non-control-related
         * features. It may also be useful as an example for you to look at if you like.
         */
        super.initInteractions();
        let debugInteractionMode = new ADebugInteractionMode(this);
        this.defineInteractionMode("Debug", debugInteractionMode);


        /**
         * This code adds the ExamplePlayer interaction mode and sets it as the current active mode
         */
        let playerInteractionMode = new ExamplePlayerInteractionMode(this);
        this.defineInteractionMode("ExamplePlayer", playerInteractionMode);


        let pointerLockInteractionMode = new ExamplePointerLockInteractionMode(this);
        this.defineInteractionMode("ExamplePointerLock", pointerLockInteractionMode);

        /**
         * For starters we will default to the debug mode.
         */
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



