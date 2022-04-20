import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TabComponent } from './tab/tab.component';
import { TabsComponent } from './tabs.component';



@NgModule({
  declarations: [
    TabsComponent,
    TabComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule
  ],
  exports: [
    TabsComponent,
    TabComponent
  ]
})
export class TabsModule { }
