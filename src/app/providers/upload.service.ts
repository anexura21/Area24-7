import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject, FileUploadOptions, FileUploadResult } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { AlertController } from '@ionic/angular';
import { Observable, from } from 'rxjs';
import { Upload } from '../entities/upload';
import { UploadVideo } from '../entities/upload-video';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private fileTransferObject: FileTransferObject;
  private basePath = '/uploads';
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  public uploads: Observable<Upload[]>;

  constructor(private file: File,
              private alertCtrl: AlertController,
              private fileTransfer: FileTransfer  ) {
    this.fileTransferObject = this.fileTransfer.create();
  }

  uploadMedia(urlMedia: string): Observable<FileUploadResult>{
    const url = CONFIG_ENV.REST_BASE_URL + '/api/multimedia';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    const options: FileUploadOptions = {
        fileKey: 'multimedia',
        mimeType: 'multipart/form-data',
        headers: { Authorization: localStorage.getItem('bearer') }
    };
    return from(this.fileTransferObject.upload(urlMedia, encodeURI(url), options));
  }

  uploadVideo(upload: UploadVideo) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/multimedia';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    const options: FileUploadOptions = {
        fileKey: 'multimedia',
        mimeType: 'multipart/form-data',
        headers: { Authorization: localStorage.getItem('bearer') }
    };
    return from(this.fileTransferObject.upload(upload.url, encodeURI(url), options));
  }

  makeFileIntoBlob(_imagePath, name, type) {
    return new Promise((resolve, reject) => {
      this.file
        .resolveLocalFilesystemUrl(_imagePath)
        .then((entry: any) => {
          entry.file((resFile) => {
            const reader = new FileReader();
            reader.onloadend = (evt: any) => {
              const videoBlob: any = new Blob([evt.target.result], { type });
              videoBlob.name = name;
              resolve(videoBlob);
            };
            reader.onerror = (e) => {
              alert('Error cargando video: ' + JSON.stringify(e));
              reject(e);
            };
            reader.readAsArrayBuffer(resFile);
          });
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

}
