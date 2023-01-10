precision highp float;
precision highp int;


uniform mat4 poses[16];
uniform mat4 projections[16];
uniform vec4 distortions[16];
uniform float weights[16];
uniform int deviceOrientations[16];
uniform int nTextures;

uniform sampler2D depthMap;

uniform sampler2D tex0Map;
uniform sampler2D tex1Map;
uniform sampler2D tex2Map;
uniform sampler2D tex3Map;
uniform sampler2D tex4Map;
uniform sampler2D tex5Map;
uniform sampler2D tex6Map;
uniform sampler2D tex7Map;
uniform sampler2D tex8Map;
uniform sampler2D tex9Map;
uniform sampler2D tex10Map;
uniform sampler2D tex11Map;
uniform sampler2D tex12Map;
uniform sampler2D tex13Map;
// uniform sampler2D tex14Map;
uniform sampler2D tex15Map;
varying vec2 vUv;

varying vec4 vPosition;


vec4 sampleTexValue(int index, vec2 uv){

    if(index==0){
        return texture(tex0Map, uv);
    }
    if(index==1){
        return texture(tex1Map, uv);
    }
    if(index==2){
        return texture(tex2Map, uv);
    }
    if(index==3){
        return texture(tex3Map, uv);
    }
    if(index==4){
        return texture(tex4Map, uv);
    }
    if(index==5){
        return texture(tex5Map, uv);
    }
    if(index==6){
        return texture(tex6Map, uv);
    }
    if(index==7){
        return texture(tex7Map, uv);
    }
    if(index==8){
        return texture(tex8Map, uv);
    }
    if(index==9){
        return texture(tex9Map, uv);
    }
    if(index==10){
        return texture(tex10Map, uv);
    }
    if(index==11){
        return texture(tex11Map, uv);
    }
    if(index==12){
        return texture(tex12Map, uv);
    }
    if(index==13){
        return texture(tex13Map, uv);
    }

    // if(index==14){
    //     return texture(tex14Map, uv);
    // }

    return texture(tex15Map, uv);
}

//vec2 orientedDeviceTexCoords(vec2 texCoords, int orientation){
//    if(orientation == 0){
////        return vec2(1.0-texCoords.x, texCoords.y);
//        return vec2(texCoords.y, 1.0-texCoords.x);
//    }
//    if(orientation == 1){
//        return vec2(texCoords.y, 1.0-texCoords.x);
//    }
//    if(orientation == 2){
//        return vec2(1.0-texCoords.y, 1.0-texCoords.x);
//    }
//    return texCoords;
//}
vec2 orientedDeviceTexCoords(vec2 texCoords, int orientation){
    if(orientation == 0){
        //        return vec2(1.0-texCoords.x, texCoords.y);
//        return vec2(texCoords.y, 1.0-texCoords.x);

        //new
//        return vec2(texCoords.y, 1.0-texCoords.x);
                return vec2(texCoords.x, texCoords.y);


    }
    if(orientation == 1){
        return vec2(texCoords.y, 1.0-texCoords.x);
    }
    if(orientation == 2){
        return vec2(1.0-texCoords.y, 1.0-texCoords.x);
    }
    return texCoords;
}

vec4 sampleWithBoundary(vec2 uv, int texIndex){
    float boundary = 0.1;
    vec4 contrib = sampleTexValue(texIndex, orientedDeviceTexCoords(uv, deviceOrientations[texIndex]))*weights[texIndex];
    float outb = 0.0;
    if(uv.x>(1.0-boundary)){
        outb = max(outb,uv.x-(1.0-boundary));
    }
    if(uv.x<boundary){
        outb = max(outb, boundary-uv.x);
    }
    if(uv.y>(1.0-boundary)){
        outb = max(outb,uv.y-(1.0-boundary));
    }
    if(uv.y<boundary){
        outb = max(outb, boundary-uv.y);
    }
    if(outb>0.0){
        return max(0.0,(boundary-outb)/boundary)*contrib;
    }else{
        return contrib;
    }
}


void main() {
    vec4 depthData = texture(depthMap, vUv);
    float depth = depthData.x;
    float hasDepth = depthData.y;
    float hasPaintMark = depthData.z;
    vec4 worldCoordinates;
    if (hasDepth > 0.5) {
        worldCoordinates = inverse(viewMatrix) * vec4(vPosition.xyz / vPosition.z * (-depth), 1.0);
    } else {
        worldCoordinates = inverse(viewMatrix) * vPosition;
    }

    vec4 oval = vec4(0.0,0.0,0.0,0.0);
    float oweights = 0.0;

    for(int tx=0;tx<nTextures;tx++){
        oweights = oweights+weights[tx];
        vec4 capturedCoord = projections[tx]*poses[tx]*worldCoordinates;
        vec2 rpcoords = capturedCoord.xy/capturedCoord.w;
        rpcoords = (rpcoords+vec2(1.0,1.0))*0.5;
        oval = oval + sampleWithBoundary(rpcoords, tx);
    }

    gl_FragColor = vec4(oval.xyz/oweights, 1.0);
    
    if (hasPaintMark > 0.5) {
        gl_FragColor = 0.8 * gl_FragColor + 0.2 * vec4(0.5, 0.0, 0.0, 1.0);
    }
}

