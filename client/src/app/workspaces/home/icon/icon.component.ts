import { Component } from '@angular/core';
import { faHome } from '@fortawesome/free-solid-svg-icons';

@Component({
  template: '<fa-icon [icon]="faHome"></fa-icon>'
})
export class HomeIconComponent {
  faHome = faHome;
}
