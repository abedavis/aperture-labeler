import {ACameraModel} from "./index";
import {_ANodeView} from "../nodeView";
import * as THREE from "three";
import {ASerializable} from "../../base";
import {ANodeModel} from "../nodeModel";

@ASerializable("ACameraView")
export class ACameraView extends _ANodeView{

    static Create(model:ACameraModel){
        let cameraView = new ACameraView();
        cameraView.setModel(model);
        return cameraView;
    }

    get threejs():THREE.Camera{
        return this._threejs as THREE.Camera;
    }

    get model():ACameraModel{
        return this._model as ACameraModel;
    }

    setModel(model: ACameraModel) {
        super.setModel(model);
        this.update();
    }

    // setModelListeners(){
    //     const self=this;
    //     this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_STATE_LISTENER, false);
    //     this.subscribe(this.model.addStateListener(()=>{self.update()}));
    //     this.unsubscribe(BASIC_VIEW_SUBSCRIPTIONS.MODEL_RELEASE_LISTENER, false);
    //     this.subscribe(this.model.addEventListener(ANodeModel.Events.RELEASE, ()=>{self.dispose()}));
    // }

    init():void{
        this.threejs.matrixAutoUpdate=false;
    }

    // updateTransform() {
    //     this.update();
    // }

    update():void{
        // this.model.camera.getProjection().assignTo(this.threejs.projectionMatrix);
        // this.model.camera.getProjectionInverse().assignTo(this.threejs.projectionMatrixInverse);
        // this.model.camera.getPose().getMatrix().assignTo(this.threejs.matrix);
        // this.model.camera.getPose().getMatrix().assignTo(this.threejs.matrixWorld);
        // this.threejs.matrixWorldInverse.copy( this.threejs.matrixWorld).invert();
        this.model.camera.getProjection().assignTo(this.threejs.projectionMatrix);
        this.model.camera.getProjectionInverse().assignTo(this.threejs.projectionMatrixInverse);
        this.model.transform.getMat4().assignTo(this.threejs.matrix);
        this.model.transform.getMat4().assignTo(this.threejs.matrixWorld);
        this.threejs.matrixWorldInverse.copy( this.threejs.matrixWorld).invert();
    }

    dispose(): void {
    }

    protected _initializeThreeJSObject(): void {
        this._threejs = this.model.camera.CreateThreeJSCamera();
    }

}
