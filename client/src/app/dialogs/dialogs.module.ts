import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogConfig, DIALOG_GLOBAL_CONFIG } from '@ui/ui/dialog';
import { UIModule } from '../ui/ui.module';
import { AddSmartCollectionComponent } from './add-smart-collection/add-smart-collection.component';
import { SelectFolderComponent } from './select-folder/select-folder.component';

@NgModule({
  declarations: [SelectFolderComponent, AddSmartCollectionComponent],
  exports: [SelectFolderComponent, AddSmartCollectionComponent],
  imports: [
    CommonModule, FlexLayoutModule, FontAwesomeModule, UIModule,
    FormsModule, ReactiveFormsModule
  ],
  providers: [
    {
      provide: DIALOG_GLOBAL_CONFIG,
      useValue: {
        width: '600px',
        height: '300px'
      } as DialogConfig
    }
  ]
})
export class DialogsModule { }