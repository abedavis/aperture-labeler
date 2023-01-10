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

        this.setCurrentInteractionMode("Debug")
    }

    onAnimationFrameCallback(context:AGLContext) {
        context.renderer.autoClear = false;
        const time = this.time;
        this.model.timeUpdate(time);
        this.interactionMode.timeUpdate(time)

        // Clear accumulation buffer
        this.setRenderTarget(this.accRenderTarget);
        context.renderer.clear();
        this.model.setOccupancyRendering(false);
        this.accMaterial.setTexture('input', this.depthGridRenderTarget.targetTexture);

        for (let i=0; i<this.model.depthGrids.length; i++) {
            this.setRenderTarget(this.depthGridRenderTarget);
            this.model.setVisibleForDepthGridAt(i);
            context.renderer.clear();
            context.renderer.render(this.view.threejs, this._threeCamera);

            this.setRenderTarget(this.accRenderTarget);
            this.fullScreenQuad.setMaterial(this.accMaterial);
            context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);
        }

        this.setRenderTarget(this.accOccupancyRenderTarget);
        context.renderer.clear();
        this.model.setOccupancyRendering(true);
        this.accMaterial.setTexture('input', this.depthGridOccupancyRenderTarget.targetTexture);

        for (let i=0; i<this.model.depthGrids.length; i++) {
            this.setRenderTarget(this.depthGridOccupancyRenderTarget);
            this.model.setVisibleForDepthGridAt(i);
            
            context.renderer.clear();
            context.renderer.render(this.view.threejs, this._threeCamera);

            this.setRenderTarget(this.accOccupancyRenderTarget);
            this.fullScreenQuad.setMaterial(this.accMaterial);
            context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);
        }

        // let ncopies = 2;
        // for(let i=0; i<ncopies; i++) {
        //     context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);
        // }
        // context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);
        // context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs);

        this.setRenderTarget();
        context.renderer.clear();
        this.fullScreenQuad.setMaterial(this.displayMaterial);
        context.renderer.render(this.fullScreenScene.threejs, this.fullScreenCamera._threejs)
    }




    depthGridRenderTarget!: ARenderTarget;
    accRenderTarget!: ARenderTarget;
    depthGridOccupancyRenderTarget!: ARenderTarget;
    accOccupancyRenderTarget!: ARenderTarget;
    fullScreenQuad!: AGraphicElement;
    fullScreenScene!: ASceneElement;
    fullScreenCamera!: PostProcessingCamera;
    accMaterial!: AShaderMaterial;
    displayMaterial!: AShaderMaterial;



    async initPostProcessingEffects(){
        function newRenderTarget(){
            let rt = new ARenderTarget(RenderTargetWidth, RenderTargetHeight);
            rt.targetTexture.setMinFilter(THREE.LinearMipmapLinearFilter);
            rt.targetTexture.setMagFilter(THREE.LinearFilter);
            return rt;
        }
        this.depthGridRenderTarget = newRenderTarget();
        this.accRenderTarget = newRenderTarget();
        this.depthGridOccupancyRenderTarget = newRenderTarget();
        this.accOccupancyRenderTarget = newRenderTarget();

        const accShaderModel = await AShaderModel.CreateModel("acctexture");
        this.accMaterial = accShaderModel.CreateMaterial();
        this.accMaterial.setTexture('input', this.depthGridRenderTarget.targetTexture);
        // this.accMaterial.threejs.transparent = true;
        this.accMaterial.threejs.blending=THREE.CustomBlending;
        this.accMaterial.threejs.blendEquation=THREE.AddEquation;
        this.accMaterial.threejs.blendSrc=THREE.SrcAlphaFactor;
        this.accMaterial.threejs.blendSrc=THREE.OneFactor;
        this.accMaterial.threejs.blendDst=THREE.OneFactor;
        this.accMaterial.threejs.depthTest=false;
        this.accMaterial.threejs.depthWrite=false;
        this.accMaterial.threejs.needsUpdate = true;

    
        const displayShaderModel = await AShaderModel.CreateModel("displaytexture");
        this.displayMaterial = displayShaderModel.CreateMaterial();
        this.displayMaterial.threejs.side = THREE.FrontSide;
        this.displayMaterial.setTexture('input', this.accRenderTarget.targetTexture);
        this.displayMaterial.setTexture('occupancy', this.accOccupancyRenderTarget.targetTexture);
        // this.displayMaterial.setTexture('input2', this.depthGridRenderTarget.targetTexture);

        this.fullScreenQuad = AGraphicElement.CreateSimpleQuad(this.displayMaterial);
        this.fullScreenQuad.setTransform(Mat4.Scale3D(V3(2.0,2.0,1.0)));

        this.fullScreenScene = new ASceneElement();
        this.fullScreenScene.add(this.fullScreenQuad);
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



