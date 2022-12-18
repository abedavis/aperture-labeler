import {ANodeModel3D, AObjectState, V3, Vec3} from "../../anigraph";
import {Particle3D} from "../../anigraph/physics/AParticle3D";
import {CharacterShaderModel} from "./CharacterShaderModel";



export class CharacterModel extends ANodeModel3D implements Particle3D{
    static ShaderModel:CharacterShaderModel;
    static async LoadShader(...args:any[]){
        CharacterModel.ShaderModel = await CharacterShaderModel.CreateModel("basic")
    }
    mass:number=1;
    velocity:Vec3 = V3();
    get position(){
        return this.transform.position;
    }
    set position(value:Vec3){
        this.transform.position = value;
    }
}

export interface CharacterModelInterface extends CharacterModel{
}
