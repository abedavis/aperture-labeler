import {AShaderMaterial, AShaderModel, ATexture, ShaderManager, V2, Vec2} from "../../anigraph";
import {
    ASerializable,
    ClassInterface,
    Mat4
} from "../../anigraph";
import type {ShaderMaterialParameters} from "three/src/materials/ShaderMaterial";
import {IBRCapturedImage} from "../IBRCapturedImage";
import * as THREE from "three";
import { ADataTextureFloat1D } from "src/anigraph/rendering/image";

const SHADER_NAME = 'planewithdepth';
ShaderManager.LoadShader(SHADER_NAME, `ibr_depth/${SHADER_NAME}.vert.glsl`, `ibr_depth/${SHADER_NAME}.frag.glsl`);
const PaddingWeight = 0;

enum Uniforms{
    Poses="poses",
    Projections="projections",
    Distortions="distortions",
    Weights="weights",
    NTextures="nTextures",
    DeviceOrientations="deviceOrientations",
    ViewMatrixInv="viewMatrixInv"
}

@ASerializable("DepthGridShaderMaterial")
export class DepthGridShaderMaterial extends AShaderMaterial {
    setDepthMap(depthMap: ADataTextureFloat1D) {
        this.setTexture("depth", depthMap);
    }
}

@ASerializable("DepthGridShaderModel")
export class DepthGridShaderModel extends AShaderModel {
    ShaderMaterialClass:ClassInterface<AShaderMaterial>=DepthGridShaderMaterial;
    constructor(shader_name?:string, shaderSettings?:ShaderMaterialParameters){
        super(
            shader_name??SHADER_NAME,
            {
                side: THREE.DoubleSide,
                ...shaderSettings
            }
        );
    }
    CreateMaterial(image: ATexture, depthMap: ATexture, captureImageProjectionMatrix: Mat4){
        const mat = super.CreateMaterial();
        mat.setBlendingMode(THREE.AdditiveBlending);
        mat.threejs.transparent = true;
        mat.setTexture("input", image);
        mat.setTexture("depth", depthMap);
        mat.setUniform("captureCameraProjMat", captureImageProjectionMatrix)
        return mat;
    }
}
