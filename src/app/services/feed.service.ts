import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from '../../environments/environment'

import { User } from '../models/user'

@Injectable()
export class FeedService {
  current_domain:string;
  constructor(private http: Http) {
    this.current_domain = localStorage.getItem('current_domain');
  }

  pin_feed(feed_id:number): Observable<any>{
    var ms_request = {
      ms_request: {
        feed: {
          pin: "U",
        }
      }
    };
    return this.http
          .post(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/feeds/'+feed_id+'/bookmark_feed.json??x=1'), ms_request)
          .map(this.extractData)
          .catch(this.handleError)
  }
  unpin_feed(feed_id:number): Observable<any>{
    return this.http
          .delete(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/feeds/'+feed_id+'/bookmark.json?x=1'))
          .map(this.extractData)
          .catch(this.handleError)
  }

  comment_on_feed(feed_id:number, comment:string): Observable<any>{
    var ms_request = {
      ms_request: {
        comment: {
          body: comment,
          parent_id: ""
        }
      }
    };

    return this.http
          .post(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/feeds/'+feed_id+'/comment.json?x=1'), ms_request)
          .map(this.extractData)
          .catch(this.handleError)
  }

  get_all_feeds(current_page:number, feed_tab:string): Observable<any>{
    let limit:number = 20
    let offset:number = limit*(current_page-1)

    let endpoint:string = '/api/feeds/whats_new.json?'
    if(feed_tab=='M'){
      endpoint = '/api/feeds/mentions.json?'
    }else if(feed_tab=='W'){
      endpoint = '/api/feeds/watched.json?'
    }else if(feed_tab=='P' || feed_tab=='S'){
      endpoint = '/api/feeds.json?feed_status_type='+feed_tab+'&'
    }

    return this.http
          .get(User.sign_url(environment.protocol+'://'+this.current_domain+endpoint+'limit='+limit+'&offset='+offset))
          .map(this.extractData)
          .catch(this.handleError)
  }
  get_dms(current_page:number): Observable<any>{
    let limit:number = 20
    let offset:number = limit*(current_page-1)
    return this.http
          .get(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/feeds/direct_messages.json?='+limit+'&offset='+offset))
          .map(this.extractData)
          .catch(this.handleError)
  }
  mark_as_read(id:number): Observable<any>{
    return this.http
          .get(User.sign_url(environment.protocol+'://'+this.current_domain+'/api/feeds/mark_all_as_read.json?ids='+id))
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
