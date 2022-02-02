import React from "react";
import {
  Position,
  Toaster,
  Tabs,
  Tab
} from "@blueprintjs/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { proxy } from "valtio";
import { bindProxyAndYArray, bindProxyAndYMap } from "valtio-yjs";
import { throttle } from 'throttle-debounce';

import "./App.css";
import Header from "./Header";
import Editor from "./Editor";
import DataArray from "./DataArray";
import User from "./util/user";

const ydoc = new Y.Doc();
const websocketProvider = new WebsocketProvider("wss://demos.yjs.dev", "janus-demo-2", ydoc);
const { awareness } = websocketProvider;

const user = User();
awareness.setLocalStateField("user", user);

// local state is instance, shared is all instances
const local = proxy({ generate: false, connected: null, user, roommates: [], synced: false });
const shared = proxy({ dataobject: {} });
const ymap = ydoc.getMap("system.v1");
const ytext = ydoc.getText("document.v1");
bindProxyAndYMap(shared, ymap);

// visualize comms on the network via a throttle, this is complicated
const comms = throttle(1000, true, (origin) => {
  if (!origin) return;
  local.synced = false;
  setTimeout(() => {
    local.synced = true;
  }, 500);
});
ydoc.on('update', (update, origin, doc) => {
  // origin can be null, websockets, or monaco
  if (!origin || (origin && origin._WS)) {
    comms(origin);
  }
})

// shared state for dataobjects
const dataitems = proxy([]);
const yarray = ydoc.getArray("dataitems.v3");
bindProxyAndYArray(dataitems, yarray);

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
  local.synced = true;
  // when we resync, don't wait to get awareness states just refresh them
  awareness.setLocalStateField("user", user);
  refreshAwareness();
  console.log('sync?')
});

websocketProvider.on('status', (...any) => {
  console.log("status", ...any);
})

websocketProvider.on('synced', (...any) => {
  console.log("synced", ...any);
})


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
      <Tabs className="App-body">
        <Tab
          id="dataarray"
          title="DataArray"
          panel={<DataArray dataitems={dataitems} yarray={yarray} me={user} />}
        />
        <Tab
          id="editor"
          title="Editor"
          panel={<Editor awareness={awareness} ytext={ytext} me={user} />}
        />
      </Tabs>
    </div>
  );
}

export default App;
