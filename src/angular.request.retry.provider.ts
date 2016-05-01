///<reference path="_all.d.ts"/>

module AngularRequestRetry {
  "use strict";
  export var NUM_RETRIES:number = 3;

  export class RequestRetryProvider implements ng.IServiceProvider {
    constructor() {
    }

    $inject = [];

    $get = RequestRetryService;
    setNumRetries = (value:number):void => {
      NUM_RETRIES = value;
    }
  }
}
