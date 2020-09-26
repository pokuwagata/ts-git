import GitApplicationService, {
  AddCommand,
} from "./service/gitApplicationService";
import { IndexfileService } from "./service/indexfileService";
import BlobService from "./service/blobService";
import BlobFactory from "./factory/blobFactory";
import BlobRepository from "./repository/blobRepository";
import Path from "./config/path";
import IndexfileRepository from "./repository/indexfileRepository";

(function main() {
  const path = new Path("work-dir", ".git-dummy");
  const blobRepository = new BlobRepository(path);
  const blobFactory = new BlobFactory();
  const blobService = new BlobService(blobRepository, blobFactory);
  const indexfileRepository = new IndexfileRepository(path);
  const indexFileService = new IndexfileService(indexfileRepository, path);
  const gitAppService = new GitApplicationService(
    indexFileService,
    blobService
  );

  const argvs = process.argv.slice(2);
  const commnad = argvs[0];
  const subArgvs = argvs.slice(1);

  try {
    switch (commnad) {
      case "init":
        // init();
        break;
      case "add":
        const addCommnad = new AddCommand(subArgvs);
        gitAppService.add(addCommnad);
        break;
      case "commit":
        // commit();
        break;
      default:
        console.info("help: ");
    }
  } catch (err) {
    console.error(err);
  }
})();
