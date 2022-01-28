
import { Navbar, Alignment, Icon } from "@blueprintjs/core";

function Header() {
  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <Icon icon="resolve" size="18" />
          {" JANUS"}
        </Navbar.Heading>
        <Navbar.Divider />
        {'looking both directions'}
      </Navbar.Group>
    </Navbar>
  );
}

export default Header;
