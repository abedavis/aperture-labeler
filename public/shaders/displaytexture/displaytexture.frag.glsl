precision highp float;
precision highp int;

uniform sampler2D inputMap;
uniform sampler2D input2Map;

varying vec4 vPosition;
varying vec2 vUv;

void main()	{
    gl_FragColor = texture(inputMap, vUv);
}