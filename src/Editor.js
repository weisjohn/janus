import { useRef } from "react";

import { Alignment, Button, Navbar } from "@blueprintjs/core";
import Monaco from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import Text from "./util/text";

import { proxy, useSnapshot } from "valtio";

import "./Editor.css";

/* generate client specific styles to be injected:
 - https://github.com/yjs/y-monaco#styling
 - https://github.com/yjs/y-monaco/blob/master/demo/index.html
*/
function ClientSelectonStyles({ clientId, color, initials }) {
  return (
    <style>
      {`
        .yRemoteSelection-${clientId} {
          background-color: ${color};
        }
        .yRemoteSelectionHead-${clientId} {
          border-color: ${color};
        }
        .yRemoteSelectionHead-${clientId}::after {
          border-color: ${color};
          background: ${color};
          content: "${initials}";
        }
      `}
    </style>
  );
}

const local = proxy({ clients: [] });

function Editor({ awareness, ytext, me }) {
  const editorRef = useRef(null);
  const snap = useSnapshot(local);

  // when awareness changes, update the styles
  awareness.on("update", () => {
    let allStates = awareness.getStates();

    local.clients = Array.from(allStates).map((s) => ({
      ...s[1].user,
      clientId: s[0],
    }));
  });

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const monacoBinding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      awareness
    );
  }

  return (
    <div className="yMonacoEditor">
      {snap.clients.map((c) => (
        <ClientSelectonStyles key={c.uuid} {...c} />
      ))}
      <Navbar>
        <Navbar.Group align={Alignment.Left}>
          <Button
            icon="reset"
            outlined
            intent="primary"
            onClick={() => {
              ytext.delete(0, ytext.length);
              ytext.insert(0, Text());
            }}
            text="Init"
          />
        </Navbar.Group>
      </Navbar>
      <Monaco
        height="calc(85vh - 100px)"
        defaultLanguage="markdown"
        defaultValue="# header\n\nfoobar"
        onMount={handleEditorDidMount}
      />
    </div>
  );
}

export default Editor;