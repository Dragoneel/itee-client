/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { Detector } from '../node_modules/threejs-full-es6/sources/helpers/Detector'
import Vue from '../node_modules/vue/dist/vue.esm'
import VueRouter from 'vue-router'
import './uis/_uis'

//import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
//import fontawesome from '@fortawesome/fontawesome'
//import { faCrosshairs, faSpinner } from '@fortawesome/fontawesome-free-solid'
//import brands from '@fortawesome/fontawesome-free-brands'

import { extend } from './utils/TObjectUtil'


export function analyseEnvironment () {

    // Check if webgl is available
    const message = Detector.getWebGLErrorMessage()
    if ( message.innerText ) {
        alert( message.innerText )
        return
    }

}

export function getRawMaterial ( environment ) {

    const rawMaterial = extend( extend( extend( window.TConfigParameters || {}, window.TUrlParameters || {} ), environment || {} ), {
        //        alloy: {
        //            Foo: { template: '<div>foo</div>' },
        //            Bar: { template: '<div>bar</div>' }
        //        }
    } )

    return rawMaterial

}

//
//export function createFuselage ( alloy ) {
//
//    //    return fontawesome.library.add(faCrosshairs, faSpinner, brands)
//
//    const routes = [
//        { path: '/foo', component: alloy.Foo },
//        { path: '/bar', component: alloy.Bar }
//    ]
//
//    return routes
//
//}
//
//export function computeInterstellarTravel ( routes ) {
//
//    const interstellarPath = new VueRouter({
//        routes
//    })
//
//    return interstellarPath
//
//}
//
export function createFlyingSaucer( rawMaterial ) {
//export function createFlyingSaucer( reactor, fuselage, interstellarPath ) {

//    const launchSite = rawMaterial.el;
//    const fuselage = createFuselage( rawMaterial.alloy )
//    const interstellarPath = computeInterstellarTravel( fuselage )
//
//    const flyingSaucer = new Vue(interstellarPath)

    return {
        goHome() {
//            flyingSaucer.$mount(launchSite)
            new Vue(rawMaterial)
        }
    }

}

export function startApp ( config ) {

    if ( !config ) {

        return

    }

    Vue.use( VueRouter )

    const router = new VueRouter( {
        routes: config.routes
    } )

    const app = new Vue( {
        router
    } )

    app.$mount( config.launchingSite )

}
