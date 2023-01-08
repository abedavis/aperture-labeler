import * as THREE from "three";
import {ACamera, Mat4} from "../../../anigraph";
export class PostProcessingCamera extends ACamera{

    static DefaultThreeJSCamera():THREE.OrthographicCamera{
        let cam = new THREE.OrthographicCamera();
        Mat4.Identity().assignTo(cam.projectionMatrix);
        return cam;
    }

    _threejs!:THREE.OrthographicCamera;
    get threejs(){
        return this._threejs;
    }

    setThreeJS(threecam:THREE.OrthographicCamera){
        this._threejs=threecam;
        this.threejs.matrixAutoUpdate=false;
        const self = this;
        let updatePose = function(){
            self.getPose().getMatrix().assignTo(self.threejs.matrix);
            self.threejs.updateWorldMatrix(false, true);
        }

        let updateProjection = function(){
            self.getProjection().assignTo(self.threejs.projectionMatrix);
            self.getProjectionInverse().assignTo(self.threejs.projectionMatrixInverse);
        }
        this.addPoseListener(updatePose);
        this.addProjectionListener(updateProjection);
        updatePose();
        updateProjection();
    }

    constructor(threeCamera?:THREE.OrthographicCamera) {
        super();
        if(threeCamera) {
            this.setWithThreeJSCamera(threeCamera)
            this.setThreeJS(threeCamera);
        }else{
            this.setThreeJS(PostProcessingCamera.DefaultThreeJSCamera())
        }
    }


}