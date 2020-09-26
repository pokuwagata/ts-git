import path from "path";

export const OBJECTS = "objects";
export const REFS = "refs";
export const INDEX = "index";
export const WORK = "work-dir";

export default class Path {
  private _workDirName: string;
  private _gitDir: string;

  constructor(workDirName: string, gitDir: string) {
    this._workDirName = workDirName;
    this._gitDir = path.join(WORK, gitDir);
  }

  get workDirName(): string {
    return this._workDirName;
  }

  get getGitDir(): string {
    return this._gitDir;
  }

  getGitObjects(): string {
    return path.join(this._gitDir, OBJECTS);
  }

  getIndex(): string {
    return path.join(this._gitDir, INDEX);
  }
}
