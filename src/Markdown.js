import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSnapshot } from "valtio";

import "./Markdown.css";

function Markdown({ doc }) {
  const snap = useSnapshot(doc);
  return (
    <ReactMarkdown
      className="Markdown"
      children={(snap && snap.text) || "loading"}
      remarkPlugins={[remarkGfm]}
    />
  );
}

export default Markdown;
