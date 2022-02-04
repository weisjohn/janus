
import { useRef } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  ReactFlowProvider,
  useZoomPanHelper,
  isNode,
  useStoreState,
} from "react-flow-renderer";
import { Alignment, Button, ButtonGroup, Colors, Divider, Icon, Navbar, Tag } from "@blueprintjs/core";
import { proxy, useSnapshot } from "valtio";
import Chance from "chance";
import { v4 as uuidv4 } from "uuid";
import cloneDeep from "lodash.clonedeep";
import { animate } from "popmotion";
import dagre from "dagre";

import "./Workspace.css";

// our custom nodes
import { CustomInputNode, CustomDefaultNode, CustomOutputNode } from "./Nodes";

// how long pans / zooms should be
const FLOW_VIEW_ANIMATION = 250;

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
const AddNode = ({ workspace, me }) => {
  // debugger;
  const { fitView } = useZoomPanHelper();
  return (
    <Button outlined intent="success" icon="duplicate"
      onClick={() => {
        workspace.push(randomNode(me.name));
        setTimeout(() => {
          fitView({ duration: FLOW_VIEW_ANIMATION });
        }, 10)
      }}
      text={`Node`}
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
      text={`Edge`}
    />
  );
};

// TODO: remove flowRef when https://github.com/wbkd/react-flow/pull/1884 is merged
const Reset = ({ workspace, flowRef }) => {
  // TODO: use transform useZoomPanHelper when https://github.com/wbkd/react-flow/pull/1884
  // const { transform } = useZoomPanHelper();
  return (
    <Button outlined intent="danger" icon="trash" text="Reset"
      onClick={() => {
        workspace.splice(0, workspace.length);
        setTimeout(() => {
          // TODO: according to https://github.com/wbkd/react-flow/releases/tag/9.7.0, this should work
          // TODO: use transform useZoomPanHelper when https://github.com/wbkd/react-flow/pull/1884
          // transform({ x: 0, y: 0, zoom: 1.0 }, FLOW_VIEW_ANIMATION);

          // get current view window to tween from
          const { position: [x, y], zoom } = flowRef.current.toObject();

          // https://popmotion.io/
          animate({
            from: { x: x, y: y, zoom },
            to: { x: 0, y: 0, zoom: 1.0 },
            onUpdate: ({ x, y, zoom }) => flowRef.current.setTransform({ x, y, zoom }),
            duration: FLOW_VIEW_ANIMATION
          });
        }, 20);
      }}
    />
  )
}

const Genie = ({ workspace, me }) => {
  const { fitView } = useZoomPanHelper();
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
        const edges = chance.integer({ min: 1, max: nodes });
        for (var j = 0; j < edges; j++) {
          const edge = randomEdge(workspace, me);
          if (edge) workspace.push(edge);
        }
        // zoom to fit
        setTimeout(() => {
          fitView({ duration: FLOW_VIEW_ANIMATION });
        }, 10);
      }}
    >
      <Icon color={ Colors.VIOLET1 } icon="clean" style={{ marginRight: "5px" }} />
      {"Genie"}
    </Button>
  );
}

// shamelessly stolen from https://reactflow.dev/examples/layouting/
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// In order to keep this example simple the node width and height are hardcoded.
// In a real world app you would use the correct width and height values of
// const nodes = useStoreState(state => state.nodes) and then node.__rf.width, node.__rf.height

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (elements, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = isHorizontal ? "left" : "top";
      el.sourcePosition = isHorizontal ? "right" : "bottom";

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }

    return el;
  });
};


const HierarchyLayoutButton = ({ workspace, me, graph, rotate }) => {
  const { fitView } = useZoomPanHelper();
  return (
    <Button
      outlined
      style={{
        borderColor: Colors.VERMILION1,
        color: Colors.VERMILION1,
        paddingLeft: "1rem",
      }}
      onClick={() => {
        // if I can do this, then does all the slice algorithm stuff get better?
        workspace = getLayoutedElements(workspace, graph);
        setTimeout(() => {
          fitView({ duration: FLOW_VIEW_ANIMATION });
        }, 10);
      }}
    >
      <Icon
        color={Colors.VERMILION1}
        icon="layout-hierarchy"
        style={{
          transform: `rotate(${rotate}deg)`,
          marginRight: "0px", // this is weird but necessary
        }}
      />
    </Button>
  );
}

