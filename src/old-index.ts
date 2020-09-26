import fs from "fs";
import path from "path";
import crypto from "crypto";

const objects = "objects";
const refs = "refs";
const work = "work-dir";
const root = path.join(work, ".git-dummy");
const index = "index";

(function main() {
  const argvs = process.argv.slice(2);
  const commnad = argvs[0];
  const subArgvs = argvs.slice(1);

  try {
    switch (commnad) {
      case "init":
        init();
        break;
      case "add":
        add(subArgvs);
        break;
      case "commit":
        commit();
        break;
      default:
        console.info("help: ");
    }
  } catch (err) {
    console.error(err);
  }
})();

function init() {
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
    fs.mkdirSync(path.join(root, objects));
    fs.mkdirSync(path.join(root, refs));
    fs.mkdirSync(path.join(root, refs, "heads"));
    fs.mkdirSync(path.join(root, refs, "tags"));
    fs.writeFileSync(path.join(root, "HEAD"), "ref: refs/heads/master");
    console.info("initialized");
  } else {
    console.error(".git directory already existed.");
  }
}

type Index = {
  entries: Map<string, string>;
};

type RawIndex = {
  entries: { path: string; sha1: string }[];
};

function add(files: string[]) {
  const indexPath = path.join(root, index);

  // convert raw index file -> map
  let entries: Index["entries"] = new Map<string, string>();
  if (fs.existsSync(indexPath)) {
    const raw: RawIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    raw.entries.forEach((entry) => {
      entries.set(entry.path, entry.sha1);
    });
  }

  files.forEach((filePath) => {
    console.log(filePath);
    const sha1 = createBlob(filePath);
    // upsert index
    entries.set(filePath, sha1);
  });

  // convert map -> raw index file
  const newRawIndex: RawIndex = { entries: [] };
  entries.forEach((value, key) => {
    newRawIndex.entries.push({ path: key, sha1: value });
  });

  // save index file
  fs.writeFile(indexPath, JSON.stringify(newRawIndex), "utf8", function (err) {
    if (err) {
      console.log(err);
    }
  });
}

type TreeEntry = {
  mode: string;
  filePath: string;
  sha1: string;
};

type Tree = {
  sha1: string;
  entries: TreeEntry[];
};

type Commit = {
  tree: string;
  parent: string;
  messeage: string;
};

