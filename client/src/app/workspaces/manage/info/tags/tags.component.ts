import { Component } from '@angular/core';
import { faAdd, faMinus } from '@fortawesome/free-solid-svg-icons';
import { concatMap, filter, map, merge, startWith, Subject, switchMap } from 'rxjs';
import { ManageService } from '../../manage.service';

@Component({
  selector: 'tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent {

  newTag = '';
  existingTags: string[] = [];
  faAdd = faAdd;
  faRemove = faMinus;

  addImageTag = new Subject<[string, FileInfo]>();
  delImageTag = new Subject<[string, FileInfo]>();

  addTag$ = this.addImageTag.pipe(concatMap(([tag, file]) => this.manageService.addImageTag(tag, file)));
  delTag$ = this.delImageTag.pipe(concatMap(([tag, file]) => this.manageService.removeImageTag(tag, file)));
  imageTags$ = merge(this.addTag$, this.delTag$).pipe(
    filter(i => i.key === 'tags:image'),
    map(i => i.data)
  );

  image$ = this.manageService.activeImage$.pipe(
    filter((file): file is FileInfo => !!file),
    switchMap(file => this.imageTags$
      .pipe(
        startWith(file.tags || []),
        map(tags => ({ ...file, tags } as FileInfo))
      )
    )
  );

  constructor(
    private readonly manageService: ManageService
  ) { }

  addTag(tag: string, image: FileInfo) {
    if (tag.trim().length > 0) {
      this.addImageTag.next([tag, image!]);
    }
  }

  removeTag(tag: string, image: FileInfo) {
    this.delImageTag.next([tag, image]);
  }
}
