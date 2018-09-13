import { combineReducers } from 'redux'
import {
    // SELECT_ACTION,
    // SELECT_TRANSITION,
    RECEIVE_DIAGRAM,
    SAVE_DIAGRAM,
    DIAGRAM_LAYOUT,

    ITEM_GRAB,
    ITEM_DRAG,
    ITEM_DROP,

    ADD_TASK,
    DELETE_TASK,

    ADD_TRANSITION,
    DELETE_TRANSITION,

    OPEN_TASKS_LIST,
    TASK_SELECTED,
    OPEN_EVENT_LIST,
    EVENT_SELECTED,

    UNSELECT_ALL
} from './actions';
import * as actions from './actions';

const diagram = (state = {}, action) => { 
  switch (action.type) {
    case RECEIVE_DIAGRAM:
        return actions.receiveDiagram(state, action, 'diagram');
    case SAVE_DIAGRAM:
        return actions.saveDiagram(state, action);
    case OPEN_TASKS_LIST:
        return actions.openTasksList(state, action);
    case TASK_SELECTED:
        return actions.closeTaskList(state, action);
    case OPEN_EVENT_LIST:
        return actions.openEventList(state, action);
    case EVENT_SELECTED:
        return actions.closeEventList(state, action);
    case UNSELECT_ALL:
        return actions.unselectAll(state, action);
    case ITEM_GRAB:
        return actions.itemGrab(state, action);
    case ITEM_DROP:
        return actions.itemDrop(state, action, 'diagram');
    case ADD_TRANSITION:
        return actions.addTransition(state, action, 'diagram');
    default:
        return state
  }
}

const states = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_DIAGRAM:
        return actions.receiveDiagram(state, action, 'states');
    case DIAGRAM_LAYOUT:
        return actions.applyLayout(state, action);
    case ITEM_DRAG:
        return actions.stateMove(state, action);
    case ADD_TASK:
        return actions.addTask(state, action);
    case DELETE_TASK:
        return actions.deleteTask(state, action);
    case TASK_SELECTED:
        return actions.assignNewTask(state, action);
    case ITEM_DROP:
         return actions.itemDrop(state, action, 'state');
    case ADD_TRANSITION:
        return actions.addTransition(state, action, 'state');
    default:
        return state
  }
}

const transitions = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_DIAGRAM:
        return actions.receiveDiagram(state, action, 'transitions');
    case ADD_TASK:
        return actions.addTransition2NewTask(state, action);
    case DELETE_TASK:
        return actions.deleteTaskTransitions(state, action);
    case EVENT_SELECTED:
        return actions.assignNewEvent(state, action);
    case ITEM_GRAB:
        return actions.transitionLabelGrab(state, action);
    case ITEM_DRAG:
         return actions.transitionLabelDrag(state, action);
    case ITEM_DROP:
         return actions.itemDrop(state, action, 'transition');
    case ADD_TRANSITION:
        return actions.addTransition(state, action, 'transition');
    case DELETE_TRANSITION:
        return actions.deleteTransition(state, action);
    default:
        return state
  }
}

const tasks = (state = {}, action) => {
    switch (action.type) {
        case RECEIVE_DIAGRAM:
            return actions.receiveDiagram(state, action, 'tasks');
        default:
            return state
    }
}

const events = (state = {}, action) => {
    switch (action.type) {
        case RECEIVE_DIAGRAM:
            return actions.receiveDiagram(state, action, 'events');
        default:
            return state
    }
}

const rootReducer = combineReducers({
    diagram,
    states,
    transitions,
    tasks,
    events
})

export default rootReducer