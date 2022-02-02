
import {
  Navbar,
  Alignment,
  Tag,
  Button,
  ButtonGroup,
  Position,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { useSnapshot } from "valtio";

import Identity from './Identity';

function Header({ local, provider }) {
  const snap = useSnapshot(local);

  const { user, roommates, connected, synced } = snap;

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <Tooltip2
            content={"looking both directions"}
            position={Position.DOWN}
          >
            <Tag icon="resolve" large minimal>
              JANUS
            </Tag>
          </Tooltip2>
        </Navbar.Heading>
        <Navbar.Divider />
        <ButtonGroup>
          <Button
            icon={connected ? "cell-tower" : "disable"}
            intent={connected ? "success" : "danger"}
            loading={connected == null}
            outlined
            onClick={() => {
              if (connected) {
                provider.disconnect();
                local.connected = null;
              } else {
                provider.connect();
                local.connected = null;
              }
            }}
            text={connected ? "Connected" : "Disconnected"}
          />
        </ButtonGroup>
        {connected && (
          <div style={{ marginLeft: "0.6rem" }}>
            <Spinner
              intent="success"
              size={SpinnerSize.SMALL}
              value={ synced ? 1 : null }
            />
          </div>
        )}
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        {roommates.map((u) => (
          <Identity key={u.uuid} user={u} />
        ))}
        <Navbar.Divider />
        <Identity user={user} type="full" />
      </Navbar.Group>
    </Navbar>
  );
}

export default Header;
