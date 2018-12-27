import { Component, OnInit, Input } from '@angular/core';

import { Feed } from '../../models/feed'

@Component({
  selector: 'app-feed-body',
  templateUrl: './feed-body.component.html',
  styleUrls: ['./feed-body.component.css']
})
export class FeedBodyComponent implements OnInit {
  @Input() feed: Feed
  body_type:string = 'N'
  external_properties:Array<any> = []
  body:string = ""
  constructor() { }

  ngOnInit() {
    this.body = this.feed.body
    if(this.feed.feed_property!=null && this.feed.feed_property.external_properties!=null){
      this.body_type = 'I'
      this.external_properties = [];
      for (var key in this.feed.feed_property.external_properties) {
        this.external_properties.push([key.split("_").join(" "), this.feed.feed_property.external_properties[key]]);
      }
    }else if(this.feed.feed_property!=null){
      this.body_type = 'P'
      if(this.feed.feed_property.stripped_description!=null)
        this.body = this.feed.feed_property.stripped_description.replace(/\\n\\n/g, "\n")
    }
  }

}
