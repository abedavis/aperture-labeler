import {AObject, AObjectState, ATexture, Mat3, Mat4, NodeTransform3D, Quaternion, V3, V4, Vec3} from "../anigraph";
import {IBRCamera} from "./IBRCamera";
import {IBRTimeStamp} from "./IBRTimeStamp";
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
        c.pose = NodeTransform3D.FromPoseMatrix(posemat);

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
            c.pose = NodeTransform3D.FromPoseMatrix(viewTransform.times(c._poseMatrixIn));
        } else {
            c.pose = NodeTransform3D.FromPoseMatrix(c._poseMatrixIn);
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
            c.pose = NodeTransform3D.FromPoseMatrix(viewTransform.times(c._poseMatrixIn));
        } else {
            c.pose = NodeTransform3D.FromPoseMatrix(c._poseMatrixIn);
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


        /**
         * The reconstructed pose of an image is specified as the projection from world to the camera coordinate system of an image using a quaternion (QW, QX, QY, QZ) and a translation vector (TX, TY, TZ). The quaternion is defined using the Hamilton convention, which is, for example, also used by the Eigen library. The coordinates of the projection/camera center are given by -R^t * T, where R^t is the inverse/transpose of the 3x3 rotation matrix composed from the quaternion and T is the translation vector. The local camera coordinatxis to the bottome system of an image is defined in a way that the X axis points to the right, the Y a, and the Z axis to the front as seen from the image.
         */

        // let adjustMat = new Mat4(
        //     1.0, 0.0, 0.0, 0.0,
        //     0.0, -1.0, 0.0, 0.0,
        //     0.0, 0.0, -1.0, 0.0,
        //     0.0, 0.0, 0.0, 1.0
        // )

        let qvec = d["rotation"];
        let tvec = V3(d["translation"]);
        //let rcorrect = Quaternion.RotationX(Math.PI);

        const rot = new Mat3(
            1 - 2 * qvec[2]**2 - 2 * qvec[3]**2,
            2 * qvec[1] * qvec[2] - 2 * qvec[0] * qvec[3],
            2 * qvec[3] * qvec[1] + 2 * qvec[0] * qvec[2],
            2 * qvec[1] * qvec[2] + 2 * qvec[0] * qvec[3],
            1 - 2 * qvec[1]**2 - 2 * qvec[3]**2,
            2 * qvec[2] * qvec[3] - 2 * qvec[0] * qvec[1],
            2 * qvec[3] * qvec[1] - 2 * qvec[0] * qvec[2],
            2 * qvec[2] * qvec[3] + 2 * qvec[0] * qvec[1],
            1 - 2 * qvec[1]**2 - 2 * qvec[2]**2,
        );
        // const trans = new Mat4(
        //     1, 0, 0, tvec.x,
        //     0, 1, 0, tvec.y,
        //     0, 0, 1, tvec.z,
        //     0, 0, 0, 1
        // )

        const cameraPosition = rot.getTranspose().times(-1).times(tvec);
        const worldToCamera = Quaternion.FromWXYZ(qvec);
        const colmapToGL = Quaternion.RotationX(Math.PI);
        const quat = worldToCamera.times(colmapToGL).getInverse();
        c.pose = new NodeTransform3D(cameraPosition, quat);
        c.pose = new NodeTransform3D(tvec, Quaternion.FromWXYZ(qvec));

        // let pose = new Mat4(
        //     1 - 2 * qvec[2]**2 - 2 * qvec[3]**2,
        //     2 * qvec[1] * qvec[2] - 2 * qvec[0] * qvec[3],
        //     2 * qvec[3] * qvec[1] + 2 * qvec[0] * qvec[2],
        //     tvec.x,
        //     2 * qvec[1] * qvec[2] + 2 * qvec[0] * qvec[3],
        //     1 - 2 * qvec[1]**2 - 2 * qvec[3]**2,
        //     2 * qvec[2] * qvec[3] - 2 * qvec[0] * qvec[1],
        //     -tvec.y,
        //     2 * qvec[3] * qvec[1] - 2 * qvec[0] * qvec[2],
        //     2 * qvec[2] * qvec[3] + 2 * qvec[0] * qvec[1],
        //     1 - 2 * qvec[1]**2 - 2 * qvec[2]**2,
        //     -tvec.z,
        //     0, 0, 0, 1
        // );
        // const rotation = Mat4.FromEulerAngles(Math.PI, 0, 0);
        // //pose = rotation.times(pose)
        // c.pose = NodeTransform3D.FromPoseMatrix(pose.invert());

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

    setSpatialSortValue(score: number) {
        this._currentSpatialSortValue = score;
    }
    setTemporalSortValue(score: number) {
        this._currentTemporalSortValue = score;
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

    static GetSortedByReconstructionScore(
        views_in: IBRCapturedImage[],
        targetViewPose?: NodeTransform3D,
        focus?: NodeTransform3D | Vec3
    ) {
        let views = views_in.slice();
        if (targetViewPose !== undefined) {
            if (focus === undefined) {
                console.error(
                    "only provided targetViewPose, must provide focus as well"
                );
            } else {
                let focusPoint =
                    focus instanceof NodeTransform3D ? focus.position : focus;
                for (let v of views) {
                    let fv = v.pose.position.minus(focusPoint).getNormalized();
                    let ft = targetViewPose.position.minus(focusPoint).getNormalized();
                    v.setSpatialSortValue(fv.dot(ft));
                }
            }
        }
        function reconstructionscore(a: IBRCapturedImage, b: IBRCapturedImage) {
            return b._currentSpatialSortValue - a._currentSpatialSortValue;
        }
        views.sort(reconstructionscore);
        return views;
    }

    static GetSortedByTimeProximity(views_in: IBRCapturedImage[], time: number) {
        let views = views_in.slice();
        function timescore(a: IBRCapturedImage, b: IBRCapturedImage) {
            return Math.abs(time - a.time) - Math.abs(time - b.time);
        }
        views.sort(timescore);
        return views;
    }

    static GetSortedByTimeScore(
        views_in: IBRCapturedImage[],
        reference?: number
    ) {
        let views = views_in.slice();
        function timescore(a: IBRCapturedImage, b: IBRCapturedImage) {
            return b._currentTemporalSortValue - a._currentTemporalSortValue;
        }
        let referenceScore = reference ?? 0;
        function relativetimescore(a: IBRCapturedImage, b: IBRCapturedImage) {
            return (
                Math.abs(a._currentTemporalSortValue - referenceScore) -
                Math.abs(b._currentTemporalSortValue - referenceScore)
            );
        }
        if (reference === undefined) {
            views.sort(timescore);
        } else {
            views.sort(relativetimescore);
        }
        return views;
    }

    static GetSortedBySpaceScore(
        views_in: IBRCapturedImage[],
        coefficient: number = 1
    ) {
        let views = views_in.slice();
        function timescore(a: IBRCapturedImage, b: IBRCapturedImage) {
            return (
                coefficient * (b._currentSpatialSortValue - a._currentSpatialSortValue)
            );
        }
        views.sort(timescore);
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
