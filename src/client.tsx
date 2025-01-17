import { createRoot } from "react-dom/client";
import App from "./app";

const rootNode = document.querySelector("#root");

if (rootNode) {
  createRoot(rootNode).render(<App />);
}
