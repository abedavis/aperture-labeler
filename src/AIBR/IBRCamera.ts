import {AniGraphDefines, ASerializable, Mat3, Mat4, V2, Vec2, Vec4} from "../anigraph";

enum DistortionModel {
    SimpleRadial = "SIMPLE_RADIAL",
    SimplePinhole = "SIMPLE_PINHOLE",
    Radial = "RADIAL",
    Pinhole = "PINHOLE",
    OpenCV = "OPENCV"
}

interface CameraData{
    height:number,
    width:number,
    model:string,
    params:number[],
    id:number
}

// https://strawlab.org/2011/11/05/augmented-reality-with-OpenGL/
// https://fruty.io/2019/08/29/augmented-reality-with-opencv-and-opengl-the-tricky-projection-matrix/

@ASerializable('ASimpleRadialDistortionCamera')
export class IBRCamera{
    static CameraModels = DistortionModel;
    _modelType!:DistortionModel;
    focalLength!:Vec2;
    center!:Vec2;
    width!:number;
    height!:number;
    _projection:Mat4|undefined=undefined;
    _distortionParams!:Vec4;
    radial_distortion:number[]=[];
    tangential_distortion:number[]=[];
    cameraID!:number;

    setProjectionExplicit(projection:Mat4){
        this._projection = projection;
    }



    /** Get set modelType */
    set modelType(value){this._modelType = value;}
    get modelType(){return this._modelType;}

    constructor(...args:any[]){

    }

    static FromCOLMAPDict(camera_data:CameraData)
    {

        let self = new IBRCamera();
        let params  = camera_data.params;
        // @ts-ignore
        self.modelType=camera_data.model as string;
        self.cameraID = camera_data.id;
        self.width=camera_data.width;
        self.height = camera_data.height;
        self._distortionParams = new Vec4(0,0,0,0);

        switch (self.modelType) {
            case DistortionModel.SimpleRadial:
                // "f, cx, cy, k";
                self.focalLength = V2(params[0], params[0]);
                self.center = V2(params[1], params[2]);
                self.radial_distortion.push(params[3]);
                self._distortionParams.x = params[3];
                break;
            case DistortionModel.Pinhole:
                // "fx, fy, cx, cy";
                self.focalLength = V2(params[0], params[1]);
                self.center = V2(params[2], params[3]);
                break;
            case DistortionModel.SimplePinhole:
                // "f, cx, cy";
                self.focalLength = V2(params[0], params[0]);
                self.center = V2(params[1], params[2]);
                break;
            case DistortionModel.Radial:
                // "f, cx, cy, k1, k2";
                self.focalLength = V2(params[0], params[0]);
                self.center = V2(params[1], params[2]);
                self.radial_distortion.push(params[3]);
                self.radial_distortion.push(params[4]);

                self._distortionParams.x = params[3];
                self._distortionParams.y = params[4];
                break;
            case DistortionModel.OpenCV:
                // "fx, fy, cx, cy, k1, k2, p1, p2";
                self.focalLength = V2(params[0], params[1]);
                self.center = V2(params[2], params[3]);
                self.radial_distortion.push(params[4]);
                self.radial_distortion.push(params[5]);
                self.tangential_distortion.push(params[6]);
                self.tangential_distortion.push(params[7]);

                self._distortionParams.x = params[4];
                self._distortionParams.y = params[5];
                self._distortionParams.z = params[6];
                self._distortionParams.h = params[7];

                break;
            default:
                console.error(`Camera Model ${self.modelType} not implemented`);
        }
        return self;
    }

    static FromProjection(p:Mat4){
        let c = new IBRCamera();
        c._projection=p;
        return c;
    }

    getMatrix(znear?:number, zfar?:number){
        if(this._projection!==undefined){
            return this._projection;
        }
        znear = znear??AniGraphDefines.DefaultZNear;
        zfar = zfar??AniGraphDefines.DefaultZFar;
        // let A = near+far;
        // let B = near*far;
        // let alpha = this.focalLength.x;
        // let beta = this.focalLength.y;
        //
        // let s = 0;

        let scl = 1;
        let fx = this.focalLength.x*scl;
        let x0 = this.center.x;
        let fy = this.focalLength.y*scl;
        let y0 = this.center.y;

        let K = new Mat3(
            fx, 0, x0,
            0, fy, y0,
            0,0,1
        )

        let width = this.width;
        let height = this.height;
        let oglx0=0;
        let ogly0=0;
        let drange = zfar-znear;

        // let proj = Mat4.PerspectiveFromFOV(60, 1/1.7);

        // negative m11?
        // let proj = new Mat4(
        //     2*fx/width, -2*K.m01/width, (width-2*x0+2*oglx0)/width, 0,
        //     0, -2*fy/height, (height-2*y0+2*ogly0)/height, 0,
        //     0, 0, (-zfar-znear)/(drange), -2*zfar*znear/(drange),
        //     0,0,-1,0
        // )

        // let proj = new Mat4(
        //     2*fx/width, -2*K.m01/width, (width-2*x0+2*oglx0)/width, 0,
        //     0, 2*fy/height, (height-2*y0+2*ogly0)/height, 0,
        //     0, 0, (-zfar-znear)/(drange), -2*zfar*znear/(drange),
        //     0,0,-1,0
        // )

        // let proj = new Mat4(
        //     2*fx/width, -2*K.m01/width, (width-2*x0+2*oglx0)/width,     0,
        //     0,          2*fy/height,    (height-2*y0+2*ogly0)/height,   0,
        //     0,          0,              (-zfar-znear)/(drange),         -2*zfar*znear/(drange),
        //     0,          0,              -1,                             0
        // )


        let proj = new Mat4(
            2*fx/width, -2*K.m01/width, (width-2*x0+2*oglx0)/width,     0,
            0,          2*fy/height,    (height-2*y0+2*ogly0)/height,   0,
            0,          0,              (-zfar-znear)/(drange),         -2*zfar*znear/(drange),
            0,          0,              -1,                             0
        )

        // Worked with old version
        // let proj = new Mat4(
        //     2*fx/width, -2*K.m01/width, (width-2*x0+2*oglx0)/width, 0,
        //     0, 2*fy/height, (height-2*y0+2*ogly0)/height, 0,
        //     0, 0, (-zfar-znear)/(drange), -2*zfar*znear/(drange),
        //     0,0,-1,0
        // )

        return proj
    }
}




