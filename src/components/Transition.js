import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { 
    OPEN_EVENT_LIST,
    ITEM_GRAB,
    ITEM_DROP,
    DELETE_TRANSITION
} from '../actions';
import { BOX_SIZE } from './State'

const config = require('../config.json');

class TLabel extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      hover: false,
      selected: false,
      editing: false,
      width: 100
    }
  }

  componentDidUpdate(prevProps, prevState) {
      if (this.props.label !== prevProps.label) {
          let w = this.textElement.getBBox().width;
          this.setState({width: w + 16});
      }
  }

  getFigureStyle() {
      return {
          stroke: config.label.stroke[this.state.hover ? 1 : 0], 
          fill: config.label.fill[this.state.hover ? 1 : 0]
      }
  }

  handleMouseOver(e) {
      e.stopPropagation();
      this.setState({hover:true});
  }

  handleMouseOut(e) {
      e.stopPropagation();
      this.setState({hover:false});
  }

  handleMouseDown(e) {
      this.mouse = [e.pageX, e.pageY];
      const store = this.context.store;
      this.grabPos = [this.props.model.x || e.pageX, this.props.model.y || e.pageY];
      store.dispatch({
          type: ITEM_GRAB,
          model: Object.assign({}, this.props.model),
          position: this.mouse
      });
      this.setState({ selected: true });
  }

  handleMouseUp(e) {
      this.setState({ selected: false })
      this.mouse = [e.pageX, e.pageY];
      const store = this.context.store;
      if(!this.props.model.dragging) {
          e.stopPropagation();
          this.setState({ editing: true });
          store.dispatch({
            type: OPEN_EVENT_LIST,
            model: this.props.model,
            position: this.mouse
          });
      }
      store.dispatch({
           type: ITEM_DROP,
           model: this.props.model,
           position: this.mouse
      });
  }

  render() {
      return <g>
          <rect
              width={this.state.width} 
              height={20} 
              style={this.getFigureStyle()}
              transform={`translate(${this.props.dx + (this.props.model.x || 0) - this.state.width/2}, ${this.props.dy + (this.props.model.y || 0) - 14})`} />

          <text
                dx={this.props.dx + (this.props.model.x || 0)} 
                dy={this.props.dy + (this.props.model.y || 0)}
                ref={txt=>{this.textElement=txt}}
                onMouseOver={this.handleMouseOver.bind(this)}
                onMouseOut={this.handleMouseOut.bind(this)}
                onMouseDown={this.handleMouseDown.bind(this)}
                onMouseUp={this.handleMouseUp.bind(this)}
                textAnchor="middle">
                {this.props.label}
            </text>
      </g>
  }
}

TLabel.propTypes = {
  dx: PropTypes.number.isRequired,
  dy: PropTypes.number.isRequired,
  model: PropTypes.object.isRequired,
  label: PropTypes.string
}

TLabel.contextTypes = {
  store: PropTypes.object.isRequired
};

