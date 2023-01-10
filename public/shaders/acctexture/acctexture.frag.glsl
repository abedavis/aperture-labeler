precision highp float;
precision highp int;

uniform sampler2D inputMap;
uniform sampler2D accMap;
uniform bool init;

varying vec4 vPosition;
varying vec2 vUv;

void main()	{
    if (init) {
        gl_FragColor = texture(inputMap, vUv);
    } else {
        vec4 inputColor = texture(inputMap, vUv);
        vec4 accColor = texture(accMap, vUv);
        gl_FragColor = vec4(inputColor.rgb + accColor.rgb, 1.0);
    }
}