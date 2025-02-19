import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
  const [uuid, set_uuid] = useState(uuidv4());
  const [command_type, set_command_type] = useState("command_type");
  const [command_text, set_command_text] = useState("{\n}");

  return (
    <>
      <div>
        <input
          type="text"
          value={uuid}
          style={{ fontFamily: "monospace", width: "36ch" }}
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => set_uuid(e.target.value)}
        />
        <input
          type="button"
          value="refresh"
          onClick={() => set_uuid(uuidv4())}
        />
      </div>
      <div>
        <input
          type="text"
          value={command_type}
          style={{
            fontFamily: "monospace",
            width: "100%",
            boxSizing: "border-box",
          }}
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => set_command_type(e.target.value)}
        />
      </div>
      <div>
        <textarea
          rows={6}
          style={{
            resize: "none",
            fontFamily: "monospace",
            width: "100%",
            boxSizing: "border-box",
          }}
          onChange={(e) => set_command_text(e.target.value)}
          value={command_text}
        />
      </div>
      <div>
        <input type="button" style={{ width: "100%" }} value="submit" />
      </div>
    </>
  );
}

export default App;
