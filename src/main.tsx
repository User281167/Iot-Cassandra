import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SensorProvider } from "./context/SensorContext.tsx";
import App from "./App.tsx";

import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SensorProvider>
      <App />
    </SensorProvider>
  </StrictMode>
);
