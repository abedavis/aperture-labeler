import {ANodeModel3D} from "../../nodeModel";
import {AObjectState, ASerializable} from "../../../base";
import {NodeTransform3D, Vec3} from "../../../math";
import {AObject3DModelWrapper, VertexArray3D} from "../../../geometry";
import * as THREE from "three";
import {Loader} from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader";
import {AMaterial} from "../../../rendering";

@ASerializable("ALoadedModel")
export class ALoadedModel extends ANodeModel3D{
    @AObjectState sourceTransform:NodeTransform3D;
    get sourceScale(){
        return this.sourceTransform.scale
    }
    set sourceScale(v:number|Vec3){
        this.sourceTransform.scale=v;
    }

    get verts(){return this.geometry.verts as VertexArray3D;}
    set verts(v:VertexArray3D){this.geometry.verts = v;}
    loadedObjects:AObject3DModelWrapper[]=[];

    constructor(obj:THREE.Object3D|AObject3DModelWrapper, material?:AMaterial, sourceScale:number=1) {
        super();
        let object = obj;
        this.sourceTransform = new NodeTransform3D();
        if(material){
            this.setMaterial(material);
        }
        if(obj instanceof THREE.BufferGeometry) {
            if(obj.attributes.normal == undefined){
                obj.computeVertexNormals()
            }
            let threemesh = new THREE.Mesh(
                obj,
                this.material.threejs
            );
            object = new AObject3DModelWrapper(threemesh);
        }else if(obj instanceof THREE.Mesh || obj instanceof THREE.Group){
            object = new AObject3DModelWrapper(obj);
        }else if (obj instanceof AObject3DModelWrapper) {
            object = obj;
        }else{
            throw new Error(`Unrecognized loaded object ${obj} of type ${typeof obj}`);
        }
        this.addLoadedObject(object);
        this.sourceScale=sourceScale;
        const self = this;
        this.subscribe(this.addStateKeyListener('sourceTransform', ()=>{
            self.geometry.sourceTransform = self.sourceTransform;
        }), 'loadedmodel.sourceTransform');
    }

    addLoadedObject(object:AObject3DModelWrapper){
        this.geometry.addMember(object);
        this.loadedObjects.push(object);
    }



}
