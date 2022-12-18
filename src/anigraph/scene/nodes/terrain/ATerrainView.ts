import {ATriangleMeshModel, ATriangleMeshView} from "../trianglemesh";
import {ANodeView} from "../../nodeView";
import {ATriangleMeshGraphic} from "../../../rendering";
import {ANodeModel} from "../../nodeModel";
import {ATerrainModel} from "./ATerrainModel";
import {APlaneGraphic} from "../../../rendering/graphicelements/APlaneGraphic";

export class ATerrainView extends ANodeView{
    graphicElement!:APlaneGraphic;

    get model():ATerrainModel{
        return this._model as ATerrainModel;
    }

    static Create(model:ANodeModel, ...args:any[]){
        let view = new ATerrainView();
        view.setModel(model);
        return view;
    }

    init(){
        this.graphicElement = APlaneGraphic.Create(this.model, this.model.material);
        this.addGraphic(this.graphicElement);
        this.setTransform(this.model.transform);
    }

    update(): void {
        // this.graphicElement.setTransform(this.model.transform);
        // this.graphicElement.setTransform(this.model.getWorldTransform());
        this.setTransform(this.model.transform);
    }

}

