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

class TBadge extends React.Component {

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

    componentWillReceiveProps ( nextProps ) {}

    shouldComponentUpdate ( nextProps, nextState ) {}

    componentWillUpdate ( nextProps, nextState ) {}

    componentDidUpdate ( prevProps, prevState ) {}

    static componentDidCatch ( error, info ) {

        console.error( error )

    }

    render () {

        const { id, className } = this.props

        const _id = id || `tBadge_${_instanceCounter}`
        const _style = {}
        const _class = ( className ) ? `tBadge ${className}` : 'tBadge'

        return (
            <t-badge ref={( container ) => {this._container = container}} id={_id} style={_style} className={_class}></t-badge>
        )

    }

}

export { TBadge }
