import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, 
         CameraPhoto, CameraSource } from '@capacitor/core';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  

  constructor() { }
  private async savePicture(cameraPhoto: CameraPhoto) { 
    const base64Data = await this.readAsBase64(cameraPhoto);

    //write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };
  }
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    //Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  public async addNewToGallery() {
  // Take a photo
  const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri, 
    source: CameraSource.Camera, 
    quality: 100 
  });
  //save the picture and add it to photo collection
  const savedImageFile = await this.savePicture(capturedPhoto);
  this.photos.unshift(savedImageFile);
    //filepath: "soon...",
    //webviewPath: capturedPhoto.webPath
  //});
}
}
export interface Photo {
  filepath: string;
  webviewPath: string;
}
