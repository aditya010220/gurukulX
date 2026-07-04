import React, { useEffect } from "react";
import Routes from "./Routes";

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("referredBy", ref);
    }
  }, []);

  return (
    <Routes />
  );
}

export default App;
