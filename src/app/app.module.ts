import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { NgxElectronModule } from 'ngx-electron';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ColleagueService } from './services/colleague.service';
import { WebsocketService } from './services/websocket.service';

const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren : './auth/auth.module#AuthModule'
  },
  {
    path: 'home',
    loadChildren : './home/home.module#HomeModule'
  },
  {
    path: '**',
    redirectTo: '/auth/signin',
    pathMatch: 'full'
  }
];


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    NgxElectronModule
  ],
  providers: [ColleagueService, WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
