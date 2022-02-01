import React from "react";
import {
  Position,
  Toaster,
} from "@blueprintjs/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { proxy } from "valtio";
import { bindProxyAndYMap } from "valtio-yjs";

import "./App.css";
import Header from "./Header";
import Editor from "./Editor";
import DataObject from "./DataObject";
import User from "./util/user";

const ydoc = new Y.Doc();
const websocketProvider = new WebsocketProvider("wss://demos.yjs.dev", "janus-demo", ydoc);
const { awareness } = websocketProvider;

const user = User();
awareness.setLocalStateField("user", user);

// local state is instance, shared is all instances
const local = proxy({ generate: false, connected: null, user, roommates: [] });
const shared = proxy({ dataobject: {} });
const ymap = ydoc.getMap("system.v1");
const ytext = ydoc.getText("document.v1");
bindProxyAndYMap(shared, ymap);

// when an awareness event happens, update list of roommates
function refreshAwareness() {
  let allStates = awareness.getStates();
  let roommates = Array.from(allStates.entries())
    .map((s) => s[1].user)
    .filter((u) => u.uuid !== user.uuid);
  local.roommates = roommates;
  awareness.setLocalStateField("user", user);
}
awareness.on("change", refreshAwareness);

// when the websocket provider "syncs", it passes a connected state
websocketProvider.on('sync', connected => {
  local.connected = connected;
  // when we resync, don't wait to get awareness states just refresh them
  awareness.setLocalStateField("user", user);
  refreshAwareness();
});


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

const App = () => {
  return (
    <div className="App">
      <Header local={local} provider={websocketProvider} />
      <div className="App-body">
        <DataObject shared={shared} ymap={ymap} me={user} />
        <Editor awareness={awareness} ytext={ytext} me={user} />
      </div>
    </div>
  );
}

export default App;
