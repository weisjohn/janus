import React, { useRef } from "react";

import Monaco from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

function Editor({ awareness, ytext }) {
  const editorRef = useRef(null);

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
    <Monaco
      height="30vh"
      defaultLanguage="markdown"
      defaultValue="# header\n\nfoobar"
      onMount={handleEditorDidMount}
    />
  );
}

export default Editor;