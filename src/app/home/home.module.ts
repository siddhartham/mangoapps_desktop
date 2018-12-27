import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdGridListModule, MdListModule, MdIconModule, MdToolbarModule, MdCardModule, MdButtonModule, MdInputModule, MdChipsModule, MdMenuModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { FeedItemComponent } from './feed-item/feed-item.component';
import { FeedService } from '../services/feed.service';
import { ReplyComponent } from './reply/reply.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { CommentsComponent } from './comments/comments.component';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { FeedBodyComponent } from './feed-body/feed-body.component';
import { KeepHtmlPipe } from '../pipes/keep-html.pipe';
import { MentionPipe } from '../pipes/mention.pipe';
import { OrderPipe } from '../pipes/order.pipe';
import { ChatComponent } from './chat/chat.component';
import { EpochPipe } from '../pipes/epoch.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MdGridListModule,
    MdListModule,
    MdIconModule,
    MdToolbarModule,
    MdCardModule,
    MdButtonModule,
    MdInputModule,
    MdChipsModule,
    MdMenuModule,
    HomeRoutingModule
  ],
  declarations: [HomeComponent, FeedItemComponent, ReplyComponent, AttachmentsComponent, CommentsComponent, TruncatePipe, FeedBodyComponent, KeepHtmlPipe, MentionPipe, OrderPipe, ChatComponent, EpochPipe],
  providers: [FeedService]
})
export class HomeModule { }
