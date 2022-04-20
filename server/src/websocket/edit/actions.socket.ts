import { Subject, take } from 'rxjs';
import { ActionProcess, ImageProcessor } from '../../image-management/image-processor';
import { MessageService } from '../message';

interface ActionRequest {
  path: string;
  actions: ActionToApply[];
}
interface ActionToApply {
  action: string,
  args: any[];
}

export default class Actions extends MessageService {

  static Processor = new ImageProcessor();

  apply(message: ActionRequest) {
    const image = Actions.Processor.addImage(message.path);
    image.init().subscribe(() => {
      this.getActions(message.actions).subscribe(actions => {
        image.setActions(actions);
        image.applyActions();
      });
    });
  }

  private getActions(actions: ActionToApply[]) {
    const mappedActions: ActionProcess[] = [];
    const sub = new Subject<ActionProcess[]>();
    const imports: Promise<any>[] = [];
    for (let action of actions) {
      const imp = import(`../image/${action.action}.image`);
      let act = { action: action.action, args: action.args };
      mappedActions.push(act as any);
      imports.push(imp);
    }
    Promise.all(imports).then(imps => {
      imps.forEach((imp, idx) => {
        mappedActions[idx] = { ...mappedActions[idx], action: imp.default };
      });
      sub.next(mappedActions);
    });
    return sub.asObservable().pipe(take(1));
  }
}