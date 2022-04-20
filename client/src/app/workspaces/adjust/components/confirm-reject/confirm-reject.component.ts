import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faCheck, faClose } from '@fortawesome/free-solid-svg-icons';
import { AdjustService } from '../../../../services/adjust.service';

@Component({
  selector: 'confirm-reject',
  templateUrl: './confirm-reject.component.html',
  styleUrls: ['./confirm-reject.component.scss']
})
export class ConfirmRejectComponent {

  @Input() path = '';
  @Output() confirmed = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<void>();

  iconConfirm = faCheck;
  iconReject = faClose;

  constructor(
    private readonly adjust: AdjustService
  ) { }

  confirm() {
    this.adjust.requestChange('apply', this.path);
    this.adjust.setAdjustmentActions(undefined);
  }

  reject() {
    this.adjust.requestChange('cancel', this.path);
    this.adjust.setAdjustmentActions(undefined);
  }

}
