import { spawn } from "node:child_process";

const port = process.env.PORT || "5173";

const child = spawn(
  "npx",
  ["vite", "preview", "--host", "0.0.0.0", "--port", port],
  {
    shell: true,
    stdio: "inherit"
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
