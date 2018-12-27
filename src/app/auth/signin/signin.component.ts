import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service'
import { User } from '../../models/user'
import { Logger } from '../../tools/logger'

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  nextBtnTxt:string = "Submit"

  callInProgress:boolean = false;

  domain:string = ""
  username:string = ""
  password:string = ""

  message:string = ""

  constructor(private authService:AuthService,
              private router: Router) {
    if(User.is_logged_in()){
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.domain = localStorage.getItem('current_domain')
    if(this.domain=="" || this.domain == null){
      this.domain = "hub.mangoapps.com"
    }
  }

  login(){
    this.authService.signin(this.domain, this.username, this.password)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)

        if(response.error){
          this.message = response.error
          this.callInProgress = false
          this.nextBtnTxt = "Submit"
        }else{
          User.login((response.user as User), this.domain)
          this.router.navigate(['/home'])
        }

      },
      error => {
        Logger.log("Error recieved...", error)

        this.message = error
        this.callInProgress = false
        this.nextBtnTxt = "Submit"
      }
    );
    this.callInProgress = true
    this.nextBtnTxt = "Please wait..."
  }

}
