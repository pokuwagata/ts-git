import { Index, Entry } from "../model/indexfile";
import fs from "fs";
import Path from "../config/path";

export interface IIndexfileRepository {
  save(file: Index): void;
  read(filePath: string): Index;
  exists(filePath: string): boolean;
}

type Indexfile = {
  entries: Entry[];
};

export default class IndexfileRepository {
  private path: Path;
  constructor(path: Path) {
    this.path = path;
  }

  save(index: Index) {
    const file: Indexfile = { entries: index.entries };
    fs.writeFileSync(this.path.getIndex(), JSON.stringify(file), "utf8");
  }

  read(filePath: string): Index {
    const file: Indexfile = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(file);
    return new Index(file.entries);
  }

  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}
