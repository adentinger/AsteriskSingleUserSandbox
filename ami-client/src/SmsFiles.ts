import { SmsFile } from "./SmsFile";
import { spawnSync } from "child_process";

export class SmsFiles {
    public static loadSmsFiles(): SmsFile[] {
        // Lists all files SMS files (one per line) as an absolute path.
        const cmd = spawnSync(
            "/bin/bash",
            ["-c", `find "${SmsFile.SMS_FILE_DIR}" -type f -print0 | xargs -0 realpath`],
            {encoding: "utf8"}
        );
        const filePaths = cmd.stdout.split("\n");
        const noSmsFiles = filePaths.length === 1 && filePaths[0] === "";
        if (noSmsFiles) {
            return [];
        }
        else {
            return filePaths
                .filter(path => path !== "")
                .map(path => new SmsFile(path));
        }
    }
}
