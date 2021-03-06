/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import Vue from '../../../../node_modules/vue/dist/vue.esm'

// Todo: implement router facility here using target instead of clickHandler !

export default Vue.component( 'TToolItem', {
    template: `
        <div v-if="onClick" :class=computedClass :title=tooltip @click=onClick(onClickData)>
            <TIcon v-if='icon' :iconProps="icon" />
            {{label}}
            <slot></slot>
        </div>
        <div v-else :class=computedClass :title=tooltip >
            <TIcon v-if='icon' :iconProps="icon" />
            {{label}}
            <slot></slot>
        </div>
    `,
    props:    [ 'label', 'icon', 'target', 'tooltip', 'onClick', 'onClickData', 'isActive' ],
    computed: {

        computedClass () {

            if ( this.isActive ) {
                return 'tToolItem isActive'
            } else {
                return 'tToolItem'
            }

        }

    }
} )
