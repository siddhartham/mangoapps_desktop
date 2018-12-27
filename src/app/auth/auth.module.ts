import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdButtonModule, MdCardModule, MdInputModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { SigninComponent } from './signin/signin.component';
import { AuthService } from '../services/auth.service';

@NgModule({
  imports: [
    CommonModule,
    MdButtonModule,
    MdCardModule,
    MdInputModule,
    FormsModule,
    AuthRoutingModule
  ],
  declarations: [SigninComponent],
  providers: [AuthService]
})
export class AuthModule { }
