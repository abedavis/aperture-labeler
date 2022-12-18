import {BaseSceneController} from "../../../../BaseClasses";
import {MainSceneModel} from "../../MainSceneModel";
import {AGLContext, AGLRenderWindow, APointLightModel, APointLightView} from "../../../../../anigraph";
import {ATriangleMeshModel, ATriangleMeshView} from "../../../../../anigraph/scene/nodes";
import {
    BotModel,
    BotView, ExampleParticleSystemModel, ExampleParticleSystemView,
    ExampleThreeJSNodeModel, ExampleThreeJSNodeView,
    PlayerModel,
    PlayerView,
    TerrainModel,
    TerrainView
} from "../../../Nodes";
import * as THREE from "three";
import {ADebugInteractionMode} from "../../../../../anigraph/scene/interactionmodes";
import {ExamplePlayerInteractionMode} from "../../../InteractionModes";
import {ExamplePointerLockInteractionMode} from "../../../InteractionModes/ExamplePointerLockInteractionMode";
import {ExampleLoadedCharacterModel, ExampleLoadedModel, ExampleLoadedView} from "../../../Nodes/Loaded";
import {UnitQuadModel, UnitQuadView} from "../../../Nodes/UnitQuadModel";
import {Example2SceneModel} from "./Example2SceneModel";

export class Example2SceneController extends BaseSceneController{
    get model():Example2SceneModel{
        return this._model as Example2SceneModel;
    }

    /**
     * This is where you specify the mapping from model classes to view classes.
     */
    initModelViewSpecs(): void {
        this.addModelViewSpec(APointLightModel, APointLightView);
        this.addModelViewSpec(ATriangleMeshModel, ATriangleMeshView);
        this.addModelViewSpec(TerrainModel, TerrainView);
        this.addModelViewSpec(PlayerModel, PlayerView);

        // Note that we can use the same view for two different models!
        this.addModelViewSpec(ExampleLoadedCharacterModel, ExampleLoadedView);
        this.addModelViewSpec(ExampleLoadedModel, ExampleLoadedView);
        this.addModelViewSpec(UnitQuadModel, UnitQuadView);


    }

    async initRendering(renderWindow: AGLRenderWindow): Promise<void> {
        await super.initRendering(renderWindow);
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


        /**
         * Tell the model to prepare for the render-to-texture pass.
         */
        this.model.prepRenderToTexturePass()

        /**
         * Set the current render target to the model's current texture render target and clear it for rendering.
         */
        this.setRenderTarget(this.model.currentTextureRenderTarget);
        context.renderer.clear();

        /**
         * Render the scene.
         */
        context.renderer.render(this.view.threejs, this._cameraView.threejs)

        /**
         * Set the render target to null, which will return it to rendering to the screen.
         * Then clear the screen for rendering.
         */
        context.renderer.setRenderTarget(null);
        context.renderer.clear();

        /**
         * Have the model prepare for the final pass before rendering the scene to the screen.
         */
        this.model.prepFinalPass();
        context.renderer.render(this.view.threejs, this._threeCamera);
    }

}
