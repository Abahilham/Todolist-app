import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Masukkan Google Client ID kamu di sini (atau dari import.meta.env.VITE_GOOGLE_CLIENT_ID)
const GOOGLE_CLIENT_ID =
  "423140696037-ethbtadioipg911vul0i9gjh7g8btuad.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
