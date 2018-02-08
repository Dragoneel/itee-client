/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import React from 'react'

let _instanceCounter = 0

class THorizontalLayout extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

    }

    /**
     * React lifecycle
     */
    componentWillMount () {}

    componentDidMount () {}

    componentWillUnmount () {}

    componentWillReceiveProps ( /*nextProps*/ ) {}

    shouldComponentUpdate ( /*nextProps, nextState*/ ) {}

    componentWillUpdate ( /*nextProps, nextState*/ ) {}

    componentDidUpdate ( /*prevProps, prevState*/ ) {}

    render () {

        const { id, className, children } = this.props

        const _id    = id || `tHorizontalLayout_${_instanceCounter}`
        const _style = {
            display:       'flex',
            flexDirection: 'row'
        }
        const _class = ( className ) ? `tHorizontalLayout ${className}` : 'tHorizontalLayout'

        return (
            <t-horizontal-layout id={_id} style={_style} className={_class}>
                {children}
            </t-horizontal-layout>
        )

    }

}

export { THorizontalLayout }
