import {ANodeView} from "../../nodeView";
import {ATriangleMeshGraphic} from "../../../rendering";
import {ANodeModel} from "../../nodeModel";

export class AMeshNodeView extends ANodeView{
    meshGraphic!:ATriangleMeshGraphic;

    static Create(model:ANodeModel){
        let view = new AMeshNodeView();
        view.setModel(model);
        return view;
    }

    init(){
        this.meshGraphic = new ATriangleMeshGraphic(this.model.verts, this.model.material.threejs);
        this.addGraphic(this.meshGraphic);
    }

    update(): void {
        throw new Error("child class should define this")
        this.setTransform(this.model.transform);
    }
}