export default class Transition extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      hover: false,
      selected: false,
      mouse: [0, 0]
    }
  }

  componentWillUnmount() {
      if(this.timeout)
          clearTimeout(this.timeout);
  }

  getSourcePoint() {
      return { x: 100, y: 100 }
  }

  getTargetPoint() {
      return { x: 100, y: 100 }
  }

  pathMouseOver(e) {
      if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
      }

      this.setState({
          hover: true,
          mouse: [e.pageX, e.pageY]
      })
  }

  pathMouseOut(e) {
      let instance = this;
      this.timeout = setTimeout(() => {
          instance.setState({
              hover: false
          })
      }, 500)
  }

  pathMouseDown(e) {
      //this.setState({selected: true});
  }

  pathMouseUp(e) {
      this.setState({selected: !this.state.selected});    
  }

  getFigureStyle() {
      return {
          stroke: config.transition.stroke[this.state.hover ? 1 : 0]
      }
  }

    //
    //  DELETE ---
    //
    handleDeleteTransition(e) {
        e.stopPropagation();
        const store = this.context.store;
        store.dispatch({
            type: DELETE_TRANSITION,
            model: this.props.model
        });
    }
    createRemoveIcon() {
        return <g>
          <text 
              className="text-glow"
              dx={0 + 4} 
              dy={0 - 24}>&#59393;</text>
          <text 
              onMouseOver={e=>{e.nativeEvent.target.style.fontWeight = 600}}
              onMouseOut={e=>{e.nativeEvent.target.style.fontWeight = 100}}
              onMouseDown={this.handleDeleteTransition.bind(this)}
              dx={0 + 4} 
              dy={0 - 24}>&#59393;</text>
      </g>
    }
    // --- DELETE

  createToolbox() {
      return this.state.selected ?
          <g className="toolbox"  transform={`translate(${this.state.mouse[0]}, ${this.state.mouse[1]+16})`} >
              {this.createRemoveIcon()}
          </g> : null;    // /
  }


  render() {
    const { source, target } = this.props;
    if(!target)
        return null;

    try {
    var sb = BOX_SIZE[source.task] || BOX_SIZE['default'],
        tb = BOX_SIZE[target.task] || BOX_SIZE['default'];
    } catch(e) {
      console.log(source, target);
    }

    const adj = target.task === 'transition' ? {x:-8, y:-8} : {x:0, y:0};

    var path = ''

    if((target.x - source.x) > (target.y - source.y)) {
        path += `M ${source.x + sb.w} ${source.y + sb.h/2} `;
        path += `C ${source.x + sb.w + 100} ${source.y + sb.h/2} `;
        path += ` ${target.x - 100} ${target.y + tb.h/2} `;
        path += ` ${target.x + adj.x} ${target.y + tb.h/2 + adj.y}`;
    } else {
        path += `M ${source.x + sb.w/2} ${source.y + sb.h} `;
        path += `C ${source.x + sb.w/2} ${source.y + sb.h + 100} `;
        path += ` ${target.x + tb.w/2} ${target.y - 100} `;
        path += ` ${target.x + tb.w/2 + adj.x} ${target.y + adj.y}`;
    }

    var arrow = ''

    if((target.x - source.x) > (target.y - source.y)) {
        arrow += `M ${target.x - 1 + adj.x} ${target.y + tb.h/2 + adj.y} `;
        arrow += `l ${-10} ${-3} `;
        arrow += `l ${0} ${6} Z`;
    } else {
        arrow += `M ${target.x + tb.w/2 + adj.x} ${target.y - 1 + adj.y} `;
        arrow += `l ${-3} ${-10} `;
        arrow += `l ${6} ${0} Z`;
    }

    const fatpath = target.task === 'transition' ? null : <path 
        className="fat-path" 
        onMouseOver={this.pathMouseOver.bind(this)}
        onMouseOut={this.pathMouseOut.bind(this)}
        onMouseDown={this.pathMouseDown.bind(this)}
        onMouseUp={this.pathMouseUp.bind(this)}
        d={path} 
    /> // 

    const textLabel = target.task === 'transition' ? null : <TLabel 
        dx={Math.min(source.x, target.x) + Math.abs((source.x - target.x)/2)} 
        dy={Math.min(source.y, target.y) + Math.abs((source.y - target.y)/2)} 
        model={this.props.model}
        label={this.props.label}
    /> //

    const toolBox = target.task === 'transition' ? null : this.createToolbox();

    const style = this.getFigureStyle();

    return (
        <g className="svg-transition" key={this.props.model.id} >
            <path 
                className="arrow" 
                style={style}
                d={arrow} />
            <path 
                className="transition" 
                style={style}
                d={path} />
            {fatpath}
            {textLabel}
            {toolBox}
        </g>
    )
  }
}

Transition.propTypes = {
  source: PropTypes.object.isRequired,
  target: PropTypes.object.isRequired,
  model: PropTypes.object.isRequired,
  label: PropTypes.string,
}

Transition.contextTypes = {
  store: PropTypes.object.isRequired
};
