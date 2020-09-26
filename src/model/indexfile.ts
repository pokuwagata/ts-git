import Sha1 from "./sha1";

export class Entry {
  private path: string;
  private sha1: Sha1;

  constructor(path: string, sha1: Sha1) {
    this.path = path;
    this.sha1 = sha1;
  }
}

export class Index {
  private _entries: Entry[];

  constructor(entries: Entry[]) {
    this._entries = entries;
  }

  add(entries: Entry[]) {
    // TODO: 重複時にエラー
    this._entries = [...this._entries, ...entries];
  }

  get entries() {
    return this._entries;
  }
}
