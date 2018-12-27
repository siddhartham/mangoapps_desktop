import { Component, OnInit, Input } from '@angular/core';

import { Feed } from '../../models/feed'
import { Comment } from '../../models/comment'

import { AttachmentsComponent } from '../attachments/attachments.component'
import { ReplyComponent } from '../reply/reply.component'

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() comments: Array<Comment>;
  @Input() selectedtab:string;
  constructor() { }

  ngOnInit() {

  }

}
