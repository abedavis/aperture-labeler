import {Mat4, Matrix, Quaternion, Vec3} from "./linalg";
import * as THREE from "three";

export interface TransformationInterface {
    getMatrix(): Matrix;
    getMat4(): Mat4;
    assignTo(threejsMat:THREE.Matrix4):void;
    setPosition(position:Vec3):void;
    getPosition():Vec3;
    _getQuaternionRotation():Quaternion;
    _setQuaternionRotation(q:Quaternion):void;
}
