///<reference path="_all.d.ts"/>

module AngularRequestRetry {
  "use strict";
  angular.module('angular-request-retry', [])
    .provider('RequestRetryService', RequestRetryProvider);
}
