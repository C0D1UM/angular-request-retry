///<reference path="_all.d.ts"/>

module AngularRequestRetry {
  "use strict";
  export var NUM_RETRIES:number = 3;

  export class RequestRetryProvider implements ng.IServiceProvider {

    $inject: string[] = [];

    $get = _getter;
    setNumRetries = (value: number): void => {
      NUM_RETRIES = value;
    }
  }
  export function _getter ($log, $q, $timeout, $xhrFactory) {
    return new RequestRetryService($log, $q, $timeout, $xhrFactory);
  }
  _getter.$inject = ['$log', '$q', '$timeout', '$xhrFactory'];
}
