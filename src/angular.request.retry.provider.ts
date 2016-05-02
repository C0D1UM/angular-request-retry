///<reference path="_all.d.ts"/>

module AngularRequestRetry {
  "use strict";
  export class RequestRetryProvider implements ng.IServiceProvider {

    constructor () {
      this.$get.$inject = ['$log', '$q', '$timeout', '$xhrFactory'];
    }

    $inject: string[] = [];
    numRetries: number = 3;

    $get = ($log, $q, $timeout, $xhrFactory) => {
      return new RequestRetryService($log, $q, $timeout, $xhrFactory, this.numRetries);
    };
    setNumRetries = (value: number): void => {
      this.numRetries = value;
    }
  }
}
