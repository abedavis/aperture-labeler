/**
 * @file Main scene controller for your application
 * @description This is where you connect models to views.
 * This is done mainly by defining your model view spec and interaction modes.
 */


import {
    AGLContext, AGraphicElement, ASceneController, ASceneElement, AShaderMaterial, AShaderModel, Color, Mat4, V3,
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
import { ARenderTarget } from "src/anigraph/rendering/multipass/ARenderTarget";
import { DepthGridShaderMaterial, DepthGridShaderModel } from "src/AIBR/shadermodels/DepthGridShaderModel";
import { PostProcessingCamera } from "./PostProcessingCamera";

const RenderTargetWidth:number=512;
const RenderTargetHeight:number=512;

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
        await this.initPostProcessingEffects();
        // console.log(this.renderer)
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
        context.renderer.autoClear = true;
        const time = this.time;
        this.model.timeUpdate(time);
        this.interactionMode.timeUpdate(time)

        this.setRenderTarget(this.depthGridRenderTarget);
        context.renderer.clear();
        context.renderer.render(this.view.threejs, this._threeCamera);

        this.setRenderTarget(this.lastTextureRenderTarget);
        context.renderer.clear();

        this.setRenderTarget(this.nextRenderTarget);
        context.renderer.clear();
        this.fullScreenQuad.setMaterial(this.accMaterial);
        this.accMaterial.setUniform("init", true)
        this.accMaterial.setTexture("acc", this.lastTextureRenderTarget.targetTexture);
        context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);

        this.usingTarget1 = !this.usingTarget1;

        this.setRenderTarget(this.nextRenderTarget);
        context.renderer.clear();
        this.fullScreenQuad.setMaterial(this.accMaterial);
        this.accMaterial.setUniform("init", false)
        this.accMaterial.setTexture("acc", this.lastTextureRenderTarget.targetTexture);
        context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);

        // this.usingTarget1 = !this.usingTarget1;

        // this.setRenderTarget(this.nextRenderTarget);
        // context.renderer.clear();
        // this.fullScreenQuad.setMaterial(this.accMaterial);
        // this.accMaterial.setUniform("init", false);
        // this.accMaterial.setTexture("acc", this.lastTextureRenderTarget.targetTexture);
        // context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);
        
        // context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);
        // // context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);

        this.setRenderTarget();
        this.fullScreenQuad.setMaterial(this.displayMaterial);
        this.displayMaterial.setTexture('input', this.lastTextureRenderTarget.targetTexture);
        context.renderer.clear();
        context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);
    }

    depthGridRenderTarget!: ARenderTarget;
    accRenderTarget1!: ARenderTarget;
    accRenderTarget2!: ARenderTarget;
    fullScreenQuad!: AGraphicElement;
    fullScreenScene!: ASceneElement;
    fullScreenCamera!: PostProcessingCamera;
    accMaterial!: AShaderMaterial;
    displayMaterial!: AShaderMaterial;

    usingTarget1: boolean = true;

    get lastTextureRenderTarget():ARenderTarget{
        return (this.usingTarget1) ? this.accRenderTarget1 : this.accRenderTarget2;
    };
    get nextRenderTarget():ARenderTarget{
        return (this.usingTarget1) ? this.accRenderTarget2 : this.accRenderTarget1;
    };

    async initPostProcessingEffects(){
        function newRenderTarget(){
            let rt = new ARenderTarget(RenderTargetWidth, RenderTargetHeight);
            rt.targetTexture.setMinFilter(THREE.LinearMipmapLinearFilter);
            rt.targetTexture.setMagFilter(THREE.LinearFilter);
            return rt;
        }
        this.depthGridRenderTarget = newRenderTarget();
        this.accRenderTarget1 = newRenderTarget();
        this.accRenderTarget2 = newRenderTarget();

        const accShaderModel = await AShaderModel.CreateModel("acctexture");
        this.accMaterial = accShaderModel.CreateMaterial();
        this.accMaterial.setTexture('input', this.depthGridRenderTarget.targetTexture);
        this.accMaterial.setTexture('acc', this.lastTextureRenderTarget.targetTexture);
        this.accMaterial.threejs.transparent = true;
        this.accMaterial.threejs.blending=THREE.CustomBlending;
        this.accMaterial.threejs.blendEquation=THREE.AddEquation;
        this.accMaterial.threejs.blendSrc=THREE.OneFactor;
        this.accMaterial.threejs.blendDst=THREE.OneFactor;
        this.accMaterial.threejs.depthTest=false;
        this.accMaterial.threejs.depthWrite=false;
        this.accMaterial.threejs.needsUpdate = true;

        const displayShaderModel = await AShaderModel.CreateModel("displaytexture");
        this.displayMaterial = displayShaderModel.CreateMaterial();
        this.displayMaterial.threejs.side = THREE.FrontSide;
        this.displayMaterial.setTexture('input', this.lastTextureRenderTarget.targetTexture);
        // this.displayMaterial.setTexture('input2', this.depthGridRenderTarget.targetTexture);

        this.fullScreenQuad = AGraphicElement.CreateSimpleQuad(this.displayMaterial);
        this.fullScreenQuad.setTransform(Mat4.Scale3D(V3(2.0,2.0,1.0)));

        this.fullScreenScene = new ASceneElement();
        this.fullScreenScene.add(this.fullScreenQuad);
        this.fullScreenScene.threejs.background = new THREE.Color(0, 0, 0);
        this.fullScreenCamera = new PostProcessingCamera();

        // const self = this;
        // appState.addSliderIfMissing("sliderValue", 0.1,0,1,0.01);
        // this.subscribeToAppState("sliderValue", (v:number)=>{
        //     self.postProcessingMaterial.setUniform("sliderValue", v);
        // });
        // appState.addSliderIfMissing("otherSliderValue", 1.0,0,2,0.01);
        // this.subscribeToAppState("otherSliderValue", (v:number)=>{
        //     self.postProcessingMaterial.setUniform("otherSliderValue", v);
        // });
    }


}



