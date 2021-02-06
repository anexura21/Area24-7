export class Upload {
    $key: string;
    base64: string;
    name: string;
    url: string;
    progress: number;
    createdAt: Date = new Date();
    constructor(base64: string) {
      this.base64 = base64;
    }
  }