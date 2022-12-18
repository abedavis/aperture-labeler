import { IBRCamera } from "./IBRCamera";
import { loadJSONFromURL} from "./IBRUtils";
import { IBRCapturedImage } from "./IBRCapturedImage";
import {
  V4,
  AObject,
  AObjectState,
  ATexture,
  Mat4,
  NodeTransform3D,
  Vec3, V4A
}
  from "../anigraph"

enum IBRSceneJSONParams {
  Images = "image_poses",
  Cameras = "cameras",
}

export class IBRScene extends AObject {
  static JSONParams = IBRSceneJSONParams;
  capturedImages: IBRCapturedImage[] = [];

  //dictionary. for single camera the index will be the number 1, which is a bit weird...
  captureCameras: { [id: number | string]: IBRCamera } = {};

  // target!:NodeTransform3D;
  // sceneView!:APerspectiveCamera;

  path!: string;

  @AObjectState nCapturedImages: number;
  @AObjectState _minTime!: number | undefined;
  @AObjectState _maxTime!: number | undefined;

  views: { [name: string]: Mat4 } = {};

  get minTime() {
    return this._minTime ?? new Date(0);
  }

  // promise returns true when textures are finished loading
  texturesLoaded!: boolean | Promise<boolean>;

  constructor() {
    super();
    this.nCapturedImages = 0;
  }

  static async FromCOLMAPDict(d: { [name: string]: any }, cameraIDs?:number[]) {
    let scene = new IBRScene();
    let poses = d[IBRSceneJSONParams.Images];
    let cameras = d[IBRSceneJSONParams.Cameras];
    for (let cam of cameras) {
      scene.captureCameras[cam["id"]] = IBRCamera.FromCOLMAPDict(cam);
    }
    for (let im of poses) {
      let nextcapi = IBRCapturedImage.FromDictCOLMAP(im);
      if(im._viewID==='extra'){
        console.log(`Ignoring extra view ${im.fileName}`)
      }else {
        nextcapi.camera = scene.captureCameras[nextcapi.cameraID];
        if(cameraIDs){
          if(cameraIDs.includes(nextcapi.cameraID) || cameraIDs.includes(Number(nextcapi.cameraID))) {
            scene.addCapturedImage(nextcapi, false);
          }
        }else{
          scene.addCapturedImage(nextcapi, false);
        }
      }
    }
    scene.capturedImages = IBRCapturedImage.GetSortedByDate(
      scene.capturedImages
    );
    scene.nCapturedImages = scene.capturedImages.length;
    return scene;
  }

  addCapturedImage(capturedImage: IBRCapturedImage, sort: boolean = true) {
    this.capturedImages.push(capturedImage);
    if (this._minTime === undefined) {
      this._minTime = capturedImage.time;
    } else {
      if (capturedImage.time < this._minTime) {
        this._minTime = capturedImage.time;
      }
    }
    if (this._maxTime === undefined) {
      this._maxTime = capturedImage.time;
    } else {
      if (capturedImage.time > this._maxTime) {
        this._maxTime = capturedImage.time;
      }
    }
    if (sort) {
      this.capturedImages = IBRCapturedImage.GetSortedByDate(
        this.capturedImages
      );
      this.nCapturedImages = this.capturedImages.length;
    }
  }

  static async FromPathCOLMAP(path: string, cameraIDs?:number[]) {
    // let jsondata = await loadJSONFromURL("./scenes/SpaceWallflower/capture0/capturedata.json");
    let jsondata = await loadJSONFromURL(path + "capturedata.json");

    let ibr = await IBRScene.FromCOLMAPDict(jsondata["_ainfo"], cameraIDs);
    ibr.path = path;
    ibr.texturesLoaded = ibr.loadTextures();
    return ibr;
  }

  static async FromPath(path: string) {
    // let jsondata = await loadJSONFromURL("./scenes/SpaceWallflower/capture0/capturedata.json");
    let jsondata = await loadJSONFromURL(path + "scene_data.json");

    let viewpoints = jsondata["viewpoints"];
    let scene = new IBRScene();
    for (let vp of viewpoints) {
      let view_id = vp["anchorID"];
      let posemat = new Mat4(vp["transform"]).getTranspose();
      scene.views[view_id] = posemat;
    }

    for (let vid in scene.views) {
      let viewjson = await loadJSONFromURL(
        path + `${vid}` + `/viewpoint_data.json`
      );
      console.log(viewjson);
      let captures = viewjson["captures"];
      for (let c of captures) {
        let nextCapturedImage = IBRCapturedImage.FromAppCaptureDict(
          c,
          scene.views[vid],
          vid
        );
        scene.addCapturedImage(nextCapturedImage);
      }
    }
    scene.capturedImages = IBRCapturedImage.GetSortedByDate(
      scene.capturedImages
    );
    scene.nCapturedImages = scene.capturedImages.length;
    scene.path = path;
    // scene.texturesLoaded = scene.loadTextures();
    return scene;
  }

  static async FromLFPath(path: string) {
    let jsondata = await loadJSONFromURL(path + "light_field_data.json");

    let poi = V4A(jsondata["pointOfInterest"]);
    let initCamPose = new Mat4(jsondata["initCameraPose"]).getTranspose();

    let scene = new IBRScene();
    let captures = jsondata["captures"];
    for (let c of captures) {
      let nextCapturedImage = IBRCapturedImage.FromAppLFCaptureDict(
        c,
        initCamPose
      );
      scene.addCapturedImage(nextCapturedImage);
    }

    scene.capturedImages = IBRCapturedImage.GetSortedByDate(
      scene.capturedImages
    );
    scene.nCapturedImages = scene.capturedImages.length;
    scene.path = path;
    // scene.texturesLoaded = scene.loadTextures();
    return scene;
  }

  async loadTextures() {
    for (let im of this.capturedImages) {
      if (im._viewID) {
        im._texturePromise = ATexture.LoadAsync(
          this.path + `/${im._viewID}/` + im.fileName
        );
      } else {
        im._texturePromise = ATexture.LoadAsync(this.path + `/` + im.filePath);
      }
      im._texturePromise.then(function (tex: ATexture) {
        im.texture = tex;
        tex.setWrapToClamp();
      });
    }
    return true;
  }

  updateReconstructionScores(
    targetViewPose: NodeTransform3D,
    focus: NodeTransform3D | Vec3
  ) {
    let focusPoint = focus instanceof NodeTransform3D ? focus.position : focus;
    for (let v of this.capturedImages) {
      let fv = v.pose.position.minus(focusPoint).getNormalized();
      let ft = targetViewPose.position.minus(focusPoint).getNormalized();
      v.setSpatialSortValue(fv.dot(ft));
    }
  }

  resetContributionValues() {
    for (let v of this.capturedImages) {
      v._currentContributionToOutput = 0.0;
    }
  }
}
