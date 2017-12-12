/**
 * @author Tristan Valcke <valcketristan@gmail.com>
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @see https://github.com/Itee

 * @file The gulp tasks file. It allow to run some tasks from command line interface.
 * The available tasks are: help, clean, lint, doc, test, build and release
 *
 * You could find a complet explanation about these tasks using: npm run help
 *
 */

/* eslint-env node */

const gulp        = require( 'gulp' )
const util        = require( 'gulp-util' )
const jsdoc       = require( 'gulp-jsdoc3' )
const del         = require( 'del' )
const runSequence = require( 'run-sequence' )
const rollup      = require( 'rollup' )

const eslint = require( 'gulp-eslint' )
// OR
//const standard    = require( 'gulp-standard' )

const log    = util.log
const colors = util.colors
const red    = colors.red
const green   = colors.green
const blue   = colors.blue
const cyan   = colors.cyan
const yellow    = colors.yellow
const magenta    = colors.magenta

/////////////////////
/////// HELP ////////
/////////////////////
gulp.task( 'default', [ 'help' ] )
gulp.task( 'help', ( done ) => {

    log( '====================================================' )
    log( '|                                                  |' )
    log( '|                Itee Client - HELP                |' )
    log( '|                                                  |' )
    log( '====================================================' )
    log( '' )
    log( 'Available commands are:' )
    log( blue( 'npm run' ), cyan( 'help' ), ' - Display this help.' )
    log( blue( 'npm run' ), cyan( 'patch' ), ' - Will patch three package to fix some invalid state.', red( '( Must be run only once after installing three package !!! )' ) )
    log( blue( 'npm run' ), cyan( 'clean' ), ' - Will delete builds and temporary folders.' )
    log( blue( 'npm run' ), cyan( 'lint' ), ' - Will run the eslint in pedantic mode with auto fix when possible.' )
    log( blue( 'npm run' ), cyan( 'doc' ), ' - Will run jsdoc, and create documentation under `documentation` folder, using the docdash theme' )
    log( blue( 'npm run' ), cyan( 'test' ), ' - Will run the test framworks (unit and bench), and create reports under `test/report` folder, using the mochawesome theme' )
    log( blue( 'npm run' ), cyan( 'unit' ), ' - Will run the karma server for unit tests.', red('( /!\\ Deprecated: will be remove as soon as test script is fixed !!! )') )
    log( blue( 'npm run' ), cyan( 'bench' ), ' - Will run the karma server for benchmarks.', red('( /!\\ Deprecated: will be remove as soon as test script is fixed !!! )') )
    log( blue( 'npm run' ), cyan( 'build' ), yellow('--'), green('<options>'), ' - Will build the application for development and/or production environments.', yellow('Note: The two dash are only required if you provide options !') )
    log( '  The available options are:' )
    log( '      ', green('-d'), 'or', green('--dev'), ' - to build in development environment' )
    log( '      ', green('-p'), 'or', green('--prod'), ' - to build in production environment' )
    log( '       (in case no environment is provide both will be compile)' )
    log( '' )
    log( '      ', green('-f:'), magenta('<format>'), 'or', green('--format:'), magenta('<format>'), ' - to specify the output build type.' )
    log( '       where format could be any of:', magenta('amd'), magenta('cjs'), magenta('es'), magenta('iife'), magenta('umd') )
    log( '' )
    log( '      ', green('-s'), 'or', green('--sourcemap'), ' - to build with related source map' )
    log( '' )
    log( blue( 'npm run' ), cyan( 'release' ), ' - Will run all the lint, test stuff, and if succeed will build the application in both environments.' )
    log( '' )
    log( 'In case you have', blue( 'gulp' ), 'installed globally, you could use also:' )
    log( blue( 'gulp' ), cyan( 'command' ), ' - It will perform the command like using "npm run" but with less characters to type... Because you\'re a developer, right ?' )

    done()

} )

/////////////////////
////// CLEAN ////////
/////////////////////
/**
 * The clean tasks will delete builds and temporary folders
 */
gulp.task( 'clean', () => {

    return del( [
        './builds'
    ] )

} )

