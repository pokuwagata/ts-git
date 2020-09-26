import Sha1 from "./sha1";

type BlobData = {
  size: number;
  fileData: string;
};

export default class Blob {
  private _sha1: Sha1;
  private _data: BlobData;

  constructor(size: number, fileData: string) {
    this._data = { size, fileData };
    this._sha1 = new Sha1(JSON.stringify(this._data));
  }

  get sha1() {
    return this._sha1;
  }

  get data() {
    return this._data;
  }
}
