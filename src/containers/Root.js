import React, {
    Component
} from 'react'
import {
    Provider
} from 'react-redux'
import configureStore from '../configureStore'
import AsyncApp from './AsyncApp'

const preload_state = {
    "diagram": {
        "id": 0,
        "name": "test diagram",
        "tasklist": {
            "active": false,
            "x": 0,
            "y": 0,
            "task": "0"
        },
        "eventlist": {
            "active": false,
            "x": 0,
            "y": 0,
            "event": "0"
        },
        "drag": ""
    },

    "states": [{
        "id": "0",
        "text": "",
        "task": "start",
        "x": 100,
        "y": 100
    }],

    "transitions": [],
    "tasks": [],
    "events": []
}

const store = configureStore(preload_state)

const dname = document.URL.substring(document.URL.lastIndexOf('/') + 1);

console.log(dname);

export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <AsyncApp dname={dname} />
            </Provider>
        )
    }
}