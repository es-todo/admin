import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import json5 from "json5";

import "./App.css";

function IssueCommand() {
  const [uuid, set_uuid] = useState(uuidv4());
  const [command_type, set_command_type] = useState("command_type");
  const [command_text, set_command_text] = useState("{\n}");
  const [submit_enabled, set_submit_enabled] = useState(true);
  const [log, set_log] = useState<string[]>([
    "Hint: Change command_text, add command data as json, and click submit button.",
  ]);

  const do_post_command = async () => {
    set_submit_enabled(false);
    const command_data_info = (() => {
      try {
        const command_data = json5.parse(command_text);
        return { error: false as const, command_data };
      } catch (err: any) {
        const errloc: { lineNumber: number; columnNumber: number } = err;
        return {
          error: true as const,
          location: `${errloc.lineNumber}:${errloc.columnNumber}`,
        };
      }
    })();
    if (command_data_info.error) {
      set_log([`parse error at ${command_data_info.location}`]);
      set_submit_enabled(true);
      return;
    }
    const command_data = command_data_info.command_data;
    set_log(["submitting ...", JSON.stringify(command_data)]);
    const result = await axios.post(
      "/event-apis/submit-command",
      {
        command_uuid: uuid,
        command_type,
        command_data,
      },
      {
        validateStatus: () => true,
      }
    );
    if (result.status >= 200 && result.status < 300) {
      set_log([
        "Command submitted successfully.",
        `Status: ${result.status}: ${result.statusText}`,
      ]);
    } else {
      set_log([
        "Command submission failed.",
        `Status: ${result.status}: ${result.statusText}`,
      ]);
    }
    set_submit_enabled(true);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", width: "min-content" }}
    >
      <div style={{ width: "max-content" }}>
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
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => set_command_text(e.target.value)}
          value={command_text}
        />
      </div>
      <div>
        <input
          type="button"
          style={{ width: "100%" }}
          value="submit"
          onClick={do_post_command}
          disabled={!submit_enabled}
        />
      </div>
      <div style={{ fontSize: ".8em" }}>
        {log.map((x, i) => (
          <div key={i}>{x}</div>
        ))}
      </div>
    </div>
  );
}

type queue_state =
  | { type: "initial" }
  | { type: "fetching" }
  | { type: "fetched"; commands: any[] };

function assert(condition: any): asserts condition {
  if (!condition) throw new Error("condition failed");
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function forever<T>(f: () => Promise<T>): Promise<T> {
  while (true) {
    try {
      return await f();
    } catch (error) {
      console.error(error);
      await sleep(100);
    }
  }
}

async function fetch_queue_t(): Promise<number> {
  return forever(async () => {
    const x = await axios.get("/event-apis/queue-t");
    assert(typeof x.data === "number");
    console.log({ queue_t: x.data });
    return x.data;
  });
}

async function poll_queue_t(queue_t: number): Promise<void> {
  return forever(async () => {
    await axios.get(`/event-apis/poll-command-queue?queue_t=${queue_t}`);
  });
}

async function fetch_pending_commands(): Promise<any[]> {
  return forever(async () => {
    const x = await axios.get("/event-apis/pending-commands");
    assert(Array.isArray(x.data));
    return x.data;
  });
}

async function refresh_commands(on_success: (commands: any[]) => void) {
  let t = await fetch_queue_t();
  while (true) {
    const commands = await fetch_pending_commands();
    on_success(commands);
    t += 1;
    await poll_queue_t(t);
  }
}

function CommandQueue() {
  const [state, set_state] = useState<queue_state>({ type: "initial" });
  useEffect(() => {
    //let cancel: (() => void) | undefined = undefined;
    //const p: Promise<void> = new Promise((resolve) => {
    //  cancel = resolve;
    //});
    switch (state.type) {
      case "initial": {
        set_state({ type: "fetching" });
        refresh_commands((commands) =>
          set_state({ type: "fetched", commands })
        );
      }
    }
  }, []);
  return (
    <div style={{ fontFamily: "monospace" }}>
      {state.type}
      {state.type === "fetched" &&
        state.commands.map((x, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            {json5.stringify(x, null, 4)}
          </div>
        ))}
    </div>
  );
}

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: ".5em" }}>
      <IssueCommand />
      <CommandQueue />
    </div>
  );
}

export default App;
