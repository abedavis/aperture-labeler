import {BaseSceneController} from "../../../../BaseClasses";
import {MainSceneModel} from "../../MainSceneModel";
import {
    ACamera,
    AGLContext,
    AGLRenderWindow, AGraphicElement,
    APointLightModel,
    APointLightView,
    ASceneElement, AShaderMaterial, AShaderModel, GetAppState, Mat4, V3
} from "../../../../../anigraph";
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
import {
    BillboardParticleSystemModel,
    BillboardParticleSystemView
} from "../../../Nodes/BillboardParticleSystem";
import {ARenderTarget} from "../../../../../anigraph/rendering/multipass/ARenderTarget";
import {Example3SceneModel} from "./Example3SceneModel";
import {ACameraElement} from "../../../../../anigraph/rendering/ACameraElement";

const appState = GetAppState();
const RenderTargetWidth:number=512;
const RenderTargetHeight:number=512;
export class Example3SceneController extends BaseSceneController{
    postProcessingCamera!:ACameraElement;
    postProcessingScene!:ASceneElement;
    fullScreenQuad!:AGraphicElement;
    postProcessingShaderModel!:AShaderModel;
    postProcessingMaterial!:AShaderMaterial;
    currentTextureRenderTarget!:ARenderTarget;


    async initPostProcessingEffects(){
        this.postProcessingScene = new ASceneElement();
        this.postProcessingCamera = ACameraElement.CreateOrthographic(-1,1,-1,1,-1,1);
        this.currentTextureRenderTarget = new ARenderTarget(RenderTargetWidth, RenderTargetHeight);
        this.currentTextureRenderTarget.targetTexture.setMinFilter(THREE.LinearMipmapLinearFilter);
        this.currentTextureRenderTarget.targetTexture.setMagFilter(THREE.LinearFilter);
        this.postProcessingShaderModel = await AShaderModel.CreateModel("postprocessing");
        this.postProcessingMaterial = this.postProcessingShaderModel.CreateMaterial();
        this.postProcessingMaterial.setTexture('input', this.currentTextureRenderTarget.targetTexture);
        this.fullScreenQuad = AGraphicElement.CreateSimpleQuad(this.postProcessingMaterial);
        this.fullScreenQuad.setTransform(Mat4.Scale3D(V3(2.0,2.0,1.0)));
        this.postProcessingScene.add(this.fullScreenQuad);
        const self = this;
        appState.addSliderIfMissing("sliderValue", 1,0,10,0.01);
        this.subscribeToAppState("sliderValue", (v:number)=>{
            self.postProcessingMaterial.setUniform("sliderValue", v);
        });
    }


    get model():Example3SceneModel{
        return this._model as Example3SceneModel;
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

        // Note that we can use the same view for two different models!
        this.addModelViewSpec(ExampleLoadedCharacterModel, ExampleLoadedView);
        this.addModelViewSpec(ExampleLoadedModel, ExampleLoadedView);

        this.addModelViewSpec(BillboardParticleSystemModel, BillboardParticleSystemView);


    }

    async initRendering(renderWindow: AGLRenderWindow): Promise<void> {
        await super.initRendering(renderWindow);
        await this.initPostProcessingEffects();
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
         * Set the render target to our texture target and clear it
         */
        this.setRenderTarget(this.currentTextureRenderTarget);
        context.renderer.clear();

        /**
         * Render our scene to the texture target
         */
        context.renderer.render(this.view.threejs, this._threeCamera)

        /**
         * Set the target back to the screen and clear it
         */
        context.renderer.setRenderTarget(null);
        context.renderer.clear();

        /**
         * Render our post-processing scene, which has a full screen quad, to the screen.
         */
        context.renderer.render(this.postProcessingScene.threejs, this.postProcessingCamera.threejs);
    }

}
