
import {
  Navbar,
  Alignment,
  Tag,
  Button,
  ButtonGroup,
  Position,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { useSnapshot } from "valtio";

import Identity from './Identity';

function Header({ local, provider }) {
  const snap = useSnapshot(local);

  const { user, roommates } = snap;

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <Tooltip2 content={"looking both directions"} position={Position.DOWN}>
            <Tag icon="resolve" large minimal>JANUS</Tag>
          </Tooltip2>
        </Navbar.Heading>
        <Navbar.Divider />
        <ButtonGroup>
          <Button
            icon={snap.connected ? "cell-tower" : "disable"}
            intent={snap.connected ? "success" : "danger"}
            loading={snap.connected == null}
            outlined
            onClick={() => {
              if (snap.connected) {
                provider.disconnect();
                local.connected = null;
              } else {
                provider.connect();
                local.connected = null;
              }
            }}
            text={snap.connected ? "Connected" : "Disconnected"}
          />
        </ButtonGroup>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        { roommates.map(u => <Identity key={u.uuid} user={u} />) }
        <Navbar.Divider />
        <Identity user={user} type="full" />
      </Navbar.Group>
    </Navbar>
  );
}

export default Header;
