
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from "react-flow-renderer";
import { Alignment, Button, ButtonGroup, Tag, Navbar } from "@blueprintjs/core";
import { proxy, useSnapshot } from "valtio";
import Chance from "chance";
import { v4 as uuidv4 } from "uuid";

import "./Workspace.css";

// use a width of 30 for our grid system
const CUBIT = 30;
const randomX = () => ((Math.floor(Math.random() * 20)) * CUBIT) + CUBIT;
const randomY = () => ((Math.floor(Math.random() * 20)) * CUBIT) + CUBIT;
const randomXY = () => ({ x: randomX(), y: randomY() });

const chance = Chance();

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

// choose default 3 out of 5 times, input|output 1 out of 5 times
const NODE_TYPES = [ "input", "default", "output"]
const NODE_TYPES_WEIGHTS = [ 1, 3, 1 ];

const randomNodeName = () => (chance.pickone(NODE_NAMES))

const randomNode = (author) => {
  return {
    id: uuidv4(), // NOTE: the ids must be strings
    type: chance.weighted(NODE_TYPES, NODE_TYPES_WEIGHTS),
    data: {
      label: randomNodeName(),
      created: new Date().toISOString(),
      author,
    },
    position: randomXY(),
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
const AddNode = ({ workspace, me }) => {
  return (
    <Button outlined intent="success" icon="add"
      onClick={() => {
        workspace.push(randomNode(me.name))
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
        workspace.push(randomEdge(workspace, me));
      }}
      text={`Add Edge`}
    />
  );
};

const Reset = ({ workspace }) => {
  return (
    <Button outlined intent="danger" icon="trash" text="Reset"
      onClick={() => {
        workspace.splice(0, workspace.length);
      }}
    />
  )
}

// use this as a state things
const local = proxy({ element: null });

function Workspace({ workspace, yArrWorkspace, me }) {

  const snap = useSnapshot(workspace);

  // TODO: handle onElementClick
  // receive awareness 

  // handle connection made
  const onConnect = (params) => {
    workspace.push({ 
      id: uuidv4(),
      source: params.source,
      target: params.target,
      type: "smoothstep", 
      arrowHeadType: 'arrowclosed' 
    });
  };

  // remove elements
  const onElementsRemove = (elements) => {
    // note how we have to do this, we can't re-assign the workspace
    elements.forEach((elem) => {
      // find the index of each item to remove
      let idx = workspace.findIndex((item) => item.id === elem.id);
      // splice it out of the array
      workspace.splice(idx, 1);
    });
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
          <Reset workspace={workspace} />
          <Navbar.Divider />
          <ButtonGroup>
            <AddNode workspace={workspace} me={me} />
            <AddEdge workspace={workspace} me={me} />
          </ButtonGroup>
          <Navbar.Divider />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <ButtonGroup>
            <Button outlined disabled icon="zoom-in" />
            <Button outlined disabled icon="zoom-out" />
            <Button outlined disabled icon="zoom-to-fit" />
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
      <div className="Workspace-flow">
        <ReactFlowProvider>
          <ReactFlow
            elements={snap}
            snapToGrid
            snapGrid={[CUBIT, CUBIT]}
            onConnect={onConnect}
            onNodeDrag={onNodeDragger()}
            onNodeDragStop={onNodeDragger()}
            onElementsRemove={onElementsRemove}
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