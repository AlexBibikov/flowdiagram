import { layoutForce } from './layoutForce'

const v4 = require('uuid/v4');

export const RECEIVE_DIAGRAM = 'RECEIVE_DIAGRAM'
export const SAVE_DIAGRAM = 'SAVE_DIAGRAM'
export const DIAGRAM_LAYOUT = 'DIAGRAM_LAYOUT'


export const ITEM_GRAB = 'ITEM_GRAB'
export const ITEM_DRAG = 'ITEM_DRAG'
export const ITEM_DROP = 'ITEM_DROP'

export const ADD_TASK = 'ADD_TASK'
export const ADD_TRANSITION = 'ADD_TRANSITION'
export const DELETE_TASK = 'DELETE_TASK'
export const DELETE_TRANSITION = 'DELETE_TRANSITION'

export const OPEN_TASKS_LIST = 'OPEN_TASKS_LIST'
export const TASK_SELECTED = 'TASK_SELECTED'

export const OPEN_EVENT_LIST = 'OPEN_EVENT_LIST'
export const EVENT_SELECTED = 'EVENT_SELECTED'

export const UNSELECT_ALL = 'UNSELECT_ALL'

export const receiveDiagram = (state, action, part) => {
    return action.model[part];
}

const config = require('./config.json');

export const saveDiagram = (state, action) => {
    console.log('saveDiagram', state, action);

    var data = new FormData();
    let diagram = Object.assign({}, action.model, { tasks: [], events: []});
    data.append( "diagram", JSON.stringify( diagram ) );
    fetch(config.api.save, {
        method: "POST",
        body: data
    })
    .then(res => {
      let Error = (msg, code) => {
          return {
              message: msg,
              code: code
          }
      }
      if(res.status >= 400)
          throw new Error(`Error while saving diagram. Code: ${res.status}`, res.status);

      return res.json();
    })
    .then(data => { 
        console.log( JSON.stringify( data ) ) ;
    })
    .catch(err => {
        console.log(err);
    })

    return state;
}

export const itemGrab = (state, action) => {
    let newState = Object.assign({}, state, { drag: action.model.id })
    return newState;
}

export const stateMove = (state, action) => {
    if(!action.model.task)
        return state;

    var hovered = (action.model.task === 'transition' && !!action.hovers) ? action.hovers.id : null;

    return state.map(s=>{
        if(s.id === hovered)
            return Object.assign({}, action.hovers, {
            hovered: true
        })

        if(s.hovered && !hovered) {
            let ns = Object.assign({}, s);
            delete ns.hovered;
            return ns;
        }

        if(s.id !== action.model.id)
            return s;

        return Object.assign({}, action.model, {
            x: s.x += action.move[0],
            y: s.y += action.move[1],
            dragging: true
        })
    })
}

export const deleteTask = (state, action) => {
    if(action.model)
        return state.filter(s=>s.id!==action.model.id);
    else
        return state.filter(s=>s.task!=='transition');
}

export const addTask = (state, action) => {
    action.newUUID = v4();
    return [...state, {
        id: action.newUUID,
        text: "unassigned",
        task: action.task || "0",
        x: action.model.x + 200,
        y: action.model.y
    }]
}

export const addTransition2NewTask = (state, action) => {
  return [...state, {
        id: v4(),
        source: action.model.id,
        target: action.newUUID,
        text: "unassigned",
        event: "0"
    }];
}

export const deleteTaskTransitions = (state, action) => {
    if(!action.model)
        return state;

    return state.filter(t=>t.source!==action.model.id && t.target!==action.model.id);
}

//
//  Tasks dropdown list
//
export const openTasksList = (state, action) => {
    let newState = Object.assign( {}, state, {
        tasklist: {
          active: true,
          id: action.model.id,
          task: action.model.task,
          x: action.model.x + 36,
          y: action.model.y + 36,
        }
    })
    return newState;
}

export const closeTaskList = (state, action) => {
    let newState = Object.assign( {}, state, {
        tasklist: {
          active: false,
          task: state.tasklist.id
        }
    })
    return newState;
}

export const assignNewTask = (state, action) => {
    const newState = state.map(s=>{
        return s.id !== action.model ? s : Object.assign({}, s, {
          text: action.text,
          task: action.taskId
        })
    })
    return newState;
}

//
//  Events dropdown list
//
export const openEventList = (state, action) => {
    let newState = Object.assign( {}, state, {
        eventlist: {
          active: true,
          event: action.model.event,
          id: action.model.id,
          x: action.position[0],
          y: action.position[1],
        }
    })
    return newState;
}

