import * as THREE from "three";
import {V3, Mat4, TransformationInterface, NodeTransform3D,} from "../index";
import {HasBounds} from "./HasBounds";
import {VertexArray3D} from "./VertexArray3D";
import {BoundingBox3D} from "./BoundingBox3D";
import { ref } from "valtio";
import {AObject, ASerializable} from "../base";
import {GetDeepTHREEJSClone} from "../rendering";

@ASerializable("AObject3DModelWrapper")
export class AObject3DModelWrapper extends AObject implements HasBounds {
  public object: THREE.Object3D;
  // protected _sourceTransform: TransformationInterface;
  protected _sourceTransform: NodeTransform3D;

  get sourceTransform() :NodeTransform3D{
    return this._sourceTransform;
  }

  // get sourceScale() {
  //   return this.sourceTransform.scale;
  // }

  // get uid() {
  //   return this.object.uuid;
  // }
  constructor(object: THREE.Object3D) {
    super(object.uuid);
    this.object = ref(object);
    this.object.matrixAutoUpdate = false;
    // this._sourceTransform = new Mat4();
    this._sourceTransform = new NodeTransform3D();
  }

  getNewSceneObject(wrapInGroup:boolean=false, deepCopy?:boolean, scale?:number) {
    let obj: THREE.Object3D;
    if(deepCopy){
      obj = GetDeepTHREEJSClone(this.object);
    }else {
      if (this.object instanceof THREE.Mesh) {
        obj = new THREE.Mesh(this.object.geometry, this.object.material);
      } else {
        obj = this.object.clone();
      }
    }
    obj.matrixAutoUpdate = false;
    if(scale===undefined) {
      this.sourceTransform.assignTo(obj.matrix);
    }else{
      (this.sourceTransform.getMatrix() as Mat4).times(Mat4.Scale3D(scale)).assignTo(obj.matrix);
    }
    if(wrapInGroup){
      let group = new THREE.Group();
      group.matrixAutoUpdate=false;
      group.add(obj);
      return group;
    }else {
      return obj;
    }
  }

  setSourceScale(sourceScale:number){
    this._sourceTransform.scale=sourceScale;
    // Mat4.Scale3D(sourceScale).assignTo(this.object.matrix);
    this._sourceTransform.getMatrix().assignTo(this.object.matrix);
  }

  getBoundingBoxVertexArray() {
    return VertexArray3D.BoundingBoxMeshVertsForObject3D(this.object);
  }

  // setSourceScale(sourceScale: number) {
  //   this._sourceTransform.scale = sourceScale;
  //   // Mat4.Scale3D(sourceScale).assignTo(this.object.matrix);
  //   this._sourceTransform.getMatrix().assignTo(this.object.matrix);
  // }

  set sourceTransform(v: TransformationInterface) {
    if(v instanceof NodeTransform3D) {
    this._sourceTransform = v;
    }else{
      this._sourceTransform = NodeTransform3D.FromMatrix(v.getMat4());
    }
    this._sourceTransform.assignTo(this.object.matrix);
  }

  getBounds(): BoundingBox3D {
    let threebox = new THREE.Box3().setFromObject(this.object);
    let bounds = new BoundingBox3D();
    bounds.minPoint = V3(threebox.min.x, threebox.min.y, threebox.min.z);
    bounds.maxPoint = V3(threebox.max.x, threebox.max.y, threebox.max.z);
    return bounds;
  }
  // getBounds(){
  //     return this.getBounds3D();
  // }
}
