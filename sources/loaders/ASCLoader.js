/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file A loader for ASC cloud point files.
 *
 * @example
 *    var loader = new ASCLoader();
 *    loader.load('/path/to/file.asc', function (geometry) {
 *
 *		scene.add( new Mesh( geometry ) );
 *
 *	} );
 *
 * If the ASC file need to be offset,
 * it can be set before loading file.
 *
 * loader.setOffset( {
 *	x: 1.0,
 *  y: 52.0,
 *  z: -5.0
 * } );
 *
 */

/* eslint-env browser */
import {
    BufferAttribute,
    BufferGeometry,
    Color,
    DefaultLoadingManager,
    FileLoader,
    Group,
    Points,
    PointsMaterial
} from 'three-full'

import { DefaultLogger as TLogger } from '../loggers/TLogger'
import { TBoundingBox } from '../cores/TBoundingBox'

/**
 *
 * @param manager
 * @constructor
 */
function ASCLoader ( manager ) {

    this.manager = ( manager ) ? manager : DefaultLoadingManager;

    this._boundingBox    = new TBoundingBox();
    this._points         = [];
    this._numberOfPoints = 0;
    this._coloredPoints  = false;
    this._autoOffset     = false; // Only for tiny files !!!!!!!
    this._offset         = {
        x: 600200,
        y: 131400,
        z: 60
    };

    this._positions   = null;
    this._bufferIndex = 0;

    this._positionsC   = null;
    this._bufferIndexC = 0;

    this.wrongPoints = 0;
}

