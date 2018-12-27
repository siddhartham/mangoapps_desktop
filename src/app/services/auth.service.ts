import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from '../../environments/environment'

import { User } from '../models/user'

@Injectable()
export class AuthService {
  current_domain:string;
  constructor(private http: Http) { }

  signin(domain:string, username:string, password:string): Observable<any>{
    var ms_request = {
      ms_request: {
        user: {
          api_key: environment.api_key,
          username:username,
          password:btoa(password)
        }
      }
    };

    return this.http
          .post(environment.protocol+'://'+domain+'/api/login.json', ms_request)
          .map(this.extractData)
          .catch(this.handleError)
  }

  private extractData(res: Response) {
    let body = res.json();

    let errMsg: string;
    if (body.ms_errors){
      return Observable.throw(body.ms_errors.error.message);
    }

    return body.ms_response
  }

  private handleError (res: Response | any) {
    let errMsg: string;
    if (res instanceof Response) {
      let body = res.json();
      errMsg = body.ms_errors.error.message;
    } else {
      errMsg = "Something went wrong while negotiating with server."
    }
    return Observable.throw(errMsg)
  }

}
