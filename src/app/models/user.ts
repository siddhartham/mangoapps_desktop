export class User {
  id:number;

  name:string;
  email_id:string;
  user_type:string;
  user_mention:string;
  human_mention:string;
  time_zone:string;
  photo:string;

  presence_string:string;

  socket_uri:string;
  http_uri:string;
  push_url:string;
  push_secondary_url:string;

  session_id:string;
  session_hash:string;

  //Get the current_user store in local
  static current_user() : User{
    let user:any = localStorage.getItem('current_user')
    if(user == null){
      return null;
    }
    return (JSON.parse(user) as User)
  }

  static is_logged_in() : boolean {
    return User.current_user() ? true : false
  }

  //Set the user as current_user
  static login(user:User, domain:string){
    localStorage.setItem('current_domain', domain)
    localStorage.setItem('current_user', JSON.stringify(user))
  }
  //Remove the user as current_user
  static logout(){
    localStorage.removeItem('current_user')
    localStorage.removeItem('pinned_chats')
  }

  static sign_url(url): string {
      var _current_user = User.current_user();
      return url + "&_token="+_current_user.session_id+"&_secret="+_current_user.session_hash+"&_user_id="+_current_user.id
  }

  static signed_browser_url(url): string {
      var _current_user = User.current_user();
      return url + "?request_token="+_current_user.session_id
  }

}
