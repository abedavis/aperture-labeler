import {ABasicTexturedShaderModel} from "../../anigraph/rendering/shadermodels/ABasicTexturedShaderModel";
import {ATexture} from "../../anigraph/rendering/ATexture";
import {AShaderMaterial, AShaderModelBase} from "../../anigraph";

export class CharacterShaderModel extends ABasicTexturedShaderModel{
    CreateMaterial(
        diffuseTexture:ATexture,
        ...args:any[]){
        let mat = super.CreateMaterial();
        mat.setTexture('diffuse', diffuseTexture);
        return mat;
    }

    getMaterialGUIParams(material:AShaderMaterial){
        const self = this;
        return {
            ...AShaderModelBase.ShaderUniformGUIColorControl(material, 'modelColor'),
            ...AShaderModelBase.ShaderUniformGUIControl(material, 'diffuse', 1.0, {
                min:0,
                max:5,
                step:0.01
            }),
            ...AShaderModelBase.ShaderTextureGUIUpload(material, 'diffuse'),
        }
    }
}
