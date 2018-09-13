import React, {
    Component
} from 'react'

import PropTypes from 'prop-types';

import ReactTable from "react-table";
import "react-table/react-table.css";

import './PropBox.css';

const config = require('../config.json');


class PropBox extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selected: null
        }
        this.selProps = [[{name: 'input', value: 'empty'}],[{name: 'output', value: 'none'}]];
        this.selModel = null;
    }

    componentWillUnmount() {
    }

    componentDidMount() {
        const store = this.context.store;
        const model = store.getState()
        if(!model.diagram.props)
            model.diagram.props = {}
        this.selModel = model.diagram.props;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.selected !== prevProps.selected) {
            let id = this.props.selected ? this.props.selected : '';

            console.log('componentDidUpdate', id);

            const store = this.context.store;
            const model = store.getState();
            if (model.diagram.id === id) {
                if(!model.diagram.props)
                    model.diagram.props = [{},{}];

                this.selModel = model.diagram.props;
                this.selProps = [Object.getOwnPropertyNames(model.diagram.props).map(name=>{
                    return {"name": name, "value": model.diagram.props[name]}
                }), []];
            }
            else {
                var m = model.states.find(s=>s.id===id);
                if(m) {
                    if(!m.props) {
                        const task = model.tasks.find(t=>t.id===m.task);
                        m.props = task && task.props ? task.props.map(p=>p) : [{},{}];
                    }
                    this.selModel = m.props;
                    this.selProps = [
                        Object.getOwnPropertyNames(m.props[0]).map(name=>{
                            return {"name": name, "value": m.props[0][name]}
                        }),
                        Object.getOwnPropertyNames(m.props[1]).map(name=>{
                            return {"name": name, "value": m.props[1][name]}
                        })
                    ];
                }
                else {
                    m = model.transitions.find(s=>s.id===id);
                    if(m) {
                        if(!m.props) {
                            const event = model.events.find(e=>e.id===m.event);
                            m.props = event && event.props ? event.props.map(p=>p) : [{},{}];
                        }
                        this.selModel = m.props;
                        this.selProps = [
                            Object.getOwnPropertyNames(m.props[0]).map(name=>{
                                return {"name": name, "value": m.props[0][name]}
                            }),
                            Object.getOwnPropertyNames(m.props[1]).map(name=>{
                                return {"name": name, "value": m.props[1][name]}
                            })
                        ];
                    }
                }
            }
            this.setState({
                selected: this.props.selected
            });
            console.log(this.selProps);
        }
    }

    cellUpdated(cellInfo, value) {
        const data = this.selProps[0];
        if(data[cellInfo.index][cellInfo.column.id] !== value) {
            data[cellInfo.index][cellInfo.column.id] = value;
            let name = data[cellInfo.index].name;
            console.log('@@@', cellInfo.index, cellInfo, name, value);
            if(this.selModel)
                this.selModel[0][name] = value;
        }
    }

    renderEditable(cellInfo) {
        return (
          <div
            style={{ backgroundColor: "#ffffff" }}
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              this.cellUpdated(cellInfo, e.target.innerHTML);
            }}
            dangerouslySetInnerHTML={{
              __html: this.selProps[0][cellInfo.index][cellInfo.column.id]
            }}
          /> //
        )
    }

    createPropsHeader(text) {
        return <div className="props-toolbar">
            <span className="props-title">{text}</span>
            <span className="button-close" />
        </div>
    }

    render() {
        const data = this.selProps;
        return (
            <div id="props-list" className="props-list">
                <ReactTable
                    data={data[0]}
                    columns={[
                        {
                            Header: this.createPropsHeader('Input'),
                            columns:[
                                {
                                    Header: "Name",
                                    accessor: "name"
                                },
                                {
                                  Header: "Value",
                                  accessor: "value",
                                  Cell: this.renderEditable.bind(this)
                                }
                            ]
                        }
                    ]}
                    showPagination={false}
                    defaultPageSize={10}
                    sortable={false}
                    resizable={false}
                    className="-striped -highlight"
                    SubComponent={(row) => {
                        return (
                          <div>
                            You can put any component you want here, even another React Table! You even have access to the row-level data if you need!  Spark-charts, drill-throughs, infographics... the possibilities are endless!
                          </div>
                        )
                    }}
                    style={{height: "50%"}}
                />
                <ReactTable
                    data={data[1]}
                    columns={[
                        {
                            Header: this.createPropsHeader('Output'),
                            columns:[
                                {
                                    Header: "Name",
                                    accessor: "name"
                                },
                                {
                                  Header: "Value",
                                  accessor: "value"
                                }
                            ]
                        }
                    ]}
                    showPagination={false}
                    defaultPageSize={8}
                    sortable={false}
                    resizable={false}
                    className="-striped -highlight"
                    style={{height: "40%"}}
                />
            </div>
        )
    }
}

PropBox.propTypes = {
    selected: PropTypes.string
}

PropBox.contextTypes = {
    store: PropTypes.object.isRequired
};

export default PropBox;
