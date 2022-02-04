
import React, { memo } from "react";
import { Handle, Position } from "react-flow-renderer";

// custom styles for presence indicators
import "./Nodes.css";

// TODO: extend this element to optionally include presence indicators by a wrapped parent?

// custom cursor selections

const Presence = ({ cursor }) => {
  return (
    <span className="node-presence-cell" style={{ 
      backgroundColor: cursor.color,
      borderColor: cursor.color
    }}>
      {cursor.initials}
    </span>
  )
}

const Cursors = ({ cursors }) => {
  if (!cursors) return null;

  const pres = cursors.map(c => <Presence key={c.uuid} cursor={c} />);
  return (
    <div className="node-presence">
      {pres}
    </div>
  )
}


// CUSTOM INPUT NODE

const CustomInputNode = ({
  data,
  isConnectable,
  sourcePosition = Position.Bottom,
}) => (
  <>
    <Cursors cursors={data.cursors} />
    {data.label}
    <Handle
      type="source"
      position={sourcePosition}
      isConnectable={isConnectable}
    />
  </>
);

CustomInputNode.displayName = "InputNode";


// CUSTOM DEFAULT NODE

const CustomDefaultNode = ({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}) => (
  <>
    <Handle
      type="target"
      position={targetPosition}
      isConnectable={isConnectable}
    />
    <Cursors cursors={data.cursors} />
    {data.label}
    <Handle
      type="source"
      position={sourcePosition}
      isConnectable={isConnectable}
    />
  </>
);

CustomDefaultNode.displayName = "DefaultNode";


// CUSTOM OUTPUT NODE

const CustomOutputNode = ({
  data,
  isConnectable,
  targetPosition = Position.Top,
}) => (
  <>
    <Handle
      type="target"
      position={targetPosition}
      isConnectable={isConnectable}
    />
    <Cursors cursors={data.cursors} />
    {data.label}
  </>
);

CustomOutputNode.displayName = "OutputNode";


export {
  CustomInputNode,
  CustomDefaultNode,
  CustomOutputNode
}

// TODO: should i consider a wrap of some form?

// const PresenceWrapper =
//   (Child) =>
//   ({ ...props }) => {
//     console.log(props.data.cursor);
//     debugger;
//     return (
//       <div
//         style={{
//           border:
//             props && props.data && props.data.cursor ? "1px solid red" : "",
//         }}
//       >
//         <Child {...props} />
//       </div>
//     );
//   };
// const PresenceInputNode = PresenceWrapper(InputNode);
// const PresenceDefaultNode = PresenceWrapper(DefaultNode);
// const PresenceOutputNode = PresenceWrapper(OutputNode);
