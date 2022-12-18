import {NodeTransform3D, Quaternion, Vec3} from "../anigraph";

export class CameraPose extends NodeTransform3D{
    constructor(position?: Vec3, rotation?: Quaternion){
        super(position, rotation);
    }
}
