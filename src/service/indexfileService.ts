import { IIndexfileRepository } from "../repository/indexfileRepository";
import { Index, Entry } from "../model/indexfile";
import Path from "../config/path";

export interface IIndexfileService {
  read(): Index;
  add(index: Index, entries: Entry[]): void;
  save(index: Index): void;
}

export class IndexfileService {
  private indexfileRepository: IIndexfileRepository;
  private path: Path;

  constructor(indexfileRepository: IIndexfileRepository, path: Path) {
    this.indexfileRepository = indexfileRepository;
    this.path = path;
  }

  read(): Index {
    if (!this.indexfileRepository.exists(this.path.getIndex())) {
      throw Error("index file is not existed");
    }
    return this.indexfileRepository.read(this.path.getIndex());
  }

  add(index: Index, entries: Entry[]) {
    index.add(entries);
    return index;
  }

  save(index: Index) {
    this.indexfileRepository.save(index);
  }
}
