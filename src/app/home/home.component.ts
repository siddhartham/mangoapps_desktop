import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../models/user'
import { Colleague } from '../models/colleague'
import { ChatObj } from '../models/chat_obj'
import { UserChat } from '../models/user_chat'
import { Feed } from '../models/feed'
import { Comment } from '../models/comment'
import { FeedStats } from '../models/feed-stats'
import { PersonalSetting } from '../models/personal-setting'

import { Logger } from '../tools/logger'

import { FeedService } from '../services/feed.service'
import { ColleagueService } from '../services/colleague.service'
import { WebsocketService } from '../services/websocket.service'

import { FeedItemComponent } from './feed-item/feed-item.component'
import { ChatComponent } from './chat/chat.component'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  feed_tabs:Array<any> = [
    {id: 'A', name: 'Unread', icon: 'markunread_mailbox'},
    {id: 'D', name: 'Direct Messages', icon: 'message'},
    {id: 'P', name: 'Primary Feeds', icon: 'receipt'},
    {id: 'S', name: 'Secondary Feeds', icon: 'dns'},
    {id: 'M', name: 'Mention Feeds', icon: 'assignment_ind'},
    {id: 'W', name: 'Pinned Feeds', icon: 'bookmark'},
  ]
  call_in_progress:Boolean = false
  block_ui:Boolean = false

  current_user:User
  personalSetting:PersonalSetting

  newMsgNotice:Boolean= false
  selectedtab:string = "feeds"

  feedStats:FeedStats
  feeds:Array<Feed>

  current_page:number = 1
  feed_tab:string
  feed_tab_name:string


  chat_query:string = ""
  chat_me:Colleague
  chats:Array<ChatObj> = []
  current_chat_index:number = -1

  constructor(private router: Router,
              private feedService: FeedService,
              private websocketService: WebsocketService,
              private colleagueService: ColleagueService) { }

  ngOnInit() {
    this.feed_tab = this.feed_tabs[0].id
    this.feed_tab_name = this.feed_tabs[0].name
    this.personalSetting = new PersonalSetting()
    this.current_user = User.current_user()
    this.chat_me = this.user_to_colleague(this.current_user)
    this.connect_to_socket()
    this.load_all()
  }

  logout(){
    User.logout()
    this.router.navigate(['/']);
  }

  load_all() {
    this.selectedtab = 'feeds'
    this.current_page = 1
    this.call_in_progress = false
    this.load_feeds()
    this.call_in_progress = false
    this.chats = ChatObj.get_pinned_chats()
  }

  connect_to_socket(){
    let that = this
    this.websocketService.connect()
    .subscribe(
      message => {
        Logger.log("Socket Data recieved...", message);
        if(message.command=='CONNECT_AGAIN'){
          this.connect_to_socket()
        }
        if(message.feedMessage){
          this.newMsgNotice = true
          that.websocketService.notify('New Message recieved', message.feedMessage.notification[0]._, function(){
            that.select_feeds_tab('A')
          })
        }
        if(message.message && message.message.$.type=='chat' && message.message.body){
          this.process_socket_chat(message.message)
        }
      },
      error => {
        Logger.log("Socket Error recieved...", error)
      }
    )
  }

  load_feeds() {
    if(this.call_in_progress)
      return
    this.call_in_progress = true
    this.feedService.get_all_feeds(this.current_page, this.feed_tab)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
        this.call_in_progress = false
        this.personalSetting.comments_order = response.comments_order
        this.feedStats = response.unread_counts
        this.append_feeds(response.feeds)
        this.block_ui = false
      },
      error => {
        Logger.log("Error recieved...", error)
        this.call_in_progress = false
        this.block_ui = false
      }
    );
  }

  load_dms() {
    if(this.call_in_progress)
      return
    this.call_in_progress = true
    this.feedService.get_dms(this.current_page)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
        this.call_in_progress = false
        this.personalSetting.comments_order = response.comments_order
        this.feedStats = response.unread_counts
        this.append_feeds(response.feeds)
        this.block_ui = false
      },
      error => {
        Logger.log("Error recieved...", error)
        this.call_in_progress = false
        this.block_ui = false
      }
    );
  }

  load_more_feeds() {
    if(this.feed_tab=='D'){
      this.load_dms()
    }else{
      this.load_feeds()
    }
  }

  append_feeds(feeds) {
    if(this.current_page==1){
      this.feeds = feeds
    }else{
      for (let i = 0; i < feeds.length; i++) {
        this.feeds.push(feeds[i]);
      }
    }
    this.current_page++
  }

  select_feeds_tab(str:string){
    this.block_ui = true
    this.newMsgNotice = false
    this.selectedtab = 'feeds'
    this.feed_tab = str
    this.current_page = 1
    this.current_chat_index = -1
    if(this.feed_tab=='D'){
      this.load_dms()
    }else{
      this.load_feeds()
    }
  }

  handleMarkAsRead(feed:Feed){
    this.feedService.mark_as_read(feed.id)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
      },
      error => {
        Logger.log("Error recieved...", error)
      }
    );
  }
  handlePinFeed(feed:Feed){
    this.feedService.pin_feed(feed.id)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
      },
      error => {
        Logger.log("Error recieved...", error)
      }
    );
  }
  handleUnpinFeed(feed:Feed){
    this.feedService.unpin_feed(feed.id)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
      },
      error => {
        Logger.log("Error recieved...", error)
      }
    );
  }

  process_socket_chat(message:any){
    let that = this
    if(message.$.from==this.chat_me.id)
      return

    let newChatUser:Colleague = {
      id: message.$.from,
      name: message.mstag[0].$.userName,
      photo: message.mstag[0].$.userImage,
      conv_id: message.$.to
    } as Colleague

    let chat:ChatObj = this.add_chat_obj(newChatUser)

    let user_chat:UserChat = {
      from_user: chat.user,
      chat_body: message.body.toString()
    }
    this.append_user_chat(chat.user, user_chat, true)

    that.websocketService.notify(chat.user.name, user_chat.chat_body, function(){
      that.select_chat(chat)
    })
  }

  user_to_colleague(user:User):Colleague{
    let u = user as any
    u.email = user.email_id
    return u as Colleague
  }

  select_chat(chat:ChatObj){
    this.chat_query = ""
    let chat_index:number = this.get_chat_index(chat)
    if(this.current_chat_index==chat_index){
      this.block_ui = false
      this.selectedtab = 'chat'
    }else{
      this.block_ui = true
      this.current_chat_index = chat_index
      this.selectedtab = 'chat'
      if(chat.user.conv_id==null){
        this.colleagueService.create_chat(chat.user.id)
        .subscribe(
          response => {
            Logger.log("Data recieved...", response)
            this.chats[chat_index].user.conv_id = response.group_id
            this.pin_chat(chat)
            this.get_chat_history(chat_index)
          },
          error => {
            Logger.log("Error recieved...", error)
            this.block_ui = false
          }
        );
      }else{
        this.get_chat_history(chat_index)
      }
    }
  }

  load_colleagues() {
    if(this.call_in_progress || this.chat_query=="")
      return
    this.colleagueService.get_colleagues(1, this.chat_query)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
        for (let i = 0; i < response.users.length; i++) {
          if(response.users[i].id!=this.chat_me.id){
            let chat:ChatObj = this.add_chat_obj(response.users[i])
            if(this.get_chat_index(chat)==-1)
              this.chats.push(chat)
          }
        }
      },
      error => {
        Logger.log("Error recieved...", error)
      }
    );
  }

  get_chat_history(chat_index:number){
    let chat:ChatObj = this.chats[chat_index]
    this.colleagueService.get_chats(chat.user.conv_id, 1)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
        chat.user_chats = []
        for (let i = 0; i < response.messages.length; i++) {
          let user_chat:UserChat = {
            from_user: (response.messages[i].user_id==this.chat_me.id) ? this.chat_me : chat.user,
            chat_body: response.messages[i].message
          }
          chat.user_chats.push(user_chat)
        }
        this.chats[chat_index] = chat
        this.block_ui = false
      },
      error => {
        Logger.log("Error recieved...", error)
        this.block_ui = false
      }
    );
  }

  get_chat_obj(user:Colleague) : ChatObj{
    let chat:ChatObj = null
    for (let i = 0; i < this.chats.length; i++) {
      if(this.chats[i].user.id == user.id){
        chat = this.chats[i]
        break
      }
    }
    return chat
  }

  add_chat_obj(user:Colleague) : ChatObj{
    let chat:ChatObj = this.get_chat_obj(user)
    if(chat==null){
      if(user.id==this.current_user.id){
        user = this.chat_me
      }
      chat = {user: user, user_chats: [], unread: false, show: false}
    }
    return chat
  }

  append_user_chat(to:Colleague, user_chat:UserChat, unread:Boolean){
    let added:Boolean = false
    let chat:ChatObj
    for (let i = 0; i < this.chats.length; i++) {
      if(this.chats[i].user.id == to.id){
        this.chats[i].user_chats.push(user_chat)
        this.chats[i].unread = unread
        chat = this.chats[i]
        added = true
        break
      }
    }
    if(added==false){
      chat = this.add_chat_obj(user_chat.from_user)
      chat.user_chats.push(user_chat)
      this.chats.push(chat)
    }
    this.pin_chat(chat)
  }

  pin_chat(chat:ChatObj){
    let chat_index:number = this.get_chat_index(chat)
    this.chats[chat_index].show = true
    ChatObj.pin_chat(chat)
  }
  unpin_chat(chat:ChatObj){
    let chat_index:number = this.get_chat_index(chat)
    this.chats[chat_index].show = false
    ChatObj.unpin_chat(chat)
  }
  get_chat_index(chat:ChatObj):number{
    for (let i = 0; i < this.chats.length; i++) {
      if(this.chats[i].user.id==chat.user.id){
        return i
      }
    }
  }

  handleChatAdd(chat_body:string){
    let chat:ChatObj = this.chats[this.current_chat_index]
    this.websocketService.send_message(chat.user.conv_id, chat_body)
    let user_chat:UserChat = {
      from_user: this.chat_me,
      chat_body: chat_body
    }
    this.append_user_chat(chat.user, user_chat, false)
  }
  should_show_chat(uc:ChatObj):Boolean{
    if(uc.user.id==this.chat_me.id)
      return false
    if(this.chat_query && uc.show)
      return false
    if(!this.chat_query && !uc.show)
      return false
    return true
  }
}
