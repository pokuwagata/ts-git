import Blob from "../model/blob";
import Sha1 from "../model/sha1";
import fs from "fs";
import Path from "../config/path";
import path from "path";

export interface IBlobRepository {
  save(blob: Blob): void;
}

export default class BlobRepository {
  private path: Path;
  constructor(path: Path) {
    this.path = path;
  }
  save(blob: Blob) {
    fs.writeFile(
      path.join(this.path.getGitObjects(), blob.sha1.getValue()),
      JSON.stringify(blob.data),
      "utf8",
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
  }
}
