/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

/* eslint-env browser */

THREE.FresnelBlueShader = {

    uniforms: {

        "mRefractionRatio": {
            type:  "f",
            value: 1.02
        },
        "mFresnelBias":     {
            type:  "f",
            value: 0.2
        },
        "mFresnelPower":    {
            type:  "f",
            value: 2.0
        },
        "mFresnelScale":    {
            type:  "f",
            value: 1.0
        },
        "tCube":            {
            type:  "t",
            value: null
        },
        "alpha":            {
            type:  'f',
            value: 1.0
        }

    },

    vertexShader: [

                      "uniform float mRefractionRatio;",
                      "uniform float mFresnelBias;",
                      "uniform float mFresnelScale;",
                      "uniform float mFresnelPower;",
                      "uniform float alpha;",

                      "varying vec3 vReflect;",
                      "varying vec3 vRefract[3];",
                      "varying float vReflectionFactor;",

                      "void main() {",

                      "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                      "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

                      "vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

                      "vec3 I = worldPosition.xyz - cameraPosition;",

                      "vReflect = reflect( I, worldNormal );",
                      "vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
                      "vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
                      "vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
                      "vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

                      "gl_Position = projectionMatrix * mvPosition;",

                      "}"

                  ].join( "\n" ),

    fragmentShader: [

                        "uniform samplerCube tCube;",

                        "varying vec3 vReflect;",
                        "varying vec3 vRefract[3];",
                        "varying float vReflectionFactor;",

                        "void main() {",

                        "vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
                        "vec4 refractedColor = vec4( 0.0, 0.0, 4.0, 0.0 );",
                        //        "vec4 refractedColor = vec4( 0.0, 0.0, (textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b) + 3.5, 0.01 );,

                        "gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.2, 1.0 ) );",

                        "}"

                    ].join( "\n" )

};
