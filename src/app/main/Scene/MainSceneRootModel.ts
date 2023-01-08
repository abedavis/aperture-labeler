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
import {ASceneModelWithIBRData} from "../../../AIBR/ASceneModelWithIBRData";
import {IBRSceneData, IBRDataModel} from "../../../AIBR";
import * as IBRShaders from "../../../AIBR/IBRShaders"

let appState = GetAppState();
export class MainSceneRootModel extends ASceneModel implements ASceneModelWithIBRData{
    _ibrDataModel!:IBRDataModel;
    get ibrData():IBRSceneData{
        return this.ibr.sceneData;
    }

    get ibr():IBRDataModel{
        return this._ibrDataModel;
    }

    setIBRDataModel(dataModel:IBRDataModel){
        this._ibrDataModel = dataModel;
    }

    async PreloadAssets() {
        await super.PreloadAssets();
        await this.materials.loadShaderModel(DefaultMaterials.RGBA_SHADER)
        await IBRShaders.LoadIBRShaders();
        this.initCamera();
        this.addChild(this.cameraModel);
    }

    // get children():ANodeModel3D[]{
    //     return this._children as ANodeModel3D[];
    // }

    initCamera() {
        this.cameraModel = ACameraModel.CreatePerspectiveFOV(90, 1, AppConfigs.ZNEAR, AppConfigs.ZFAR);
        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                V3(0.0, -AppConfigs.CameraDefaultHeight, AppConfigs.CameraDefaultHeight), V3(0,0,0),
                V3(0,0,1)
            )
        )
    }



    async initScene() {
        // let ibrDataModel = await IBRDataModel.CreateForScene("./ibrscenes/TreeNewold/");
        // let ibrDataModel = await IBRDataModel.CreateForScene("./ibrscenes/CGTest/");
        let ibrDataModel = await IBRDataModel.CreateForScene("./ibrscenes/TestLF/");
        // let ibrDataModel = await IBRDataModel.CreateForScene("./ibrscenes/testscene1/images/");
        // let ibrDataModel = await IBRDataModel.CreateForScene("./ibrscenes/testscene2/images/");
        // let ibrDataModel = await IBRDataModel.CreateForScene("./ibrscenes/BalconyTest/");
        this.setIBRDataModel(ibrDataModel);
        this.addChild(this.ibr);
        this.ibr.setVirtualCamera(this.camera);
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


