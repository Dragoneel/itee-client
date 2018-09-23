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
import Vue                              from '../../../../node_modules/vue/dist/vue.esm'
import { isDefined } from 'itee-validators'

export default Vue.component( 'TTreeItem', {
    template: `
        <li v-if="needUpdate || !needUpdate" :class=computeTreeItemClass>
            <TContainerHorizontal :class=computeTreeItemContentClass hAlign="start" vAlign="center">
                <TIcon v-if="haveChildren()" :iconProps=computeToggleChildrenIconClass :iconOn="{click: toggleChildren}" />
                <TCheckIcon class="margin-left-5px" v-if="eyeCheckModifier" :iconOn="eyeCheckModifier.iconOn" :iconOff="eyeCheckModifier.iconOff" :value="eyeCheckModifier.value" :onClick=eyeCheckModifier.onClick />
                <label @click="function () { updateSelectionState( onClick ) }">{{name}}</label>
                <span v-for="modifier in filteredModifier" class="tTreeItemModifiers">
                    <TIcon v-if="( !modifier.display || (modifier.display === 'select' && isSelected)) && modifier.type === 'icon'" :iconProps='modifier.icon' v-bind:iconOn="{click: modifier.onClick}" />
                    <TButton v-else-if="modifier.type === 'button'" :label="modifier.label" :icon="modifier.icon" :onClick=modifier.onClick :messageData="modifier.value" />
                    <input v-else-if="modifier.type === 'range'" type="range" value="100" max="100" @input="modifier.onInput" />
                    <input v-else-if="modifier.type === 'number'" type="number" @change="modifier.onChange" />
                    <input v-else-if="modifier.type === 'color'" type="color" @change="modifier.onChange" />
                    <label v-else>Error: Unknown modifier type !!!</label>
                </span>
            </TContainerHorizontal>
            <ul v-if="haveChildren() && showChildren && (_currentDeepLevel < maxDeepLevel)" :class=computeTreeItemChildrenClass :style=computeChildrenStyle>
                <TTreeItem
                    v-for="child in computedChildren"
                    v-bind:key="child.id"
                    v-bind:name="child.name"
                    v-bind:onClick="child.onClick"
                    v-bind:modifiers="child.modifiers"
                    v-bind:children="child.children"
                    v-bind:filters="filters"
                    v-bind:sort="sort"
                    v-bind:deepSelect="deepSelect"
                    v-bind:needUpdate="needUpdate"
                    v-bind:maxDeepLevel="maxDeepLevel"
                    v-bind:_currentDeepLevel="_currentDeepLevel + 1"
                />
            </ul>
        </li>
    `,
    data:     function () {

        return {
            showChildren: false,
            isSelected:   false
        }

    },
    props:    [ 'id', 'name', 'onClick', 'modifiers', 'children', 'filters', 'sort', 'deepSelect', 'needUpdate', 'maxDeepLevel', '_currentDeepLevel' ],
    computed: {

        computeTreeItemClass () {

            return (this.isSelected && this.deepSelect) ? 'tTreeItem selected' : 'tTreeItem'

        },

        computeTreeItemContentClass () {

            return (this.isSelected && !this.deepSelect) ? 'tTreeItemContent selected' : 'tTreeItemContent'

        },

        computeTreeItemChildrenClass () {

            if ( !this.children || this.children.length === 0 ) {
                return 'tTreeItemChildren'
            } else if ( this.children.length === 1 ) {
                return 'tTreeItemChildren singleChild'
            } else {
                return 'tTreeItemChildren multiChild'
            }

        },

        computeToggleChildrenIconClass () {

            // Todo: Make them props
            return (this.showChildren) ? 'chevron-circle-down' : 'chevron-circle-right'

        },

        computeChildrenStyle () {

            return {
                display: (this.showChildren) ? 'block' : 'none'
            }

        },

        computedChildren () {

            let children = this.children

            if ( isDefined( this.filters ) ) {
                children = this.filterItems( children )
            }

            if ( isDefined( this.sort ) ) {
                children = this.sortItems( children )
            }

            return children

        },

        eyeCheckModifier () {

            return (isDefined( this.modifiers )) ? this.modifiers.find( modifier => modifier.type === 'checkicon' ) : null

        },

        filteredModifier () {

            return (isDefined( this.modifiers )) ? this.modifiers.filter( ( modifier ) => {

                return (!modifier.display || (modifier.display === 'select' && this.isSelected))

            } ) : []

        }

    },
    methods:  {

        // need to be a methods in view to be rerender on every template update
        haveChildren () {

            return (this.children && this.children.length > 0)

        },

        toggleChildren () {

            this.showChildren = !this.showChildren

        },

        filterChildren( children ) {

            return children.filter( child => !this.filters.includes( child.name ) )

        },

        sortChildren ( children ) {

            // Todo: Externalize the sort function as use defined function. And implement current sort function as utility
            if ( ![ 'asc', 'desc' ].includes( this.sort ) ) {
                console.error( "Invalid sorter !" )
                return
            }

            let sortedChildren = children.sort( ( a, b ) => {

                if ( a.name < b.name ) {
                    return -1
                }

                if ( a.name > b.name ) {
                    return 1
                }

                return 0

            } )

            if ( this.sort === 'desc' ) {
                sortedChildren.reverse()
            }

            return sortedChildren

        },

        updateSelectionState ( onClickCallback ) {

            // Deselect
            let selectedItem = document.querySelector( '.selected' )
            if ( !isNullOrUndefined(selectedItem) ) {
              selectedItem.__vue__.isSelected = false
            }
            
            // Select
            this.isSelected = !this.isSelected

            if ( onClickCallback ) {
                onClickCallback()
            }

        }

    }

} )
