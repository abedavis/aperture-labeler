precision highp float;
precision highp int;
varying vec2 vUv;
varying vec4 vPosition;
varying mat4 mProj;

void main() {
    vUv = uv;
    vPosition = modelViewMatrix * vec4(position, 1.0);
    mProj = projectionMatrix;
    gl_Position = projectionMatrix * vPosition;
}
