import crypto from "crypto";

export default class Sha1 {
  private value: string
  constructor(data: string) {
    this.value = crypto.createHash("sha1").update(data).digest("hex");
  }

  getValue(): string {
    return this.value;
  }
}