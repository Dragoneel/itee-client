/**
 * @author TristanVALCKE / https://github.com/TristanVALCKE
 *
 * This class allow to split any geometries type during runtime.
 * Keeping normals and Uvs. It is really usefull to see inside mesh like building.
 *
 * Constructor parameter:
 *
 * size - the size of the square view
 *
 */

import { DefaultLoadingManager } from '../../../node_modules/three/src/loaders/LoadingManager'
import { DefaultLogger } from '../Loggers/TLogger'
import { FileLoader } from '../../../node_modules/three/src/loaders/FileLoader'
import { Vector3 } from '../../../node_modules/three/src/math/Vector3'
import { Shape } from '../../../node_modules/three/src/extras/core/Shape'
import {
    BinaryReader,
    Endianness
} from './BinaryReader'

///////////

const ShapeType = Object.freeze( {
    NullShape:   0,
    Point:       1,
    Polyline:    3,
    Polygon:     5,
    MultiPoint:  8,
    PointZ:      11,
    PolyLineZ:   13,
    PolygonZ:    15,
    MultiPointZ: 18,
    PointM:      21,
    PolylineM:   23,
    PolygonM:    25,
    MultiPointM: 28,
    MultiPatch:  31
} );

// Helpers
function ringClockwise ( ring ) {

    if ( (n = ring.length) < 4 ) {
        return false;
    }

    var i = 0, n, area = ring[ n - 1 ][ 1 ] * ring[ 0 ][ 0 ] - ring[ n - 1 ][ 0 ] * ring[ 0 ][ 1 ];
    while ( ++i < n ) {
        area += ring[ i - 1 ][ 1 ] * ring[ i ][ 0 ] - ring[ i - 1 ][ 0 ] * ring[ i ][ 1 ];
    }
    return area >= 0;
}

function ringContainsSome ( ring, hole ) {

    var i = -1, n = hole.length, c;
    while ( ++i < n ) {
        if ( c = ringContains( ring, hole[ i ] ) ) {
            return c > 0;
        }
    }
    return false;

}

