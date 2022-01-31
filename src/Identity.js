
import { Tag, Position, Icon } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";

import "./Identity.css";

function Identity({ user, type }) {

  const { name, color, initials } = user;

  if (type === "full") {
    return (
      <Tag className="identity" round large style={{ background: color }}>
        <Icon style={{ marginRight: "10px" }} icon="person" />
        {name}
      </Tag>
    );
  }

  return (
    <Tooltip2 content={name} position={Position.DOWN}>
      <Tag className="identity initials" round large style={{ background: color }}>
        {initials}
      </Tag>
    </Tooltip2>
  );
}

export default Identity;
