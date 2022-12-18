precision highp float;
precision highp int;


uniform mat4 poses[16];
uniform mat4 projections[16];
uniform vec4 distortions[16];
uniform float weights[16];
uniform int deviceOrientations[16];
uniform int nTextures;
uniform vec2 texSizes[16];
uniform vec2 opticalCenters[16];
uniform vec2 focalLengths[16];
//uniform bool homogenize;

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
uniform sampler2D tex14Map;
uniform sampler2D tex15Map;
varying vec2 vUv;
varying vec4 worldCoordinates;



vec2 undistortedUV(int index, vec2 uvin){
//    vec2 centeruv = opticalCenters[index]/texSizes[index];
//    vec2 uvd = uvin-centeruv;
    vec2 uvpix = uvin*texSizes[index];
//    return uvpix/texSizes[index];
    vec2 uvrecenteredpix = uvpix-opticalCenters[index];

//    return (uvrecenteredpix+opticalCenters[index])/texSizes[index];

    vec2 lenscoords = uvrecenteredpix/focalLengths[index];

//    return ((lenscoords*focalLengths[index])+opticalCenters[index])/texSizes[index];


//
    float r2 = dot(lenscoords, lenscoords);
    float r4 = r2*r2;
//
    float cterm = distortions[index].x*r2+distortions[index].y*r4;
//    float cterm = 0.0;
    vec2 correctedlenscoords = (lenscoords*(1.0+cterm));
    vec2 correctedimcoords = correctedlenscoords*focalLengths[index];
//
////    vec2 duv = (lenscoords)*focalLengths[index]+opticalCenters[index];
////    float distortionTerm = distortions[index]
////    return duv;
    return (correctedimcoords+opticalCenters[index])/texSizes[index];
//    return (correctedimcoords+opticalCenters[index])/texSizes[index];
}

vec4 sampleTexValue(int index, vec2 uvin){
    vec2 uv = undistortedUV(index, uvin);

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

    if(index==14){
        return texture(tex14Map, uv);
    }

    return texture(tex15Map, uv);
}

vec2 orientedDeviceTexCoords(vec2 texCoords, int orientation){
    if(orientation == 0){
//        return vec2(1.0-texCoords.x, texCoords.y);
        return vec2(texCoords.y, 1.0-texCoords.x);
    }
    if(orientation == 1){
        return vec2(texCoords.y, 1.0-texCoords.x);
    }
    if(orientation == 2){
        return vec2(1.0-texCoords.y, 1.0-texCoords.x);
    }
    return texCoords;
}


void main()    {
//    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
//    gl_FragColor = sampleTexValue(0,vUv);
    //    vec4 inputPix = texture(inputMap, vUv);
    vec4 oval = vec4(0.0,0.0,0.0,0.0);
    float boundary = 0.1;

    for(int tx=0;tx<nTextures;tx++){
        vec4 capturedCoord = projections[tx]*poses[tx]*worldCoordinates;
        vec2 rpcoords = capturedCoord.xy/capturedCoord.w;
        rpcoords = (rpcoords+vec2(1.0,1.0))*0.5;

        vec4 contrib = sampleTexValue(tx, orientedDeviceTexCoords(vec2(rpcoords.x, rpcoords.y), deviceOrientations[tx]))*weights[tx];
        float outb = 0.0;
        if(rpcoords.x>(1.0-boundary)){
            outb = max(outb,rpcoords.x-(1.0-boundary));
        }
        if(rpcoords.x<boundary){
            outb = max(outb, boundary-rpcoords.x);
        }
        if(rpcoords.y>(1.0-boundary)){
            outb = max(outb,rpcoords.y-(1.0-boundary));
        }
        if(rpcoords.y<boundary){
            outb = max(outb, boundary-rpcoords.y);
        }
        if(outb>0.0){
            oval = oval + max(0.0,(boundary-outb)/boundary)*contrib;
        }else{
            oval = oval + contrib;
        }


//        oval = vec4(vec2(rpcoords.x, 1.0-rpcoords.y), 0.0, 1.0);
    }
//    if(homogenize){
//        oval=oval/oval.w;
//    }
//    gl_FragColor = oval;
//
//    vec4 capturedCoord = projections[0]*poses[0]*worldCoordinates;
//    vec2 rpcoords = capturedCoord.xy/capturedCoord.w;
//    rpcoords = (rpcoords+vec2(1.0,1.0))*0.5;
//
//    vec2 tcoord = undistortedUV(0,rpcoords);
////    vec2 tcoord = rpcoords;
//    oval.xy=tcoord.xy;
////    oval.xy = tcoord;
////    oval.xy = texSizes[0];
//    oval.z=0.0;
//    oval.w = 1.0;



    gl_FragColor = oval;
//    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}

