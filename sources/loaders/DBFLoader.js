/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * From:
 * https://www.clicketyclick.dk/databases/xbase/format/db2_dbf.html#DBII_DBF_STRUCT
 * http://web.archive.org/web/20150323061445/http://ulisse.elettra.trieste.it/services/doc/dbase/DBFstruct.htm
 * http://www.dbase.com/Knowledgebase/INT/db7_file_fmt.htm
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    DefaultLoadingManager,
    FileLoader
} from 'three-full'

import { DefaultLogger as TLogger } from '../Loggers/TLogger'
import {
    BinaryReader,
    Endianness
} from './BinaryReader'

///////////

/**
 *
 * @type {Object}
 */
const DBFVersion = Object.freeze( {
    FoxPro:               0x30,
    FoxPro_Autoincrement: 0x31,

    dBASE_II:   0x02,
    FoxPro_Var: 0x32,

    dBASE_III_plus:          0x03,
    dBASE_III_plus_memo:     0x83,
    dBASE_IV_SQL_table:      0x43,
    dBASE_IV_SQL_system:     0x63,
    dBASE_IV_memo:           0x8B,
    dBASE_IV_memo_SQL_table: 0xCB,
    FoxBase:                 0xFB,

    dBase_v_7: 4,

    FoxPro_2_x:    0xF5,
    HiPerSix_memo: 0xE5
} )

/**
 *
 * @type {Object}
 */
const DataType = Object.freeze( {
    Binary:        'B',
    Character:     'C',
    Date:          'D',
    Numeric:       'N',
    Logical:       'L',
    Memo:          'M',
    Timestamp:     '@',
    Long:          'I',
    Autoincrement: '+',
    Float:         'F',
    Double:        'O',
    OLE:           'G'
} );

/**
 *
 * @param manager
 * @param logger
 * @constructor
 */
function DBFLoader ( manager, logger ) {

    this.manager = ( manager === undefined ) ? DefaultLoadingManager : manager;
    this.logger  = ( logger === undefined ) ? TLogger : logger;
    this.reader  = new BinaryReader();

}

Object.assign( DBFLoader, {

    /**
     *
     */
    Terminator: 0x0D,

    /**
     *
     */
    DeletedRecord: 0x1A,

    /**
     *
     */
    YearOffset: 1900

} );

