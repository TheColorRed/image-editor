import { Component, HostBinding } from '@angular/core';

@Component({ template: '' })
export class WorkspaceComponent {
  @HostBinding('class')
  get elementClass() {
    return {
      workspace: true
    };
  }
}