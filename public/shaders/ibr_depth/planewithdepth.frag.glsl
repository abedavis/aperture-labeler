precision highp float;
precision highp int;

varying vec2 vUv;
varying vec4 vPosition;

uniform sampler2D inputMap;
uniform sampler2D paintMap;
uniform bool isOccupancy;
uniform float depth;

uniform mat4 captureCameraProjMat;
varying mat4 mModel;
varying float visibility;
varying vec2 texCoords;

// vec2 orientedDeviceTexCoords(vec2 texCoords, int orientation){
//     switch(orientation) {
//         case 0:
//             return vec2(texCoords.x, texCoords.y);
//             break;
//         case 1:
//             return vec2(texCoords.y, 1.0-texCoords.x);
//             break;
//         case 2:
//             return vec2(1.0-texCoords.y, 1.0-texCoords.x);
//             break;
//         default:
//             return texCoords;
//     }
// }

// vec4 sampleWithBoundary(vec2 uv, int texIndex){
//     float boundary = 0.1;
//     vec4 contrib = sampleTexValue(texIndex, orientedDeviceTexCoords(uv, deviceOrientations[texIndex]))*weights[texIndex];
//     float outb = 0.0;
//     if(uv.x>(1.0-boundary)){
//         outb = max(outb,uv.x-(1.0-boundary));
//     }
//     if(uv.x<boundary){
//         outb = max(outb, boundary-uv.x);
//     }
//     if(uv.y>(1.0-boundary)){
//         outb = max(outb,uv.y-(1.0-boundary));
//     }
//     if(uv.y<boundary){
//         outb = max(outb, boundary-uv.y);
//     }
//     if(outb>0.0){
//         return max(0.0,(boundary-outb)/boundary)*contrib;
//     }else{
//         return contrib;
//     }
// }


void main() {
    if (visibility > 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }
    if (isOccupancy) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
    } else {
        float painted = texture(paintMap, texCoords).x;
        if (painted > 0.5) {
            vec4 worldCoordinates = inverse(viewMatrix) * vec4(vPosition.xyz / vPosition.z * (-depth), 1.0);
            vec4 capturedCoord = captureCameraProjMat * inverse(mModel) * worldCoordinates;
            vec2 rpcoords = capturedCoord.xy/capturedCoord.w;
            rpcoords = (rpcoords+vec2(1.0,1.0))*0.5;
            gl_FragColor = texture(inputMap, rpcoords);
            gl_FragColor = gl_FragColor * 0.8 + vec4(1.0, 0.0, 0.0, 1.0) * 0.2;
        } else {
            gl_FragColor = texture(inputMap, vUv);
        }
    }


        // gl_FragColor = vec4(vec3(depth), 1.0);
    // return;
    // vec3 N = normalize( cross( dFdx( mPosition.xyz ), dFdy( mPosition.xyz ) ) );
    // vec3 viewDir = vec3(0, 0, -1);
    // if (abs(dot(N, viewDir)) < 0.95) {
    //     gl_FragColor = vec4(0.0);
    // } else {
    //     gl_FragColor = texture(inputMap, vUv);
    //     //gl_FragColor.a = 0.5;
    // }
    // vec4 ra = texture(depthMap, vec2(vUv.x, 1.0-vUv.y));
    // vec4 depthColor = vec4(vec3(ra.x/100.0),1.0);
    // gl_FragColor = gl_FragColor * 0.2 + depthColor * 0.8;
    // gl_FragColor = texture(inputMap, vUv);
    
    // gl_FragColor = texture(inputMap, vUv);
    // gl_FragColor = vec4(vec3(abs(vPosition.x/2.0)), 1.0);
}