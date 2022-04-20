import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PalettesModule } from '../../components/palettes/palettes.module';
import { ToolbarsModule } from '../../components/toolbars/toolbars.module';
import { EditComponent } from './edit.component';

@NgModule({
  declarations: [EditComponent],
  exports: [EditComponent],
  imports: [
    ToolbarsModule,
    PalettesModule,
    FlexLayoutModule
  ]
})
export class EditModule {

}