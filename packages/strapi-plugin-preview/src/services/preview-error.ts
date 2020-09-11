module.exports = class PreviewError extends Error {
  status: number;
  payload: any;
  constructor(status: number, message: string, payload: any = undefined) {
    super();
    this.name = "Strapi:Plugin:Preview";
    this.status = status || 500;
    this.message = message || "Internal error";
    this.payload = payload;
  }

  toString(e = this) {
    return `${e.name} - ${e.message}`;
  }

  getData() {
    if (this.payload) {
      return JSON.stringify({
        name: this.name,
        message: this.message,
        ...(this.payload || {}),
      });
    }
    return this.toString();
  }
};
