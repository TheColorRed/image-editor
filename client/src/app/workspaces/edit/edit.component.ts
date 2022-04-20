import { Component, OnInit } from '@angular/core'
import { WorkspaceComponent } from '../workspace.component'

@Component({
  selector: 'edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends WorkspaceComponent implements OnInit {

  ngOnInit(): void {
  }

}
