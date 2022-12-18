import {Mat4, NodeTransform3D, TransformationInterface} from "../../math";
import {VertexArray3D, BoundingBox2D, BoundingBox3D, HasBounds} from "../../geometry";
import {ANodeModelSubclass} from "./NodeModelSubclass";
import {ASerializable} from "../../base";

@ASerializable("ANodeModel3D")
export class ANodeModel3D extends ANodeModelSubclass<NodeTransform3D, VertexArray3D> implements HasBounds {
    constructor(verts?:VertexArray3D, transform?:NodeTransform3D, ...args:any) {
        super(verts, transform);
        this._setVerts(new VertexArray3D());
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBounds(): BoundingBox3D {
        return this.getBounds3D();
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox2D}
     */
    getBounds2D(): BoundingBox2D {
        let tpoint = new VertexArray3D()
        tpoint.position = this.verts.position.GetTransformedByMatrix(this.transform.getMatrix());
        return tpoint.getBounds().getBoundsXY();
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBounds3D(): BoundingBox3D {
        let b = this.verts.getBounds();
        b.transform = this.transform.getMat4();
        return b;
    }

    /**
     * Bounds are only transformed by the model's current (local) transform
     * @returns {BoundingBox3D}
     */
    getBoundsXY(): BoundingBox2D {
        return this.getBounds3D().getBoundsXY();
    }

    setTransform(transform: TransformationInterface): void {
        if(transform instanceof NodeTransform3D){
            this._transform = transform;
        }else {
            this._transform = NodeTransform3D.FromPoseMatrix(transform.getMat4())
        }
    }

}



