import faker from "faker";
import { Colors } from "@blueprintjs/core";

// get user identity from sessionStorage
function User() {
  const session = window.sessionStorage;
  let user = "";
  if (session.getItem("user")) {
    try {
      user = JSON.parse(session.getItem("user"))
    } catch {
      user = null;
    }
  }

  if (!user || !user.name) {
    let name = faker.name.firstName() + " " + faker.name.lastName();

    // filter out black/white/gray from BlueprintJS colors
    const userColors = Object.keys(Colors).filter(
      (c) => !/gray|black|white|4|5/gi.test(c)
    );

    // turn username into a sum of all character's ASCII values
    const nameASCIIValue = name
      .split("")
      .reduce((p, c) => p + c.charCodeAt(0), 0);

    // hash users's name into a hash-space of colors (note the use of modulo)
    const colorHash = nameASCIIValue % userColors.length;

    // get hex value from Blueprint colors
    const color = Colors[userColors[colorHash]];

    user = { name, color, uuid: crypto.randomUUID() };
    session.setItem("user", JSON.stringify(user));
  }
  return user;
}

export default User;
