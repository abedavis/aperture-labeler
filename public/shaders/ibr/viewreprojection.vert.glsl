precision highp float;
precision highp int;
varying vec2 vUv;
varying vec4 vPosition;

void main() {
    vUv = uv;
    vPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * vPosition;
}