////////////////////
////// LINT ////////
////////////////////
gulp.task( 'lint', () => {

    // Todo: split between source and test with differents env

    return gulp.src( [ 'gulpfile.js', 'configs/**/*.js', 'scripts/**/*.js', 'sources/**/*', 'tests/**/*.js' ] )
               .pipe( eslint( {
                   allowInlineConfig: true,
                   globals:           [],
                   fix:               true,
                   quiet:             false,
                   envs:              [],
                   configFile:        './configs/eslint.conf.json',
                   parser:            'babel-eslint',
                   parserOptions:     {
                       ecmaFeatures: {
                           jsx: true
                       }
                   },
                   plugins:           [
                       'react'
                   ],
                   rules:             {
                       "react/jsx-uses-react": "error",
                       "react/jsx-uses-vars":  "error"
                   },
                   useEslintrc:       false
               } ) )
               .pipe( eslint.format( 'stylish' ) )
               .pipe( eslint.failAfterError() )

    // OR

    //    return gulp.src([ 'gulpfile.js', 'configs/**/*.js', 'scripts/**/*.js', 'sources/**/*.js', 'tests/**/*.js' ])
    //               .pipe(standard({
    //                   fix:     true,   // automatically fix problems
    //                   globals: [],  // custom global variables to declare
    //                   plugins: [],  // custom eslint plugins
    //                   envs:    [],     // custom eslint environment
    //                   parser:  'babel-eslint'    // custom js parser (e.g. babel-eslint)
    //               }))
    //               .pipe(standard.reporter('default', {
    //                   breakOnError:   true,
    //                   breakOnWarning: true,
    //                   quiet:          true,
    //                   showRuleNames:  true,
    //                   showFilePath:   true
    //               }))
    //               .pipe(gulp.dest((file) => {
    //                   return file.base
    //               }))

} )

////////////////////
/////// DOC ////////
////////////////////
gulp.task( 'doc', () => {

    const config = require( './configs/jsdoc.conf' )

    return gulp.src( [ 'sources/**/*' ], { read: false } )
               .pipe( jsdoc( config ) )

} )

////////////////////
////// TEST ////////
////////////////////
gulp.task( 'test', ( done ) => {

    runSequence(
        'unit',
        'bench',
        done
    )

} )

gulp.task( 'unit', () => {

} )

gulp.task( 'bench', () => {

} )

/////////////////////
////// BUILDS ///////
/////////////////////
gulp.task( 'build', ['clean'], ( done ) => {

    const options = processArguments( process.argv )
    const configs = createBuildsConfigs( options )

    nextBuild()

    function processArguments ( processArgv ) {
        'use strict'

        let defaultOptions = {
            environments: [ 'development', 'production' ],
            formats: [ 'amd', 'cjs', 'es', 'iife', 'umd' ],
            sourceMap: false
        }

        const argv = processArgv.slice( 4 ) // Ignore nodejs, script paths and gulp params
        argv.forEach( argument => {

            if ( argument.indexOf( '-f' ) > -1 || argument.indexOf( '--format' ) > -1 ) {

                const splits    = argument.split( ':' )
                const splitPart = splits[ 1 ]

                defaultOptions.formats = []
                defaultOptions.formats.push( splitPart )

            } else if ( argument.indexOf( '-d' ) > -1 || argument.indexOf( '--dev' ) > -1 ) {

                defaultOptions.environments = []
                defaultOptions.environments.push( 'development' )

            } else if ( argument.indexOf( '-p' ) > -1 || argument.indexOf( '--prod' ) > -1 ) {

                defaultOptions.environments = []
                defaultOptions.environments.push( 'production' )

            } else if ( argument.indexOf( '-s' ) > -1 || argument.indexOf( '--sourcemap' ) > -1 ) {

                defaultOptions.sourceMap = true

            } else {

                throw new Error( `Build Script: invalid argument ${argument}. Type \`npm run help build\` to display available argument.` )

            }

        } )

        return defaultOptions

    }

    function createBuildsConfigs ( options ) {
        'use strict'

        let configs = []

        for ( let formatIndex = 0, numberOfFormats = options.formats.length ; formatIndex < numberOfFormats ; ++formatIndex ) {
            const format = options.formats[ formatIndex ]

            for ( let envIndex = 0, numberOfEnvs = options.environments.length ; envIndex < numberOfEnvs ; ++envIndex ) {
                const environment  = options.environments[ envIndex ]
                const onProduction = (environment === 'production')

                const config = require( './configs/rollup.conf' )( format, onProduction, options.sourceMap )

                configs.push( config )
            }
        }

        return configs

    }

    function nextBuild () {
        'use strict'

        if ( configs.length === 0 ) {
            done()
            return
        }

        build( configs.pop(), nextBuild )

    }

    function build ( config, done ) {

        log( `Building ${config.outputOptions.file}` )

        rollup.rollup( config.inputOptions )
              .then( ( bundle ) => {

                  bundle.write( config.outputOptions )
                        .catch( ( error ) => {
                            log( red( error ) )
                            done()
                        } )

                  done()
              } )
              .catch( ( error ) => {
                  log( red( error ) )
                  done()
              } )

    }

} )

//////////////////////
////// RELEASE ///////
//////////////////////
gulp.task( 'release', ( done ) => {

    runSequence(
        'clean',
        [
            'lint',
            'doc',
            'test'
        ],
        'build',
        done
    )

} )
