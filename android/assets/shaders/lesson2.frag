#ifdef GL_ES
    #define LOWP lowp
    precision mediump float;
#else
    #define LOWP
#endif

varying LOWP vec4 vColor;
varying vec2 vTexCoord;
uniform sampler2D u_texture;

void main() {
	vec4 texColor = texture2D(u_texture, vTexCoord);

	texColor.rgb = 1.0 - texColor.rgb;

	gl_FragColor = texColor * vColor;
}
