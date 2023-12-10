import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.scss";

const root = document.querySelector<HTMLDivElement>("#root")!;

createRoot(root).render(
  <StrictMode/>
);