const ZoomIn = () => {
  const { zoomIn } = useZoomPanHelper();
  return (
    <Button
      outlined
      icon="zoom-in"
      onClick={() => {
        zoomIn(FLOW_VIEW_ANIMATION)
      }}
    />
  );
}

const ZoomOut = () => {
  const { zoomOut } = useZoomPanHelper();
  return (
    <Button
      outlined
      icon="zoom-out"
      onClick={() => {
        zoomOut(FLOW_VIEW_ANIMATION)
      }}
    />
  );
}

const ZoomToFit = () => {
  const { fitView } = useZoomPanHelper();
  return (
    <Button
      outlined
      icon="zoom-to-fit"
      onClick={() => {
        fitView({ duration: FLOW_VIEW_ANIMATION });
      }}
    />
  );
}

const Number = ({ width, value }) => {
  return (
    <span 
      class="Workspace-Number"
      style={{
        width: `${width * 16}px`
      }}
    >
      {value}
    </span>
  )
}

const Positioning = () => {
  // meta for footer
  const transform = useStoreState((store) => store.transform);
  const x = transform[0].toFixed(1);
  const y = transform[1].toFixed(1);
  const zoom = transform[2].toFixed(2);

  return (
    <>
      <Tag large minimal icon="widget">
        {`X: `}
        <Number width="4" value={x} />
      </Tag>
      <Navbar.Divider />
      <Tag large minimal icon="widget">
        {`Y: `}
        <Number width="4" value={y} />
      </Tag>
      <Navbar.Divider />
      <Tag large minimal icon="eye-open">
        {`Zoom: `}
        <Number width="3" value={zoom} />
      </Tag>
    </>
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
    setTimeout(() => {
      flowRef.current.fitView({ duration: FLOW_VIEW_ANIMATION });
    }, 0)
  };

  const modifyWorkspaceElement = (elem, fn) => {
    // create a new copy of the element, as react-flow needs it
    const changed = cloneDeep(elem);

    // do the function
    fn(changed);

    // find the index of the item to splice into
    let idx = workspace.findIndex((item) => item.id === elem.id);

    // replace that thing in the graph
    workspace.splice(idx, 1, changed);
  }

  // blur a single element
  const blurElement = (elem) => {
    modifyWorkspaceElement(elem, (changed) => {
      // find the index of the item to splice into
      let idx = changed.data.cursors.findIndex((c) => c.uuid === me.uuid);
      // remove this item from the array
      changed.data.cursors.splice(idx, 1);
    });
  }

  // find the index of the item to remove focus
  const blurElements = (except) => {
    console.log("blurElements")
    // all those elements focused by me
    const focused = workspace.filter(item => item.id !== except).filter((item) => {
      return item.data && item.data.cursors && item.data.cursors.find(c => c.uuid === me.uuid)
    });
    focused.forEach(blurElement);
  }

  const focusNode = (elem) => {
    // TODO: could maybe use isNode() - https://reactflow.dev/docs/api/helper-functions/
    // don't focus on non nodes
    if (!elem.data) return;

    // if i already have a cursor on this item, bail
    if (elem.data.cursors && elem.data.cursors.find((c) => c.uuid === me.uuid)) {
      console.log('focus bail')
      return true;
    }

    // mark that element as being focused by me
    modifyWorkspaceElement(elem, (changed) => {
      // if that object doesn't have cursors
      if (!changed.data.cursors) changed.data.cursors = [];
      // add me to list of cursors
      changed.data.cursors.push(me);
    });
  }

  // mark awareness on an item
  const onElementClick = (e, elem) => {
    // if someone wasn't holding down the multiselect key, don't allow it
    if (!e.metaKey) blurElements(elem.id);

    focusNode(elem);
    // console.log('onElementClick')
  };

  const onNodeDragStart = (e, node) => {
    focusNode(node);
    // console.log("onNodeDragStart");
  }
  
  const onNodeDragStop = (e, node) => {
    blurElement(node);
    // console.log("onNodeDragStop");
  }

  // wire up onPanelClick
  const onPaneClick = (e, elem) => {
    blurElements();
  };

  // when double clicking an element, change its name
  const onNodeDoubleClick = (e, elem) => {
    modifyWorkspaceElement(elem, (changed) => {
      changed.data.label = randomNodeName();
    });
  };

  // place cursors on multiple items
  const onSelectionChange = (elements) => {
    if (!elements) return blurElements();
    elements.forEach(focusNode);
    // debugger;
  };

  // handle connection made
  const createConnection = (params) => {
    workspace.push({
      id: uuidv4(),
      source: params.source,
      target: params.target,
      type: "smoothstep",
      arrowHeadType: "arrowclosed",
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
  };

  // function generator to allow nodes to be moved
  const onNodeDragger = () => {
    return (event, node) => {
      workspace.forEach((i) => {
        if (i.id === node.id) {
          i.position = node.position;
        }
      });
    };
  };

  // simple composition of two helpers
  const onEdgeUpdate = (oldEdge, newConnection) => {
    removeElement(oldEdge);
    createConnection(newConnection);
  };

  return (
    <div className="Workspace">
      <ReactFlowProvider>
        <Navbar className="Workspace-navbar">
          <Navbar.Group align={Alignment.LEFT}>
            <Reset workspace={workspace} flowRef={flowRef} />
            <Navbar.Divider />
            <ButtonGroup>
              <AddNode workspace={workspace} me={me} />
              <AddEdge workspace={workspace} me={me} />
            </ButtonGroup>
            <Navbar.Divider />
            <Genie workspace={workspace} me={me} />
            <Navbar.Divider />
            <ButtonGroup>
              <HierarchyLayoutButton workspace={workspace} me={me} graph="TB" rotate={0} />
              <HierarchyLayoutButton workspace={workspace} me={me} graph="LR" rotate={270} />
              <HierarchyLayoutButton workspace={workspace} me={me} graph="BT" rotate={180} />
              <HierarchyLayoutButton workspace={workspace} me={me} graph="RL" rotate={90} />
            </ButtonGroup>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <ButtonGroup>
              <ZoomIn />
              <ZoomOut />
              <ZoomToFit />
            </ButtonGroup>
          </Navbar.Group>
        </Navbar>
        <div className="Workspace-flow">
          <ReactFlow
            nodeTypes={{
              input: CustomInputNode,
              default: CustomDefaultNode,
              output: CustomOutputNode,
            }}
            elements={snap}
            snapToGrid
            snapGrid={[CUBIT, CUBIT]}
            onConnect={createConnection}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDragger()}
            onNodeDragStop={onNodeDragStop}
            onElementClick={onElementClick}
            onNodeDoubleClick={onNodeDoubleClick}
            // TODO: this introduces a really weird bug
            // onSelectionChange={onSelectionChange}
            onPaneClick={onPaneClick}
            onElementsRemove={onElementsRemove}
            onEdgeUpdate={onEdgeUpdate}
            onLoad={onLoad}
          >
            <Background variant="dots" gap={CUBIT} size={1} />
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
        </div>
        <Navbar className="Workspace-navbar">
          <Navbar.Group align={Alignment.LEFT}>
            <Tag large minimal icon="data-lineage">
              {`Nodes: `}
              <Number width={2} value={snap.filter((e) => e.data).length} />
            </Tag>
            <Navbar.Divider />
            <Tag large minimal icon="one-to-one">
              {`Edges: `}
              <Number width={2} value={snap.filter((e) => !e.data).length} />
            </Tag>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <Positioning />
          </Navbar.Group>
        </Navbar>
      </ReactFlowProvider>
    </div>
  );
}

export default Workspace;