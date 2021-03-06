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
import resize from 'vue-resize-directive'

export default Vue.component( 'TSplitter', {
    template:   `
        <div :class=computeClass :style=computeSplitterStyle @mousemove=onMouseMoveHandler @mouseup=onMouseUpHandler @mouseleave=onMouseUpHandler v-resize:debounce="onResize">
            <slot name="left"></slot>
            <div class="tSplitterSeparator" :style=computeSeparatorStyle @mousedown=onMouseDownHandler></div>
            <slot name="right"></slot>
        </div>
    `,
    directives: {
        resize
    },
    data:       function () {

        return {
            onTracking:             false,
            previousMousePositionX: 0,
            previousMousePositionY: 0,
            position:               (this.initPosition) ? this.initPosition : 50
        }

    },
    props:      [ 'initPosition', 'isVertical' ],
    computed:   {

        computeClass () {

            return ( this.isVertical ) ? 'tSplitter tSplitterVertical' : 'tSplitter tSplitterHorizontal'

        },

        computeSplitterStyle () {

            return {
                display:  'flex',
                flexFlow: ( this.isVertical ) ? 'row' : 'column',
                overflow: 'hidden',
                flex: 1
            }

        },

        computeSeparatorStyle () {

            console.log( 'computeSeparatorStyle' )

            let _separatorStyle = {
                //                display: 'flex'
            }

            if ( this.isVertical ) {

                _separatorStyle = {
                    minWidth: '1px',
                    cursor:   'col-resize'
                }

            } else {

                _separatorStyle = {
                    minHeight: '1px',
                    cursor:    'row-resize'
                }

            }

            return _separatorStyle

        }

    },
    methods:    {

        onResize () {

            const domElement              = this.$el
            const globalWidth             = domElement.offsetWidth
            const globalHeight            = domElement.offsetHeight
            const currentSplitterPosition = this.position

            const firstSplit             = domElement.children[ 0 ]
            const firstSplitBorderWidth  = firstSplit.offsetWidth - firstSplit.clientWidth
            const firstSplitBorderHeight = firstSplit.offsetHeight - firstSplit.clientHeight
            let firstSplitWidth          = undefined
            let firstSplitHeight         = undefined

            const splitterElement             = domElement.children[ 1 ]
            const splitterElementBorderWidth  = splitterElement.offsetWidth - splitterElement.clientWidth
            const splitterElementBorderHeight = splitterElement.offsetHeight - splitterElement.clientHeight
            let splitterWidth                 = undefined
            let splitterHeight                = undefined

            const secondSplit             = domElement.children[ 2 ]
            const secondSplitBorderWidth  = secondSplit.offsetWidth - secondSplit.clientWidth
            const secondSplitBorderHeight = secondSplit.offsetHeight - secondSplit.clientHeight
            let secondSplitWidth          = undefined
            let secondSplitHeight         = undefined

            if ( this.isVertical ) {

                firstSplitWidth  = Math.round( (domElement.offsetWidth / 100) * currentSplitterPosition ) - firstSplitBorderWidth
                firstSplitHeight = globalHeight - firstSplitBorderHeight

                splitterWidth  = splitterElement.offsetWidth - splitterElementBorderWidth
                splitterHeight = globalHeight - splitterElementBorderHeight

                secondSplitWidth  = (Math.round( (domElement.offsetWidth / 100) * (100 - currentSplitterPosition) )) - secondSplitBorderWidth - splitterElement.offsetWidth
                secondSplitHeight = globalHeight - secondSplitBorderHeight

            } else {

                firstSplitWidth  = globalWidth - firstSplitBorderWidth
                firstSplitHeight = Math.round( (domElement.offsetHeight / 100) * currentSplitterPosition ) - firstSplitBorderHeight

                splitterWidth  = globalWidth - splitterElementBorderWidth
                splitterHeight = splitterElement.offsetHeight - splitterElementBorderHeight

                secondSplitWidth  = globalWidth - secondSplitBorderWidth
                secondSplitHeight = (Math.round( (domElement.offsetHeight / 100) * (100 - currentSplitterPosition) )) - secondSplitBorderHeight - splitterElement.offsetHeight

            }

            firstSplit.style.width  = `${firstSplitWidth}px`
            firstSplit.style.height = `${firstSplitHeight}px`

            splitterElement.style.width  = `${splitterWidth}px`
            splitterElement.style.height = `${splitterHeight}px`

            secondSplit.style.width  = `${secondSplitWidth}px`
            secondSplit.style.height = `${secondSplitHeight}px`

            console.log( `TSplitter.onResize(fW/fH): ${firstSplitWidth}/${firstSplitHeight}` )
            console.log( `TSplitter.onResize(spW/spH): ${splitterWidth}/${splitterHeight}` )
            console.log( `TSplitter.onResize(sW/sH): ${secondSplitWidth}/${secondSplitHeight}` )

        },

        onMouseDownHandler ( event ) {

            this.onTracking             = true
            this.previousMousePositionX = event.clientX
            this.previousMousePositionY = event.clientY

            event.preventDefault()

        },

        onMouseMoveHandler ( event ) {

            if ( !this.onTracking ) {
                return
            }

            const domElement      = this.$el
            const firstSplit      = domElement.children[ 0 ]
            const splitterElement = domElement.children[ 1 ]
            const secondSplit     = domElement.children[ 2 ]

            if ( this.isVertical ) {

                const deltaX   = event.clientX - this.previousMousePositionX
                let firstWidth = firstSplit.offsetWidth + deltaX
                if ( firstWidth < 0 ) {
                    firstWidth = 0
                }

                const secondWidth  = domElement.offsetWidth - firstWidth - splitterElement.offsetWidth
                const globalHeight = domElement.offsetHeight

                firstSplit.style.width  = `${firstWidth}px`
                firstSplit.style.height = `${globalHeight}px`

                splitterElement.style.height = `${globalHeight}px`

                secondSplit.style.width  = `${secondWidth}px`
                secondSplit.style.height = `${globalHeight}px`

                console.log( `TSplitter.onMouseMoveHandler(fw/sw): ${firstWidth}/${secondWidth}` )

                this.previousMousePositionX = event.clientX

            } else {

                const deltaY    = event.clientY - this.previousMousePositionY
                let firstHeight = firstSplit.offsetHeight + deltaY
                if ( firstHeight < 0 ) {
                    firstHeight = 0
                }

                const secondHeight = domElement.offsetHeight - firstHeight - splitterElement.offsetHeight
                const globalWidth  = domElement.offsetWidth

                firstSplit.style.height = `${firstHeight}px`
                firstSplit.style.width  = `${globalWidth}px`

                splitterElement.style.width = `${globalWidth}px`

                secondSplit.style.height = `${secondHeight}px`
                secondSplit.style.width  = `${globalWidth}px`

                console.log( `TSplitter.onMouseMoveHandler(fh/sh): ${firstHeight}/${secondHeight}` )

                this.previousMousePositionY = event.clientY

            }

            event.preventDefault()

        },

        onMouseUpHandler ( event ) {

            this.onTracking = false
            event.preventDefault()

        }

    },
    mounted () {

        const domElement      = this.$el
        const firstSplit      = domElement.children[ 0 ]
        const splitterElement = domElement.children[ 1 ]
        const secondSplit     = domElement.children[ 2 ]

        const currentSplitterPosition = this.position

        if ( this.isVertical ) {

            const firstWidth    = Math.round( (domElement.offsetWidth / 100) * currentSplitterPosition )
            const splitterWidth = splitterElement.offsetWidth
            const secondWidth   = (Math.round( (domElement.offsetWidth / 100) * (100 - currentSplitterPosition) )) - splitterWidth
            const globalHeight  = domElement.offsetHeight

            firstSplit.style.width  = `${firstWidth}px`
            firstSplit.style.height = `${globalHeight}px`

            splitterElement.style.height = `${globalHeight}px`

            secondSplit.style.width  = `${secondWidth}px`
            secondSplit.style.height = `${globalHeight}px`

            console.log( `TSplitter.mounted(fw/sw): ${firstWidth}/${secondWidth}` )

        } else {

            const firstHeight    = Math.round( (domElement.offsetHeight / 100) * currentSplitterPosition )
            const splitterHeight = splitterElement.offsetHeight
            const secondHeight   = (Math.round( (domElement.offsetHeight / 100) * (100 - currentSplitterPosition) )) - splitterHeight
            const globalWidth    = domElement.offsetWidth

            firstSplit.style.height = `${firstHeight}px`
            firstSplit.style.width  = `${globalWidth}px`

            splitterElement.style.width = `${globalWidth}px`

            secondSplit.style.height = `${secondHeight}px`
            secondSplit.style.width  = `${globalWidth}px`

            console.log( `TSplitter.mounted(fh/sh): ${firstHeight}/${secondHeight}` )

        }

    },
    updated () {

        //        console.log('Updated !')

    }

} )
