import "./App.css";
import DND from "./components/DND";
import React, { useEffect } from "react";
import axios from "axios";

function App() {
  /*useEffect(() => {
    const getData = async () => {
      const data = await axios.get("http://localhost:3001/tts");
      console.log(data);
    };
    getData();
  });*/
  return (
    <div className="App">
      <DND></DND>
    </div>
  );
}

export default App;
