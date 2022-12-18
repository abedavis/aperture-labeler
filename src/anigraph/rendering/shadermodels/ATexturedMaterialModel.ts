
import * as THREE from "three";
import {AShaderMaterial, AShaderModel, AShaderModelBase, ShaderManager} from "../material";
import {ASerializable} from "../../base";
import {ATexture} from "../ATexture";
ShaderManager.LoadShader('textured', 'textured/textured.vert.glsl', 'textured/textured.frag.glsl');


@ASerializable("ATexturedMaterialModel")
export class ATexturedMaterialModel extends AShaderModel{
    textureName:string;
    constructor(texture?:string|ATexture) {
        // texture=texture??marble;
        super("textured");
        if(texture instanceof ATexture){
            this.setTexture('color', texture);
            this.textureName = texture.name;
        }else{
            let textureName = texture??'marble.jpg';
            this.textureName=textureName;
            this.setTexture('color', './images/'+this.textureName);
            this.getTexture('color')?.setWrapToRepeat();
        }
        // this.setTexture('normal', undefined);
    }

    CreateMaterial(){
        let mat = super.CreateMaterial();
        mat.setUniform('ambient', 0.2);
        mat.setUniform('exposure', 1.0);
        mat.setUniform('specularExp', 20);
        mat.setUniform('specular', 1.0);
        mat.setUniform('diffuse', 2.5);
        // mat.setTexture('maintexture', './images/'+this.textureName);
        mat.setTexture('color', this.getTexture('color'));
        return mat;
    }

    getMaterialGUIParams(material:AShaderMaterial){
        const self = this;
        return {
            ...self.getTextureGUIParams(material),
            ...AShaderModelBase.ShaderUniformGUIControl(material, 'specular', 1.0, {
                min:0,
                max:5,
                step:0.01
            }),
            ...AShaderModelBase.ShaderUniformGUIControl(material, 'specularExp', 10, {
                min:0,
                max:100,
                step:0.01
            }),
            ...AShaderModelBase.ShaderUniformGUIControl(material, 'diffuse', 1.0, {
                min:0,
                max:5,
                step:0.01
            }),
            ...AShaderModelBase.ShaderUniformGUIControl(material, 'ambient', 1.0, {
                min:0,
                max:2,
                step:0.01
            }),
            ...AShaderModelBase.ShaderUniformGUIControl(material, 'exposure', 1, {
                min:0,
                max:20,
                step:0.01
            })
        }
    }


    _CreateTHREEJS(){
        let uniforms = {uniforms:THREE.UniformsUtils.merge([
                THREE.UniformsLib['lights'],
                {...this.uniforms}
            ])};
        return new this.materialClass({
            vertexShader: this.vertexSource,
            fragmentShader: this.fragSource,
            vertexColors: true,
            ...this.settingArgs,
            ...this.defaults,
            ...uniforms,
            ...this.sharedParameters,
        });
    }

}

