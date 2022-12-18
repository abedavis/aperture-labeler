import {ASerializable, V3, VertexArray3D} from "../../../../anigraph";
import {TriangleMeshCharacterModel} from "../CharacterNodes/TriangleMeshCharacterModel";
import {ATexture} from "../../../../anigraph/rendering/ATexture";
import {AppConfigs} from "../../../AppConfigs";
import {CharacterModel} from "../../../BaseClasses";

@ASerializable("PlayerModel")
export class PlayerModel extends TriangleMeshCharacterModel{
    size!:number;
    static async Create(diffuseMap:string|ATexture, size?:number, ...args:any[]){
        size = size??AppConfigs.DefaultBotSize;
        let newmodel = new this();
        newmodel.size = size;
        await newmodel.init(diffuseMap);
        return newmodel;
    }

    async init(diffuseMap:string|ATexture, ...args:any[]){
        this.setMaterial(CharacterModel.ShaderModel.CreateMaterial(
            (diffuseMap instanceof ATexture)? diffuseMap:new ATexture(diffuseMap)
        ));
    }
}



