import { AfterViewInit, Component, DoCheck, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faCog, faTurnUp } from '@fortawesome/free-solid-svg-icons';
import { DialogRef } from '@ui/ui/dialog';
import { debounceTime, fromEvent, Observable } from 'rxjs';
import { Message, WebSocketService } from '../../services/websockets/web-socket.service';
import { ManageService } from '../../workspaces/manage/manage.service';


@Component({
  templateUrl: './select-folder.component.html',
  styleUrls: ['./select-folder.component.scss']
})
export class SelectFolderComponent implements OnInit, AfterViewInit, DoCheck {

  faCog = faCog;
  invalid = true;
  upLevel = faTurnUp;
  isRoot = true;
  folder = '';
  showHidden = false;
  folderExists = false;
  shouldIncludeSubFolders = true;
  folders: FolderResponseItem[] = [];
  keyup!: Observable<Event>;
  @ViewChild('folderPath') set inputFolder(folderPath: ElementRef<HTMLInputElement>) {
    this.keyup = fromEvent(folderPath.nativeElement, 'keyup');
  }

  constructor(
    private readonly dialogRef: DialogRef,
    private readonly manage: ManageService,
    private readonly socket: WebSocketService
  ) { }

  ngOnInit() {
    this.requestFolders('/');
  }

  ngDoCheck() {
    this.invalid = this.folder.length === 0;
  }

  ngAfterViewInit() {
    this.keyup.pipe(
      debounceTime(250)
    ).subscribe(r => {
      const path = (r.target as HTMLInputElement).value;
      this.requestFolders(path);
    });
  }

  save() {
    const sep = this.socket.info.separator;
    const label = this.folder.split(sep).pop();
    const sendData = {
      label,
      type: 'folder',
      info: {
        path: this.folder,
        deep: this.shouldIncludeSubFolders
      }
    } as FolderCollection;
    this.manage.createFolderCollection(sendData).subscribe(message => {
      this.folderExists = message === 'folder exists';
      if (message === '') {
        this.dialogRef.close();
      }
    });
  }

  setPath(path: string) {
    this.folder = path;
    this.isRoot = this.isRootFolder(path);
    this.requestFolders(path);
  }

  goUpLevel() {
    const sep = this.socket.info.separator;
    const isWindows = this.socket.info.isWindows;
    let path = this.folder.split(sep).slice(0, -1).join(sep);
    if (!path.includes(sep)) {
      path = isWindows ? 'C:' + sep : sep;
    }
    this.setPath(path);
  }

  updateFolderList(showHidden: boolean) {
    this.showHidden = showHidden;
    this.requestFolders(this.folder);
  }

  includeSubFolders(shouldIncludeSubFolders: boolean) {
    this.shouldIncludeSubFolders = shouldIncludeSubFolders;
  }

  private isRootFolder(path: string) {
    const sep = this.socket.info.separator;
    if (
      path.replace(new RegExp(`[^\\${sep}]`, 'g'), '').length === 1 &&
      !!path.match(new RegExp(`^(\\${sep}|\\w:\\${sep}).+`)) === false
    ) {
      return true;
    }
    return false;
  }

  private setFolders(result: Message<FolderResponseItem[]>) {
    if (result.data.length === 0) return;
    this.folders = result.data;
  }

  private requestFolders(path: string,) {
    const showHidden = this.showHidden;
    return this.socket.send<{ path: string; showHidden: boolean; }, FolderResponseItem[]>('manage/files/folders', { path, showHidden })
      .subscribe(r => this.setFolders(r));
  }

}
