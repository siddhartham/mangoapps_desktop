import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ElectronService } from 'ngx-electron';

import { User } from '../../models/user'
import { Feed } from '../../models/feed'
import { PersonalSetting } from '../../models/personal-setting'
import { Comment } from '../../models/comment'

import { AttachmentsComponent } from '../attachments/attachments.component'
import { CommentsComponent } from '../comments/comments.component'
import { ReplyComponent } from '../reply/reply.component'

@Component({
  selector: 'app-feed-item',
  templateUrl: './feed-item.component.html',
  styleUrls: ['./feed-item.component.css']
})
export class FeedItemComponent implements OnInit {
  @Output() markAsRead = new EventEmitter();
  @Output() pinFeed = new EventEmitter();
  @Output() unpinFeed = new EventEmitter();
  @Input() feed: Feed
  @Input() selectedtab:string
  @Input() selectedFeedTab:string
  @Input() personalSetting:PersonalSetting
  pin_icon = 'bookmark_border'
  is_expanded:boolean = false
  has_comments:boolean = false
  main_head:string
  sub_head:string
  last_comment:Comment
  body:string
  from_user:any
  mention_tags:Array<any>
  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    this.change_view()
  }

  feed_type() : string{
    if(this.feed.feed_type=="LST" && this.feed.category==null){
      return "Direct Message"
    }else{
      return "Feed"
    }
  }

  change_view(){
    if(this.feed.watched){
      this.pin_icon = 'bookmark'
    }
    if(this.feed.comments.length > 0)
      this.has_comments = true

    if(this.is_expanded || !this.has_comments){
      this.from_user = this.feed.from_user
      this.body = this.feed.body
      this.mention_tags = this.feed.mention_tags

      this.main_head = this.feed.from_user.name
      this.sub_head = "created a "+this.feed_type()
      if(this.feed.group_id != null)
        this.sub_head = "in " + this.feed.group_name

    }

    if(!this.is_expanded && this.has_comments){
      this.last_comment = this.feed.comments[0]
      if(this.personalSetting.comments_order == 'NTO')
        this.last_comment = this.feed.comments[this.feed.comments.length-1]

      if(this.last_comment.children!=null && this.last_comment.children.length > 0){
        this.last_comment = (this.personalSetting.comments_order == 'NTO') ? this.last_comment.children[this.last_comment.children.length - 1] : this.last_comment.children[0]
      }

      this.from_user = this.last_comment.user
      this.body = this.last_comment.body
      this.mention_tags = this.last_comment.mention_tags

      this.main_head = this.from_user.name + " commented on a "+this.feed_type()
      if(this.feed.group_id != null)
        this.main_head = this.main_head + " in " + this.feed.group_name

      this.sub_head = 'by '+ this.feed.from_user.name
    }
  }
  handleCommentAdd(comment:Comment){
    if(this.personalSetting.comments_order == 'NTO'){
      this.feed.comments.push(comment)
    }else{
      this.feed.comments.unshift(comment)
    }
    this.is_expanded = true
  }

  toggle_item(){
    this.is_expanded = !this.is_expanded
    this.change_view()
  }

  open_mlink(){
    this.electronService.shell.openExternal(User.signed_browser_url(this.feed.mlink));
  }

  mark_as_read(){
    this.markAsRead.emit(this.feed)
    this.feed.unread = false
    if(this.selectedFeedTab=='A')
      this.feed = null
  }

  pin_toggle_feed(){
    this.feed.watched = !this.feed.watched
    if(this.feed.watched){
      this.pin_icon = 'bookmark'
      this.pinFeed.emit(this.feed)
    }else{
      this.pin_icon = 'bookmark_border'
      this.unpinFeed.emit(this.feed)
    }
  }

}
