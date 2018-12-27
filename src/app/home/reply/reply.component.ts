import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { User } from '../../models/user'
import { Feed } from '../../models/feed'
import { Comment } from '../../models/comment'

import { Logger } from '../../tools/logger'

import { FeedService } from '../../services/feed.service'

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.css']
})
export class ReplyComponent implements OnInit {
  @Output() commentAdd = new EventEmitter();
  @Input() feed: Feed
  comment_body:string
  constructor(private feedService:FeedService) { }

  ngOnInit() {
  }

  reply(){
    this.feedService.comment_on_feed(this.feed.id, this.comment_body)
    .subscribe(
      response => {
        Logger.log("Data recieved...", response)
        this.commentAdd.emit(response.comment as Comment);
        this.comment_body = ""
      },
      error => {
        Logger.log("Error recieved...", error)
      }
    );
  }

}
