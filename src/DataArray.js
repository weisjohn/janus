
import { useSnapshot } from "valtio";

import { Alignment, Button, ButtonGroup, Colors, Divider, Navbar } from "@blueprintjs/core";
import "./DataArray.css";
import faker from "faker";
import * as Y from "yjs";

function DataArray({ dataitems, yarray, me }) {
  const snap = useSnapshot(dataitems);

  // TODO: this should probably be using useEffect or something, but i don't know hooks
  // undo manager - https://docs.yjs.dev/api/undo-manager
  if (!window.undoManager) {
    window.undoManager = new Y.UndoManager([yarray]);
    // undoManager.on("stack-item-added", (...any) => {
    //   console.log("stack-item-added", ...any);
    // });
  }

  const Undo = () => {
    return (
      <Button
        icon="undo"
        onClick={() => {
          // TODO: don't use window
          window.undoManager.undo();
        }}
        text={`Undo`}
      ></Button>
    );
  };

  const Redo = () => {
    return (
      <Button
        icon="redo"
        onClick={() => {
          // TODO: don't use window
          window.undoManager.redo();
        }}
        text={`Redo`}
      ></Button>
    );
  };

  const Init = () => {
    return (
      <Button
        outlined
        intent="primary"
        icon="reset"
        onClick={() => {
          // note how this is done
          // we can not do dataitems = [], as it will destroy our reference
          dataitems.splice(0, dataitems.length);
        }}
        text={`Init`}
      ></Button>
    );
  };

  const AddItem = () => {
    return (
      <Button
        outlined
        intent="success"
        icon="add-to-artifact"
        onClick={() => {
          dataitems.unshift({
            name: faker.commerce.productName(),
            // uuid: uuidv4(),
            created: new Date().toISOString(),
            author: me.name,
          });
        }}
        text={`Add Item`}
      ></Button>
    );
  };

  const Shift = () => {
    return (
      <Button
        outlined
        intent="warning"
        icon="key-shift"
        onClick={() => {
          dataitems.shift();
        }}
        text={`Shift`}
      ></Button>
    );
  };

  const Pop = () => {
    return (
      <Button
        outlined
        intent="warning"
        icon="remove"
        onClick={() => {
          dataitems.pop();
        }}
        text={`Pop`}
      ></Button>
    );
  };

  return (
    <div className="DataArray">
      <Navbar>
        <Navbar.Group align={Alignment.Left}>
          <Init />
          <Navbar.Divider />
          <ButtonGroup>
            <AddItem />
            <Shift />
            <Pop />
          </ButtonGroup>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <ButtonGroup>
            <Undo />
            <Redo />
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
      <pre className="DataArray-json">{JSON.stringify(snap, null, 4)}</pre>
    </div>
  );
}

export default DataArray;