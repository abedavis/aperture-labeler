import {AGraphicElement, ANodeView} from "../../../../anigraph";
import {UnitQuadModel} from "./UnitQuadModel";

export class UnitQuadView extends ANodeView{
    quad!:AGraphicElement
    get model():UnitQuadModel{
        return this._model as UnitQuadModel;
    }
    init(){
        this.quad = AGraphicElement.CreateSimpleQuad(this.model.material);
        this.addGraphic(this.quad);
        this.update();
    }

    update(): void {
        this.setTransform(this.model.matrix.times(this.model.transform.getMat4()));
    }
}
