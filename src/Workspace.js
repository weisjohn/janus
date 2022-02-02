
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from "react-flow-renderer";
import { Alignment, Button, ButtonGroup, Tag, Navbar } from "@blueprintjs/core";
import { useSnapshot } from "valtio";
import Chance from "chance";

import "./Workspace.css";

// TODO: interestingly, this is just an array of elements, so we should be good...
const elements = [
  {
    id: "1",
    type: "input",
    data: { label: "Node 1" },
    position: { x: 60, y: 60 },
  },
  // you can also pass a React Node as a label
  { id: "2", data: { label: <div>Node 2</div> }, position: { x: 360, y: 360 } },
  { id: "e1-2", source: "1", target: "2", type: "smoothstep", arrowHeadType: 'arrowclosed' },
];

// use a width of 30 for our grid system
const CUBIT = 30;
const randomX = () => ((Math.floor(Math.random() * 20)) * CUBIT) + CUBIT;
const randomY = () => ((Math.floor(Math.random() * 10)) * CUBIT) + CUBIT;
const randomXY = () => ({ x: randomX(), y: randomY() });

const chance = Chance();
const NODE_NAMES = [
  "Retro Encabulator",
  "Panametric Fan",
  "Spurving Bearing",
  "Hydrocoptic Marzelvane",
  "Ambifacient Waneshaft",
  "Differential Girdlespring",
  "Graham Meter",
  "Milford Trenions",
];
const NODE_TYPES = [
  "input",
  "default",
  "output",
]

const randomNodeName = () => (chance.pickone(NODE_NAMES))

const randomNode = (id, author) => {
  return {
    id,
    type: chance.pickone(NODE_TYPES),
    data: {
      label: randomNodeName(),
      created: new Date().toISOString(),
      author,
    },
    position: randomXY(),
  };
}

const AddNode = ({ workspace, me }) => {
  return (
    <Button outlined intent="success" icon="add"
      onClick={() => {
        workspace.push(randomNode(workspace.length, me.name))
      }}
      text={`Add`}
    />
  );
};

const Reset = ({ workspace }) => {
  return (
    <Button outlined intent="danger" icon="reset" text="Reset"
      onClick={() => {
        workspace.splice(0, workspace.length);
      }}
    />
  )
}


function Workspace({ workspace, yArrWorkspace, me }) {

  const snap = useSnapshot(workspace);

  return (
    <div className="Workspace">
      <Navbar>
        <Navbar.Group align={Alignment.Left}>
          <Reset workspace={workspace} />
          <Navbar.Divider />
          <ButtonGroup>
            <Tag large minimal>
              Node
            </Tag>
            <AddNode workspace={workspace} me={me} />
            <Button outlined disabled intent="warning" icon="add" text="Remove" />
          </ButtonGroup>
          <Navbar.Divider />
          <ButtonGroup>
            <Tag large minimal>
              Edge
            </Tag>
            <Button outlined disabled intent="success" icon="new-link" text="Add" />
            <Button outlined disabled intent="warning" icon="add" text="Remove" />
          </ButtonGroup>
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
          <ReactFlow elements={JSON.parse(JSON.stringify(snap))} snapToGrid snapGrid={[CUBIT, CUBIT]}>
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