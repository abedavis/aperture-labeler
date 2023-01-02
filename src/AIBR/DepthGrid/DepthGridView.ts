import { AGraphicElement, ANodeView, ASerializable, VertexArray3D } from "src/anigraph";

@ASerializable("IBRSceneView")
export class DepthGridView extends ANodeView {
    grid!: AGraphicElement
    init(): void {
        this.grid = AGraphicElement.Create(
            VertexArray3D.IndexedGrid(2, 2, 100, 100),
            this.model.material
        );
        this.addGraphic(this.grid);
        this.update();
    }
    update(): void {
        this.setTransform(this.model.transform.getMat4());
    }
}