import { AGraphicElement, ANodeView, ASerializable, ATriangleMeshGraphic, VertexArray3D } from "src/anigraph";
import { DepthGridModel } from "./DepthGridModel";
import * as IBRShaders from "../IBRShaders"

@ASerializable("IBRSceneView")
export class DepthGridView extends ANodeView {
    grid!: AGraphicElement

    get model():DepthGridModel{
        return this._model as DepthGridModel;
    }

    init(): void {
        this.grid = AGraphicElement.Create(
            VertexArray3D.IndexedGrid(2, 2, 100, 100),
            this.model.material
        );
        this.grid.setTransform(this.model.transform);
        this.addGraphic(this.grid);
        const frustEl = new ATriangleMeshGraphic();
        const material = IBRShaders.CreateMaterial(IBRShaders.ShaderNames.Basic).threejs;
        material.wireframe = true;
        frustEl.init(
            VertexArray3D.FrustumFromProjectionMatrix(this.model.capturedImage.camera.getMatrix(), 0.25),
            material
        );
        frustEl.setTransform(this.model.transform);
        // frustEl.setTransform(v.pose);
        // this._guiCameraFrustaGroup.add(frustEl);
        this.addGraphic(frustEl);

        this.subscribe(this.model.addEventListener("visibilityChanged", () => { this.update() }));
        this.update();
    }

    update(): void {
        this.threejs.visible = this.model.visible;
    }
}