import { concat, filter, Observable, tap } from 'rxjs';
import { files } from '../../database/files.database';
import { tags } from '../../database/tags.database';
import { MessageService } from '../message';

export default class Tags extends MessageService {
  get() {
    tags.get().subscribe(tags => this.done(tags));
  }
  /**
   * Adds a tag to the tags table and optionally to an image.
   * @param data The data to add.
   */
  add(data: FileTagsModify) {
    const actions: Observable<any>[] = [];
    const tag = data.tag;
    const file = data.file;

    actions.push(
      tags.add(tag).pipe(
        filter(i => i === true),
        tap(i => this.send(i, 'tags:new'))
      )
    );
    if (typeof file === 'string') {
      actions.push(
        tags.addPathTag(tag, file).pipe(tap(i => this.send(i, 'tags:image')))
      );
    }

    concat(...actions).subscribe({
      complete: () => {
        this.done();
        files.indexFiles().subscribe();
      }
    });
  }
  /**
   * Removes a tag from the tags table and/or optionally from an image.
   * @param data The data to remove.
   */
  remove(data: FileTagsModify) {
    const actions: Observable<any>[] = [];
    const tag = data?.tag;
    const file = data?.file;

    // Remove tag relation
    if (typeof tag === 'string' && typeof file === 'string') {
      actions.push(
        tags.removeTagFromFile(tag, file).pipe(tap(i => this.send(i, 'tags:image')))
      );
    }
    // Remove tag and all relations
    else if (typeof tag === 'string' && typeof file === 'undefined') {
      actions.push(tags.removeTag(tag));
      actions.push(tags.removeTagFromAllFiles(tag));
    }

    concat(...actions).subscribe({
      complete: () => {
        tags.get().subscribe(tags => this.done(tags));
        files.indexFiles().subscribe();
      }
    });
  }
}