import * as THREE from "three";
import {
  AObject,
  AObjectState,
  ATexture,
  Mat4,
  NodeTransform3D,
  Quaternion,
  V3,
  Vec3
} from "../anigraph";
import { IBRCamera } from "./IBRCamera";
import { CameraPose } from "./CameraPose";
import { IBRTimeStamp } from "./IBRTimeStamp";
import * as d3 from "d3";
enum DeviceOrientations {
  Unknown = 0,
  Portrait = 1, // Portrait mode
  PortraitUpsideDown = 2, // portrait mode upside down
  LandscapeLeft = 3, // Screen Landscape Home button on Left
  LandscapeRight = 4, // Screen Landscape Home button on Right
  FaceUp = 5, // Screen Facing up
  FaceDown = 6, //Screen Facing Down
}

export class IBRCapturedImage extends AObject {
  texture!: ATexture;
  _texturePromise!: Promise<ATexture>;
  @AObjectState camera!: IBRCamera;
  @AObjectState pose!: CameraPose;
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
  _poseMatrixIn!: Mat4;
  deviceOrientation: number = -1;
  _currentSpatialSortValue: number = 0;
  _currentTemporalSortValue: number = 0;
  // _currentSpatialValue:any;
  // _currentTemporalValue:any;
  @AObjectState _currentContributionToOutput!: number;

  _viewID: string | undefined;

  setSpatialSortValue(score: number) {
    this._currentSpatialSortValue = score;
  }
  setTemporalSortValue(score: number) {
    this._currentTemporalSortValue = score;
  }

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

  cameraID!: number;
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
