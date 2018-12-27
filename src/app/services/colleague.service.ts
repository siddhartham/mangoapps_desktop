import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from '../../environments/environment'

import { User } from '../models/user'

@Injectable()
export class ColleagueService {
  current_domain:string;
  constructor(private http: Http) {
    this.current_domain = localStorage.getItem('current_domain');
  }

  create_chat(user_id:number): Observable<any>{
    var ms_request = {
      ms_request: {
        chat: {
          user_id: user_id
        }
      }
    };

    return this.http
          .post(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/chats.json?x=1'), ms_request)
          .map(this.extractData)
          .catch(this.handleError)
  }

  get_chats(conversation_id:number, current_page:number): Observable<any>{
    let limit:number = 10
    let offset:number = limit*(current_page-1)
    return this.http
          .get(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/chats.json?limit='+limit+'&offset='+offset+'&conversation_id='+conversation_id))
          .map(this.extractData)
          .catch(this.handleError)
  }

  get_colleagues(current_page:number, query:string=''): Observable<any>{
    let limit:number = 10
    let offset:number = limit*(current_page-1)
    return this.http
          .get(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/users/colleagues.json?limit='+limit+'&offset='+offset+'&query='+query))
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
