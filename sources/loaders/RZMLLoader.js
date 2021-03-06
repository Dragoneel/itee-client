/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

/**
 * @file This RZMLLoader allow to load images in space
 *
 * @author Tristan Valcke <valcke.tristan@gmail.com>
 * @license LGPLv3
 *
 */

import {
    _Math,
    DefaultLoadingManager,
    DoubleSide,
    FileLoader,
    Group,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    TextureLoader,
} from 'three-full'

import { DefaultLogger as TLogger } from '../loggers/TLogger'

/**
 *
 * @param manager
 * @constructor
 */
function RZMLLoader ( manager ) {

    this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

    this.textureLoader  = new TextureLoader();
    this.imagesShotData = [];

}

Object.assign( RZMLLoader.prototype, {

    /**
     *
     */
    constructor: RZMLLoader,

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( url, onLoad, onProgress, onError ) {

        //TLogger.time( "RZMLLoader" )

        var filePath = url.replace( /[^\/]*$/, '' )

        var scope = this;

        var loader = new FileLoader( scope.manager );
        loader.setResponseType( 'text/plain' );
        loader.load( url, function ( text ) {

            onLoad( scope._parse( text, filePath ) );

        }, onProgress, onError );

    },

    /**
     *
     * @param text
     * @param filePath
     * @return {*}
     * @private
     */
    _parse ( text, filePath ) {

        var document = null;

        if ( window.DOMParser ) {
            var parser = new DOMParser();
            document   = parser.parseFromString( text, "text/xml" );
        }
        else // Internet Explorer
        {
            document       = new ActiveXObject( "Microsoft.XMLDOM" );
            document.async = false;
            document.loadXML( text );
        }

        var shots              = document.getElementsByTagName( 'SHOT' );
        var shot               = undefined;
        var cfrmElement        = undefined;
        var translationElement = undefined;
        var rotationElement    = undefined;
        var iplnElement        = undefined;
        for ( var i = 0, numberOfShots = shots.length ; i < numberOfShots ; ++i ) {
            shot               = shots[ i ];
            cfrmElement        = shot.children[ 0 ];
            translationElement = cfrmElement.children[ 0 ];
            rotationElement    = cfrmElement.children[ 1 ];
            iplnElement        = shot.children[ 1 ];

            // Todo: consider using array and/or create directly floating images from there
            this.imagesShotData.push( {
                imageName: shot.attributes[ "n" ].value,
                //        imagePath: iplnElement.attributes["img"].value,
                position:  {
                    x: parseFloat( translationElement.attributes[ "x" ].value ),
                    y: parseFloat( translationElement.attributes[ "y" ].value ),
                    z: parseFloat( translationElement.attributes[ "z" ].value )
                },
                rotation:  {
                    x: parseFloat( rotationElement.attributes[ "x" ].value ),
                    y: parseFloat( rotationElement.attributes[ "y" ].value ),
                    z: parseFloat( rotationElement.attributes[ "z" ].value )
                }
            } );
        }

        //TLogger.timeEnd( "RZMLLoader" );

        return this._createImagesPacks( filePath );
    },

    /**
     *
     * @param filePath
     * @return {Group}
     * @private
     */
    _createImagesPacks ( filePath ) {

        var imagesShots = this.imagesShotData
        var planesGroup = new Group()
        var imageShot   = undefined
        var plane       = undefined
        for ( var i = 0, numberOfShots = imagesShots.length ; i < numberOfShots ; ++i ) {

            imageShot = imagesShots[ i ]

            plane = new Mesh(
                new PlaneGeometry( 0.06528, 0.04896, 1, 1 ),
                new MeshBasicMaterial( {
                    color: 0xffffff,
                    side:  DoubleSide
                } ) )

            plane.name       = imageShot.imageName
            plane.position.x = imageShot.position.x - 600200
            plane.position.y = imageShot.position.y - 131400
            plane.position.z = imageShot.position.z - 60 - 0.34
            plane.rotation.x = _Math.degToRad( imageShot.rotation.x )
            plane.rotation.y = _Math.degToRad( imageShot.rotation.z ) // Need to inverse y and z due to z up import !!!
            plane.rotation.z = -(_Math.degToRad( imageShot.rotation.y ))
            // plane.visible    = false

            plane.userData = {
                filePath: filePath
            }

            planesGroup.add( plane )

        }

        planesGroup.rotateX( -(Math.PI / 2) )

        return planesGroup

    }

} )

export { RZMLLoader }
