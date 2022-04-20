import { NgModule } from '@angular/core';
import { AutocompleteModule } from '@ui/ui/autocomplete';
import { ButtonModule } from '@ui/ui/button';
import { CoreModule } from '@ui/ui/core';
import { DialogModule } from '@ui/ui/dialog';
import { DividerModule } from '@ui/ui/divider';
import { InputModule } from '@ui/ui/input';
import { OptionModule } from '@ui/ui/option';
import { PopupMenuModule } from '@ui/ui/popup-menu';
import { SelectModule } from '@ui/ui/select';
import { SliderModule } from '@ui/ui/slider';
import { TabsModule } from '@ui/ui/tabs';


@NgModule({
  exports: [
    CoreModule,
    ButtonModule,
    TabsModule,
    DialogModule,
    InputModule,
    SelectModule,
    OptionModule,
    PopupMenuModule,
    AutocompleteModule,
    DividerModule,
    SliderModule
  ]
})
export class UIModule { }
