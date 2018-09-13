import React, {
    Component
} from 'react'
import PropTypes from 'prop-types';
import State from '../components/State'
import Transition from '../components/Transition'
import {
    RECEIVE_DIAGRAM,
    SAVE_DIAGRAM,
    TASK_SELECTED,
    EVENT_SELECTED,
    UNSELECT_ALL,
    //ITEM_GRAB,
    DIAGRAM_LAYOUT,
    ITEM_DRAG,
    ITEM_DROP,
    DELETE_TASK
} from '../actions';

import { BOX_SIZE } from '../components/State'
import PropBox from './PropBox';

//import interpolateZoom from '../interpolateZoom'

import './AsyncApp.css';

const v4 = require('uuid/v4');
const config = require('../config.json');

class AsyncApp extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            w: 1000,
            h: 800,
            scale: 1,
            x: 0, 
            y: 0,
            propsVisible: false,
            selected: null
        }
        this.mouse = [0, 0];
        this.dragXY = { x: -1, y: -1, dragged: null};
    }

    loadDiagram(id) {
      console.log('loadDiagram', id)
        const store = this.context.store;
        const promises = [
            fetch(config.api.load.replace('#', id)).then(response => response.json()),
            fetch(config.api.load.replace('#', '../events')).then(response => response.json()),
            fetch(config.api.load.replace('#', '../actions')).then(response => response.json()),
        ]

        Promise.all(promises)
            .then(j => {
                let model = j[0];
                model.events = j[1];
                model.tasks = j[2];

                store.dispatch({
                    type: RECEIVE_DIAGRAM,
                    model: model
                })
            })
            .catch(err => {
                console.log(err);
            })
    }

    initMessageProcessor(store) {
        window.addEventListener("message", event => {
            var msg;
            try {
                msg = JSON.parse(event.data);
            } catch(err) {
                msg = {}
            }

            console.log("message:", msg)
            if(!msg.type)
                return;

            switch(msg.type) {
                case "save": {
                    store.dispatch({
                      type: SAVE_DIAGRAM,
                      model: store.getState()
                    })
                    break;
                }
                case "save as": {
                    let m = Object.assign({}, store.getState());
                    m.diagram.id = v4();
                    m.diagram.name = msg.value;
                    store.dispatch({
                      type: SAVE_DIAGRAM,
                      model: m
                    })
                    break;
                }
                case "layout": {
                    store.dispatch({
                      type: DIAGRAM_LAYOUT,
                      model: store.getState(),
                      layout: +msg.value
                    })
                    break;
                }
                case "zoom": {
                    this.setState({scale: +msg.value/100});
                    break;
                }
                case "properties": {
                    this.setState({propsVisible: !this.state.propsVisible});
                    break;
                }
                default: {
                    console.log(`Unknown message type: ${msg.type}`)
                }
            }

        }, false);
    }


    handleResizedScreen() {
        this.setState({
            w: window.innerWidth,
            h: window.innerHeight
        });
    }

    handleWheel(e) {
        const delta = e.wheelDelta < 0 ? .95 : 1/.95;
        const newScale = this.state.scale * delta;
        const point = [e.clientX, e.clientY];
        const shift = [point[0]*delta - point[0], point[1]*delta - point[1]];

        this.setState({
            scale: newScale,
            x: this.state.x - shift[0],
            y: this.state.y - shift[1]
        });

        //console.log('zoom', this.state.scale, 'pan', this.state.x, this.state.y );
    }
 
    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResizedScreen.bind(this));
        window.removeEventListener('wheel', this.handleWheel.bind(this));
    }

    componentDidMount() {
        const store = this.context.store;
        store.subscribe(this.forceUpdate.bind(this));
        this.initMessageProcessor(store);
        this.loadDiagram(this.props.dname || 'default');
        window.addEventListener("resize", this.handleResizedScreen.bind(this));
        //window.addEventListener('wheel', this.handleWheel.bind(this));
    }

    componentDidUpdate(prevState) {
    }

    handleOnMouseDown(e) {
        if(!this.state.propsVisible)
            return;

        const store = this.context.store;
        const model = store.getState();

        if(model.diagram.drag) {
            let m = model.states.find(s=>s.id===model.diagram.drag);
            if(!m) m = model.transitions.find(s=>s.id===model.diagram.drag);
            if(!m)
                this.setState({'selected': ''});
            else
                this.setState({'selected':  m.id});
        }
        else {
            this.setState({'selected': model.diagram.id});
        }
    }

    handleMouseUp(e) {
        this.dragXY.dragged = null;
        const store = this.context.store;
        const model = store.getState();

        if (model.diagram.eventlist.active || model.diagram.tasklist.active)
            store.dispatch({ type: UNSELECT_ALL });

        if (model.diagram.drag) {
            const id = model.diagram.drag;
            var m = model.states.find(s=>s.id===id);
            if(!m) m = model.transitions.find(s=>s.id===id);
            if(!m) return;

            let dropAndClean = () => {
                return dispatch => {
                    dispatch({
                        type: ITEM_DROP,
                        model: m,
                        position: [e.pageX, e.pageY]
                    });
                    dispatch({
                        type: DELETE_TASK
                    });
                }
            }
            
            store.dispatch(dropAndClean());

        }
        else {
            //console.log(model);
        }
    }


    isHovers(point, model) {
        if(!point)
            return false;

        if(!model)
            return false;

        const l = { x: model.x, y: model.y};
        const s = config.figure[model.task] ? config.figure[model.task].size : config.figure['default'].size;
        switch(model.task) {
        case 'start': return Math.sqrt(s/2) > Math.sqrt(point.x - l.x - s/2) + Math.sqrt(point.y - l.y - s/2);
        case 'end': {
          let r = s/2;
          //console.log(r, r*r, point.x - l.x, (point.x - l.x)*(point.x - l.x), point.y - l.y, (point.y - l.y)*(point.y - l.y));
          let p = {x: point.x - 8, y: point.y - 8}; // 8 - half size of cursor
          let dx = p.x - l.x - r;
          let dy = p.y - l.y - r;
          //console.log(p, l, dx, dy)
          return r*r-32 > dx*dx + dy*dy;
        }
        case 'gateway': return point.x >= l.x && point.y >= l.y && point.x <= l.x + s && point.y <= l.y + s;
        case 'default': return point.x >= l.x && point.y >= l.y && point.x <= l.x + s[0] && point.y <= l.y + s[1];
        case 'transition': return false;
        default: return point.x >= l.x && point.y >= l.y && point.x <= l.x + s[0] && point.y <= l.y + s[1];
        }
    }

    getDragLineXY(store) {
        this.dragXY = { x: -1, y: -1, dragged: null, w: 0, h: 0 };
        this.dragXY.dragged = store.states.find(s => !!s.dragging);

        if (typeof this.dragXY.dragged === 'undefined')
            return;

        if (this.dragXY.dragged === null)
            return;
        
        const otherStates = store.states.filter(s => s.id !== this.dragXY.dragged.id).map(s=>{
            let box = BOX_SIZE[s.task] || BOX_SIZE['default'];
            return {
                 x: s.x + box.w/2,
                y: s.y + box.h/2
            };
        });

        let box = BOX_SIZE[this.dragXY.dragged.task] || BOX_SIZE['default'];
        let dragged = {
            x: this.dragXY.dragged.x + box.w/2,
            y: this.dragXY.dragged.y + box.h/2,
        }
        this.dragXY.w = box.w;
        this.dragXY.h = box.h;

        // vertical
        var t = otherStates.find(s =>Math.abs(s.x - dragged.x) < config.figure.stick);
        if (!!t) this.dragXY.x = t.x;
        // horizontal
        t = otherStates.find(s => Math.abs(s.y - dragged.y) < config.figure.stick);
        if (!!t) this.dragXY.y = t.y;
    }

    createDragLines(store) {
        let t = this.dragXY;
        if(!t.dragged)
            return null;

        var d = '';
        if (t.x >= 0) d += `M ${t.x} 0 L ${t.x} 1000 `;
        if (t.y >= 0) d += `M 0 ${t.y} L 1000 ${t.y} `;

        if (d.length > 0)
            return <path d={d} strokeDasharray="15, 2, 1, 2" className='drag-line' />

        return null
    }


    handleMouseMove(e) {
        const delta = [e.pageX - this.mouse[0], e.pageY - this.mouse[1]];
        this.mouse = [e.pageX, e.pageY];

        const model = this.context.store.getState();
        this.getDragLineXY(model);

        const id = model.diagram.drag;
        if(!id) {
            // nothing to drag
            //console.log(e.buttons);
            if (e.buttons === 1) {
                // pan whole diagram 
                this.setState({
                    x: this.state.x + delta[0],
                    y: this.state.y + delta[1]
                })
            }
            return;
        }
        
        var d = model.states.find(s=>s.id===id);
        if(!d) d = model.transitions.find(s=>s.id===id);
        if(!d) return;  // object with such id not found

        if(!!d.task && d.task !== 'transition' && !!config.figure.stick) {
            // dragging action
            if (Math.abs(e.pageX - this.dragXY.x) < config.figure.stick) {
                delta[0] = 0;
                d.x = this.dragXY.x - this.dragXY.w/2;
            }
            if (Math.abs(e.pageY - this.dragXY.y) < config.figure.stick) {
                delta[1] = 0;
                d.y = this.dragXY.y - this.dragXY.h/2;
            }
        }

        var hovered = undefined;
        if(d.task && this.dragXY && this.dragXY.dragged && this.dragXY.dragged.id)
            hovered = model.states.find(s=>s.id !== this.dragXY.dragged.id && this.isHovers(this.dragXY.dragged, s));

        this.context.store.dispatch({
            type: ITEM_DRAG,
            model: d,
            hovers: hovered,
            move: delta
         });
    }

    //
    //  Events dropdown list
    //
    onEventSelected(e) {
        const store = this.context.store;
        const state = store.getState();
        const id = state.diagram.eventlist.id;
        var model = state.transitions.find(s=>s.id===id);
        if (!model) return;

        store.dispatch({
            type: EVENT_SELECTED,
            model: model,
            event: e.currentTarget.attributes[0].value,
            text: e.currentTarget.textContent
        });
    }

    createEventList(store) {
        return store.diagram.eventlist.active ?
            <div id="events-list" className="items-list" style={{left:store.diagram.eventlist.x,top:store.diagram.eventlist.y}}>
            <ul>
            {store.events.map((e, i)=>{
                return <li 
                    key={i} 
                    className={store.diagram.eventlist.event === e.id ? 'li-selected': null}
                    onClick={this.onEventSelected.bind(this)}
                    value={e.id}>
                    {e.name}
                </li>
            })}
            </ul>
        </div> : null;
    }

    //
    //  Tasks dropdown list
    // /
    onTaskSelected(e) {
        const store = this.context.store;
        store.dispatch({
            type: TASK_SELECTED,
            model: store.getState().diagram.tasklist.id,
            taskId: e.currentTarget.attributes[0].value,
            text: e.currentTarget.textContent
        });
    }

    createTaskList(store) {
        return store.diagram.tasklist.active ?
            <div id="tasks-list" className="items-list" style={{left:store.diagram.tasklist.x,top:store.diagram.tasklist.y}}>
                <ul>
                {store.tasks.map((t, i)=>{
                    return <li 
                        key={i}
                        className={store.diagram.tasklist.task === t.id ? 'li-selected': null}
                        onClick={this.onTaskSelected.bind(this)}
                        value={t.id}>
                        {t.name}
                    </li>
                })}
                </ul>     
            </div> : null; 
    }

    createPropsList(store) {
        return this.state.propsVisible ? <PropBox selected={this.state.selected} /> : null;
    }


    render() {
        const model = this.context.store.getState();
        var states = model.states.map(s => {
            let task = model.tasks.find(t=>t.id===s.task);
            let label = task ? task.name : '';

            return <State 
                x={s.x} 
                y={s.y} 
                task={s.task} 
                text={label} 
                model={s} 
                key={s.id} />
        });

        let getState = id => model.states.find(s => s.id === id);

        var transitions = model.transitions.map(t => {
            var src = t.source ? getState(t.source) : {};
            var trg = t.target ? getState(t.target) : {};
            let event = model.events.find(e=>e.id===t.event);
            let label = event ? event.name : '';
            return <Transition 
                source={src} 
                target={trg} 
                model={t} 
                label={label}
                key={t.id} />
        });

        const dragline = this.createDragLines(model);
        const eventlist = this.createEventList(model);
        const tasklist = this.createTaskList(model);
        const propslist = this.createPropsList(model);

        const transform = `scale(${this.state.scale}) translate(${this.state.x}, ${this.state.y})`;

        return (
            <div id="flow-diagram">
              <svg 
                  width={this.state.w} 
                  height={this.state.h} 
                  onMouseDown = { this.handleOnMouseDown.bind(this) }
                  onMouseMove={this.handleMouseMove.bind(this)}
                  onMouseUp={this.handleMouseUp.bind(this)}
                  className="diagram" >
                    <defs>
                        <filter id="blur8" x="0" y="0">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                        </filter>
                    </defs>
                    <g transform={transform}>
                        {dragline}
                        {transitions}
                        {states}
                    </g>
              </svg>
              {eventlist}
              {tasklist}
              {propslist}
            </div>
        )
    }
}


AsyncApp.propTypes = {
    dname: PropTypes.string
}


AsyncApp.contextTypes = {
    store: PropTypes.object.isRequired
};

export default AsyncApp;