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

// Nice website for computing Gaussian coeffs:
//  http://dev.theomader.com/gaussian-kernel-calculator/
// Sigma=3, Kernel Size=19
// coeff2D:
//    0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.01 0.01 0.01 0.01 0.01 0.00 0.00 0.00 0.00 0.00 0.00 0.00
//    0.00 0.00 0.00 0.00 0.00 0.01 0.01 0.01 0.02 0.02 0.02 0.01 0.01 0.01 0.00 0.00 0.00 0.00 0.00
//    0.00 0.00 0.00 0.01 0.01 0.02 0.02 0.03 0.04 0.04 0.04 0.03 0.02 0.02 0.01 0.01 0.00 0.00 0.00
//    0.00 0.00 0.01 0.01 0.02 0.03 0.05 0.06 0.07 0.08 0.07 0.06 0.05 0.03 0.02 0.01 0.01 0.00 0.00
//    0.00 0.00 0.01 0.02 0.04 0.06 0.09 0.12 0.14 0.14 0.14 0.12 0.09 0.06 0.04 0.02 0.01 0.00 0.00
//    0.00 0.01 0.02 0.03 0.06 0.10 0.14 0.19 0.22 0.24 0.22 0.19 0.14 0.10 0.06 0.03 0.02 0.01 0.00
//    0.00 0.01 0.02 0.05 0.09 0.14 0.21 0.28 0.33 0.35 0.33 0.28 0.21 0.14 0.09 0.05 0.02 0.01 0.00
//    0.01 0.01 0.03 0.06 0.12 0.19 0.28 0.37 0.43 0.46 0.43 0.37 0.28 0.19 0.12 0.06 0.03 0.01 0.01
//    0.01 0.02 0.04 0.07 0.14 0.22 0.33 0.43 0.51 0.54 0.51 0.43 0.33 0.22 0.14 0.07 0.04 0.02 0.01
//    0.01 0.02 0.04 0.08 0.14 0.24 0.35 0.46 0.54 0.57 0.54 0.46 0.35 0.24 0.14 0.08 0.04 0.02 0.01
//    0.01 0.02 0.04 0.07 0.14 0.22 0.33 0.43 0.51 0.54 0.51 0.43 0.33 0.22 0.14 0.07 0.04 0.02 0.01
//    0.01 0.01 0.03 0.06 0.12 0.19 0.28 0.37 0.43 0.46 0.43 0.37 0.28 0.19 0.12 0.06 0.03 0.01 0.01
//    0.00 0.01 0.02 0.05 0.09 0.14 0.21 0.28 0.33 0.35 0.33 0.28 0.21 0.14 0.09 0.05 0.02 0.01 0.00
//    0.00 0.01 0.02 0.03 0.06 0.10 0.14 0.19 0.22 0.24 0.22 0.19 0.14 0.10 0.06 0.03 0.02 0.01 0.00
//    0.00 0.00 0.01 0.02 0.04 0.06 0.09 0.12 0.14 0.14 0.14 0.12 0.09 0.06 0.04 0.02 0.01 0.00 0.00
//    0.00 0.00 0.01 0.01 0.02 0.03 0.05 0.06 0.07 0.08 0.07 0.06 0.05 0.03 0.02 0.01 0.01 0.00 0.00
//    0.00 0.00 0.00 0.01 0.01 0.02 0.02 0.03 0.04 0.04 0.04 0.03 0.02 0.02 0.01 0.01 0.00 0.00 0.00
//    0.00 0.00 0.00 0.00 0.00 0.01 0.01 0.01 0.02 0.02 0.02 0.01 0.01 0.01 0.00 0.00 0.00 0.00 0.00
//    0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.01 0.01 0.01 0.01 0.01 0.00 0.00 0.00 0.00 0.00 0.00 0.00


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
            p = min(p, texture2D(u_texture, vec2(tc.x - 1.0*hblur, tc.y)));
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y + 1.0*vblur)));
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y - 1.0*vblur)));
            // keep going to make wider edges...
            p = min(p, texture2D(u_texture, vec2(tc.x + 2.0*hblur, tc.y)));
            p = min(p, texture2D(u_texture, vec2(tc.x - 2.0*hblur, tc.y)));
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y + 2.0*vblur)));
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y - 2.0*vblur)));

            p = min(p, texture2D(u_texture, vec2(tc.x + 3.0*hblur, tc.y)));
            p = min(p, texture2D(u_texture, vec2(tc.x - 3.0*hblur, tc.y)));
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y + 3.0*vblur)));
            p = min(p, texture2D(u_texture, vec2(tc.x, tc.y - 3.0*vblur)));


            gl_FragColor = vec4(color.rgb, 1.0 - step(0.5, p.a));
        }
    } else {
	    // 2-D Gaussian filter (we ignore any coeff less than 0.01) <-- frame rate drops to 27
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 9.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 8.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 8.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 8.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 8.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y - 7.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y - 7.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 7.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 7.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 7.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 7.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 7.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y - 7.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y - 7.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y - 6.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y - 6.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y - 6.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 6.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 6.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 6.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 6.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 6.0*vstep)) * 0.08;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 6.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 6.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 6.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 6.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y - 6.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y - 6.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y - 6.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y - 5.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y - 5.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y - 5.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 5.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 5.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 5.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 5.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 5.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 5.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 5.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 5.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 5.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y - 5.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y - 5.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y - 5.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y - 4.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y - 4.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y - 4.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y - 4.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 4.0*vstep)) * 0.1;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 4.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 4.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 4.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 4.0*vstep)) * 0.24;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 4.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 4.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 4.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 4.0*vstep)) * 0.1;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y - 4.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y - 4.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y - 4.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y - 4.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y - 3.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y - 3.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y - 3.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y - 3.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 3.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 3.0*vstep)) * 0.21;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 3.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 3.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 3.0*vstep)) * 0.35;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 3.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 3.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 3.0*vstep)) * 0.21;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 3.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y - 3.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y - 3.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y - 3.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y - 3.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 9.0*hstep, tc.y - 2.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y - 2.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y - 2.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y - 2.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y - 2.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 2.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 2.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 2.0*vstep)) * 0.37;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 2.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 2.0*vstep)) * 0.46;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 2.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 2.0*vstep)) * 0.37;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 2.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 2.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y - 2.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y - 2.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y - 2.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y - 2.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 9.0*hstep, tc.y - 2.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 9.0*hstep, tc.y - 1.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y - 1.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y - 1.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y - 1.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y - 1.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y - 1.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y - 1.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y - 1.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y - 1.0*vstep)) * 0.51;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y - 1.0*vstep)) * 0.54;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y - 1.0*vstep)) * 0.51;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y - 1.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y - 1.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y - 1.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y - 1.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y - 1.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y - 1.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y - 1.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 9.0*hstep, tc.y - 1.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 9.0*hstep, tc.y + 0.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y + 0.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y + 0.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 0.0*vstep)) * 0.08;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 0.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 0.0*vstep)) * 0.24;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 0.0*vstep)) * 0.35;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 0.0*vstep)) * 0.46;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 0.0*vstep)) * 0.54;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 0.0*vstep)) * 0.57;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 0.0*vstep)) * 0.54;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 0.0*vstep)) * 0.46;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 0.0*vstep)) * 0.35;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 0.0*vstep)) * 0.24;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 0.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 0.0*vstep)) * 0.08;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y + 0.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y + 0.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 9.0*hstep, tc.y + 0.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 9.0*hstep, tc.y + 1.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y + 1.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y + 1.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 1.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 1.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 1.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 1.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 1.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 1.0*vstep)) * 0.51;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 1.0*vstep)) * 0.54;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 1.0*vstep)) * 0.51;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 1.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 1.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 1.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 1.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 1.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y + 1.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y + 1.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 9.0*hstep, tc.y + 1.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 9.0*hstep, tc.y + 2.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y + 2.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y + 2.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 2.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 2.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 2.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 2.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 2.0*vstep)) * 0.37;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 2.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 2.0*vstep)) * 0.46;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 2.0*vstep)) * 0.43;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 2.0*vstep)) * 0.37;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 2.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 2.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 2.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 2.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y + 2.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y + 2.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 9.0*hstep, tc.y + 2.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y + 3.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y + 3.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 3.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 3.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 3.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 3.0*vstep)) * 0.21;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 3.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 3.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 3.0*vstep)) * 0.35;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 3.0*vstep)) * 0.33;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 3.0*vstep)) * 0.28;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 3.0*vstep)) * 0.21;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 3.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 3.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 3.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y + 3.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y + 3.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 8.0*hstep, tc.y + 4.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y + 4.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 4.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 4.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 4.0*vstep)) * 0.1;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 4.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 4.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 4.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 4.0*vstep)) * 0.24;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 4.0*vstep)) * 0.22;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 4.0*vstep)) * 0.19;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 4.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 4.0*vstep)) * 0.1;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 4.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 4.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y + 4.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 8.0*hstep, tc.y + 4.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y + 5.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 5.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 5.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 5.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 5.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 5.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 5.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 5.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 5.0*vstep)) * 0.14;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 5.0*vstep)) * 0.12;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 5.0*vstep)) * 0.09;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 5.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 5.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 5.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y + 5.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 7.0*hstep, tc.y + 6.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 6.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 6.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 6.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 6.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 6.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 6.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 6.0*vstep)) * 0.08;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 6.0*vstep)) * 0.07;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 6.0*vstep)) * 0.06;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 6.0*vstep)) * 0.05;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 6.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 6.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 6.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 7.0*hstep, tc.y + 6.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 6.0*hstep, tc.y + 7.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 5.0*hstep, tc.y + 7.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 7.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 7.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 7.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 7.0*vstep)) * 0.04;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 7.0*vstep)) * 0.03;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 7.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 5.0*hstep, tc.y + 7.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 6.0*hstep, tc.y + 7.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 4.0*hstep, tc.y + 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 3.0*hstep, tc.y + 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 8.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 8.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 8.0*vstep)) * 0.02;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 3.0*hstep, tc.y + 8.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 4.0*hstep, tc.y + 8.0*vstep)) * 0.01;

sum += texture2D(u_texture, vec2(tc.x - 2.0*hstep, tc.y + 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x - 1.0*hstep, tc.y + 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 0.0*hstep, tc.y + 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 1.0*hstep, tc.y + 9.0*vstep)) * 0.01;
sum += texture2D(u_texture, vec2(tc.x + 2.0*hstep, tc.y + 9.0*vstep)) * 0.01;

    	gl_FragColor = vColor * vec4(sum.rgba);
    }
}