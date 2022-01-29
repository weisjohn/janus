import React from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Colors,
  Elevation,
  Position,
  Toaster,
} from "@blueprintjs/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { proxy, useSnapshot } from "valtio";
import { bindProxyAndYMap } from "valtio-yjs";

import "./App.css";
import Header from "./Header";

const ydoc = new Y.Doc();
const websocketProvider = new WebsocketProvider("wss://demos.yjs.dev", "janus-demo", ydoc);

// local state is instance, shared is all instances
const local = proxy({ generate: true });
const shared = proxy({ count: 0 });
const ymap = ydoc.getMap("system.v1");
bindProxyAndYMap(shared, ymap);


/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster = Toaster.create({
  className: "recipe-toaster",
  position: Position.TOP,
});

// interval, randomly skip counting
setInterval(() => {
  if (!!(Math.random() > 0.5)) {
    if (!local.generate) return;
    console.log(`write ${Date.now()}`);
    AppToaster.show({ message: "count", timeout: 250 });
    shared.count++;
  }
}, 1e3);

// show state
const Counter = () => {
  const snap = useSnapshot(shared);
  const { count } = snap;
  let background = count % 3 === 0 ? Colors.GREEN1 : 
      count % 2 === 0 ? Colors.BLUE1 : Colors.RED1;

  return (
    <Card style={{ background }} className={`App-state`} elevation={Elevation.TWO}>
      <pre>{count}</pre>
    </Card>
  );
}

const Clicker = () => {
  return (
    <Button
      intent="primary"
      icon="plus"
      onClick={() => ++shared.count}
      text={`Count`}
    ></Button>
  );
}

const Reset = () => {
  return (
    <Button
      intent="danger"
      icon="reset"
      onClick={() => shared.count = 0 }
      text={`Reset`}
    ></Button>
  );
};

const App = () => {
  return (
    <div className="App">
      <Header local={local} />
      <div className="App-body">
        <Counter />
        <ButtonGroup>
          <Clicker />
          <Reset />
        </ButtonGroup>
      </div>
    </div>
  );
}

export default App;
