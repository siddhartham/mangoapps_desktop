import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { User } from '../models/user'

import * as xml2js from 'xml2js'

@Injectable()
export class WebsocketService {
  socket:any
  current_user:User
  timer:any
  constructor() { }

  connect()  : Observable<any>{
    let that = this
    this.current_user = User.current_user()
    return new Observable(observer => {
      this.socket = new WebSocket("wss://"+this.current_user.push_secondary_url);
      this.socket.onopen = function (e) {
        console.log('In connection open with inOpenConn value :: ');
        that.socket.send(that.getSubscribeString(that.current_user.id, -1, that.current_user.session_id, 13, that.escapeHTML(that.current_user.name), that.escapeHTML(that.current_user.photo)));
        that.timer = setInterval(function(){
          if(that.socket.OPEN===that.socket.readyState){
            that.socket.send(that.getHeartBeatReqString(that.current_user.id, that.current_user.session_id, 13));
          }else{
            clearInterval(that.timer)
            observer.next({command: "CONNECT_AGAIN"});
          }
        }, 25000)
        observer.next(e);
      };
      this.socket.onmessage = function (e) {
        var reader = new FileReader();
        reader.onload = function (event) {
          let xmlData = reader.result.replace('\0', '')
          console.log('App.net.Socket.onData :: ' + xmlData);
          xml2js.parseString(xmlData, function(err, message){
            observer.next(message);
          });
        };
        reader.readAsText(e.data);
      };
      this.socket.onclose = function (e) {
          console.log('Connection Closed because of :: '+ e.code);
          console.log('Connection Closed');
          observer.next(e);
      };
      this.socket.onerror = function (e) {
          console.log('Connection Error because of :: '+ e.code);
          observer.next(e);
      };
    })
  }

  send_message(to, message) {
    this.socket.send(this.sendMessageRequest(to, this.current_user.id, this.current_user.session_id, this.escapeHTML(message), this.escapeHTML(this.current_user.name), 'chat', new Date().getTime()));
  }

  notify(title:string, body:string, callback:any){
    let myNotification = new Notification(title, {
      body: body
    })
    myNotification.onclick = () => {
      callback()
    }
  }

  escapeHTML(s) {
     return s.replace(/>|<|&|\r\n|\n|\r/g, function (m){
                 switch (m) {
                     case '<':
                         return '&lt;';
                     case '>':
                         return '&gt;';
                     case '&':
                         return '&amp;';
                     case '\n':
                     case '\r':
                     case '\r\n':
                         return '<br />';
                     default:
                         return m;
                 }
            });
  }

  getSubscribeString(from, to, jid, platform, userName, userImage) : string {
      let loc1 = '<iq type="set" from="' + from + '" to="' + to + '">\r\n\t\t\t\t\t\t\t\t <pubsub xmlns="http://jabber.org/protocol/pubsub">\r\n\t\t\t\t\t\t\t\t <subscribe platform="' + platform + '" jid="' + jid + '" userName="' + userName + '" userImage="' + userImage + '" is_secure="true" /> \r\n\t\t\t\t\t\t\t\t   </pubsub> \r\n\t\t\t\t\t\t\t </iq>';
      console.log(loc1)
      return loc1;
  }
  getUnsubscribeString(from, to, jid, userName, platform) : string {
      let loc1 = '<iq type="set" from="' + from + '" to="' + to + '">\r\n\t\t\t\t\t\t\t\t <pubsub xmlns="http://jabber.org/protocol/pubsub">\r\n\t\t\t\t\t\t\t\t <unsubscribe platform="' + platform + '" jid="' + jid + '" closeConnectionOnLastSession="true" userName="' + userName + '"/> \r\n\t\t\t\t\t\t\t\t   </pubsub> \r\n\t\t\t\t\t\t\t </iq>';
      return loc1;
  }

