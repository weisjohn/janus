
import { useSnapshot } from "valtio";

import { Alignment, Button, ButtonGroup, Card, Colors, Divider, Elevation, Navbar } from "@blueprintjs/core";
import "./DataObject.css";
import faker from "faker";
import * as Y from "yjs";

function DataObject({ shared, ymap, me }) {
  const snap = useSnapshot(shared);
  const { dataobject } = shared;

  // do i need to init if it's never happened?
  function initDataObject(dataobject) {
    return {
      count: (dataobject && dataobject.count) || 0,
      items: (dataobject && dataobject.items) || [],
    };
  }

  // TODO: make this work
  // undo manager - https://docs.yjs.dev/api/undo-manager
  const undoManager = new Y.UndoManager(ymap);

  const Undo = () => {
    return (
      <Button
        icon="undo"
        disabled
        onClick={() => {
          // TODO: make this work
          undoManager.undo();
        }}
        text={`Undo`}
      ></Button>
    );
  };

  const Redo = () => {
    return (
      <Button
        icon="redo"
        disabled
        onClick={() => {
          // TODO: make this work
          undoManager.redo();
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
          shared.dataobject = initDataObject();
          // TODO: when we init, reset the undo stack
          // undoManager.clear();
        }}
        text={`Init`}
      ></Button>
    );
  };

  const AddCounter = () => (
    <Button
      outlined
      intent="success"
      icon="plus"
      onClick={() => ++dataobject.count}
      text={`Add`}
    ></Button>
  );

  const SubtractCounter = () => (
    <Button
      outlined
      intent="warning"
      icon="minus"
      onClick={() => --dataobject.count}
      text={`Subtract`}
    ></Button>
  );

  const AddItem = () => {
    return (
      <Button
        outlined
        intent="success"
        icon="add-to-artifact"
        onClick={() => {
          dataobject.items.push({
            name: faker.commerce.productName(),
            // uuid: crypto.randomUUID(),
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
          dataobject.items.shift();
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
          dataobject.items.pop();
        }}
        text={`Pop`}
      ></Button>
    );
  };

  return (
    <Card className="DataObject" elevation={Elevation.TWO}>
      <Navbar>
        <Navbar.Group align={Alignment.Left}>
          <Init />
          <Navbar.Divider />
          <ButtonGroup>
            <AddCounter />
            <SubtractCounter />
          </ButtonGroup>
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
      <pre className="DataObject-json">
        {JSON.stringify(snap.dataobject, null, 4)}
      </pre>
    </Card>
  );
}

export default DataObject;