import * as THREE from "three";
import {AModelInterface, AView, HasModelViewMap, MVMViewMap} from "../base";
import {ASceneController} from "./ASceneController";
import {ANodeView} from "./nodeView";
import {ASceneModel} from "./ASceneModel";
import {Color} from "../math";


export class ASceneView extends AView implements HasModelViewMap {
    protected _viewMap: MVMViewMap = {};
    protected _controller!:ASceneController;
    get controller(){return this._controller;}
    get model(){return this.controller.model;}
    get modelID(){return this.model.uid;}
    get viewMap(){return this._viewMap;}
    _threejs!:THREE.Object3D;
    get threejs():THREE.Scene{
        return this._threejs as THREE.Scene;
    }

    setModel(model:ASceneModel){
        throw new Error("Should not setModel directly on scene view. It should access model through the controller.")
    }

    constructor(controller:ASceneController) {
        super();
        this._controller = controller;
        this._threejs = new THREE.Scene();
    }

    hasModel(model:AModelInterface){return this.controller.hasModel(model);};
    hasView(view:AView){
        return (view.uid in this.viewMap[view.modelID]);
    }
    addView(view:AView){
        if(this.viewMap[view.modelID]===undefined){
            this.viewMap[view.modelID]={};
        }
        this.viewMap[view.modelID][view.uid]=view;
        // this.threejs.add(view._threejs);
    }
    removeView(view:AView){
        // this.threejs.remove(view._threejs);
        delete this.viewMap[view.modelID][view.uid];
    }
    getViewListForModel(model:AModelInterface):AView[]{
        if(this.hasModel(model)) {
            return Object.values(this.viewMap[model.uid]);
        }
        else{
            return [];
        }
    }

    setBackgroundColor(color:Color){
        this.threejs.background = color.asThreeJS();
    }

    loadSkyBox(basePath?:string, format:string='.jpg'){
        let path = basePath??'./images/cube/MilkyWay/dark-s_';
        const urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];
        // const urls = [
        //     path + 'nx' + format, path + 'px' + format,
        //     path + 'ny' + format, path + 'py' + format,
        //     path + 'nz' + format, path + 'pz' + format
        // ];
        const reflectionCube = new THREE.CubeTextureLoader().load( urls );
        reflectionCube.rotation = Math.PI*0.25;
        // refractionCube.mapping = THREE.CubeRefractionMapping;
        this.threejs.background = reflectionCube;
    }



}

