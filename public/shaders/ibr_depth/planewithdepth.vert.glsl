precision highp float;
precision highp int;
varying vec2 vUv;
varying vec4 vPosition;
varying vec4 mPosition;

uniform sampler2D depthMap;
uniform mat4 captureCameraProjMat;
varying float depth;

void main() {
    vec4 depthData = texture(depthMap, vec2(uv.x, 1.0-uv.y));
    depth = depthData.x;
    if (depth < 1.0) {
        depth = 100.0;
    }
    float hasDepth = depthData.y;

    mPosition = inverse(captureCameraProjMat) * vec4(position.x, position.y, 1.0, 1.0);
    mPosition = vec4(mPosition.xyz / mPosition.z * (-depth), 1.0);

    vUv = vec2(uv.x, uv.y);
    vPosition = modelViewMatrix * mPosition;
    gl_Position = projectionMatrix * vPosition;
}