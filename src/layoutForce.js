import * as d3 from "d3-force"

export const layoutForce = (state, action) => {
    const width = action.model.width || 1000;
    const height =  action.model.height || 800;
    let nodes = state.map((s, i)=>Object.assign({index:i}, s));

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(80))

    simulation.nodes(nodes);

    let links = action.model.transitions.map(l=>{
        let s = nodes.find(n=>n.id===l.source);
        let t = nodes.find(n=>n.id===l.target);
        return {
            source: (s ? s.index : t.index || 0),
            target: (t ? t.index : s.index || 0)
        }
    })

    simulation.force("link").links(links);//.distance(200);

    return (dispatch) => {
        simulation.on("end", (a, b, c) => {
            console.log("end", nodes);
            dispatch({type:"UNSELECT_ALL"})
        });
        console.log("999:", nodes);
    }
}