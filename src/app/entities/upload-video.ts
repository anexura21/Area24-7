export class UploadVideo {
    $key: string;
    blob: Blob;
    type: string;
    name: string;
    url: string;
    progress: number;
    createdAt: Date = new Date();
    constructor(blob: Blob) {
      this.blob = blob;
    }
  }