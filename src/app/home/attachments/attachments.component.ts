import { Component, OnInit, Input } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { Feed } from '../../models/feed'
import { User } from '../../models/user'
import { Comment } from '../../models/comment'

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  @Input() selectedtab:string;
  @Input() attachments: Array<any>;
  @Input() attachment_references: Array<any>;

  //If all are images
  //SB = SINGLE BIG
  //PS = PORTRAIT AND SMALL
  //LS = LANDSCAPE AND SMALL

  //If all are not image
  //LIST = A LIST OF SMALL ICONS

  layout:string = "LIST"
  images:Array<any> = []
  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    if(this.attachment_references==null)
      this.attachment_references = []
    if(this.attachments==null)
      this.attachments = []

    this.set_layout()
    this.get_images()
  }

  private get_images(){
    if(this.layout=="LIST"){
      for (let i = 0; i < this.attachment_references.length; i++) {
        this.images[this.images.length] = {name: this.attachment_references[i].filename,
                                           cols: 1,
                                           rows: 1,
                                           url: this.get_preview_url(this.attachment_references[i]),
                                           mlink: this.attachment_references[i].mlink}
      }
      for (let i = 0; i < this.attachments.length; i++) {
        this.images[this.images.length] = {name: this.attachments[i].filename,
                                           cols: 1,
                                           rows: 1,
                                           url: (this.is_image(this.attachments[i]) ? this.sign_preview_url(this.attachments[i].preview_url2) : this.attachments[i].preview_url),
                                           mlink: this.attachments[i].mlink}
      }
      if(this.images.length == 1 && this.is_image_from_name(this.images[0].name)){
        this.layout="SB"
      }
    }else if (this.layout=="LS"){
      for (let i = 0; i < this.attachments.length; i++) {
        let col = (i==0) ? 3 : 1
        let row = (i==0) ? 2 : 1
        this.images[this.images.length] = {name: this.attachments[i].filename,
                                           cols: col,
                                           rows: row,
                                           url: this.sign_preview_url(this.attachments[i].preview_url2),
                                           mlink: this.attachments[i].mlink}
      }
    }else if (this.layout=="PS"){
      for (let i = 0; i < this.attachments.length; i++) {
        let col = (i==0) ? 2 : 1
        let row = (i==0) ? 3 : 1
        this.images[this.images.length] = {name: this.attachments[i].filename,
                                           cols: col,
                                           rows: row,
                                           url: this.sign_preview_url(this.attachments[i].preview_url2),
                                           mlink: this.attachments[i].mlink}
      }
    }else if (this.layout=="SB"){
      for (let i = 0; i < this.attachments.length; i++) {
        let col = (i==0) ? 3 : 1
        let row = (i==0) ? 2 : 1
        this.images[this.images.length] = {name: this.attachments[i].filename,
                                           cols: col,
                                           rows: row,
                                           url: this.sign_preview_url(this.attachments[i].preview_url2),
                                           mlink: this.attachments[i].mlink}
      }
    }
  }

  private sign_preview_url(url): string{
    url = url.split('?')[0]
    return url + "?type=attachment&_felix_session_id="+User.current_user().session_id
  }

  private get_preview_url(item): string{
    //https://hub.mangoapps.com/f/1487d4?
    //https://hub.mangoapps.com/media/1487d4?filename=1500877657188_24-07-2017-11-56-59.png&sub_type=thumbnail_398&type=attachment
    if(this.is_image_from_name(item.filename))
      return this.sign_preview_url(item.short_url.replace('/f/', '/media/'))
    else
      return item.preview_url
  }

  private set_layout() {
    this.layout = "LIST"

    if(this.attachments.length == 0 && this.attachment_references.length == 0){
      this.layout = "LIST"
      return
    }

    if(this.attachment_references.length > 0){
      this.layout = "LIST"
      return
    }
    if(this.attachments.length == 1 && this.is_image(this.attachments[0])){
      this.layout = "SB"
      return
    }
    for (let i = 0; i < this.attachments.length; i++) {
        if(this.is_image(this.attachments[i])==false){
          this.layout = "LIST"
          return
        }
    }
    if(this.is_landscape(this.attachments[0])){
      this.layout = "LS"
    }else{
      this.layout = "PS"
    }
  }
  private is_image_from_name(name) :Boolean{
    if (["jpeg", "pjpeg", "gif", "png", "x-png", "jpg", "bmp"].indexOf(name.split('.')[1]) > -1)
      return true
    return false;
  }
  private is_image(item:any) : Boolean{
    if(["image/jpeg", "image/pjpeg", "image/gif", "image/png", "image/x-png", "image/jpg"].indexOf(item.content_type) > -1 || this.is_image_from_name(item.filename)){
      return true;
    }
    return false
  }
  private is_landscape(item:any) : Boolean{
    let wh = this.getWidthHeight(item.preview_url);
    if(wh[0] > wh[1])
      return true
    return false;
  }
  private getWidthHeight(src) {
    var width = 200;
    var height = 200;

    try{
      var widthMatch = src.match(/width=\d*/g);
      var heightMatch = src.match(/height=\d*/g);
      if(widthMatch && heightMatch){
        width = parseInt(widthMatch[0].replace('width=', ''));
        height = parseInt(heightMatch[0].replace('height=', ''));
        if(width == 0 || height == 0 || width == NaN || height == NaN) {
          width = 200;
          height = 200;
        }
      }
    }catch(err){
      width = 200;
      height = 200;
    }
    return [width, height];
  }

  open_mlink(mlink:string){
    this.electronService.shell.openExternal(User.signed_browser_url(mlink));
  }

}
