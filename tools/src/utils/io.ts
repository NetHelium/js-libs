import { type ChildProcess, type SpawnOptions, spawn } from "node:child_process";
import type { Readable } from "node:stream";
import { text as streamText } from "node:stream/consumers";

type cmdOutput = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

const text = async (stream: NodeJS.ReadableStream | Readable | null) =>
  stream ? (await streamText(stream)).trimEnd() : "";

/**
 * Run a command in a dedicated process and get the command's output (stdout and stderr).
 * The command's output is not displayed in the host process.
 *
 * @param cmd the shell command to execute
 * @param args the args to pass to the command
 * @param options the options for the dedicated process running the command
 * @returns the resulting output of the command
 */
export const cmd = async (
  cmd: string,
  args?: string[],
  options?: SpawnOptions,
): Promise<cmdOutput> => {
  if (!args) args = [];
  if (!options) options = {};

  let cmdProcess: ChildProcess;
  let stdout = "";
  let stderr = "";

  try {
    cmdProcess = spawn(cmd, args, options);

    const done = new Promise((resolve) => {
      cmdProcess.on("close", resolve);
    });

    [stdout, stderr] = await Promise.all([text(cmdProcess.stdout), text(cmdProcess.stderr)]);
    await done;
  } catch {
    return { exitCode: 1, stdout, stderr };
  }

  const { exitCode } = cmdProcess;
  if (exitCode === 0) return { exitCode, stdout, stderr };

  return {
    exitCode: 1,
    stdout,
    stderr: exitCode === null ? "Timeout" : stderr,
  };
};

/**
 * Run a command in a dedicated process and stream its output in the host process.
 *
 * @param cmd the command to execute
 * @param args the args to pass to the command
 * @param options the options for the dedicated process running the command
 * @returns the child process in which the command is being executed
 */
export const streamCmd = (cmd: string, args?: string[], options?: SpawnOptions) => {
  if (!args) args = [];
  if (!options) options = {};

  return spawn(cmd, args, { ...options, stdio: "inherit" });
};
