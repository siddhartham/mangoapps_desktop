import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'mention',
  pure: false
})
export class MentionPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }
  transform(value: any, args: Array<any>): any {
    if(value!=null){
      for (let i = 0; i < args.length; i++) {
          let m = args[i]
          let re = new RegExp("@"+m.mention, "g")
          value = value.replace(re, "<md-chip>"+m.human_mention+"</md-chip>")
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
