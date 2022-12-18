/**
 * @file Main scene model
 * @description Scene model for your application
 */

import {
    ACameraModel,
    AInteractionEvent, AModel, ANodeModel3D, ASceneModel,
    Color, DefaultMaterials,
    GetAppState,
    NodeTransform3D, Quaternion,
    V3,
    Vec2, Vec3
} from "../../../anigraph";
import { ATexture} from "../../../anigraph";
import {AppConfigs} from "../../AppConfigs";
import {ASceneModelWithIBR} from "../../../AIBR/ASceneModelWithIBR";


let appState = GetAppState();
export class MainSceneModel extends ASceneModel implements ASceneModelWithIBR{
    async PreloadAssets() {
        await super.PreloadAssets();
        await this.materials.loadShaderModel(DefaultMaterials.RGBA_SHADER)
        this.initCamera();
        this.addChild(this.cameraModel);
    }

    // get children():ANodeModel3D[]{
    //     return this._children as ANodeModel3D[];
    // }


    initCamera() {
        this.cameraModel = ACameraModel.CreatePerspectiveFOV(90, 1, 0.01, 10);
        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                V3(0.0, -AppConfigs.CameraDefaultHeight, AppConfigs.CameraDefaultHeight), V3(0,0,0),
                V3(0,0,1)
            )
        )
    }



    async initScene() {
    }

    timeUpdate(t: number, ...args:any[]) {

        /**
         * We can call timeUpdate on all of the model nodes in the scene here, which will trigger any updates that they
         * individually define.
         */
        for(let c of this.getDescendantList()){
            c.timeUpdate(t);
        }
    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


