import {ANodeModel2D, ANodeModel3D, ASceneModel, Color, GetAppState} from "../../anigraph";
import {ACameraModel, DefaultMaterials} from "../../anigraph";
import {APointLightModel} from "../../anigraph/scene/lights";
import {CharacterModel} from "./CharacterModel";
let appState = GetAppState();

enum BaseSceneModelSubscriptions{
    VIEW_LIGHT_UPDATE="VIEW_LIGHT_UPDATE"
}

export abstract class BaseSceneModel extends ASceneModel {
    static BaseSceneModelSubscriptionKeys=BaseSceneModelSubscriptions;

    // abstract player:ANodeModel3D;
    abstract _player:CharacterModel;
    get player(){
        return this._player;
    }
    set player(v:CharacterModel){
        this._player = v;
    }


    viewLight!:APointLightModel;
    get children():ANodeModel3D[]{
        return this._children as ANodeModel3D[];
    }

    async PreloadAssets() {
        await super.PreloadAssets();
        await this.materials.loadShaderModel(DefaultMaterials.RGBA_SHADER)
        this.initCamera();
        this.addChild(this.cameraModel);
    }

    initViewLight(){
        this.viewLight = new APointLightModel(this.camera.pose, Color.FromString("#ffffff"),1, 1, 1);
        this.addChild(this.viewLight)
        this.attachViewLightToCamera();
    }

    attachViewLightToCamera(){
        const self = this;
        this.subscribe(this.camera.addPoseListener(()=>{
            self.viewLight.setTransform(self.camera.transform);
        }), BaseSceneModel.BaseSceneModelSubscriptionKeys.VIEW_LIGHT_UPDATE);
    }
    detachViewLightFromCamera(){
        this.unsubscribe(BaseSceneModel.BaseSceneModelSubscriptionKeys.VIEW_LIGHT_UPDATE);
    }

    // initCamera() {
    //     this.cameraModel = ACameraModel.CreatePerspectiveFOV(90, 1, 0.01, 10);
    // }

    abstract initCamera():void;

    abstract timeUpdate(t: number, ...args:any[]): void;

}

