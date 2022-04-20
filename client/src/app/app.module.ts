import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { filter, interval, take } from 'rxjs';
import { AppComponent } from './app.component';
import { DialogsModule } from './dialogs/dialogs.module';
import { ServerService } from './services/server.service';
import { WebSocketService } from './services/websockets/web-socket.service';
import { WorkspaceTabsModule } from './workspaces/workspace-tabs.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    WorkspaceTabsModule,
    DialogsModule
  ],
  providers: [
    WebSocketService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerService,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (webSocket: WebSocketService) => () => {
        return interval(100).pipe(
          filter(() => webSocket.ready),
          take(1)
        );
      },
      deps: [WebSocketService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
