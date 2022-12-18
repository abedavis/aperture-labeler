precision highp float;
precision highp int;


struct PointLight {
    vec3 color;
    vec3 position; // light position, in camera coordinates
    float distance; // used for attenuation purposes.
    float intensity;
    float decay;
};

uniform vec4 modelColor;
uniform sampler2D colorMap;
uniform bool colorMapProvided;

varying vec4 vPosition;
varying vec4 vColor;
varying vec3 vNormal;
varying vec2 vUv;


void main()	{
    vec3 N = normalize(vNormal);
    vec3 position = vPosition.xyz/vPosition.w;
    vec4 surface_color = texture(colorMap, vUv);
    gl_FragColor = surface_color;

}
