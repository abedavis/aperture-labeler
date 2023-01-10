precision highp float;
precision highp int;

uniform sampler2D inputMap;
uniform sampler2D input2Map;

varying vec4 vPosition;
varying vec2 vUv;

void main()	{
    vec4 tval = texture(inputMap, vUv);
    gl_FragColor = vec4(tval.xyz, 1.0);
//    gl_FragColor = vec4(tval.xyz/tval.w, 1.0);
//    gl_FragColor = vec4(tval.www, 1.0);
//    gl_FragColor = vec4(0.0,1.0,0.0,1.0);
}
