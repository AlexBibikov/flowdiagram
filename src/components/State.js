import React, {
    Component
} from 'react'
import PropTypes from 'prop-types'

import {
    ITEM_GRAB,
    ITEM_DROP,
    ADD_TASK,
    ADD_TRANSITION,
    DELETE_TASK,
    OPEN_TASKS_LIST
} from '../actions';

const config = require('../config.json');

export const BOX_SIZE = {
    'start': { w: config.figure.start.size, h: config.figure.start.size },
    'gateway': { w: config.figure.gateway.size, h: config.figure.gateway.size },
    'end': { w: config.figure.end.size, h: config.figure.end.size },
    'default': { w: config.figure.default.size[0], h: config.figure.default.size[1] },
    'transition': { w: config.figure.transition.size, h: config.figure.transition.size }
}

class State extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            hover: false,
            selected: false,
            editing: false
        }

        this.box = BOX_SIZE[this.props.task] ?
            BOX_SIZE[this.props.task] :
            BOX_SIZE['default'];
    }

    componentDidMount() {
        //console.log('componentDidmount.', this.props.task);
        
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log('componentDidUpdate.', prevProps.task, this.props.task);
        if (this.props.sel !== prevProps.sel)
            this.setState({
                selected: this.props.sel || false
            });
        if (this.props.text !== prevProps.text)
            this.setState({
                editing: false
            });
    }

    handleOnMouseOver(e) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        this.setState({
            hover: true
        })
    }

    handleOnMouseOut(e) {
        let instance = this;
        this.timeout = setTimeout(() => {
            instance.setState({
                hover: false
            })
        }, 500)
    }

    handleOnMouseDown(e) {
        this.mouse = [e.pageX, e.pageY];
        const store = this.context.store;
        store.dispatch({
            type: ITEM_GRAB,
            model: Object.assign({}, this.props.model),
            position: this.mouse
        });
        this.setState({ selected: true });
    }

    handleOnMouseUp(e) {
        this.setState({ selected: false })
        this.mouse = [e.pageX, e.pageY];
        const store = this.context.store;
        store.dispatch({
             type: ITEM_DROP,
             model: Object.assign({}, this.props.model),
             position: this.mouse
        });
    }

    handleAddObject(e, task) {
        e.stopPropagation();
        this.setState({
            selected: false,
            hover: false
        });
        this.mouse = [e.pageX, e.pageY];
        const store = this.context.store;
        store.dispatch({
            type: ADD_TASK,
            model: this.props.model,
            position: this.mouse,
            task: task
        });
    }

    //
    //  TASK ---
    //
    handleAddTask(e) {
        this.handleAddObject(e);
    }
    createAddTaskIcon() {
        return <g>
          <text
              className="text-glow"
              dx={this.box.w + 20} 
              dy={this.box.h/2 - 24}>&#9634;</text>
          <text
              onMouseOver={e=>{e.nativeEvent.target.style.fontWeight = 600}}
              onMouseOut={e=>{e.nativeEvent.target.style.fontWeight = 100}}
              onMouseDown={this.handleAddTask.bind(this)}
              dx={this.box.w + 20} 
              dy={this.box.h/2 - 24}>&#9634;</text>
      </g>
    }
    // --- TASK

    //
    //  GATEWAY ---
    //
    handleAddGateway(e) {
        this.handleAddObject(e, 'gateway');
    }
    createAddGatewayIcon() {
        return <g>
        <text dx={this.box.w + 20} dy={this.box.h/2 - 8} className="text-glow" >&#9671;</text>
        <text 
            onMouseOver={e=>{e.nativeEvent.target.style.fontWeight = 600}}
            onMouseOut={e=>{e.nativeEvent.target.style.fontWeight = 100}}
            onMouseDown={this.handleAddGateway.bind(this)}
            dx={this.box.w + 20}
            dy={this.box.h/2 - 8 }>&#9671;</text>
      </g>
    }
    // --- GATEWAY

    //
    //  END ---
    //
    handleAddEnd(e) {
        this.handleAddObject(e, 'end');
    }
    createAddEndIcon() {
        return <g>
          <text dx={this.box.w + 20} dy={this.box.h/2 + 8} className="text-glow" >&#9673;</text>
          <text 
              onMouseOver={e=>{e.nativeEvent.target.style.fontWeight = 600}}
              onMouseOut={e=>{e.nativeEvent.target.style.fontWeight = 100}}
              onMouseDown={this.handleAddEnd.bind(this)}
              dx={this.box.w + 20} 
              dy={this.box.h/2 + 8}>&#9673;</text>
      </g>
    }
    // --- END

    //
    //  TRANSITION ---
    //

    handleAddTransition(e) {
        console.log('handleAddTransition');
        e.stopPropagation();
        this.setState({
            selected: false,
            hover: false
        });
        this.mouse = [e.pageX, e.pageY];
        const store = this.context.store;
        store.dispatch({
            type: ADD_TRANSITION,
            source: this.props.model,
            position: this.mouse
        });
    }

    createAddTransitionIcon() {
        return <g>
          <text 
              dx={this.box.w + 4} 
              dy={this.box.h/2 - 8} 
              className="text-glow" >&#8605;</text>
          <text 
              onMouseOver={e=>{e.nativeEvent.target.style.fontWeight = 600}}
              onMouseOut={e=>{e.nativeEvent.target.style.fontWeight = 100}}
              onMouseDown={this.handleAddTransition.bind(this)}
              dx={this.box.w + 4} 
              dy={this.box.h/2 - 8}>&#8605;</text>
      </g>
    }
    // --- TRANSITION

    //
    //  DELETE ---
    //
    handleDeleteTask(e) {
        e.stopPropagation();
        const store = this.context.store;
        store.dispatch({
            type: DELETE_TASK,
            model: this.props.model
        });
    }
    createRemoveIcon() {
        return <g>
          <text 
              className="text-glow"
              dx={this.box.w + 4} 
              dy={this.box.h/2 - 24}>&#59393;</text>
          <text 
              onMouseOver={e=>{e.nativeEvent.target.style.fontWeight = 600}}
              onMouseOut={e=>{e.nativeEvent.target.style.fontWeight = 100}}
              onMouseDown={this.handleDeleteTask.bind(this)}
              dx={this.box.w + 4} 
              dy={this.box.h/2 - 24}>&#59393;</text>
      </g>
    }
    // --- DELETE

    createToolbox() {
        return this.state.hover && !this.state.editing && !this.props.model.hovered ?
            <g className="toolbox"  transform={this.box.h === 80 ? null : `translate(0, ${(50-this.box.h)/2})`} >
                {['start', 'transition'].indexOf(this.props.task) >= 0 ? null : this.createRemoveIcon()}
                {['end', 'transition'].indexOf(this.props.task) >= 0 ? null : this.createAddTransitionIcon()}
                {['end', 'transition'].indexOf(this.props.task) >= 0 ? null : this.createAddTaskIcon()}
                {['end', 'transition'].indexOf(this.props.task) >= 0 ? null : this.createAddGatewayIcon()}
                {['end', 'transition'].indexOf(this.props.task) >= 0 ? null : this.createAddEndIcon()}
            </g> : null;    // /
    }

    getFigureStyle(shape = 'default') {
        const f = config.figure[shape];
        const d = config.figure.default;

        var strokeIdx = 0;
        var fillIdx = 0;

        if(this.props.model.hovered || this.state.hover)
            strokeIdx = 1;

        if(this.props.model.hovered || this.state.selected)
            fillIdx = 1;

        return f ? {
            stroke: f.stroke ? f.stroke[strokeIdx] : d.stroke[strokeIdx], 
            fill: f.fill ? f.fill[fillIdx] : d.fill[fillIdx]
        } : {
            stroke: d.stroke[strokeIdx], 
            fill: d.fill[fillIdx]
        }
    }

    createShapeTransition() {
        const r = config.figure.transition.size/2;
        return <g>
          <circle 
              className="circle-white" 
              r={r}
              transform={`translate(-8,-8)`}
              style={this.getFigureStyle('transition')} />
          <circle 
              className="circle-black" 
              r={2}
              transform={`translate(-8,-8)`}
              style={{'fill': '#000' }} />
      </g>
    }

    createShapeStart() {
        const r = config.figure.start.size/2;
        return <g>
          <circle
              className="shadow" 
              r={r}
              transform={`translate(${r}, ${r})`} />
          <circle 
              className="circle-white" 
              r={r}
              transform={`translate(${r}, ${r})`}
              style={this.getFigureStyle()} />
      </g>
    }

    createShapeEnd() {
        const r = config.figure.end.size/2;
        return <g transform={`translate(${r}, ${r})`}>
          <circle
              className="shadow" 
              r={r} />
          <circle 
              className="circle-white" 
              r={r}
              style={this.getFigureStyle()} />
          <circle 
              className="circle-black" 
              r={2/3*r}
              style={{'fill': this.state.hover ? '#000' : '#777' }} />
      </g>
    }

    createShapeGateway() {
        const S = config.figure.gateway.size;
        const x = Math.round(S / Math.sqrt(2));
        const t = Math.round((S - x) / 2);
        return <g className="svg-gateway">
            <rect
                width={S} 
                height={S} 
                style={{'stroke': 'transparent', 'fill': 'transparent' }} />
            <rect
                className='shadow'
                width={x} 
                height={x} 
                transform={`rotate(45, ${S/2}, ${S/2}) translate(${t}, ${t})`} />
            <rect
                className='box'
                width={x} 
                height={x} 
                transform={`rotate(45, ${S/2}, ${S/2}) translate(${t}, ${t})`}
                style={this.getFigureStyle('gateway')} />
        </g>
    }

    createShapeAction() {
        return <g>
            <rect 
                className="shadow" 
                width={this.box.w} 
                height={this.box.h} 
                rx="5" 
                ry="5" />
            <rect 
                className="box" 
                width={this.box.w} 
                height={this.box.h} 
                rx="5" 
                ry="5" 
                style={this.getFigureStyle()} />
            <text 
                dx={this.box.w/2} 
                dy={this.box.h/2} 
                textAnchor="middle"
                onClick={this.handleSelectTask.bind(this)}
                >{this.props.text}</text>
      </g>
    }

    createShape() {
        switch (this.props.task) {
            case "start":
                return this.createShapeStart();
            case "end":
                return this.createShapeEnd();
            case "gateway":
                return this.createShapeGateway();
            case "transition":
                return this.createShapeTransition();
            default:
                return this.createShapeAction();
        }
    }

    handleSelectTask(e) {
        e.stopPropagation();
        const store = this.context.store;
        this.setState({ editing: !this.state.editing });
        store.dispatch({
            type: OPEN_TASKS_LIST,
            model: this.props.model,
            position: this.mouse
        });
    }

    render() {
        var shift = `translate(${this.props.x},${this.props.y})`;
        const buttons = this.createToolbox();
        const shape = this.createShape();

        return ( 
            <g draggable = "false"
                // Hover and Select
                onMouseDown = { this.handleOnMouseDown.bind(this) }
                onMouseUp = { this.handleOnMouseUp.bind(this) }
                onMouseOver = { this.handleOnMouseOver.bind(this) }
                onMouseOut = { this.handleOnMouseOut.bind(this) }

                className = "svg-state"
                transform = {shift} > 
                {shape}
                {buttons} 
            </g>
        )
    }
}

State.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    text: PropTypes.string,
    task: PropTypes.string,
    model: PropTypes.object.isRequired
}

State.contextTypes = {
    store: PropTypes.object.isRequired
};

export default State;