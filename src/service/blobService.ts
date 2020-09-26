import { IBlobRepository } from "../repository/blobRepository";
import Blob from "../model/blob";
import Sha1 from "../model/sha1";
import { IBlobFactory } from "../factory/blobFactory";

export interface IBlobService {
  create(filePath: string): Sha1;
}

export default class BlobService {
  private blobRepository: IBlobRepository;
  private blobFactory: IBlobFactory;

  constructor(blobRepository: IBlobRepository, blobFactory: IBlobFactory) {
    this.blobRepository = blobRepository;
    this.blobFactory = blobFactory;
  }

  create(filePath: string): Sha1 {
    const blob = this.blobFactory.create(filePath);
    this.blobRepository.save(blob);
    return blob.sha1;
  }
}
