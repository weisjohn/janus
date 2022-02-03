
import { useRef } from "react";
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from "react-flow-renderer";
import { Alignment, Button, ButtonGroup, Colors, Icon, Navbar } from "@blueprintjs/core";
import { proxy, useSnapshot } from "valtio";
import Chance from "chance";
import { v4 as uuidv4 } from "uuid";
import cloneDeep from "lodash.clonedeep";

import "./Workspace.css";

const chance = Chance();

// use a width of 30 for our grid system
const CUBIT = 30;
const typeYGrid = {
  input: {   min: 1,  max: 4 },
  default: { min: 6,  max: 14 },
  output: {  min: 16, max: 20 },
}
const randomX = () => chance.integer({ min: 1, max: 20 }) * CUBIT;
const randomY = (type) => chance.integer({ min: typeYGrid[type].min, max: typeYGrid[type].max }) * CUBIT;
const randomXY = (type) => ({ x: randomX(), y: randomY(type) });

// ifyky
const NODE_NAMES = [
  "Phase Detractor",
  "Retro Encabulator",
  "Panametric Fan",
  "Spurving Bearing",
  "Hydrocoptic Marzelvane",
  "Lunar Waneshaft",
  "Semiboloid Stator",
  "Tremie Pipe",
  "Differential Girdlespring",
  "Graham Meter",
  "Milford Trenions",
  "O-Deltoid Winding",
  "Reciprocation Arm",
];
const randomNodeName = () => (chance.pickone(NODE_NAMES))

const NODE_TYPES = [ "input", "default", "output"]
const NODE_TYPES_WEIGHTS = [ 1, 3, 1 ];

const randomNode = (author) => {
  // choose default 3 out of 5 times, input|output 1 out of 5 times
  const type = chance.weighted(NODE_TYPES, NODE_TYPES_WEIGHTS);

  return {
    id: uuidv4(), // NOTE: the ids must be strings
    type,
    data: {
      label: randomNodeName(),
      created: new Date().toISOString(),
      author,
    },
    position: randomXY(type),
  };
}

// a function with glorious purpose
const randomEdge = (workspace, author) => {
  const filterWorkspace = (type) => {
    return workspace.filter((e) => e.type === type).map((e) => e.id)
  }
  // generate the set of all possible edges,
  // taking into consideration react-flow's default types
  const inputs = filterWorkspace("input");
  const defaults = filterWorkspace("default");
  const outputs = filterWorkspace("output");
  
  // get all edges
  const edges = workspace.filter((e) => !!e.source && !!e.target);
  
  //  - sources can be either inputs or default
  const sources = inputs.concat(defaults);
  //  - targets can either be defaults or outputs
  const targets = defaults.concat(outputs);

  // generate all possible edges
  const permutations = sources.map(source => {
    return targets.map(target => ({ source, target }) );
  })
    // flatten out the array
    .flat()
    // an edge can not have the same source and destination
    .filter(perm => perm.source !== perm.target)
    // we don't want an edge if it already exists
    .filter(perm => !edges.find((e) => e.source === perm.source && e.target === perm.target))

  // if there's no available edges, bail
  if (!permutations.length) return;

  // the lucky edge to insert
  const edge = chance.pickone(permutations);

  return {
    ...edge,
    id: uuidv4(), // NOTE: the ids must be strings
    type: 'smoothstep', 
    arrowHeadType: 'arrowclosed'
  };

}

// add a random node to the design
const AddNode = ({ workspace, me, flowRef }) => {
  return (
    <Button outlined intent="success" icon="add"
      onClick={() => {
        workspace.push(randomNode(me.name));
        setTimeout(flowRef.current.fitView, 10)
      }}
      text={`Add Node`}
    />
  );
};

// add a random edge to the design
const AddEdge = ({ workspace, me }) => {
  return (
    <Button outlined intent="primary" icon="new-link"
      onClick={() => {
        // is this the most fun part of the algorithm
        const edge = randomEdge(workspace, me);
        if (edge) workspace.push(edge);
      }}
      text={`Add Edge`}
    />
  );
};

const Reset = ({ workspace, flowRef }) => {
  return (
    <Button outlined intent="danger" icon="trash" text="Reset"
      onClick={() => {
        workspace.splice(0, workspace.length);
        setTimeout(() => {
          flowRef.current.setTransform({ x: 0, y: 0, zoom: 1.0 });
        }, 10);
      }}
    />
  )
}

