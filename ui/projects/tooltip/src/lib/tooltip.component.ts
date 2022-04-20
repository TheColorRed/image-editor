import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ui-tooltip',
  template: `
    <p>
      tooltip works!
    </p>
  `,
  styles: [
  ]
})
export class TooltipComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
