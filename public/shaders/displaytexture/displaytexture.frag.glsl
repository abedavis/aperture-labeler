precision highp float;
precision highp int;

uniform sampler2D inputMap;
uniform sampler2D occupancyMap;

varying vec4 vPosition;
varying vec2 vUv;

void main()	{
    vec4 tval = texture(inputMap, vUv);
    float occupancy = texture(occupancyMap, vUv).x;
    // gl_FragColor = vec4(tval.xyz, 1.0);
    gl_FragColor = vec4(tval.xyz/occupancy, 1.0);
    // gl_FragColor = vec4(tval.www / 15.0, 1.0);
//    gl_FragColor = vec4(tval.www, 1.0);
//    gl_FragColor = vec4(0.0,1.0,0.0,1.0);
}
