import React from 'react'
import PropTypes from 'prop-types'

class CommonContainerDivider extends React.Component {
  styles = {
    height: '40px',
    width: '100%'
  }

  render() {
    return (
      <div style={this.styles} />
    )
  }
}

export default class CommonContainer extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string
  }

  styles = {
    background: '#FFF',
    boxShadow: '0 0 4px 0 #C5D9E8',
    borderRadius: '4px',
    padding: '40px'
  }

  render() {
    return (
      <div
        className={this.props.className}
        style={Object.assign({}, this.styles, this.props.style)}>{this.props.children}</div>
    )
  }
}

CommonContainer.defaultProps = {style: {}, className: ''}

CommonContainer.CommonContainerDivider = CommonContainerDivider
