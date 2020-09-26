import { IIndexfileService } from "./indexfileService";
import Blob from "../model/blob";
import { IBlobService } from "./blobService";
import { Entry } from "../model/indexfile";

export class AddCommand {
  private _filePaths: string[];

  constructor(filePaths: string[]) {
    this._filePaths = filePaths;
  }

  get filePaths(): string[] {
    return this._filePaths;
  }
}

export interface IGitApplicationService {
  init(): void;
  add(command: AddCommand): void;
  commit(): void;
}

export default class GitApplicationService {
  private indexfileService: IIndexfileService;
  private blobService: IBlobService;

  constructor(indexfileService: IIndexfileService, blobService: IBlobService) {
    this.indexfileService = indexfileService;
    this.blobService = blobService;
  }

  init() {}
  add(command: AddCommand) {
    const blobService = this.blobService;
    const entries = command.filePaths.map(
      (path) => new Entry(path, blobService.create(path))
    );
    const index = this.indexfileService.read();
    this.indexfileService.add(index, entries);
    this.indexfileService.save(index);
  }
  commit() {}
}
