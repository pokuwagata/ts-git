import Blob from "../model/blob";
import fs from "fs";

export interface IBlobFactory {
  create(filePath: string): Blob;
}

export default class BlobFactory {
  create(filePath: string): Blob {
    const size = fs.lstatSync(filePath)["size"];
    const data = fs.readFileSync(filePath, "utf8");
    return new Blob(size, data);
  }
}
