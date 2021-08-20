export default class MissingHeaderError extends Error {
    constructor(message?: string) {
        super(message);

        this.name = "MISSING_HEADER";
        this.message = message || "MISSING_HEADER";
    }
}
