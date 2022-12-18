import {AObject, AObjectState, ATexture, Mat4, NodeTransform3D, Quaternion, V3, Vec3} from "../anigraph";
import {IBRCamera} from "../AIBRold/IBRCamera";
import {CameraPose} from "../AIBRold/CameraPose";
import {IBRTimeStamp} from "../AIBRold/IBRTimeStamp";
import * as d3 from "d3";

export class IBRCapturedImage extends AObject {
    texture!: ATexture;
    _texturePromise!: Promise<ATexture>;
    @AObjectState camera!: IBRCamera;
    @AObjectState pose!: NodeTransform3D;
    @AObjectState fileName!: string;
    @AObjectState filePath!: string;
    @AObjectState name!: string;
    @AObjectState fileExtension!: string;
    @AObjectState imageID!: number;
    @AObjectState info!: { [name: string]: any };
    @AObjectState captureTime!: IBRTimeStamp;
    @AObjectState _isActive!: boolean;
    @AObjectState _isBeingRendered!: boolean;
    @AObjectState viewAngleTheta!: number;
    @AObjectState viewAnglePhi!: number;
    cameraID!: number;
    _poseMatrixIn!: Mat4;
    deviceOrientation: number = -1;
    _currentSpatialSortValue: number = 0;
    _currentTemporalSortValue: number = 0;
    @AObjectState _currentContributionToOutput!: number;

    _viewID: string | undefined;

    get time() {
        return this.captureTime.time;
    }

    get XDimTime() {
        // Date
        const timeFormatter = d3.timeFormat("%Y-%m-%d");
        const timeString = timeFormatter(this.captureTime.date);
        const timeParser = d3.timeParse("%Y-%m-%d");
        return timeParser(timeString)!;
    }

    get YDimTime() {
        // timeOfDay
        const timeFormatter = d3.timeFormat("%H:%M:%S");
        const timeString = timeFormatter(this.captureTime.date);
        const timeParser = d3.timeParse("%H:%M:%S");
        return timeParser(timeString)!;
    }

    get XDimSpace() {
        return this.pose.position.x;
    }
    get YDimSpace() {
        return this.pose.position.y;
    }


    constructor() {
        super();
        this._isActive = true;
        this._viewID = "";
        this._currentContributionToOutput = 0;
    }

    static FromAppSceneViewDict(d: { [name: string]: any }) {
        let c = new IBRCapturedImage();
        c.name = d["anchorID"];
        c._viewID = d["anchorID"];
        let posemat = new Mat4(d["transform"]);
        c.pose = CameraPose.FromPoseMatrix(posemat);
    }

    static FromAppLFCaptureDict(
        d: { [name: string]: any },
        viewTransform?: Mat4,
        view_id?: string,
        fullRes?: boolean
    ) {
        let c = new IBRCapturedImage();
        c.name = d["timeStamp"];
        c._viewID = view_id;
        c.camera = IBRCamera.FromProjection(
            new Mat4(d["projectionMatrix"]).getTranspose()
        );
        c._poseMatrixIn = new Mat4(d["relativeCameraPose"]).getTranspose();
        c.captureTime = IBRTimeStamp.FromString(d["timeStamp"]);
        if (viewTransform) {
            // c.pose =CameraPose.FromPoseMatrix(c._poseMatrixIn);
            c.pose = CameraPose.FromPoseMatrix(viewTransform.times(c._poseMatrixIn));
        } else {
            c.pose = CameraPose.FromPoseMatrix(c._poseMatrixIn);
            // c.pose =CameraPose.FromPoseMatrix(c._poseMatrixIn);
        }
        c.pose.position = c.pose.position.times(5.0);
        // console.log(`Camera Pose:\n    Position:${c.pose.position}\n   Matrix:\n${c.pose.getMatrix().asPrettyString()}`);
        c.deviceOrientation = d["deviceOrientation"];
        if (fullRes) {
            c.fileName = d[`timeStamp`] + `.jpeg`;
        } else {
            c.fileName = d[`timeStamp`] + `_downsamp.jpeg`;
        }
        return c;
    }

    static FromAppCaptureDict(
        d: { [name: string]: any },
        viewTransform?: Mat4,
        view_id?: string,
        fullRes?: boolean
    ) {
        let c = new IBRCapturedImage();
        c.name = d["timeStamp"];
        c._viewID = view_id;
        c.camera = IBRCamera.FromProjection(
            new Mat4(d["projectionMatrix"]).getTranspose()
        );
        c._poseMatrixIn = new Mat4(d["relativeCameraPose"]).getTranspose();
        c.captureTime = IBRTimeStamp.FromString(d["timeStamp"]);
        if (viewTransform) {
            c.pose = CameraPose.FromPoseMatrix(viewTransform.times(c._poseMatrixIn));
        } else {
            c.pose = CameraPose.FromPoseMatrix(c._poseMatrixIn);
        }
        console.log(
            `Camera Pose:\n    Position:${c.pose.position}\n   Matrix:\n${c.pose
                .getMatrix()
                .asPrettyString()}`
        );
        c.deviceOrientation = d["deviceOrientation"];

        if (fullRes) {
            c.fileName = d[`timeStamp`] + `.jpeg`;
        } else {
            c.fileName = d[`timeStamp`] + `_lowres.jpeg`;
        }
        return c;
    }

    // https://colmap.github.io/format.html#images-txt
    static FromDictCOLMAP(d: { [name: string]: any }) {
        let c = new IBRCapturedImage();
        c.captureTime = IBRTimeStamp.FromDictCOLMAP(d);
        let q = Quaternion.FromWXYZ(d["rotation"]);
        let T = V3(d["translation"]);
        let M_COLMAP = q.getMatrix();
        T = q.getInverse().appliedTo(T).times(-1);
        M_COLMAP.c3 = T.Vec3DH;
        c.pose = CameraPose.FromPoseMatrix(M_COLMAP);
        //////////////
        let posemat = c.pose.getMatrix();
        posemat.c1 = posemat.c1.clone().times(-1);
        posemat.c2 = posemat.c2.clone().times(-1);
        c.pose = CameraPose.FromPoseMatrix(posemat);
        c.fileName = d["filename"];
        if (d["viewID"] !== undefined) {
            c._viewID = d["viewID"];
        }
        if (d["file_path"] !== undefined) {
            c.filePath = d["file_path"];
        } else {
            c.filePath = c.fileName;
        }
        c.fileExtension = d["ext"];
        c.name = d["name"];
        c.cameraID = d["cameraID"];
        c.camera = new IBRCamera();
        return c;
    }

    static GetSortedByDate(views_in: IBRCapturedImage[]) {
        let views = views_in.slice();
        function timestamporder(a: IBRCapturedImage, b: IBRCapturedImage) {
            return a.captureTime.time - b.captureTime.time;
        }
        views.sort(timestamporder);
        return views;
    }

    static GetSortedByTimeOfDay(views_in: IBRCapturedImage[]) {
        let views = views_in.slice();
        function hourorder(a: IBRCapturedImage, b: IBRCapturedImage) {
            return a.captureTime.getDaySeconds() - b.captureTime.getDaySeconds();
        }
        views.sort(hourorder);
        return views;
    }

    static GetActive(views_in: IBRCapturedImage[]) {
        let views = [];
        for (let v of views_in) {
            if (v._isActive) {
                views.push(v);
            }
        }
        return views;
    }
}

// class SyntheticCapturedImage extends CapturedImage{
//     _target: THREE.WebGLRenderTarget | null = null;
//     _targetTexture!:ATexture;
// }
