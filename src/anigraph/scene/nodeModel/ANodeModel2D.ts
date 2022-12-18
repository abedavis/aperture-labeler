import {Color, Mat3, TransformationInterface} from "../../math";
import {BoundingBox2D, BoundingBox3D, HasBounds2D, VertexArray2D} from "../../geometry";
import {ANodeModelSubclass} from "./NodeModelSubclass";

export class ANodeModel2D extends ANodeModelSubclass<Mat3, VertexArray2D> implements HasBounds2D{
    _zValue:number=0;
    /** Get set zValue */
    set zValue(value){
        this._zValue = value;
        this.signalGeometryUpdate();
    }
    get zValue(){return this._zValue;}
    constructor() {
        super();
        this._transform = new Mat3();
        this._setVerts(new VertexArray2D());
    }

    get transform(): Mat3 {
        return this._transform as Mat3;
    }


    setTransform(transform:TransformationInterface){
        if(transform instanceof Mat3){
            this._transform = transform;
            return;
        }else {
            let m3 = new Mat3();
            let m4 = transform.getMat4()
            m3.m00 = m4.m00;
            m3.m10 = m4.m10;
            m3.m01 = m4.m01;
            m3.m11 = m4.m11;
            m3.c2 = m4.c3.Point3D;
            this._transform = m3;
        }
        // this.signalTransformUpdate();
    }

    /**
     * Right now, bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox2D}
     */
    getBounds(): BoundingBox2D {
        let b = this.verts.getBounds().getBoundsXY();
        b.transform = this.transform;
        return b;
    }

    /**
     * Right now, bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox2D}
     */
    getBounds2D(): BoundingBox2D {
        let b = this.verts.getBounds().getBoundsXY();
        b.transform = this.transform;
        return b;
    }

    /**
     * Right now, bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBounds3D(): BoundingBox3D {
        let b = this.verts.getBounds();
        b.transform = this.transform.Mat4From2DH();
        return b;
    }

    /**
     * Right now, bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBoundsXY(): BoundingBox2D {
        return this.getBounds();
    }
}




