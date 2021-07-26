import { ILogger } from "./loggerInterface";

export abstract class GenercicLogger implements ILogger {
    protected abstract log(level: string, message: string): void;

    public emerg(message: string): void {
        this.log("emerg", message);
    }

    public alert(message: string): void {
        this.log("alert", message);
    }

    public crit(message: string): void {
        this.log("crit", message);
    }

    public error(message: string): void {
        this.log("error", message);
    }

    public warning(message: string): void {
        this.log("warning", message);
    }

    public notice(message: string): void {
        this.log("notice", message);
    }

    public info(message: string): void {
        this.log("info", message);
    }

    public debug(message: string): void {
        this.log("debug", message);
    }
}
