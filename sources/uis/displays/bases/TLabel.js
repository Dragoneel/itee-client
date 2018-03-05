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

export default Vue.component( 'TLabel', {
    template: `
        <label v-if=onClickHandler class="tLabel" :title=tooltip @click=onClickHandler>
            <i v-if=icon :class=icon></i>
            {{label}}
        </label>
        <label v-else class="tLabel" :title=tooltip>
            <i v-if=icon :class="icon"></i>
            {{label}}
        </label>
    `,
    props:    [ 'label', 'icon', 'tooltip', 'onClickHandler' ]
} )
