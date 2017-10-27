#ifdef GL_ES
    #define LOWP lowp
    precision mediump float;
#else
    #define LOWP
#endif
varying LOWP vec4 vColor;
varying vec2 vTexCoord;

uniform sampler2D u_texture;
uniform float width;
uniform float height;
uniform float radius;
uniform vec2 dir;
uniform int edgedetect;
uniform vec3 color;

void main() {
	vec4 sum = vec4(0.0);
	vec2 tc = vTexCoord;
	float hblur = radius/width;
	float vblur = radius/height;

    float hstep = dir.x;
    float vstep = dir.y;

    if (edgedetect==1) {
        vec4 p = texture2D(u_texture, tc);
        if (p.a < 0.5) {
            gl_FragColor = vec4(color.rgb, 0.0);
        } else {
            p = texture2D(u_texture, vec2(tc.x + 1.0*hblur, tc.y));
            p = min(
                texture2D(u_texture, vec2(tc.x + 1.0*hblur, tc.y)),
                texture2D(u_texture, vec2(tc.x - 1.0*hblur, tc.y))
                );
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y + 1.0*vblur)));
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y - 1.0*vblur)));
            gl_FragColor = vec4(color.rgb, 1.0 - step(0.5, p.a));
        }
    } else {
	    sum += texture2D(u_texture, vec2(tc.x - 4.0*hblur*hstep, tc.y - 4.0*vblur*vstep)) * 0.05;
	    sum += texture2D(u_texture, vec2(tc.x - 3.0*hblur*hstep, tc.y - 3.0*vblur*vstep)) * 0.09;
	    sum += texture2D(u_texture, vec2(tc.x - 2.0*hblur*hstep, tc.y - 2.0*vblur*vstep)) * 0.12;
	    sum += texture2D(u_texture, vec2(tc.x - 1.0*hblur*hstep, tc.y - 1.0*vblur*vstep)) * 0.15;

	    sum += texture2D(u_texture, vec2(tc.x, tc.y)) * 0.16;

	    sum += texture2D(u_texture, vec2(tc.x + 1.0*hblur*hstep, tc.y + 1.0*vblur*vstep)) * 0.15;
	    sum += texture2D(u_texture, vec2(tc.x + 2.0*hblur*hstep, tc.y + 2.0*vblur*vstep)) * 0.12;
	    sum += texture2D(u_texture, vec2(tc.x + 3.0*hblur*hstep, tc.y + 3.0*vblur*vstep)) * 0.09;
	    sum += texture2D(u_texture, vec2(tc.x + 4.0*hblur*hstep, tc.y + 4.0*vblur*vstep)) * 0.05;

    	gl_FragColor = vColor * vec4(sum.rgba);
    }
}