  getHeartBeatReqString(userId, jId, userPlatform) : string {
      let loc1 = '<heartbeat-message type="request" userId="' + userId + '" platform="'+userPlatform+'" jid="' + jId + '"/>';
      return loc1;
  }
  sendMessageRequest(to, from, jId, message, userNm, type, id) : string {
      let loc1 = '<message to="' + to + '" from="' + from + '" type="' + type + '" id="' + id + '" xml:lang="en">\r\n\t\t\t\t\t\t\t\t\t <mstag jid="' + jId + '" userName="' + userNm + '"/>\r\n\t\t\t\t\t\t\t\t \t <body>' + message + '</body> \r\n\t\t\t\t\t\t\t\t </message>';
      return loc1;
  }
  sendAckMessageRequest(to, from, jId, message, userNm,ackType,isAckReq, type, id) : string {
      let loc1='<message to="' + to + '" from="' + from + '" type="' + type + '" id="' + id + '" xml:lang="en" is_ack_required="' + isAckReq + '" ack_type="' + ackType + '">\r\n\t\t\t\t\t\t\t\t\t <mstag jid="' + jId + '" userName="' + userNm + '"/>\r\n\t\t\t\t\t\t\t\t \t <body>' + message + "</body> \r\n\t\t\t\t\t\t\t\t </message>";
      return loc1;
  }
  getAckString(to, id, uniqueId, convId, jId, msgID, type) : string {
      let loc1 = '<ackMessage id="' + id + '" message_id="' + msgID +'" type="'+type+'" toUserId="' + to + '" uniqueId="' + uniqueId + '" conversation_id="' +( convId == undefined ?0:convId )+ '">\r\n\t\t\t\t\t\t  <mstag jid="'+jId+'"/> </ackMessage>';
      return loc1;
  }

  sendOfflineMessageRequest(to, from, jId, body, userNm, type, id) : string {
      let loc1 = '<offline_message to="' + to + '" from="' + from + '" type="' + type + '" id="' + id + '" xml:lang="en">\r\n\t\t\t\t\t\t\t\t \t <mstag jid="' + jId + '" userName="' + userNm + '"/> \r\n\t\t\t\t\t\t\t\t \t <body>' + body + '</body> \r\n\t\t\t\t\t\t\t\t </offline_message>';
      return loc1;
  }

  getPausedString(from, jID, to, userNm) : string {
      let loc1 = '<message from="' + from + '" to="' + to + '" type="groupchat">\r\n\t\t\t\t\t\t\t\t \t <mstag jid="' + jID + '" userName="' + userNm + '"/> \r\n\t\t\t\t\t\t\t\t \t<paused xmlns="http://jabber.org/protocol/chatstates"/>\r\n\t\t\t\t\t\t\t\t </message>';
      return loc1;
  }
  getInactiveString(from, jId, to, userNm) : string {
      let loc1 = '<message from="' + from + '" to="' + to + '" type="groupchat">\r\n\t\t\t\t\t\t\t\t \t <mstag jid="' + jId + '" userName="' + userNm + '"/> \r\n\t\t\t\t\t\t\t\t \t<inactive xmlns="http://jabber.org/protocol/chatstates"/>\r\n\t\t\t\t\t\t\t\t </message>';
      return loc1;
  }
  getComposingString(from, jId, to, userNm) : string {
      let loc1 = '<message from="' + from + '" to="' + to + '" type="groupchat">\r\n\t\t\t\t\t\t\t\t \t <mstag jid="' + jId + '" userName="' + userNm + '"/> \r\n\t\t\t\t\t\t\t\t \t<composing xmlns="http://jabber.org/protocol/chatstates"/>\r\n\t\t\t\t\t\t\t\t </message>';
      return loc1;
  }
  getWarnString(from, jID, to, recipientUserId, recipientUserName) : string {
      let loc1 = '<iq type="set" from="' + from + '" to="' + to + '" id="">\r\n\t  \t\t\t\t\t\t\t <warn jid="' + jID + '" recipientUserId="' + recipientUserId + '" recipientUserName="' + recipientUserName + '"/> \r\n\t\t\t\t\t\t\t  </iq>';
      return loc1;
  }
  sendCustomPresenceRequest(from, jId, presence, presenceStatus, userName, customStatus) : string {
      let loc1 = '<presence from="' + from + '" to="" xml:lang="en">\r\n\t\t\t\t\t\t\t\t <mstag jid="' + jId + '" userName="' + userName + '"/> \r\n\t\t\t\t\t\t\t\t <show>' + presence + '</show> \r\n\t\t\t\t\t\t\t\t <status>' + presenceStatus + '</status>'+(customStatus==null?'<custom-status></custom-status>':('<custom-status><![CDATA[' +  customStatus  + ']]></custom-status>'))+'\r\n\t\t\t\t\t\t\t </presence>';
      return loc1;
  }

}
