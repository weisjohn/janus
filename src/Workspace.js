
import ReactFlow, { Background, Controls, MiniMap } from "react-flow-renderer";
import { Alignment, Button, ButtonGroup, Tag, Navbar } from "@blueprintjs/core";

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


function Workspace({ awareness, ytext, me }) {
  return (
    <div className="Workspace">
      <Navbar>
        <Navbar.Group align={Alignment.Left}>
          <Button outlined disabled intent="danger" icon="reset" text="Reset" />
          <Navbar.Divider />
          <ButtonGroup>
            <Tag large minimal>
              Node
            </Tag>
            <Button outlined disabled intent="success" icon="insert" text="Add" />
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
        <ReactFlow elements={elements} snapToGrid snapGrid={[30, 30]}>
          <Background variant="dots" gap={30} size={1} />
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
      </div>
    </div>
  );
}

export default Workspace;