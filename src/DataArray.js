

import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import * as Y from "yjs";
import { Alignment, Button, ButtonGroup, Navbar } from "@blueprintjs/core";
import faker from "faker";

import "./DataArray.css";

function DataArray({ dataitems, yarray, me }) {
  const snap = useSnapshot(dataitems);

  const undoRef = useRef();

  // undo manager - https://docs.yjs.dev/api/undo-manager
  useEffect(() => {
    console.log('useEffect new UndoManager');
    undoRef.current = new Y.UndoManager([yarray]);
  }, [yarray])

  const Undo = () => {
    return (
      <Button
        icon="undo"
        disabled={!undoRef.current || (undoRef.current && !undoRef.current.undoStack.length)}
        onClick={() => {
          undoRef.current.undo();
        }}
        text={`Undo`}
      ></Button>
    );
  };

  const Redo = () => {
    return (
      <Button
        icon="redo"
        disabled={!undoRef.current || (undoRef.current && !undoRef.current.redoStack.length)}
        onClick={() => {
          undoRef.current.redo();
        }}
        text={`Redo`}
      ></Button>
    );
  };

  const Reset = () => {
    return (
      <Button
        outlined
        intent="danger"
        icon="trash"
        onClick={() => {
          // note how this is done
          undoRef.current.clear();

          // we can not do dataitems = [], as it will destroy our reference
          dataitems.splice(0, dataitems.length);

          // clear undo stack as well
          setTimeout(() => { undoRef.current.clear(); }, 0);
        }}
        text={`Reset`}
      ></Button>
    );
  };

  const Push = () => {
    return (
      <Button
        outlined
        intent="success"
        icon="add"
        onClick={() => {
          dataitems.push({
            name: faker.commerce.productName(),
            // uuid: uuidv4(),
            created: new Date().toISOString(),
            author: me.name,
          });
        }}
        text={`Push`}
      ></Button>
    );
  };

  const Unshift = () => {
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
        text={`Unshift`}
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
          <Reset />
          <Navbar.Divider />
          <ButtonGroup>
            <Push />
            <Pop />
          </ButtonGroup>
          <Navbar.Divider />
          <ButtonGroup>
            <Unshift />
            <Shift />
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