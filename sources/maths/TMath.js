/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file TMath contains commons math function
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import { Vector3 } from '../../node_modules/threejs-full-es6/sources/math/Vector3'

// RANDOM
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function getRandomArbitrary ( min = 0, max = 1 ) {
    return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt ( min = 0, max = 1 ) {
    return (Math.floor( Math.random() * (max - min + 1) ) + min)
}

// TRIGO
export const PI   = Math.PI
export const PI_2 = Math.PI / 2
export const PI_4 = Math.PI / 4

export const DEG_TO_RAD = (PI / 180)
export const RAD_TO_DEG = (180 / PI)

/**
 *
 * @param degrees
 * @return {number}
 */
export function degreesToRadians ( degrees ) {
    return degrees * DEG_TO_RAD
}

/**
 *
 * @param radians
 * @return {number}
 */
export function degreesFromRadians ( radians ) {
    return radians * RAD_TO_DEG
}

/**
 *
 * @param radians
 * @return {number}
 */
export function radiansToDegrees ( radians ) {
    return radians * RAD_TO_DEG
}

/**
 *
 * @param degrees
 * @return {number}
 */
export function radiansFromDegrees ( degrees ) {
    return degrees * DEG_TO_RAD
}

// PROJECTION 2D/3D
/**
 *
 * @param vector
 * @return {number}
 */
export function getYaw ( vector ) {
    return -Math.atan2( vector.x, vector.z )
}

/**
 *
 * @param vector
 * @return {number}
 */
export function getPitch ( vector ) {
    return Math.asin( vector.y )
}

/**
 *
 * @param vectorDir
 * @return {{yaw: number, pitch: number}}
 */
export function convertWebGLRotationToTopogicalYawPitch ( vectorDir ) {

    function getYaw ( vector ) {
        return Math.atan2( vector.y, vector.x )
    }

    function getPitch ( vector ) {
        return Math.asin( vector.z )
    }

    const topoVectorDir = convertWebglVectorToTopologicVector( vectorDir )

    return {
        yaw:   -( radiansToDegrees( getYaw( topoVectorDir ) ) - 90 ),
        pitch: radiansToDegrees( getPitch( topoVectorDir ) )
    }

}

var OFFSET_CORRECTOR = {
    x: 0.48,
    y: 0.31
}

var LAMBERT_NINETY_THREE_OFFSET = {
    x: 651543.533,
    y: 6864982.935
}

/**
 *
 * @param vector
 * @return {Vector3}
 */
function convertWebglVectorToTopologicVector ( vector ) {

    return new Vector3( vector.x, -vector.z, vector.y )

}

/**
 *
 * @param coordinates
 * @return {Vector3}
 */
function convertWebGLCoordinatesToLambert93Coordinates ( coordinates ) {

    return new Vector3(
        coordinates.x + LAMBERT_NINETY_THREE_OFFSET.x + OFFSET_CORRECTOR.x,
        -coordinates.z + LAMBERT_NINETY_THREE_OFFSET.y + OFFSET_CORRECTOR.y,
        coordinates.y
    )

}

/**
 *
 * @param coordinates
 * @return {Vector3}
 */
function convertLambert93CoordinatesToWebGLCoordinates ( coordinates ) {

    return new Vector3(
        coordinates.x - LAMBERT_NINETY_THREE_OFFSET.x - OFFSET_CORRECTOR.x,
        0,
        -(coordinates.y - LAMBERT_NINETY_THREE_OFFSET.y - OFFSET_CORRECTOR.y)
    )

}