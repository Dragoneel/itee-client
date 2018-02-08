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

class TDropDownMenu extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

        this.state = {
            isHover: false
        }

        this.onMouseEnterHandler = this.onMouseEnterHandler.bind( this )
        this.onMouseLeaveHandler = this.onMouseLeaveHandler.bind( this )

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

        const { id, className, icon, label, align, children } = this.props

        const _id    = id || `tDropDownMenu_${_instanceCounter}`
        const _style = {}
        const _class = ( className ) ? `tDropDownMenu ${className}` : 'tDropDownMenu'

        const dropdownStyle = {
            float:         'left',
            listStyleType: 'none'
        }

        const labelStyle = {
            display:        'block',
            color:          'white',
            fontSize:       '1.6em',
            textAlign:      'center',
            padding:        '14px 16px',
            textDecoration: 'none'
        }

        let contentStyle = {
            listStyleType: 'none',
            position:      'absolute',
            minWidth:      '100%'
        }

        if ( this.state.isHover ) {
            contentStyle[ 'display' ] = 'block'
        } else {
            contentStyle[ 'display' ] = 'none'
        }

        if ( align === 'left' ) {
            contentStyle[ 'left' ] = 0
        } else if ( align === 'right' ) {
            contentStyle[ 'right' ] = 0
        } else {
            // Todo: center
        }

        if ( icon && label ) {

            return (
                <li className={"dropdown"} style={dropdownStyle} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                    <a className={"dropdown-label"} style={labelStyle}>
                        <i className={icon}></i>
                        {label}
                    </a>
                    <div className={"dropdown-content"} style={contentStyle}>
                        {children}
                    </div>
                </li>
            )

        } else if ( icon && !label ) {

            const iconStyle = {
                fontSize:     '46px',
                marginRight:  '11px',
                marginBottom: '6px',
                marginTop:    '6px',
                color:        'white'
            }

            return (
                <li className={"dropdown"} style={dropdownStyle} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                    <a className={"dropdown-label"}>
                        <i className={icon} style={iconStyle}></i>
                    </a>
                    <div className={"dropdown-content"} style={contentStyle}>
                        {children}
                    </div>
                </li>
            )

        } else if ( !icon && label ) {

            return (
                <li className={"dropdown"} style={dropdownStyle} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                    <a className={"dropdown-label"} style={labelStyle}>
                        {label}
                    </a>
                    <div className={"dropdown-content"} style={contentStyle}>
                        {children}
                    </div>
                </li>
            )

        } else {

            return (
                <li className={"dropdown"} style={dropdownStyle} onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                    <a className={"dropdown-label"} style={labelStyle}></a>
                    <div className={"dropdown-content"} style={contentStyle}>
                        {children}
                    </div>
                </li>
            )

        }

//        return (
//            <t-drop-down-menu ref={( container ) => {this._container = container}} id={_id} style={_style} className={_class}></t-drop-down-menu>
//        )

    }

    onMouseEnterHandler ( event ) {

        this.setState( { isHover: true } )
        event.preventDefault()

    }

    onMouseLeaveHandler ( event ) {

        this.setState( { isHover: false } )
        event.preventDefault()

    }


}

export { TDropDownMenu }
