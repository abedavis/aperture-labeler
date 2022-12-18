import {NodeTransform3D, V2, V3} from "../../anigraph";
import {
    ArrayEqualTo,
    ArrayCloseTo,
    MatrixEqual,
    VecEqual,
    VecCloseTo,
    VertexArray2DCircToBeCloseTo,
    VertexArray2DToBeCloseTo,
    MatrixCloseTo,
    QuaternionCloseToMatrix
} from "./helpers/TestHelpers";
expect.extend(ArrayEqualTo);
expect.extend(ArrayCloseTo);
expect.extend(VertexArray2DToBeCloseTo);
expect.extend(MatrixEqual);
expect.extend(MatrixCloseTo);
expect.extend(VecEqual);
expect.extend(VecCloseTo);
expect.extend(VertexArray2DCircToBeCloseTo);
expect.extend(QuaternionCloseToMatrix);
import {Quaternion, Mat4, Mat3, Vec3, Vec4} from "../../anigraph";


describe("Quaternion Basis Rotation Tests", () => {
    let RandomAngles = [];
    let nRandomAngles = 5;
    for(let r=0;r<nRandomAngles;r++){
        RandomAngles.push(Math.random()*Math.PI*2);
    }

    test("Rotation X", () => {
        for(let randomAngle of RandomAngles){
            // let randomAngle = Math.random()*Math.PI*2;
            let mr = Mat4.RotationX(randomAngle);
            let qr = Quaternion.RotationX(randomAngle);
            expect(qr).QuaternionCloseToMatrix(mr, 0.001);
        }
    });
    test("Rotation Y", () => {
        for(let randomAngle of RandomAngles){
            // let randomAngle = Math.random()*Math.PI*2;
            let mr = Mat4.RotationY(randomAngle);
            let qr = Quaternion.RotationY(randomAngle);
            expect(qr).QuaternionCloseToMatrix(mr, 0.001);
        }
    });

    test("Rotation Z", () => {
        for(let randomAngle of RandomAngles){
            // let randomAngle = Math.random()*Math.PI*2;
            let mr = Mat4.RotationZ(randomAngle);
            let qr = Quaternion.RotationZ(randomAngle);
            expect(qr).QuaternionCloseToMatrix(mr, 0.001);
        }
    });
});

describe("Quaternion vs. Matrix Basis Rotation Tests", () => {
    const angle = Math.PI*0.5;

    test("Rotation X", () => {
        let mr = Mat4.RotationX(angle);
        let qr = Quaternion.RotationX(angle);
        expect(qr).QuaternionCloseToMatrix(mr, 0.001);
    });
    test("Rotation Y", () => {
        let mr = Mat4.RotationY(angle);
        let qr = Quaternion.RotationY(angle);
        expect(qr).QuaternionCloseToMatrix(mr, 0.001);
    });
    test("Rotation Z", () => {
        let mr = Mat4.RotationZ(angle);
        let qr = Quaternion.RotationZ(angle);
        expect(qr).QuaternionCloseToMatrix(mr, 0.001);
    });
});


describe("Quaternion Rotation around basis vectors", () => {
    test("Rotation around Z", () => {
        let rotz = Quaternion.RotationZ(Math.PI*0.5);
        let xrot = rotz.Mat4().times(new Vec4(1.0, 0.0, 0.0,0.0));
        expect(xrot).VecEqual(new Vec4(0.0, 1.0, 0.0, 0.0));
    });

    test("Rotation around X", () => {
        let rotx = Quaternion.RotationX(Math.PI*0.5);
        let zrot = rotx.Mat4().times(new Vec4(0.0, 0.0, -1.0,0.0));
        expect(zrot).VecEqual(new Vec4(0.0, 1.0, 0.0, 0.0));
    });

    test("Rotation around Y", () => {
        let roty = Quaternion.RotationY(Math.PI*0.5);
        let xrot = roty.Mat4().times(new Vec4(1.0, 0.0, 0.0,0.0));
        expect(xrot).VecEqual(new Vec4(0.0, 0.0, -1.0, 0.0));
    });
});



describe("Matrix Rotation Around Bases", () => {
    test("Rotation around Z", () => {
        let rotz = Mat4.RotationZ(Math.PI*0.5);
        let xrot = rotz.times(new Vec4(1.0, 0.0, 0.0,0.0));
        expect(xrot).VecEqual(new Vec4(0.0, 1.0, 0.0, 0.0));
    });

    test("Rotation around X", () => {
        let rotx = Mat4.RotationX(Math.PI*0.5);
        let zrot = rotx.times(new Vec4(0.0, 0.0, -1.0,0.0));
        expect(zrot).VecEqual(new Vec4(0.0, 1.0, 0.0, 0.0));
    });

    test("Rotation around Y", () => {
        let roty = Mat4.RotationY(Math.PI*0.5);
        let xrot = roty.times(new Vec4(1.0, 0.0, 0.0,0.0));
        expect(xrot).VecEqual(new Vec4(0.0, 0.0, -1.0, 0.0));
    });
});

describe("Matrix Axis Angle", () => {
    test("MatX", () => {
        let angle = Math.random();
        let matx = Mat4.RotationX(angle);
        let mataa = Mat4.RotationAxisAngle(V3(1,0,0), angle);
        expect(matx).MatrixCloseTo(mataa);
    });
    test("MatY", () => {
        let angle = Math.random();
        let maty = Mat4.RotationY(angle);
        let mataa = Mat4.RotationAxisAngle(V3(0,1,0), angle);
        expect(maty).MatrixCloseTo(mataa);
    });
    test("MatZ", () => {
        let angle = Math.random();
        let matz = Mat4.RotationZ(angle);
        let mataa = Mat4.RotationAxisAngle(V3(0,0,1), angle);
        expect(matz).MatrixCloseTo(mataa);
    });
});

