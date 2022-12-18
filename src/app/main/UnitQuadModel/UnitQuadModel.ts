import {AMaterial, ANodeModel3D, ASerializable, Mat4, NodeTransform3D, VertexArray3D} from "../../../anigraph";

@ASerializable("AUnitQuadModel")
export class UnitQuadModel extends ANodeModel3D{
    matrix!:Mat4;
    constructor(material:AMaterial, transform?:NodeTransform3D, ...args:any) {
        super(undefined, transform);
        this.setMaterial(material);
        this.matrix = new Mat4();
    }
}

