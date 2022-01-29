
import {
  Navbar,
  Alignment,
  Icon,
  Button,
  ButtonGroup,
} from "@blueprintjs/core";
import { useSnapshot } from "valtio";

function Header({ local }) {
  const snap = useSnapshot(local);

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <Icon icon="resolve" size="18" />
          {" JANUS"}
        </Navbar.Heading>
        <Navbar.Divider />
        {"looking both directions"}
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
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
    </Navbar>
  );
}

export default Header;
