
import ReactFlow, { Background, Controls, MiniMap } from "react-flow-renderer";

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
  { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
];


function Workspace({ awareness, ytext, me }) {
  return (
    <div className="Workspace">
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
  );
}

export default Workspace;