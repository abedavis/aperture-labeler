precision highp float;
precision highp int;
varying vec2 vUv;
varying vec4 vPosition;
varying mat4 mModel;

uniform sampler2D depthMap;
uniform mat4 captureCameraProjMat;
varying float visibility;
varying vec2 texCoords;

void main() {
    vec4 depthData = texture(depthMap, vec2(uv.x, 1.0-uv.y));
    float depth = depthData.x;
    if (depth < 5.0) {
        depth = 100.0;
        visibility = 1.0;
    }
    // depth = 20.0;

    vec4 mPosition = inverse(captureCameraProjMat) * vec4(position.x, position.y, 1.0, 1.0);
    mPosition = vec4(mPosition.xyz / mPosition.z * (-depth), 1.0);

    vUv = vec2(uv.x, uv.y);
    mModel = modelMatrix;
    vPosition = modelViewMatrix * mPosition;
    gl_Position = projectionMatrix * vPosition;
    texCoords = (gl_Position.xy / gl_Position.w + 1.0) / 2.0;
}