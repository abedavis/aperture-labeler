precision highp float;
precision highp int;
varying vec2 vUv;
varying vec4 worldCoordinates;

void main() {
    vUv = uv;
    worldCoordinates=modelMatrix*vec4(position,1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz , 1.0);
}
