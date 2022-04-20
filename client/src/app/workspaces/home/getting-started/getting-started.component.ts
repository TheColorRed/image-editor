import { Component, OnInit } from '@angular/core';
import { faAdd, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {

  images: FileInfo[] = [];
  faAdd = faAdd;
  faOpen = faFolderOpen;

  ngOnInit() {
    // this.httpClient.get<FileInfo[]>('/images/pictures')
    //   .pipe(
    //     map(
    //       imgs => imgs.map(img => {
    //         return {
    //           ...img,
    //           atime: new Date(img.atime),
    //           ctime: new Date(img.ctime),
    //           mtime: new Date(img.mtime),
    //           birthtime: new Date(img.birthtime)
    //         };
    //       })
    //     )
    //   )
    //   .subscribe(images => {
    //     images.sort((a, b) => {
    //       return b.mtime.getTime() - a.mtime.getTime();
    //     });
    //     this.images = images;
    //   });
  }

}
