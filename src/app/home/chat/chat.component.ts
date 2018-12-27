import { Component, OnInit, Input, Output, EventEmitter, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { User } from '../../models/user'
import { ChatObj } from '../../models/chat_obj'
import { UserChat } from '../../models/user_chat'
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input() me:any
  @Input() chat:ChatObj
  @Output() chatAdd = new EventEmitter();
  chat_body:string
  constructor() { }

  ngOnInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
      this.scrollToBottom();
  }

  scrollToBottom(): void {
      try {
          this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
  }

  send_chat(){
    this.chatAdd.emit(this.chat_body);
    this.chat_body = ""
  }
}
