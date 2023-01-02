import { text } from "d3";
import { ANodeModel3D, ASerializable, ATexture, NodeTransform3D } from "src/anigraph";
import { ADataTextureFloat4D } from "src/anigraph/rendering/image";
import { IBRCapturedImage } from "../IBRCapturedImage";
import { DepthGridShaderModel } from "../shadermodels/DepthGridShaderModel";

@ASerializable("IBRSceneModel")
export class DepthGridModel extends ANodeModel3D {
    capturedImage: IBRCapturedImage
    // depthMap!: ADataTextureFloat4D
    depthMap!: ATexture

    constructor(capturedImage: IBRCapturedImage) {
        super();
        this.capturedImage = capturedImage;
        this.setTransform(capturedImage.pose);
    }

    static ShaderModel:DepthGridShaderModel;
    static async LoadShader(...args:any[]){
        this.ShaderModel = await DepthGridShaderModel.CreateModel("planewithdepth");
    }

    async registerDepthMap(path: string) {
        this.depthMap = await ATexture.LoadAsync(path);
        this.depthMap.setWrapToClamp();
    }

    static async Create(capturedImage: IBRCapturedImage) {
        if(this.ShaderModel === undefined){
            await this.LoadShader();
        }

        const grid = new this(capturedImage);
        const depthMapPath = `ibrscenes/TestLF/depth_maps/${capturedImage.filePath}.geometric.jpeg`;
        await grid.registerDepthMap(depthMapPath);

        grid.setMaterial(
            this.ShaderModel.CreateMaterial(capturedImage.texture, grid.depthMap, capturedImage.camera.getMatrix())
        );
        return grid;
    }

}