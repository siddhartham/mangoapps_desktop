import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'epoch'
})
export class EpochPipe implements PipeTransform {

  transform(utcSeconds: any, args?: any): any {
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(utcSeconds);
    return d;
  }

}
