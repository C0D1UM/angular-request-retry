///<reference path="_all.d.ts"/>

module AngularRequestRetry {
  import IPromise = angular.IPromise;
  "use strict";

  export interface IRequestConfig extends ng.IRequestConfig {
    timeout: ng.IPromise<any>
  }
  export interface IXhrFactory<T> extends ng.IXhrFactory<T> {
    (): T
  }

  export function RequestRetryService($log:ng.ILogService,
                                      $q:ng.IQService,
                                      $timeout:ng.ITimeoutService,
                                      $xhrFactory:IXhrFactory<XMLHttpRequest>) {

    /**
     * Make an http request and retry it numRetries times before failing hard.
     * @param {Object} config - HttpConfig-ish object
     * @param {string} config.method
     * @param {string} config.url
     * @param {FormData} config.data
     * @param {Object} config.headers
     * @param {Promise} config.timeout
     * @param {Number} [retries]
     * @returns {Promise}
     */
    this.http = (config:IRequestConfig, retries:number): IPromise<any> => {
      var deferred = $q.defer();

      var xhr = $xhrFactory();
      xhr.open(config.method, config.url);

      angular.forEach(config.headers, function (value, key) {
        xhr.setRequestHeader(key, value);
      });

      xhr.onerror = (err) => {
        $log.debug('Request error:', err, config);
        if (angular.isUndefined(retries)) {
          retries = NUM_RETRIES;
        }

        if (retries === 0) {
          $log.error('Given up trying.', config);
          deferred.reject(err);
        } else {
          var delay = 1000 * Math.pow(2, NUM_RETRIES - retries);  // exponential backoff, 1 second, then 2, then 4 ... etc
          deferred.resolve($timeout(() => {
            return this.http(config, --retries);
          }, delay));
        }
      };

      xhr.onload = (response) => {
        if (xhr.status != 200) {
          xhr.onerror(response);
        } else {
          deferred.resolve(response);
        }
      };

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          var loaded = event.loaded / event.total;
          deferred.notify(loaded);
        }
      };

      xhr.send(config.data);
      config.timeout.then(() => {
        xhr.abort();
        deferred.reject('Upload cancelled');
      });

      return deferred.promise;
    };
    return this;
  }
  RequestRetryService.$inject = ['$log', '$q', '$timeout', '$xhrFactory'];
}
