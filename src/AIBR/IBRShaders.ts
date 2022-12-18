import {ABasicMaterialModel, AMaterialManager, AShaderMaterial} from "../anigraph";
import {WebGLRenderTargetOptions} from "three/src/renderers/WebGLRenderTarget";
import * as THREE from "three";
import {BasicTextureShaderModel} from "../anigraph/rendering/material/shadermodels";
import {ViewReprojectionShaderModel} from "../AIBRold/shadermodels";

enum ShaderNames{
    ViewReprojection='ViewReprojection',
    Basic='Basic',
    BasicTexture='BasicTexture',
}


const MaterialManager = new AMaterialManager();

function CreateMaterial(modelName:string, ...args:any[]){
    return MaterialManager.CreateMaterial(modelName, ...args) as AShaderMaterial;
}


function CreateRenderTargetFloat(width:number, height:number, options?:WebGLRenderTargetOptions){
    // if(this.getTarget(name)){
    //     throw new Error(`Target "${name} already created!"`);
    // }
    let defaultOptions = {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    }
    let op = defaultOptions;
    if(options){
        op = {...op, ...options};
    }
    return new THREE.WebGLRenderTarget(width,height,{
        ...op,
    });
}

var shadersLoaded:boolean=false;
async function LoadIBRShaders(){
    if(!shadersLoaded) {
        await MaterialManager.setMaterialModel(ShaderNames.Basic, new ABasicMaterialModel());
        await MaterialManager.setMaterialModel(ShaderNames.BasicTexture, new BasicTextureShaderModel());
        await MaterialManager.setMaterialModel(ShaderNames.ViewReprojection, new ViewReprojectionShaderModel());

        shadersLoaded=true;
    }
}
export {
    ShaderNames,
    MaterialManager,
    CreateMaterial,
    LoadIBRShaders, CreateRenderTargetFloat
};
