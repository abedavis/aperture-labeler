import {AShaderModel} from "../material";
import {ATexture} from "../ATexture";
import {ShaderMaterialParameters} from "three/src/materials/ShaderMaterial";
import {AAppState, GetAppState} from "../../base";
import {ABasicShaderModel} from "./ABasicShaderModel";

export class ABasicTexturedShaderModel extends ABasicShaderModel{
    CreateMaterial(diffuseTexture?:ATexture, ...args:any[]){
        let mat = super.CreateMaterial(...args);
        if(diffuseTexture !== undefined) {
            mat.setTexture('diffuse', diffuseTexture);
        }
        return mat;
    }
}



