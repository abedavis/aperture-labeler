import {
    AGraphicGroup,
    AMaterial, ANodeView, ASceneController,
    ASerializable, AShaderMaterial,
    ATriangleMeshGraphic, Color, NodeTransform3D, V3, VertexArray3D
} from "../anigraph";
import * as IBRShaders from "./IBRShaders"
import {IBRDataModel} from "./IBRDataModel";
import * as THREE from "three";

@ASerializable("IBRSceneView")
export class IBRSceneView extends ANodeView{
    public focalPlane!: ATriangleMeshGraphic;
    public guiGroup!: AGraphicGroup;
    public targetSphereElement!: ATriangleMeshGraphic;
    public _guiCameraFrustaGroup!: AGraphicGroup;
    public guiMaterial!: AMaterial;
    public focalPlaneMaterial!:AShaderMaterial;

    get model():IBRDataModel{
        return this._model as IBRDataModel;
    }

    get ibr() {
        return this.model.sceneData;
    }

    init() {
        this.guiMaterial = IBRShaders.CreateMaterial(IBRShaders.ShaderNames.Basic);

        this.focalPlane = new ATriangleMeshGraphic();
        this.focalPlane.init(VertexArray3D.SquareXYUV(1), this.model.material);
        this.guiGroup = new AGraphicGroup();
        this.addGraphic(this.focalPlane);
        this.addGraphic(this.guiGroup);


        // @ts-ignore
        this.guiMaterial.threejs.wireframe = true;

        this.targetSphereElement = new ATriangleMeshGraphic();
        this.targetSphereElement.init(
            VertexArray3D.Sphere(0.5, 10, 10),
            this.guiMaterial.threejs
        );
        this.targetSphereElement.setColor(Color.FromString("#22ff22"));
        this.guiGroup.add(this.targetSphereElement);
        this._resetGUICameraFrusta();
        this._initViewSubscriptions();
    }

    _initViewSubscriptions(){
        let model = this.model;
        let self = this;
        this.subscribe(this.model.addTransformListener(()=>{
            self.guiGroup.setTransform(model.transform.getMatrix().getInverse());
        }), "ibr_view_gui_inverse_transform");

        this.subscribe(
            this.addEventListener(IBRDataModel.EVENTS.IBR_SCENE_CHANGE, () => {
                self._guiCameraFrustaGroup.dispose();
                self._resetGUICameraFrusta();
            })
        );

        this.subscribe(
            this.model.addFocusListener(() => {
                if (!self.model.fixedFocalPlane) {
                    self.targetSphereElement.setTransform(
                        model.focalSurfacePose
                    );
                    self.updateFocalPlane();
                }
            }, "ViewRespondToFocusPointChange")
        );

        this.subscribe(
            model.addVirtualCameraListener(() => {
                self.updateFocalPlane();
            }),
            "ViewRespondToVirtualCameraPoseChange"
        );

        this.subscribe(
            model.addStateKeyListener("showGUI", () => {
                self.guiGroup.visible = model.showGUI;
            }),
            "IBR Scene View Show GUI"
        );

        this.subscribe(
            model.addStateKeyListener("showFocusSphere", () => {
                self.targetSphereElement.visible = model.showFocusSphere;
            }),
            "IBR Scene View showFocusSphere"
        );
    }

    updateFocalPlane() {
        if (this.model.fixedFocalPlane) {
            return;
        }
        let cameraPose = this.model.virtualCameraPose;
        let model = this.model;
        let focusDistance = model.focusTargetPoint.minus(cameraPose.position).L2();
        let focalPlacement = NodeTransform3D.LookAt(
            model.focusTargetPoint,
            cameraPose.position,
            cameraPose.rotation.Mat4().c1.Point3D
        );
        focalPlacement.scale = V3(
            focusDistance * 100.0,
            focusDistance * 100.0,
            1.0
        );
        this.focalPlane.setTransform(focalPlacement);
    }

    _resetGUICameraFrusta(size: number = 0.25) {
        if(this._guiCameraFrustaGroup){
            this._guiCameraFrustaGroup.dispose();
        }
        this._guiCameraFrustaGroup = new AGraphicGroup();
        let ibr = this.ibr;
        for (let v of this.ibr.capturedImages) {
            let frustEl = new ATriangleMeshGraphic();
            frustEl.init(
                VertexArray3D.FrustumFromProjectionMatrix(v.camera.getMatrix(), size),
                this.guiMaterial.threejs
            );
            frustEl.setTransform(v.pose);
            this._guiCameraFrustaGroup.add(frustEl);
        }
        this.guiGroup.add(this._guiCameraFrustaGroup);
        // model.transform.getMatrix().assignTo(this.threejs.matrix);
    }


    update(...args: any[]): void {
        console.warn("Update not implemented")
    }
}