export const closeEventList = (state, action) => {
    let newState = Object.assign( {}, state, {
        eventlist: {
          active: false,
          event: action.event,
          id: action.model.id
        }
    })
    return newState;
}

export const assignNewEvent = (state, action) => {
    const newState = state.map(s=>{
        return s.id !== action.model.id ? s : Object.assign({}, s, {
          text: action.text,
          event: action.event
        })
    })
    return newState;
}

export const unselectAll = (state, action) => {
    const isSelected = state.eventlist.active || state.tasklist.active;
    if(isSelected)
        return Object.assign({}, state, {
            eventlist: { active: false },
            tasklist: { active: false },
        })
    else
        return state;
}

//
//  Transition label ---
//
export const transitionLabelGrab = (state, action) => {
    if(action.model.task)
        return state;

    return state.map(t=>{
        if(t.id !== action.model.id)
            return t;

        let newModel = Object.assign({
            x: 0,
            y: 0
        }, t);
        return newModel;
    })
}

export const transitionLabelDrag = (state, action) => {
    if(action.model.task)
        return state;

    if(action.move[0] === 0 && action.move[1] === 0)
        return state;

    return state.map(t=>{
        if(t.id !== action.model.id)
            return t;

        let newModel = Object.assign({}, t, {
            x: t.x + action.move[0],
            y: t.y + action.move[1],
            dragging: true
        });
        return newModel;
    })
}

export const transitionLabelDrop = (state, action) => {
    if(action.model.task)
        return state;

    return state.map(t=>{
        if(t.id !== action.model.id)
          return t;
        else {
            let newModel = Object.assign({}, t);
            delete newModel.dragging;
            return newModel;
        }
    })
}

//  --- Transition label

export const addTransition = (state, action, part) => {
    console.log("addTransition",  part)
    switch (part) {
        case 'diagram': {
            action.drag = v4();
            return Object.assign({}, state, { drag: action.drag })
        }
        case 'state': {
            return [...state, {
                id: action.drag,
                task: "transition",
                x: action.position[0],
                y: action.position[1],
                dragging: true
            }]
        }
        case 'transition': {
            return [...state, {
                  id: v4(),
                  source: action.source.id,
                  target: action.drag,
                  text: "unassigned",
                  event: "0"
            }];
        }
        default: {
            console.log('addTransition', state, action, part);
            return state;
        }
    }
}

export const deleteTransition = (state, action) => {
    return state.filter(s=>s.id!==action.model.id);
}

export const itemDrop = (state, action, part) => {
    console.log("itemDrop",  part)
    switch (part) {
        case 'diagram': {
            let newModel = Object.assign({}, state);
            delete newModel.drag;
            return newModel;
        }
        case 'state': {
            if(!action.model.task)
                return state;

            action.hovered = state.find(s=>s.hovered); 
            action.dragged = state.find(s=>s.dragging);

            return state
                .filter(s=>s.task !== 'transition')
                .map(s=>{
                    var ns = s;

                    if(s.hovered)
                      ns = Object.assign({}, s);

                    if(s.dragging)
                        ns = Object.assign({}, s);

                    delete ns.dragging;
                    delete ns.hovered;

                    return ns;
                })
        }
        case 'transition': {
          if(action.model.task) {   // not transaction label
              if(!action.dragged)
                  return state;

              // dragged transition
              if(action.dragged.task === 'transition') {
                  if(!action.hovered) // dropped to nothing
                      return state.filter(t=>t.target !== action.model.id);   // delete transition

                  return state.map(t=>{
                      if(t.target !== action.dragged.id)
                          return t;

                      return Object.assign({}, t, {   // assign transition to hovered object
                          target: action.hovered.id
                      })
                  })
              }
          }

          // transition label has been moved
          return transitionLabelDrop(state, action);
        }
        default: {
            console.log('itemDrop', state, action, part);
            return state;
        }
    }
}

export const applyLayout = (state, action) => {
    switch(action.layout) {
        case 0: return state;
        case 1: return state;
        case 2: return layoutForce(state, action);
        case 3: return state;
        case 4: {
            let states = state.map( s => {
                return Object.assign({}, s, {
                  x: 100 + 800*Math.random(), 
                  y: 100 + 800*Math.random()
                })
            });
            return states;
        }
        default: return state;
    }
}