Object.assign( ASCLoader.prototype, {

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     * @param sampling
     */
    load ( url, onLoad, onProgress, onError, sampling ) {

        //        //TLogger.time("ASCLoader")

        const loader = new FileLoader( this.manager )
        loader.setResponseType( 'blob' )
        loader.load( url, function ( blob ) {

            const groupToFeed = new Group()
            this._parse( blob, groupToFeed, onLoad, onProgress, onError, sampling )
            onLoad( groupToFeed )

        }.bind( this ), onProgress, onError )

    },

    /**
     *
     * @param offset
     */
    setOffset ( offset ) {

        //TODO: check is correct

        this._offset     = offset;
        this._autoOffset = false;

    },

    /**
     *
     * @param blob
     * @param groupToFeed
     * @param onLoad
     * @param onProgress
     * @param onError
     * @param sampling
     * @private
     */
    _parse ( blob, groupToFeed, onLoad, onProgress, onError, sampling ) {

        const self = this

        const _sampling = (sampling) ? sampling : 100

        const reader     = new FileReader()
        const CHUNK_SIZE = 134217728
        let offset       = 0

        reader.onabort = function ( abortEvent ) {

            // TLogger.log("abortEvent:");
            // TLogger.log(abortEvent);

        };

        reader.onerror = function ( errorEvent ) {

            // TLogger.log("errorEvent:");
            // TLogger.log(errorEvent);

            if ( onError ) {
                onError( errorEvent );
            }

        };

        reader.onloadstart = function ( loadStartEvent ) {

            // TLogger.log("loadStartEvent:");
            // TLogger.log(loadStartEvent);

        };

        reader.onprogress = function ( progressEvent ) {

            // TLogger.log("progressEvent:");
            // TLogger.log(progressEvent);

            // // By lines
            // var lines = this.result.split('\n');
            // for(var lineIndex = 0, numberOfLine = lines.length; lineIndex < numberOfLine; ++lineIndex){
            //     self._parseLine(lines[lineIndex])
            // }

            if ( onProgress ) {
                onProgress( progressEvent );
            }

        };

        reader.onload = function ( loadEvent ) {

            // TLogger.log("loadEvent:");
            // TLogger.log(loadEvent);

            // By lines
            const lines         = this.result.split( '\n' );
            const numberOfLines = lines.length;

            // /!\ Rollback offset for last line that is uncompleted in most time
            offset -= lines[ numberOfLines - 1 ].length;

            // //TLogger.time("Parse Lines A");
            const modSampling = Math.round( 100 / _sampling )
            for ( let lineIndex = 0 ; lineIndex < numberOfLines - 1 ; lineIndex++ ) {
                if ( lineIndex % modSampling === 0 ) // Just to make cloud lighter under debug !!!!
                {
                    self._parseLine( lines[ lineIndex ] )
                }
            }
            // //TLogger.timeEnd("Parse Lines A");

            // //TLogger.time("Parse Lines B");
            // self._parseLines(lines);
            // //TLogger.timeEnd("Parse Lines B");

            ////Todo: use ArrayBuffer instead !!!
            // //TLogger.time("Parse Lines B");
            // self._bufferIndex = 0;
            // self._positions = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // //TLogger.timeEnd("Parse Lines B");
            //
            // //TLogger.time("Parse Lines C");
            // self._bufferIndexC = 0;
            // self._positionsC = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // //TLogger.timeEnd("Parse Lines C");

        };

        reader.onloadend = function ( loadEndEvent ) {

            // TLogger.log("loadEndEvent");
            // TLogger.log(loadEndEvent);

            if ( self._points.length > 1000000 || offset + CHUNK_SIZE >= blob.size ) {

                // Compute bounding box in view to get his center for auto offseting the cloud point.
                // if ( self._autoOffset ) {
                //     //TLogger.time("Compute Points");
                //     self._boundingBox.computePoints(self._points);
                //     //TLogger.timeEnd("Compute Points");
                // }

                // //TLogger.time("Offset Points");
                self._offsetPoints();
                // //TLogger.timeEnd("Offset Points");

                // //TLogger.time("Create WorldCell");
                self._createSubCloudPoint( groupToFeed );
                // //TLogger.timeEnd("Create WorldCell");

            }

            offset += CHUNK_SIZE;
            seek();

        };

        // reader.readAsText(blob);
        seek();

        function seek () {
            if ( offset >= blob.size ) {

                // //TLogger.timeEnd("Parse")
                //                //TLogger.timeEnd( "ASCLoader" )

                // // Compute bounding box in view to get his center for auto offseting the cloud point.
                // if ( self._autoOffset ) {
                //     //TLogger.time("Compute Points");
                //     self._boundingBox.computePoints(self._points);
                //     //TLogger.timeEnd("Compute Points");
                // }
                //
                // //TLogger.time("Offset Points");
                // self._offsetPoints();
                // //TLogger.timeEnd("Offset Points");
                //
                // //TLogger.time("Create WorldCell");
                // self._createCloudPoint(groupToFeed);
                // // var cloudPoints = self._createCloudPoint();
                // //TLogger.timeEnd("Create WorldCell");
                // // onLoad(cloudPoints);

                return;
            }

            const slice = blob.slice( offset, offset + CHUNK_SIZE, "text/plain" )
            reader.readAsText( slice )
        }

    },

    /**
     *
     * @param line
     * @private
     */
    _parseLine ( line ) {

        const values        = line.split( " " )
        const numberOfWords = values.length

        if ( numberOfWords === 3 ) {

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] )
            } )

        } else if ( numberOfWords === 4 ) {

            this._pointsHaveIntensity = true

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] )
            } )

        } else if ( numberOfWords === 6 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveColor = true

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                r: parseFloat( values[ 3 ] ),
                g: parseFloat( values[ 4 ] ),
                b: parseFloat( values[ 5 ] )
            } )

        } else if ( numberOfWords === 7 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveIntensity = true
            this._pointsHaveColor     = true

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] ),
                r: parseFloat( values[ 4 ] ),
                g: parseFloat( values[ 5 ] ),
                b: parseFloat( values[ 6 ] )
            } )

        } else if ( numberOfWords === 9 ) {

            this._pointsHaveColor   = true
            this._pointsHaveNormals = true

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                r:  parseFloat( values[ 3 ] ),
                g:  parseFloat( values[ 4 ] ),
                b:  parseFloat( values[ 5 ] ),
                nx: parseFloat( values[ 6 ] ),
                ny: parseFloat( values[ 7 ] ),
                nz: parseFloat( values[ 8 ] )
            } )

        } else if ( numberOfWords === 10 ) {

            this._pointsHaveIntensity = true
            this._pointsHaveColor     = true
            this._pointsHaveNormals   = true

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                i:  parseFloat( values[ 3 ] ),
                r:  parseFloat( values[ 4 ] ),
                g:  parseFloat( values[ 5 ] ),
                b:  parseFloat( values[ 6 ] ),
                nx: parseFloat( values[ 7 ] ),
                ny: parseFloat( values[ 8 ] ),
                nz: parseFloat( values[ 9 ] )
            } )

        } else {
            TLogger.error( "Invalid data line: " + line )
        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLines ( lines ) {

        const firstLine = lines[ 0 ].split( " " )
        const pointType = firstLine.length

        if ( pointType === 3 ) {

            this._parseLinesAsXYZ( lines )

        } else if ( pointType === 4 ) {

            this._parseLinesAsXYZI( lines )

        } else if ( pointType === 6 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZRGB( lines )

        } else if ( pointType === 7 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals see _parseLinesAsXYZInXnYnZ
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZIRGB( lines )

        } else if ( pointType === 9 ) {

            this._parseLinesAsXYZRGBnXnYnZ( lines )

        } else if ( pointType === 10 ) {

            this._parseLinesAsXYZIRGBnXnYnZ( lines )

        } else {
            TLogger.error( "Invalid data line: " + line )
        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZ ( lines ) {

        let words = []

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] )
            } )
        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZI ( lines ) {

        this._pointsHaveIntensity = true
        let words                 = []

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] )
            } )

        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZRGB ( lines ) {

        this._pointsHaveColor = true
        let words             = []

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                r: parseFloat( words[ 3 ] ),
                g: parseFloat( words[ 4 ] ),
                b: parseFloat( words[ 5 ] )
            } )

        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZnXnYnZ ( lines ) {

        let words = [];
        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )

        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZIRGB ( lines ) {

        this._pointsHaveIntensity = true
        this._pointsHaveColor     = true
        let words                 = []

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] ),
                r: parseFloat( words[ 4 ] ),
                g: parseFloat( words[ 5 ] ),
                b: parseFloat( words[ 6 ] )
            } )
        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZInXnYnZ ( lines ) {

        let words = [];
        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )
        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZRGBnXnYnZ ( lines ) {

        this._pointsHaveColor   = true
        this._pointsHaveNormals = true
        let words               = []

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                r:  parseFloat( words[ 3 ] ),
                g:  parseFloat( words[ 4 ] ),
                b:  parseFloat( words[ 5 ] ),
                nx: parseFloat( words[ 6 ] ),
                ny: parseFloat( words[ 7 ] ),
                nz: parseFloat( words[ 8 ] )
            } )

        }

    },

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZIRGBnXnYnZ ( lines ) {

        this._pointsHaveIntensity = true
        this._pointsHaveColor     = true
        this._pointsHaveNormals   = true
        let words                 = []

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " )

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                i:  parseFloat( words[ 3 ] ),
                r:  parseFloat( words[ 4 ] ),
                g:  parseFloat( words[ 5 ] ),
                b:  parseFloat( words[ 6 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } )

        }
    },

    /**
     *
     * @param line
     * @private
     */
    _parseLineB ( line ) {

        const values        = line.split( " " )
        const numberOfWords = values.length
        const bufferIndex   = this._bufferIndex

        if ( numberOfWords === 3 ) {

            // positions
            this._positions[ bufferIndex ]     = parseFloat( values[ 0 ] )
            this._positions[ bufferIndex + 1 ] = parseFloat( values[ 1 ] )
            this._positions[ bufferIndex + 2 ] = parseFloat( values[ 2 ] )

            this._bufferIndex += 3

        }

    },

    /**
     *
     * @param line
     * @private
     */
    _parseLineC: function ( line ) {

        const values        = line.split( " " )
        const numberOfWords = values.length
        const bufferIndex   = this._bufferIndexC

        if ( numberOfWords === 3 ) {

            // positions
            this._positionsC[ bufferIndex ]     = Number.parseFloat( values[ 0 ] )
            this._positionsC[ bufferIndex + 1 ] = Number.parseFloat( values[ 1 ] )
            this._positionsC[ bufferIndex + 2 ] = Number.parseFloat( values[ 2 ] )

            this._bufferIndexC += 3

        }

    },

    /**
     *
     * @private
     */
    _offsetPoints () {

        const offset         = (this._autoOffset) ? this._boundingBox.getCenter() : this._offset
        const numberOfPoints = this._points.length;
        let point            = null;
        for ( let i = 0 ; i < numberOfPoints ; ++i ) {

            point = this._points[ i ]
            point.x -= offset.x
            point.y -= offset.y
            point.z -= offset.z

        }

    },

    /**
     *
     * @param groupToFeed
     * @private
     */
    _createCloudPoint ( groupToFeed ) {

        const SPLIT_LIMIT        = 1000000
        // var group = new Group();
        const numberOfPoints     = this._points.length
        const numberOfSplit      = Math.ceil( numberOfPoints / SPLIT_LIMIT )
        let splice               = undefined
        let numberOfPointInSplit = 0
        let cloud                = undefined

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = this._points.splice( 0, SPLIT_LIMIT )
            numberOfPointInSplit = splice.length

            const geometry  = new BufferGeometry()
            const positions = new Float32Array( numberOfPointInSplit * 3 )
            const colors    = new Float32Array( numberOfPointInSplit * 3 )
            const color     = new Color()
            let bufferIndex = 0
            let point       = undefined

            for ( let i = 0 ; i < numberOfPointInSplit ; ++i ) {

                // current point
                point = splice[ i ];

                // positions
                positions[ bufferIndex ]     = point.x
                positions[ bufferIndex + 1 ] = point.y
                positions[ bufferIndex + 2 ] = point.z

                // colors
                if ( this._pointsHaveColor ) {
                    colors[ bufferIndex ]     = point.r / 255
                    colors[ bufferIndex + 1 ] = point.g / 255
                    colors[ bufferIndex + 2 ] = point.b / 255
                } else {
                    colors[ bufferIndex ]     = 0.1
                    colors[ bufferIndex + 1 ] = 0.2
                    colors[ bufferIndex + 2 ] = 0.5
                }

                bufferIndex += 3

            }

            geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) )
            geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) )

            const material = new PointsMaterial( {
                size:         0.01,
                vertexColors: true
            } )

            cloud = new Points( geometry, material )
            groupToFeed.children.push( cloud )
            // group.children.push(cloud);
        }

        // return group;

    },

    /**
     *
     * @param group
     * @private
     */
    _createSubCloudPoint ( group ) {

        const numberOfPoints = this._points.length;
        const geometry       = new BufferGeometry()
        const positions      = new Float32Array( numberOfPoints * 3 )
        const colors         = new Float32Array( numberOfPoints * 3 )
        const color          = new Color()
        let bufferIndex      = 0
        let point            = undefined

        for ( let i = 0 ; i < numberOfPoints ; ++i ) {

            // current point
            point = this._points[ i ]

            // positions
            positions[ bufferIndex ]     = point.x
            positions[ bufferIndex + 1 ] = point.y
            positions[ bufferIndex + 2 ] = point.z

            // colors
            if ( this._pointsHaveColor ) {
                colors[ bufferIndex ]     = point.r / 255
                colors[ bufferIndex + 1 ] = point.g / 255
                colors[ bufferIndex + 2 ] = point.b / 255
            } else {
                colors[ bufferIndex ]     = 0.1
                colors[ bufferIndex + 1 ] = 0.2
                colors[ bufferIndex + 2 ] = 0.5
            }

            bufferIndex += 3

        }

        geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) )
        geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) )

        var material = new PointsMaterial( {
            size:         0.005,
            vertexColors: true
        } )

        var cloud = new Points( geometry, material )
        //Todo: Apply import coordinates syteme here !
        cloud.rotation.x -= Math.PI / 2

        group.children.push( cloud )

        // Clear current processed points
        this._points = []

    }

} )

export { ASCLoader }
