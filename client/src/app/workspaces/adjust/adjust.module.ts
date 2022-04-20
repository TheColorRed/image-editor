import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UIModule } from '../../ui/ui.module';
import { ActionComponent } from './action/action.component';
import { AdjustComponent } from './adjust.component';
import { AdjustmentComponent } from './adjustment.component';
import { BrightnessContrastComponent } from './brightness-contrast/brightness-contrast.component';
import { ColorAdjustComponent } from './color-adjust/color-adjust.component';
import { ConfirmRejectComponent } from './components/confirm-reject/confirm-reject.component';
import { SliderComponent } from './components/slider/slider.component';
import { WhiteBalanceComponent } from './white-balance/white-balance.component';
import { HighPassSharpenComponent } from './high-pass-sharpen/high-pass-sharpen.component';



@NgModule({
  declarations: [
    AdjustComponent,
    ActionComponent,
    BrightnessContrastComponent,
    AdjustmentComponent,
    ColorAdjustComponent,
    SliderComponent,
    ConfirmRejectComponent,
    WhiteBalanceComponent,
    HighPassSharpenComponent
  ],
  exports: [AdjustComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    UIModule
  ]
})
export class AdjustModule { }