describe("Quaternion To / From Matrix Tests", () => {
    let RandomAxes = [];
    let RandomAngles = [];
    let nRandom = 5;
    for(let r=0;r<nRandom;r++){
        RandomAxes.push(Vec3.Random().getNormalized());
        RandomAngles.push(Math.random()*Math.PI*2);
    }

    test("Mat4->Quaternion->Mat4", () => {
        for(let i=0;i<nRandom;i++){
            // let randomAngle = Math.random()*Math.PI*2;
            let mr = Mat4.RotationAxisAngle(RandomAxes[i], RandomAngles[i]);
            let qr = Quaternion.FromMatrix(mr);
            expect(qr.Mat4()).MatrixCloseTo(mr);
            // expect(qr).QuaternionCloseToMatrix(mr, 0.001);
        }
    });
});


describe("Quaternion Local XYZ", () => {
    test("Rotation around Z", () => {
        let rotz = Quaternion.RotationZ(Math.PI*0.5);
        let xrot = rotz.Mat4().times(new Vec4(1.0, 0.0, 0.0,0.0));
        expect(rotz.getLocalX()).VecCloseTo(new Vec3(0.0, 1.0, 0.0), "Vec Close To", 0.00001);
    });
});

describe("Quaternion FromMatrix", () => {
    test("Rotation Axis Angle", () => {
        let r = Mat4.RotationAxisAngle(V3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).getNormalized(), Math.random()*Math.PI*2);
        let m = r;
        let q = Quaternion.FromMatrix(m);
        expect(q.Mat4()).MatrixCloseTo(r, "Mat Close To", 0.00001);
    });

    test("Rotation Axis Angle and Scale RS", () => {
        let r = Mat4.RotationAxisAngle(V3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).getNormalized(), Math.random()*Math.PI*2);
        let m = r.times(Mat4.Scale3D([3,2,1]));
        let q = Quaternion.FromMatrix(m);
        expect(q.Mat4()).MatrixCloseTo(r, "Mat Close To", 0.00001);
    });

    test("RotationX and Scale RS", () => {
        let r = Mat4.RotationX(Math.random()*Math.PI*2);
        let m = r.times(Mat4.Scale3D([3,2,1]));
        let q = Quaternion.FromMatrix(m);
        expect(q.Mat4()).MatrixCloseTo(r, "Mat Close To", 0.00001);
    });
});



describe("NodeTransform", () => {
    test("setWithMatrix TRS rotationaxisangle", () => {
        let mat4 = Mat4.Translation3D(V3(1, 2, 3))
            .times(Mat4.RotationAxisAngle(V3(1, 5, 7).getNormalized(), Math.random() * Math.PI * 2))
            .times(Mat4.Scale3D(V3(3, 2, 1)))
        let nt = NodeTransform3D.FromMatrix(mat4);
        expect(nt.getMat4()).MatrixCloseTo(mat4, "Vec Close To", 0.00001);
    });

    test("setWithMatrix RS rotationaxisangle", () => {
        let mat4 =Mat4.RotationAxisAngle(V3(1, 5, 7).getNormalized(), Math.random() * Math.PI * 2)
            .times(Mat4.Scale3D(V3(3, 2, 1)))
        let nt = NodeTransform3D.FromMatrix(mat4);
        expect(nt.getMat4()).MatrixCloseTo(mat4, "Vec Close To", 0.00001);
    });

    test("setWithMatrix TR rotationaxisangle", () => {
        let mat4 = Mat4.Translation3D(V3(1, 2, 3))
            .times(Mat4.RotationAxisAngle(V3(1, 5, 7).getNormalized(), Math.random() * Math.PI * 2))
        let nt = NodeTransform3D.FromMatrix(mat4);
        expect(nt.getMat4()).MatrixCloseTo(mat4, "Vec Close To", 0.00001);
    });

    test("setWithMatrix TS", () => {
        let mat4 = Mat4.Translation3D(V3(1, 2, 3))
            .times(Mat4.Scale3D(V3(3, 2, 1)))
        let nt = NodeTransform3D.FromMatrix(mat4);
        expect(nt.getMat4()).MatrixCloseTo(mat4, "Vec Close To", 0.00001);
    });

    test("setWithMatrix norotation", () => {
        let mat4 = Mat4.Translation3D(V3(1, 2, 3))
            .times(Mat4.Scale3D(V3(3, 2, 1)))
        let nt = NodeTransform3D.FromMatrix(mat4);
        expect(nt.getMat4()).MatrixCloseTo(mat4, "Vec Close To", 0.00001);
    });
    test("setWithMatrix TRS rotationx", () => {
        let mat4 = Mat4.Translation3D(V3(1, 2, 3))
            .times(Mat4.RotationX(Math.random() * Math.PI * 2))
            .times(Mat4.Scale3D(V3(3, 2, 1)))
        let nt = NodeTransform3D.FromMatrix(mat4);
        expect(nt.getMat4()).MatrixCloseTo(mat4, "Vec Close To", 0.00001);
    });

    test("setWithMatrix rotation only", () => {
        let mat4 = Mat4.RotationAxisAngle(V3(1, 5, 7).getNormalized(), Math.random() * Math.PI * 2);
        let nt = NodeTransform3D.FromMatrix(mat4);
        expect(nt.getMat4()).MatrixCloseTo(mat4, "Vec Close To", 0.00001);
    });
});




// describe("LookAt, NodeTransform3D, and Quaternions", () => {
//
//
//     test("Mat4->Quaternion->Mat4", () => {
//         let nt = NodeTransform3D.LookAt(
//             V3(0,-10,10), V3(0,0,0), V3(0,0,1)
//         )
//
//     });
// });




