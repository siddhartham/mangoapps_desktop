export class Comment {
  id:number;
  feed_id:number;

  body:string;
  posted_to_zendesk:string;
  like_count:number;
  comment_type:string;



  platform:string;
  is_edited:boolean;
  is_system:boolean;
  zendesk_author_image:string;

  created_at:string;
  updated_at:string;

  from_user: any;
  user: any;

  mention_tags: Array<any>;
  attachments: Array<any>;
  attachment_references: Array<any>;
  children: Array<Comment>;
}
