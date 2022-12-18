import {AShaderModel} from "../material";
import {AAppState, GetAppState} from "../../base";

export class ABasicShaderModel extends AShaderModel{
    static async CreateModel(shaderName?:string, ...args:any[]){
        if(shaderName === undefined){
            shaderName = "basic";
        }
        await AShaderModel.ShaderSourceLoaded(shaderName);
        return new this(shaderName, ...args);
    }

    CreateMaterial(...args:any[]){
        let appState = GetAppState();
        let mat = super.CreateMaterial();
        function setAmbient(){
            mat.setUniform('ambient', appState.getState(AAppState.AppStateDefaultKeys.AmbientLight));
        }
        setAmbient();
        mat.subscribe(appState.addStateValueListener(AAppState.AppStateDefaultKeys.AmbientLight, ()=>{
            setAmbient();
        }), "ambient_update");

        mat.setUniform('diffuse', 1.0);
        return mat;
    }
}



