import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import App from "./App";
import { DeskproAppProvider } from "@deskpro/app-sdk";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import { BookmarkProvider } from "./context/bookmarkContext";
import "simplebar/dist/simplebar.min.css";

const root = ReactDOM.createRoot(document.getElementById("root") as Element);
root.render(
  <React.StrictMode>
    <div style={{ height: "100%", width: "100%" }}>
      <DeskproAppProvider>
        <BookmarkProvider>
          <App />
        </BookmarkProvider>
      </DeskproAppProvider>
    </div>
  </React.StrictMode>
);
