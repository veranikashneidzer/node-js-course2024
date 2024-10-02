import { appendFile } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const refreshRate = 100;
const logInterval = 60000;

const platform = process.platform;

const promisifiedExec = promisify(exec);
const promisifiedAppend = promisify(appendFile);

const appendToFile = async (message: string) => {
    await promisifiedAppend('./src/activityMonitor', message);
};

const executeCmd = async () => {
    try {
        const cmd = platform === 'win32'
            ? `powershell "Get-Process | Sort-Object CPU -Descending | Select-Object -Property Name, CPU, WorkingSet -First 1 | ForEach-Object { $_.Name + ' ' + $_.CPU + ' ' + $_.WorkingSet }"`
            : 'ps -A -o %cpu,%mem,comm | sort -nr | head -n 1';

        const { stdout } = await promisifiedExec(cmd);

        return stdout;
    } catch (error) {
        await appendToFile("Unsupported platform");
        process.exit(1);
    }
};

export default function run() {
    setInterval(async () => {
        const processInfo = await executeCmd();

        process.stdout.write('\r' + processInfo);
    }, refreshRate);

    setInterval(async () => {
        const processInfo = await executeCmd();
        await appendToFile(`${Date.now()}: ${processInfo}\n`);
    }, logInterval);
}
