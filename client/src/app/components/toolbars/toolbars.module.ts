import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PresetsComponent } from './presets/presets.component';
import { StatusComponent } from './status/status.component';
import { ToolsComponent } from './tools/tools.component';

@NgModule({
  declarations: [PresetsComponent, ToolsComponent, StatusComponent],
  exports: [PresetsComponent, ToolsComponent, StatusComponent],
  imports: [FlexLayoutModule, CommonModule]
})
export class ToolbarsModule { }