import { Comment } from './comment'

export class Feed {
  id:number;

  body:string;
  mlink:string;
  is_system:string;
  is_edited:boolean;
  is_ack:boolean;

  feed_type:string;
  feed_status_type:string;
  category:string;

  full_details_mobile_url:string;

  group_id:string;
  group_name:string;
  group_privacy:string;
  group_sub_type:string;
  has_guest:boolean;

  like_count:number;
  superlike_count:number;
  haha_count:number;
  yay_count:number;
  wow_count:number;
  sad_count:number;

  comment_count:number;
  attachment_count:number;

  platform:string;

  liked:boolean;
  superliked:boolean;
  haha:boolean;
  yay:boolean;
  wow:boolean;
  sad:boolean;
  watched:boolean;
  unread:boolean;

  comments: Array<Comment>;

  mention_tags: Array<any>;
  attachments: Array<any>;
  attachment_references: Array<any>;
  liked_list: Array<any>;

  from_user: any;
  to_user: any;
  feed_property: any;

}
