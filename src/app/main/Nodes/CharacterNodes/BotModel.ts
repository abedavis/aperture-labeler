import {ATexture} from "../../../../anigraph/rendering/ATexture";
import {ASerializable, V3, VertexArray3D} from "../../../../anigraph";
import {CharacterModel} from "../../../BaseClasses";
import {TriangleMeshCharacterModel} from "./TriangleMeshCharacterModel";
import {AppConfigs} from "../../../AppConfigs";

@ASerializable("BotModel")
export class BotModel extends TriangleMeshCharacterModel{

    /**
     * Creates a new bot model to be textured with the provided diffuse texture map.
     * @param diffuseMap
     * @param size
     * @param args
     * @returns {Promise<BotModel>}
     * @constructor
     */
    static async Create(diffuseMap:string|ATexture, size?:number, ...args:any[]){
        size = size??AppConfigs.DefaultBotSize;

        /**
         * Set the vertices to be a box. The Box3D helper function creates box geometry based on opposite corners,
         * specifically the minimumum and maximum x,y,z coordinate values for an axis-aligned box
         */
        let verts = VertexArray3D.Box3D(
            V3(-0.5,-0.5,0).times(size),
            V3(0.5,0.5,1.0).times(size)
        );

        /**
         * Create the new bot model, initialize it with the provided diffuse map, and return it when that is done
         * @type {BotModel}
         */
        let newmodel = new this(verts);
        await newmodel.init(diffuseMap);
        return newmodel;
    }

    async init(diffuseMap:string|ATexture, ...args:any[]){
        /**
         * The diffuseMap input can be an ATexture object or a path to a texture. If it is a path, then we load the
         * corresponding texture into an ATexture object
         * @type {ATexture}
         */
        let texture = (diffuseMap instanceof ATexture)? diffuseMap:await ATexture.LoadAsync(diffuseMap);

        /**
         * Sets the material for our model to the corresponding AShaderMaterial instance, with the provided texture as
         * the diffuse texture.
         */
        this.setMaterial(CharacterModel.ShaderModel.CreateMaterial(
            texture
        ));
    }

}


