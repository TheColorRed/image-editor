import { NgModule } from '@angular/core';
import { SizePipe } from './size.pipe';

@NgModule({
  declarations: [SizePipe],
  exports: [SizePipe]
})
export class PipesModule { }