const Genie = ({ workspace, me, flowRef }) => {
  return (
    <Button
      outlined
      style={{
        borderColor: Colors.VIOLET1,
        color: Colors.VIOLET1,
        paddingLeft: "1rem"
      }}
      onClick={() => {
        // add n random nodes
        const nodes = chance.integer({ min: 3, max: 6 });
        for (var i = 0; i < nodes; i++) {
          workspace.push(randomNode(me.name))
        }
        // add m random edges
        const edges = chance.integer({ min: 3, max: 8 });
        for (var i = 0; i < nodes; i++) {
          const edge = randomEdge(workspace, me);
          if (edge) workspace.push(edge);
        }
        // zoom in
        setTimeout(flowRef.current.fitView, 10);
      }}
    >
      <Icon color={ Colors.VIOLET1 } icon="clean" style={{ marginRight: "5px" }} />
      {"Genie"}
    </Button>
  );
}


// use this as a state things
const local = proxy({ element: null });

function Workspace({ workspace, yArrWorkspace, me }) {

  const snap = useSnapshot(workspace);

  // https://reactflow.dev/docs/api/react-flow-instance/
  const flowRef = useRef(null);
  const onLoad = (reactFlowInstance) => {
    flowRef.current = reactFlowInstance;
  }



  // when double clicking an element, change its name
  const onNodeDoubleClick = (e, elem) => {
    // create a new copy of the element, as react-flow needs it
    const changed = cloneDeep(elem);

    // change the label just to show it being updated
    changed.data.label = randomNodeName();

    // find the index of the item to splice into
    let idx = workspace.findIndex((item) => item.id === elem.id);

    // replace that thing in the graph
    workspace.splice(idx, 1, changed);
  }

  // handle connection made
  const createConnection = (params) => {
    workspace.push({ 
      id: uuidv4(),
      source: params.source,
      target: params.target,
      type: "smoothstep", 
      arrowHeadType: 'arrowclosed' 
    });
  };

  // remove element
  const removeElement = (elem) => {
    // note how we have to do this, we can't re-assign the workspace
    // find the index of each item to remove
    let idx = workspace.findIndex((item) => item.id === elem.id);
    // splice it out of the array
    workspace.splice(idx, 1);
  };

  // handles removing multiple items from tool
  const onElementsRemove = (elements) => {
    elements.forEach(removeElement);
  }

  // function generator to allow nodes to be moved
  const onNodeDragger = () => {
    return (event, node) => {
      workspace.forEach(i => {
        if (i.id === node.id) {
          i.position = node.position;
        }
      })
    }
  }

  // simple composition of two helpers
  const onEdgeUpdate = (oldEdge, newConnection) => {
    removeElement(oldEdge);
    createConnection(newConnection);
  }

  // TODO: determine if we can live valtio or if we need to bother w/ hooks
  // const [elements, setElements] = useState(snap);
  // useEffect(() => {
  //   const copy = snap.map((e) => deepClone(e));
  //   setElements(copy);
  //   // debugger;
  // }, [snap, setElements]);

  return (
    <div className="Workspace">
      <Navbar className="Workspace-navbar">
        <Navbar.Group align={Alignment.Left}>
          <Reset workspace={workspace} flowRef={flowRef} />
          <Navbar.Divider />
          <ButtonGroup>
            <AddNode workspace={workspace} me={me} flowRef={flowRef} />
            <AddEdge workspace={workspace} me={me} />
          </ButtonGroup>
          <Navbar.Divider />
          <Genie workspace={workspace} me={me} flowRef={flowRef} />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <ButtonGroup>
            <Button outlined onClick={() => {
              flowRef.current.zoomIn();
            }} icon="zoom-in" />
            <Button outlined onClick={() => {
              flowRef.current.zoomOut();
            }} icon="zoom-out" />
            <Button outlined onClick={() => {
              flowRef.current.fitView();
            }} icon="zoom-to-fit" />
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
      <div className="Workspace-flow">
        <ReactFlowProvider>
          <ReactFlow
            elements={snap}
            snapToGrid
            snapGrid={[CUBIT, CUBIT]}
            onConnect={createConnection}
            onNodeDrag={onNodeDragger()}
            onNodeDragStop={onNodeDragger()}
            onNodeDoubleClick={onNodeDoubleClick}
            onElementsRemove={onElementsRemove}
            onEdgeUpdate={onEdgeUpdate}
            onLoad={onLoad}
          >
            <Background variant="dots" gap={CUBIT} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.style?.background) return n.style.background;
                if (n.type === "input") return "#0041d0";
                if (n.type === "output") return "#ff0072";
                if (n.type === "default") return "#1a192b";

                return "#eee";
              }}
              nodeColor={(n) => {
                if (n.style?.background) return n.style.background;

                return "#fff";
              }}
              nodeBorderRadius={2}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default Workspace;