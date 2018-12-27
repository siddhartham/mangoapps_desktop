import { Colleague } from './colleague'
import { UserChat } from './user_chat'
export class ChatObj {
  user: Colleague;
  user_chats: Array<UserChat>;
  unread: Boolean;
  show: Boolean;

  static pin_chat(chat:ChatObj){
    let index:number = -1
    chat.show = true
    let chats:Array<ChatObj> = ChatObj.get_pinned_chats()
    for (let i = 0; i < chats.length; i++) {
      if(chats[i].user.id==chat.user.id){
        index = i
        chats[i] = chat
        break
      }
    }
    if(index==-1){
      chats.push(chat)
    }
    localStorage.setItem('pinned_chats', JSON.stringify(chats))
  }

  static unpin_chat(chat:ChatObj){
    let index:number = -1
    chat.show = false
    let chats:Array<ChatObj> = ChatObj.get_pinned_chats()
    let tmp:Array<ChatObj> = []
    for (let i = 0; i < chats.length; i++) {
      if(chats[i].user.id==chat.user.id){
        index = i
      }else{
        tmp.push(chats[i])
      }
    }
    localStorage.setItem('pinned_chats', JSON.stringify(tmp))
  }

  static get_pinned_chats() : Array<ChatObj>{
    let chats:Array<ChatObj> = []
    let tmp:any = localStorage.getItem('pinned_chats')
    if(tmp == null){
      localStorage.setItem('pinned_chats', JSON.stringify(chats))
    }else{
      chats = JSON.parse(tmp)
    }
    return chats
  }
}
