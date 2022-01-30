
import {
  Navbar,
  Alignment,
  Icon,
  Button,
  ButtonGroup,
} from "@blueprintjs/core";
import { useSnapshot } from "valtio";

import Identity from './Identity';

function Header({ local }) {
  const snap = useSnapshot(local);

  const { user, roommates } = snap;

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <Icon icon="resolve" size="18" />
          {" JANUS"}
        </Navbar.Heading>
        <Navbar.Divider />
        {"looking both directions"}
        <Navbar.Divider />
        <ButtonGroup>
          <Button
            icon={snap.generate ? "pause" : "play"}
            onClick={() => {
              local.generate = !local.generate;
            }}
            text={snap.generate ? "Pause" : "Generate"}
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
