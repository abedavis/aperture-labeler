import {
    ATexture, ShaderManager, V2, Vec2,
    ASerializable,
    ClassInterface, Mat4
} from "../../anigraph";
import {MixTexturesShaderMaterial, MixTexturesShaderModel,MAX_TEX_PER_CALL} from "../../anigraph/rendering/material/shadermodels";
import type {ShaderMaterialParameters} from "three/src/materials/ShaderMaterial";
import {IBRCapturedImage} from "../IBRCapturedImage";
import * as THREE from "three";

const SHADER_NAME = 'viewreprojectionWithDistortion';
ShaderManager.LoadShader(SHADER_NAME, `ibr/${SHADER_NAME}.vert.glsl`, `ibr/${SHADER_NAME}.frag.glsl`);
const PaddingWeight = 0;

enum Uniforms{
    Poses="poses",
    Projections="projections",
    Distortions="distortions",
    Weights="weights",
    NTextures="nTextures",
    DeviceOrientations="deviceOrientations",
    TexSizes="texSizes",
    OpticalCenters="opticalCenters",
    FocalLengths="focalLengths"
    // Homogenize="homogenize"
}

@ASerializable("ViewReprojectionShaderMaterialWithDistortion")
export class ViewReprojectionShaderMaterialWithDistortion extends MixTexturesShaderMaterial{
    async setCapturedImages(
        capturedImages?:IBRCapturedImage[],
        weights?:number[]
    ){
        try {
            let mat = this;
            if (!capturedImages || !weights) {
                return;
            }
            let modelviews = Array(MAX_TEX_PER_CALL).fill(Mat4.Identity().asThreeJS());
            let projections = Array(MAX_TEX_PER_CALL).fill(Mat4.Identity().asThreeJS());
            let deviceOrientations = Array(MAX_TEX_PER_CALL).fill(0);
            let distortions = Array(MAX_TEX_PER_CALL).fill(new THREE.Vector4());
            let opticalCenters = Array(MAX_TEX_PER_CALL).fill(new THREE.Vector2());
            let texSizes = Array(MAX_TEX_PER_CALL).fill(new THREE.Vector2());
            let focalLengths = Array(MAX_TEX_PER_CALL).fill(new THREE.Vector2());
            for (let ri = 0; ri < capturedImages.length; ri++) {
                let capi = capturedImages[ri];
                mat.setTexture(`tex${ri}`, await capi.texture);
                // modelviews[ri]=capi.pose.getMatrix().asThreeJS();
                // projections[ri]=capi.camera.getMatrix().asThreeJS();
                // modelviews[ri]=capi.pose.getMatrix().asThreeJS();
                projections[ri] = capi.camera.getMatrix().asThreeJS();
                modelviews[ri] = capi.pose.getMatrix().getInverse().asThreeJS();
                // projections[ri]=capi.camera.getMatrix().getInverse().asThreeJS();
                deviceOrientations[ri] = capi.deviceOrientation;
                distortions[ri]= capi.camera._distortionParams.asThreeJS();
                let tx = (capi.texture as ATexture);
                texSizes[ri].x=tx.width;
                texSizes[ri].y=tx.height;
                opticalCenters[ri].x=capi.camera.center.x;
                opticalCenters[ri].y=capi.camera.center.y;
                focalLengths[ri].x=capi.camera.focalLength.x;
                focalLengths[ri].y=capi.camera.focalLength.y;
            }
            mat.setUniform(Uniforms.Poses, modelviews);
            mat.setUniform(Uniforms.Projections, projections);
            mat.setUniform(Uniforms.DeviceOrientations, deviceOrientations);
            mat.setUniform(Uniforms.TexSizes, texSizes);
            mat.setUniform(Uniforms.OpticalCenters, opticalCenters);
            mat.setUniform(Uniforms.FocalLengths, focalLengths);

            if (weights.length > MAX_TEX_PER_CALL) {
                throw new Error(`Can't have more than ${MAX_TEX_PER_CALL}`);
            }
            if (weights.length < MAX_TEX_PER_CALL) {
                let packed_weights = [...weights];
                while (packed_weights.length < MAX_TEX_PER_CALL) {
                    packed_weights.push(PaddingWeight);
                }
                mat.setUniform(Uniforms.Weights, packed_weights, 'fv1');
            } else {
                mat.setUniform(Uniforms.Weights, weights, 'fv1');
            }

            mat.setUniform(Uniforms.Distortions, distortions);
            mat.setUniform(Uniforms.NTextures, capturedImages.length, 'int');
            // mat.setHomogenize(false);
            // mat.threejs.needsUpdate=true;
            // mat.setUniform(Uniforms.referenceValueStep, 1.0/(referenceTextures.length-1));
        } catch (error){
            console.error(error);
        }
    }
}

@ASerializable("ViewReprojectionShaderModel")
export class ViewReprojectionShaderModel extends MixTexturesShaderModel{
    ShaderMaterialClass:ClassInterface<MixTexturesShaderMaterial>=ViewReprojectionShaderMaterialWithDistortion;
    constructor(shader_name?:string, shaderSettings?:ShaderMaterialParameters, ){
        super(
            shader_name??SHADER_NAME,
            {
                side: THREE.DoubleSide,
                ...shaderSettings
            }
        );
    }
    CreateMaterial(...args:any[]){
        return super.CreateMaterial(...args);
    }
}