function ringContains ( ring, point ) {
    var x = point[ 0 ], y = point[ 1 ], contains = -1;
    for ( var i = 0, n = ring.length, j = n - 1 ; i < n ; j = i++ ) {
        var pi                               = ring[ i ], xi               = pi[ 0 ], yi = pi[ 1 ],
            pj = ring[ j ], xj = pj[ 0 ], yj = pj[ 1 ];
        if ( segmentContains( pi, pj, point ) ) {
            return 0;
        }
        if ( ((yi > y) !== (yj > y)) && ((x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ) {
            contains = -contains;
        }
    }
    return contains;
}

function segmentContains ( p0, p1, p2 ) {
    var x20 = p2[ 0 ] - p0[ 0 ], y20 = p2[ 1 ] - p0[ 1 ];
    if ( x20 === 0 && y20 === 0 ) {
        return true;
    }
    var x10 = p1[ 0 ] - p0[ 0 ], y10 = p1[ 1 ] - p0[ 1 ];
    if ( x10 === 0 && y10 === 0 ) {
        return false;
    }
    var t = (x20 * x10 + y20 * y10) / (x10 * x10 + y10 * y10);
    return t < 0 || t > 1 ? false : t === 0 || t === 1 ? true : t * x10 === x20 && t * y10 === y20;
}

/**
 *
 * Loader
 *
 * @param manager
 * @param logger
 * @constructor
 */

function SHPLoader ( manager = DefaultLoadingManager, logger = DefaultLogger ) {

    this.manager = manager;
    this.logger  = logger;

    this.globalOffset = new Vector3();
    this.worldAxis    = {
        from: 'zUp',
        to:   'zForward'
    }

    this._reader = new BinaryReader();

}

Object.assign( SHPLoader, {

    FileCode:      9994,
    MinFileLength: 100,
    MinVersion:    1000

} );

Object.assign( SHPLoader.prototype, {

    load ( url, onLoad, onProgress, onError ) {

        const scope = this;

        const loader = new FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    },

    parse ( arrayBuffer ) {

        this._reader
            .setEndianess( Endianness.Big )
            .setBuffer( arrayBuffer );

        const header = this._parseHeader();

        if ( header.fileCode !== SHPLoader.FileCode ) {
            this.logger.error( "SHPLoader: Invalide Shape file code !" );
            return null;
        }

        if ( header.fileLength < SHPLoader.MinFileLength ) {
            this.logger.error( "SHPLoader: Shape file have an incorrect length !" );
            return null;
        }

        if ( !Object.values( ShapeType ).includes( header.shapeType ) ) {
            this.logger.error( "SHPLoader: Shape file have an incorrect shape type !" );
            return null;
        }

        if ( header.version < SHPLoader.MinVersion ) {
            this.logger.warn( "SHPLoader: Version of shape file below than 1000 could be incorrectly parsed !" )
        }

        const datas  = this._parseDatas( header );
        const shapes = this._convertToObjects( datas );

        return shapes;

    },

    _parseHeader () {

        const fileCode = this._reader.getInt32();
        this._reader.skipOffsetOf( 20 );
        const fileLength = this._reader.getInt32();

        this._reader.setEndianess( Endianness.Little );

        const version         = this._reader.getInt32();
        const shapeType       = this._reader.getInt32();
        const xMinBoundingBox = this._reader.getInt32();
        const yMinBoundingBox = this._reader.getInt32();
        const xMaxBoundingBox = this._reader.getInt32();
        const yMaxBoundingBox = this._reader.getInt32();
        const zMinBoundingBox = this._reader.getInt32();
        const zMaxBoundingBox = this._reader.getInt32();
        const mMinBoundingBox = this._reader.getInt32();
        const mMaxBoundingBox = this._reader.getInt32();

        return {
            fileCode:    fileCode,
            fileLength:  fileLength,
            version:     version,
            shapeType:   shapeType,
            boundingBox: {
                xMin: xMinBoundingBox,
                xMax: xMaxBoundingBox,
                yMin: yMinBoundingBox,
                yMax: yMaxBoundingBox,
                zMin: zMinBoundingBox,
                zMax: zMaxBoundingBox,
                mMin: mMinBoundingBox,
                mMax: mMaxBoundingBox
            }
        }

    },

    _parseDatas ( header ) {

        this._reader.skipOffsetTo( 100 );

        let datas         = [];
        let recordHeader  = undefined;
        let endOfRecord   = undefined;
        let recordContent = undefined;

        while ( !this._reader.isEndOfFile() ) {

            recordHeader = this._parseRecordHeader();
            endOfRecord  = this._reader.getOffset() + (recordHeader.contentLength * 2);

            // All parsing methods use little below
            this._reader.setEndianess( Endianness.Little );

            switch ( header.shapeType ) {

                case ShapeType.NullShape:

                    this._reader.skipOffsetTo( endOfRecord );

                    //                    // Todo: just skip 1 byte - or - to endRecord
                    //                    while ( this._reader.getOffset() < endOfRecord ) {
                    //
                    //                        recordContent = this._parseNull();
                    //                        if ( recordContent ) {
                    //                            datas.push( recordContent );
                    //                        }
                    //
                    //                    }
                    break;

                case ShapeType.Point:
                case ShapeType.PointZ:
                case ShapeType.PointM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePoint();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break;

                case ShapeType.Polyline:
                case ShapeType.PolyLineZ:
                case ShapeType.PolylineM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolyLine();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break;

                case ShapeType.Polygon:
                case ShapeType.PolygonZ:
                case ShapeType.PolygonM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolygon();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break;

                case ShapeType.MultiPoint:
                case ShapeType.MultiPointZ:
                case ShapeType.MultiPointM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPoint();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break;

                case ShapeType.MultiPatch:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPatch();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break;

                default:
                    this.logger.error( `SHPLoader: Invalid switch parameter: ${ shapeType }` );
                    break

            }

        }

        return datas

    },

    _parseRecordHeader () {

        this._reader.setEndianess( Endianness.Big );

        const recordNumber  = this._reader.getInt32();
        const contentLength = this._reader.getInt32();

        return {
            recordNumber,
            contentLength
        }

    },

    //    _parseNull () {
    //
    //        this._reader.getInt32();
    //
    //        return null;
    //    },

    _parsePoint () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const x = this._reader.getDouble();
        const y = this._reader.getDouble();

        return {
            shapeType,
            x,
            y
        };

    },

    _parsePolyLine () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getDouble(),
            yMin: this._reader.getDouble(),
            xMax: this._reader.getDouble(),
            yMax: this._reader.getDouble()
        };

        const numberOfParts  = this._reader.getInt32();
        const numberOfPoints = this._reader.getInt32();

        const parts = new Array( numberOfParts );
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32();
        }

        const points = new Array( numberOfPoints );
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getDouble(),
                y: this._reader.getDouble()
            };
        }

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            points
        };

    },

    _parsePolygon () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getDouble(),
            yMin: this._reader.getDouble(),
            xMax: this._reader.getDouble(),
            yMax: this._reader.getDouble()
        };

        const numberOfParts  = this._reader.getInt32();
        const numberOfPoints = this._reader.getInt32();

        let parts = new Array( numberOfParts );
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32();
        }

        let points = new Array( numberOfPoints );
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getDouble(),
                y: this._reader.getDouble()
            };
        }

        const polygons = [];
        const holes    = [];

        parts.forEach( ( value, index ) => {

            const ring = points.slice( value, parts[ index + 1 ] );

            if ( ringClockwise( ring ) ) {

                polygons.push( ring );
                //					polygons.push( [ ring ] );

            } else {

                holes.push( ring );

            }

        } );

        holes.forEach( hole => {

            polygons.some( polygon => {

                if ( ringContainsSome( polygon[ 0 ], hole ) ) {
                    polygon.push( hole );
                    return true;
                }

            } ) || polygons.push( [ hole ] );

        } );

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            polygons
        }

    },

    _parseMultiPoint () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getDouble(),
            xMax: this._reader.getDouble(),
            yMin: this._reader.getDouble(),
            yMax: this._reader.getDouble()
        };

        const numberOfPoints = this._reader.getInt32();

        const points = new Array( numberOfPoints );

        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points.push( [ this._reader.getDouble(), this._reader.getDouble() ] )
        }

        return {
            shapeType,
            boundingBox,
            numberOfPoints,
            points
        };

    },

    _parseMultiPatch () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        return {
            shapeType
        };

    },

    _convertToObjects ( datas ) {

        let shapes = [];

        for ( let index = 0, numberOfShapes = datas.length ; index < numberOfShapes ; index++ ) {
            let data = datas[ index ];

            if ( data.shapeType === ShapeType.Polygon || data.shapeType === ShapeType.PolygonZ || data.shapeType === ShapeType.PolygonM ) {

                if ( Array.isArray( data.points ) ) {

                    __createObjectsFromArrays( data.points )

                } else {

                    __createObjectFromPoints( data.points );

                }

            }

        }

        function __createObjectsFromArrays ( arrays ) {

            //Todo: need to fix parsePolygon to avoid too much array imbrication

            for ( let arrayIndex = 0, numberOfArray = arrays.length ; arrayIndex < numberOfArray ; arrayIndex++ ) {

                let array = arrays[ arrayIndex ]

                if ( !array ) {
                    console.log( 'no array, oups !' )
                    continue
                }

                if ( Array.isArray( array[ 0 ] ) ) {

                    __createObjectsFromArrays( array )

                } else {

                    __createObjectFromPoints( array )

                }

            }

        }

        function __createObjectFromPoints ( points ) {

            shapes.push( new Shape( points ) )

        }

        return shapes

    }

} );

export {
    SHPLoader,
    ShapeType
}