import { useSnapshot } from "valtio";

import { Tag, Tooltip, Position } from "@blueprintjs/core";

import "./Identity.css";

function Identity({ local, type }) {
  const snap = useSnapshot(local);

  const { user: { name, color }} = snap;

  if (type === "full") {
    return (
      <Tag className="identity" round large style={{ background: color }}>
        {name}
      </Tag>
    );
  }

  let initials = name.split(" ").map(s => s[0]).join("").slice(0, 2);
  return (
    <Tooltip content={name} position={Position.DOWN}>
      <Tag className="identity initials" round large style={{ background: color }}>
        {initials}
      </Tag>
    </Tooltip>
  );
}

export default Identity;
