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
import {IBRSceneData, IBRDataModel, IBRCapturedImage} from "../../../AIBR";
import * as IBRShaders from "../../../AIBR/IBRShaders"
import { DepthGridModel } from "src/AIBR/DepthGrid/DepthGridModel";

let appState = GetAppState();
export class MainSceneRootModel extends ASceneModel implements ASceneModelWithIBRData {
    depthGrids: DepthGridModel[] = [];

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
        this.setIBRDataModel(ibrDataModel);
        this.ibr.setVirtualCamera(this.camera);



        this.depthGrids = []
        this.ibrData.capturedImages.slice(0, 5).forEach(async (capture: IBRCapturedImage) => {
            const depthGrid = await DepthGridModel.Create(capture);
            depthGrid.visible = false;
            depthGrid.material.setTexture("paint", this.ibr.paintedDepthMap);
            this.addChild(depthGrid);
            this.depthGrids.push(depthGrid);
        })

        this.cameraModel.setPose(this.ibrData.capturedImages[0].pose);
    }

    timeUpdate(t: number, ...args:any[]) {

        /**
         * We can call timeUpdate on all of the model nodes in the scene here, which will trigger any updates that they
         * individually define.
         */
        for(let c of this.getDescendantList()){
            c.timeUpdate(t);
        }
        this.depthGrids.forEach((grid: DepthGridModel) => {
            grid.material.setUniform("depth", this.ibr.focusDistance);
        })
    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }

    setVisibleForDepthGridAt(idx: number) {
        this.depthGrids.forEach((grid: DepthGridModel, i: number) => {
            if (i === idx) {
                grid.visible = true;
            } else {
                grid.visible = false;
            }
        })
    }

    setOccupancyRendering(val: boolean) {
        this.depthGrids.forEach((grid: DepthGridModel) => {
            grid.material.setUniform("isOccupancy", val);
        })
    }
}