function commit() {
  // create blob list from parent commit
  const head = fs.readFileSync(path.join(root, "HEAD")).toString("utf-8");
  const refPath = head.substr(5); // ex) ref: refs/heads/master
  const commitHash = fs
    .readFileSync(path.join(root, refPath))
    .toString("utf-8");
  console.log(commitHash);
  const commit: Commit = JSON.parse(
    fs.readFileSync(path.join(root, objects, commitHash), "utf-8")
  );
  const rootTree: Tree = JSON.parse(
    fs.readFileSync(path.join(root, objects, commit.tree), "utf-8")
  );
  const snapshotBlobs = new Map<string, string>();
  const snapshotPathToTree = new Map<string, string>();

  dfs(rootTree.entries);

  function dfs(entries: TreeEntry[]) {
    entries.forEach((entry) => {
      console.log(entry);
      const entryPath = path.join(root, objects, entry.sha1);
      if (entry.mode.substr(0, 2) === "40") {
        // directory
        console.log(entryPath);
        snapshotPathToTree.set(entry.filePath, entry.sha1);
        const subTree: Tree = JSON.parse(fs.readFileSync(entryPath, "utf-8"));
        dfs(subTree.entries);
      }
      if (entry.mode.substr(0, 3) === "100") {
        // file
        if (!fs.existsSync(entryPath)) {
          throw Error(`${entry.sha1} is not exists`);
        }
        snapshotBlobs.set(entry.filePath, entry.sha1);
      }
    });
  }

  console.log(snapshotBlobs);

  const indexPath = path.join(root, index);
  // convert raw index file -> map
  let indexEntries: Index["entries"] = new Map<string, string>();
  if (fs.existsSync(indexPath)) {
    const raw: RawIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    raw.entries.forEach((entry) => {
      indexEntries.set(entry.path, entry.sha1);
    });
  }

  // compare index to snapshot
  indexEntries.forEach((path, sha1) => {
    if (!(snapshotBlobs.has(path) && snapshotBlobs.get(path) === sha1)) {
      // new blob or updated blob case
      createBlob(path);
      // update tree
      const dirPathMatchResult = path.match(/.*\//);
      if (dirPathMatchResult) {
        const dirPath = dirPathMatchResult[0].substr(
          0,
          dirPathMatchResult[0].length - 1
        );
        const treeSha1 = snapshotPathToTree.get(dirPath);
        if(treeSha1) {
          // already existed directory
          updateTree(rootTree, treeSha1, {sha1: });
        } else {
          // root or new directory

          // 既存ディレクトリ配下の新規ディレクトリ
          // 新規ディレクトリ配下の新規ディレクトリなどの場合があるので、既存ディレクトリ（あるいはroot）に到達するまで再帰して
          // updateTree をしていく必要がある
        }
      }
    }
  });

  // compare snapshot to index
}

function updateTree(
  rootTree: Tree,
  treeSha1: string,
  updatedEntry: TreeEntry
): Tree | null {
  return dfs(rootTree.entries);

  function dfs(entries: TreeEntry[]): Tree | null {
    // entries.forEach((entry)=>{
    let rebuild = false;
    let updatedTreeEntry: TreeEntry | undefined;
    for (const entry of entries) {
      const entryPath = path.join(root, objects, entry.sha1);
      if (entry.mode.substr(0, 2) === "40") {
        // directory
        console.log(entryPath);
        const subTree: Tree = JSON.parse(fs.readFileSync(entryPath, "utf-8"));
        if (entry.sha1 === treeSha1) {
          rebuild = true;
          const updatedTree = createTree(
            getNewEntries(subTree.entries, updatedEntry)
          );
          updatedTreeEntry = {
            sha1: updatedTree.sha1,
            filePath: entry.filePath,
            mode: entry.mode,
          };
          break;
        } else {
          const updatedTree = dfs(subTree.entries);
          if (updatedTree) {
            updatedTreeEntry = {
              sha1: updatedTree.sha1,
              filePath: entry.filePath,
              mode: entry.mode,
            };
          }
        }
      }
      // if (entry.mode.substr(0, 3) === "100") {
      //   // file
      //   if (!fs.existsSync(entryPath)) {
      //     throw Error(`${entry.sha1} is not exists`);
      //   }
      // }
      // });
    }
    if (updatedTreeEntry) {
      return createTree(getNewEntries(entries, updatedTreeEntry));
    }
    return null;
  }
}

function getNewEntries(entries: TreeEntry[], entry: TreeEntry): TreeEntry[] {
  for (const e of entries) {
    if (e.filePath === entry.filePath) {
      e.sha1 = entry.sha1;
      return entries;
    }
  }
  // new entry
  return [...entries, entry];
}

function createTree(entries: TreeEntry[]): Tree {
  const content = JSON.stringify(entries);
  const sha1 = crypto.createHash("sha1").update(content).digest("hex");
  const tree = JSON.stringify({ sha1, entries });

  fs.writeFile(path.join(root, objects, sha1), tree, "utf8", function (err) {
    if (err) {
      console.log(err);
    }
  });

  return { sha1, entries };
}

function createBlob(filePath: string): string {
  const stats = fs.lstatSync(filePath);
  const data = fs.readFileSync(filePath, "utf8");
  const content = `blob ${stats["size"]}\0${data}`;
  console.log(content);
  const sha1 = crypto.createHash("sha1").update(content).digest("hex");
  fs.writeFile(path.join(root, objects, sha1), content, "utf8", function (err) {
    if (err) {
      console.log(err);
    }
  });
  console.log(sha1);
  return sha1;
}
