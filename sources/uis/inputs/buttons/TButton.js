/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import Vue from '../../../../node_modules/vue/dist/vue.esm'

export default Vue.component( 'TButton', {
    template: `
        <button class="button" @click="onClick(messageData)"><i v-if="icon" class="icon"></i>{{label}}</button>
    `,
    props:    [ 'label', 'icon', 'onClick', 'messageData' ]
} )

