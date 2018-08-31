/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TErrorManager
 * @classdesc TCache is a simple javascript object whose purpose is to store some ket/value data to future usage. It could be enable/disable.
 *
 * @example
 * var cache = new TCache()
 * cache.add( 'foo', 'bar' )
 * TLogger.log( cache.get('foo') ) // 'bar'
 */

/* eslint-env browser */

import {
    isDefined,
    isString,
    isFunction
} from 'itee-validators'

/**
 * @class Super class cache!
 */
class TStore {

    /**
     * @constructor
     */
    constructor ( collection = {}, allowOverride = false, keyValidators = [], itemValidators = [] ) {

        this._collection     = collection
        this._allowOverride  = allowOverride
        this._keyValidators  = keyValidators
        this._itemValidators = itemValidators

    }

    get keys() {

        const keys       = []
        const collection = this._collection

        for ( let key in collection ) {
            if ( !collection.hasOwnProperty( key ) ) {
                continue
            }
            keys.push( key )
        }

        return keys

    }

    /**
     * Allow to add new key value pair, the key cannot be null, undefined, or an empty string.
     * In case the key already exist, the value will be overwritten.
     *
     * @param key
     * @param item
     */
    add ( key, item ) {

        // In case key validators were provide, check if given parameters are valids
        this._validateKey( key )
        this._validateItem( item )
        this._collection[ key ] = item

        return this

    }

    contain ( key ) {

        return isDefined( this._collection[ key ] )

    }

    /**
     * Return the value associated to the key.
     *
     * @param key
     * @returns {*}
     */
    get ( key ) {

        if ( !this.contain( key ) ) {
            throw new ReferenceError( `The item for key (${key}) does not exist.` )
        }

        return this._collection[ key ]

    }

    /**
     * Remove to value from the cache. Does nothing if the key does not exist.
     *
     * @param key
     */
    remove ( key ) {

        delete this._collection[ key ]

        return this

    }

    /**
     * Clear the cache and reset collection to an empty object.
     */
    clear () {

        this._collection = {}

        return this

    }

    _validateKey ( key ) {

        if ( !this._allowOverride && this.contain( key ) ) {
            throw new TypeError( `Item with key (${key}) already exist in collection !` )
        }

        const validators = this._keyValidators
        for ( let validatorIndex = 0, numberOfValidators = validators.length ; validatorIndex < numberOfValidators ; validatorIndex++ ) {
            let validator = validators[ validatorIndex ]

            if ( !validator.validator( key ) ) {

                const error = validator.error
                if ( isString( error ) ) {
                    throw new TypeError( error )
                } else if ( isFunction( error ) ) {
                    throw new TypeError( error( key ) )
                } else {
                    throw new TypeError( `Invalid key ${key}.` )
                }

            }

        }

    }

    _validateItem ( item ) {

        const validators = this._itemValidators
        for ( let validatorIndex = 0, numberOfValidators = validators.length ; validatorIndex < numberOfValidators ; validatorIndex++ ) {
            let validator = validators[ validatorIndex ]

            if ( !validator.validator( item ) ) {

                const error = validator.error
                if ( isString( error ) ) {
                    throw new TypeError( error )
                } else if ( isFunction( error ) ) {
                    throw new TypeError( error( item ) )
                } else {
                    throw new TypeError( `Invalid item ${item}.` )
                }

            }

        }

    }

}

export { TStore }
