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

function commit() {}

function dfs(dirPath: string) {
  fs.readdirSync(dirPath).forEach((name) => {
    const target = path.join(dirPath, name);
    const stats = fs.lstatSync(target);

    console.log(name);
    if (stats.isDirectory()) {
      dfs(target);
    }
    if (stats.isFile()) {
      createBlob(target);
    }
  });
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

function createTree() {}