Object.assign( DBFLoader.prototype, {

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( url, onLoad, onProgress, onError ) {

        const scope = this;

        const loader = new FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    },

    /**
     *
     * @param arrayBuffer
     * @return {*}
     */
    parse ( arrayBuffer ) {

        this.reader
            .setEndianess( Endianness.Big )
            .setBuffer( arrayBuffer );

        const version = this.reader.getInt8();
        if ( !this._isValidVersion( version ) ) {
            TLogger.error( `DBFLoader: Invalid version number: ${version}` );
            return null;
        }

        const header = this._parseHeader( version );
        const datas  = this._parseDatas( version, header );

        return {
            header,
            datas
        };

    },

    /**
     *
     * @param version
     * @return {boolean}
     * @private
     */
    _isValidVersion ( version ) {

        const availablesVersionValues = Object.values( DBFVersion );
        return (availablesVersionValues.includes( version ));

    },

    /**
     *
     * @param version
     * @return {{}}
     * @private
     */
    _parseHeader ( version ) {

        let header = {}

        switch ( version ) {

            case DBFVersion.FoxPro:
            case DBFVersion.FoxPro_Autoincrement:
            case DBFVersion.FoxPro_Var:
            case DBFVersion.dBASE_II:
                header = this._parseHeaderV2()
                break

            case DBFVersion.dBASE_III_plus:
            case DBFVersion.dBASE_III_plus_memo:
            //                header = this._parseHeaderV2_5()
            //                break;

            case DBFVersion.dBASE_IV_memo:
            case DBFVersion.dBASE_IV_memo_SQL_table:
            case DBFVersion.dBASE_IV_SQL_system:
            case DBFVersion.dBASE_IV_SQL_table:
                header = this._parseHeaderV3()
                break;

            case DBFVersion.dBase_v_7:
            case DBFVersion.FoxPro_2_x:
            case DBFVersion.HiPerSix_memo:
                header = this._parseHeaderV4()
                break;

            default:
                throw new RangeError( `Invalid version parameter: ${version}`, 'DBFLoader' );
                break;

        }

        // Check terminator
        if ( this.reader.getUInt8() !== DBFLoader.Terminator ) {
            TLogger.error( 'DBFLoader: Invalid terminator after field descriptors !!!' );
        }

        return header;

    },

    /**
     *
     * @return {{numberOfRecords, year: *, month: (*|number), day: (*|number), lengthOfEachRecords, fields: Array}}
     * @private
     */
    _parseHeaderV2 () {

        const numberOfRecords     = this.reader.getInt16();
        const year                = this.reader.getInt8() + DBFLoader.YearOffset;
        const month               = this.reader.getInt8();
        const day                 = this.reader.getInt8();
        const lengthOfEachRecords = this.reader.getInt16();

        // Field descriptor array
        let fields        = [];
        let name          = undefined;
        let type          = undefined;
        let length        = undefined;
        let memoryAddress = undefined;
        let decimalCount  = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name          = this.reader.getString( 11 );
            type          = this.reader.getChar();
            length        = this.reader.getUInt8();
            memoryAddress = this.reader.getInt16();
            decimalCount  = this.reader.getInt8();

            fields.push( {
                name,
                type,
                length,
                memoryAddress,
                decimalCount
            } );

        }

        return {
            numberOfRecords,
            year,
            month,
            day,
            lengthOfEachRecords,
            fields
        }

    },

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, fields: Array}}
     * @private
     */
    _parseHeaderV2_5 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();

        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
        this.reader.skipOffsetOf( 3 + 13 + 4 ); // Reserved

        // Field descriptor array
        let fields        = [];
        let name          = undefined;
        let type          = undefined;
        let length        = undefined;
        let memoryAddress = undefined;
        let decimalCount  = undefined;
        let workAreaId    = undefined;
        let MDXFlag       = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name          = this.reader.getString( 11 );
            type          = this.reader.getChar();
            memoryAddress = this.reader.getInt32();
            length        = this.reader.getUInt8();
            decimalCount  = this.reader.getUInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            workAreaId = this.reader.getInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            MDXFlag = this.reader.getInt8();
            this.reader.skipOffsetOf( 1 ); // Reserved

            fields.push( {
                name,
                type,
                length,
                memoryAddress,
                decimalCount,
                workAreaId,
                MDXFlag
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            fields
        }

    },

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, incompleteTransactionFlag: (*|number), encryptionFlag: (*|number), MDXFlag:
     *     (*|number), languageDriverId: (*|number), fields: Array}}
     * @private
     */
    _parseHeaderV3 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
        this.reader.skipOffsetOf( 2 ); // Reserved
        const incompleteTransactionFlag = this.reader.getInt8();
        const encryptionFlag            = this.reader.getInt8();
        this.reader.skipOffsetOf( 12 );  // Reserved multi-users
        const MDXFlag          = this.reader.getInt8();
        const languageDriverId = this.reader.getInt8();
        this.reader.skipOffsetOf( 2 ); // Reserved

        // Field descriptor array
        let fields       = [];
        let name         = undefined;
        let type         = undefined;
        let length       = undefined;
        let decimalCount = undefined;
        let workAreaId   = undefined;
        let MDXFieldFlag = undefined;
        while ( this.reader.getOffset() < numberOfByteInHeader - 1 ) {
            //                for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name = this.reader.getString( 11 );
            type = this.reader.getChar();
            this.reader.skipOffsetOf( 4 ); // Reserved
            length       = this.reader.getUInt8();
            decimalCount = this.reader.getUInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            workAreaId = this.reader.getInt8();
            this.reader.skipOffsetOf( 10 ); // Reserved
            MDXFieldFlag = this.reader.getInt8();

            fields.push( {
                name,
                type,
                length,
                decimalCount,
                workAreaId,
                MDXFieldFlag
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            incompleteTransactionFlag,
            encryptionFlag,
            MDXFlag,
            languageDriverId,
            fields
        }

    },

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, incompleteTransactionFlag: (*|number), encryptionFlag: (*|number), MDXFlag:
     *     (*|number), languageDriverId: (*|number), languageDriverName, fields: Array}}
     * @private
     */
    _parseHeaderV4 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
        this.reader.skipOffsetOf( 2 ); // Reserved
        const incompleteTransactionFlag = this.reader.getInt8();
        const encryptionFlag            = this.reader.getInt8();
        this.reader.skipOffsetOf( 12 );  // Reserved multi-users
        const MDXFlag          = this.reader.getInt8();
        const languageDriverId = this.reader.getInt8();
        this.reader.skipOffsetOf( 2 ); // Reserved
        const languageDriverName = this.reader.getString( 32 );
        this.reader.skipOffsetOf( 4 ); // Reserved

        // Field descriptor array
        let fields                 = [];
        let name                   = undefined;
        let type                   = undefined;
        let length                 = undefined;
        let decimalCount           = undefined;
        let MDXFieldFlag           = undefined;
        let nextAutoincrementValue = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name         = this.reader.getString( 32 );
            type         = this.reader.getChar();
            length       = this.reader.getUInt8();
            decimalCount = this.reader.getUInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            MDXFieldFlag = this.reader.getInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            nextAutoincrementValue = this.reader.getInt32();
            this.reader.skipOffsetOf( 4 ); // Reserved

            fields.push( {
                name,
                type,
                length,
                decimalCount,
                MDXFieldFlag,
                nextAutoincrementValue
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            incompleteTransactionFlag,
            encryptionFlag,
            MDXFlag,
            languageDriverId,
            languageDriverName,
            fields
        }

    },

    /**
     *
     * @param version
     * @param header
     * @return {Array}
     * @private
     */
    _parseDatas ( version, header ) {

        const numberOfRecords = header.numberOfRecords
        const fields          = header.fields

        let properties = undefined
        if ( version === DBFVersion.dBase_v_7 ) {
            properties = this._parseFieldProperties()
        }

        let records = []
        let record  = undefined
        let field   = undefined
        for ( let recordIndex = 0 ; recordIndex < numberOfRecords ; recordIndex++ ) {

            record              = {}
            record[ 'deleted' ] = ( this.reader.getUInt8() === DBFLoader.DeletedRecord )

            for ( let fieldIndex = 0, numberOfFields = fields.length ; fieldIndex < numberOfFields ; fieldIndex++ ) {

                field = fields[ fieldIndex ]

                switch ( field.type ) {

                    case DataType.Binary:
                        const binaryString   = this.reader.getString( field.length )
                        record[ field.name ] = parseInt( binaryString )
                        break;

                    case DataType.Numeric:
                        const numericString  = this.reader.getString( field.length )
                        record[ field.name ] = parseInt( numericString )
                        break;

                    case DataType.Character:
                        record[ field.name ] = this.reader.getString( field.length )
                        break;

                    case DataType.Date:
                        // YYYYMMDD
                        record[ field.name ] = this.reader.getString( field.length )
                        break;

                    case DataType.Logical:
                        const logical = this.reader.getChar().toLowerCase()
                        if ( logical === 't' || logical === 'y' ) {
                            record[ field.name ] = true
                        } else if ( logical === 'f' || logical === 'n' ) {
                            record[ field.name ] = false
                        } else {
                            record[ field.name ] = null
                        }
                        break;

                    case DataType.Memo:
                        record[ field.name ] = this.reader.getString( field.length )
                        break;

                    case DataType.Timestamp:
                        // 8 bytes - two longs, first for date, second for time.
                        // The date is the number of days since  01/01/4713 BC.
                        // Time is hours * 3600000L + minutes * 60000L + Seconds * 1000L

                        break;

                    case DataType.Long:
                        // 4 bytes. Leftmost bit used to indicate sign, 0 negative.
                        record[ field.name ] = this.reader.getInt32()
                        break;

                    case DataType.Autoincrement:
                        // Same as a Long
                        record[ field.name ] = this.reader.getInt32()
                        break;

                    case DataType.Float:
                        const floatString    = this.reader.getString( field.length )
                        record[ field.name ] = parseInt( floatString )
                        break;

                    case DataType.Double:
                        record[ field.name ] = this.reader.getDouble()
                        break;

                    case DataType.OLE:
                        record[ field.name ] = this.reader.getString( field.length )
                        break;

                    default:
                        throw new RangeError( `Invalid data type parameter: ${field.type}`, '_parseDatas' )
                        break

                }

            }

            records.push( record )

        }

        return records

    },

    /**
     *
     * @return {{numberOfStandardProperties, startOfStandardPropertiesDescriptor, numberOfCustomProperties, startOfCustomPropertiesDescriptor, numberOfReferentialIntegrityProperties,
     *     startOfReferentialIntegrityDescriptor, startOfData, sizeOfPropertiesStructure, standardProperties: Array, customProperties: Array, referentialIntegrityProperties: Array}}
     * @private
     */
    _parseFieldProperties () {

        const numberOfStandardProperties             = this.reader.getInt16();
        const startOfStandardPropertiesDescriptor    = this.reader.getInt16();
        const numberOfCustomProperties               = this.reader.getInt16();
        const startOfCustomPropertiesDescriptor      = this.reader.getInt16();
        const numberOfReferentialIntegrityProperties = this.reader.getInt16();
        const startOfReferentialIntegrityDescriptor  = this.reader.getInt16();
        const startOfData                            = this.reader.getInt16();
        const sizeOfPropertiesStructure              = this.reader.getInt16();

        let standardProperties = []
        for ( let standardIndex = 0 ; standardIndex < numberOfStandardProperties ; standardIndex++ ) {
            standardProperties.push( this._getStandardProperties() );
        }

        let customProperties = []
        for ( let customIndex = 0 ; customIndex < numberOfCustomProperties ; customIndex++ ) {
            customProperties.push( this._getCustomProperties() );
        }

        let referentialIntegrityProperties = []
        for ( let referentialIntegrityIndex = 0 ; referentialIntegrityIndex < numberOfReferentialIntegrityProperties ; referentialIntegrityIndex++ ) {
            referentialIntegrityProperties.push( this._getReferentialIntegrityProperties() );
        }

        return {
            numberOfStandardProperties,
            startOfStandardPropertiesDescriptor,
            numberOfCustomProperties,
            startOfCustomPropertiesDescriptor,
            numberOfReferentialIntegrityProperties,
            startOfReferentialIntegrityDescriptor,
            startOfData,
            sizeOfPropertiesStructure,
            standardProperties,
            customProperties,
            referentialIntegrityProperties
        }

    },

    /**
     *
     * @return {{generationalNumber, tableFieldOffset, propertyDescribed: (*|number), type: (*|number), isConstraint: (*|number), offsetFromStart, widthOfDatabaseField}}
     * @private
     */
    _getStandardProperties () {

        const generationalNumber = this.reader.getInt16();
        const tableFieldOffset   = this.reader.getInt16();
        const propertyDescribed  = this.reader.getInt8();
        const type               = this.reader.getInt8();
        const isConstraint       = this.reader.getInt8();
        this.reader.skipOffsetOf( 4 ); // Reserved
        const offsetFromStart      = this.reader.getInt16();
        const widthOfDatabaseField = this.reader.getInt16();

        return {
            generationalNumber,
            tableFieldOffset,
            propertyDescribed,
            type,
            isConstraint,
            offsetFromStart,
            widthOfDatabaseField
        }

    },

    /**
     *
     * @return {{generationalNumber, tableFieldOffset, type: (*|number), offsetFromStartOfName, lengthOfName, offsetFromStartOfData, lengthOfData}}
     * @private
     */
    _getCustomProperties () {

        const generationalNumber = this.reader.getInt16();
        const tableFieldOffset   = this.reader.getInt16();
        const type               = this.reader.getInt8();
        this.reader.skipOffsetOf( 1 ); // Reserved
        const offsetFromStartOfName = this.reader.getInt16();
        const lengthOfName          = this.reader.getInt16();
        const offsetFromStartOfData = this.reader.getInt16();
        const lengthOfData          = this.reader.getInt16();

        return {
            generationalNumber,
            tableFieldOffset,
            type,
            offsetFromStartOfName,
            lengthOfName,
            offsetFromStartOfData,
            lengthOfData
        }

    },

    /**
     *
     * @return {{databaseState: (*|number), sequentialNumberRule, offsetOfTheRIRuleName, sizeOfTheRIRuleName, offsetOfNameOfForeignTable, sizeOfNameOfForeignTable, stateBehaviour: (*|number),
     *     numberOfFieldsInLinkingKey, offsetOfLocalTableTagName, sizeOfTheLocalTableTagName, offsetOfForeignTableTagName, sizeOfTheForeignTableTagName}}
     * @private
     */
    _getReferentialIntegrityProperties () {

        const databaseState                = this.reader.getInt8();
        const sequentialNumberRule         = this.reader.getInt16();
        const offsetOfTheRIRuleName        = this.reader.getInt16();
        const sizeOfTheRIRuleName          = this.reader.getInt16();
        const offsetOfNameOfForeignTable   = this.reader.getInt16();
        const sizeOfNameOfForeignTable     = this.reader.getInt16();
        const stateBehaviour               = this.reader.getInt8();
        const numberOfFieldsInLinkingKey   = this.reader.getInt16();
        const offsetOfLocalTableTagName    = this.reader.getInt16();
        const sizeOfTheLocalTableTagName   = this.reader.getInt16();
        const offsetOfForeignTableTagName  = this.reader.getInt16();
        const sizeOfTheForeignTableTagName = this.reader.getInt16();

        return {
            databaseState,
            sequentialNumberRule,
            offsetOfTheRIRuleName,
            sizeOfTheRIRuleName,
            offsetOfNameOfForeignTable,
            sizeOfNameOfForeignTable,
            stateBehaviour,
            numberOfFieldsInLinkingKey,
            offsetOfLocalTableTagName,
            sizeOfTheLocalTableTagName,
            offsetOfForeignTableTagName,
            sizeOfTheForeignTableTagName
        }

    }

} );

export {
    DBFLoader,
    DataType
}
