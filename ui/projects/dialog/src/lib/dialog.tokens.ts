import { InjectionToken, Type } from '@angular/core';
import { DialogRef } from './dialog-ref.service';
import { DialogComponent } from './dialog.component';
import { DialogConfig } from './dialog.service';

export const DIALOG = new InjectionToken<DialogComponent>('DialogToken');
export const DIALOG_COMP = new InjectionToken<Type<any>>('DialogToken');
export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('DialogConfigToken');
export const DIALOG_GLOBAL_CONFIG = new InjectionToken<DialogConfig>('DialogGlobalCOnfigToken');
export const DIALOG_DATA = new InjectionToken<{ [key: string]: any; }>('DialogBackdropToken');
export const DIALOG_REF = new InjectionToken<DialogRef>('DialogRefToken');