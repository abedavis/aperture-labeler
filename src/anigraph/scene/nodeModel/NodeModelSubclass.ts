import {Mat4, TransformationInterface} from "../../math";
import {VertexArray} from "../../geometry";
import {ANodeModel} from "./ANodeModel";

export abstract class ANodeModelSubclass<TransformType extends TransformationInterface, VertexArrayType extends VertexArray<any>> extends ANodeModel{
    get transform():TransformType{
        return this._transform as TransformType;
    };
    abstract setTransform(transform:TransformationInterface):void;

    protected set transform(t:TransformType){
        this.setTransform(t);
    }

    get verts(): VertexArrayType{
        return this._geometry.verts as VertexArrayType;
    }

    _setVerts(verts: VertexArrayType) {
        this._geometry.verts=verts;
    }
    setVerts(verts: VertexArrayType) {
        this._setVerts(verts);
        this.signalGeometryUpdate();
    }

    constructor(verts?:VertexArrayType, transform?:TransformType) {
        super();
        if(transform !== undefined){
            this.transform = transform;
        }else{
            //setTransform can always take a TransformationInterface, so we can use it here regardless of TransformType
            this.setTransform(new Mat4());
        }
        if(verts !== undefined){
            this._setVerts(verts);
        }
    }

    /**
     * Returns the transform from object coordinates (the coordinate system where this.verts is
     * defined) to world coordinates
     * @returns {TransformType}
     */
    getWorldTransform():TransformType{
        let parent = this.parent;
        if(parent && parent instanceof ANodeModelSubclass){
            return parent.getWorldTransform().getMat4().times(this.transform.getMat4());
        }else{
            return this.transform;
        }
    }

}
