import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

// 代码高亮样式
import "highlight.js/styles/github-dark.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
