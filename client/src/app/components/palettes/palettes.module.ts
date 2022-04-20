import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UIModule } from '../../ui/ui.module';
import { InfoComponent } from './info/info.component';
import { MainPaletteComponent } from './main/main.component';

@NgModule({
  declarations: [MainPaletteComponent, InfoComponent],
  exports: [MainPaletteComponent],
  imports: [FlexLayoutModule, UIModule]
})
export class PalettesModule { }