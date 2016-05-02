///<reference path="_all.d.ts"/>
var AngularRequestRetry;
(function (AngularRequestRetry) {
    "use strict";
    var RequestRetryService = (function () {
        function RequestRetryService($log, $q, $timeout, $xhrFactory, maxRetries) {
            var _this = this;
            this.$log = $log;
            this.$q = $q;
            this.$timeout = $timeout;
            this.$xhrFactory = $xhrFactory;
            this.maxRetries = maxRetries;
            /**
             * Make an http request and retry it maxRetries times before failing hard.
             * @param {Object} config - HttpConfig-ish object
             * @param {string} config.method
             * @param {string} config.url
             * @param {FormData} config.data
             * @param {Object} config.headers
             * @param {Promise} config.timeout
             * @param {Number} [retries]
             * @returns {Promise}
             */
            this.http = function (config, retries) {
                var deferred = _this.$q.defer();
                var xhr = _this.$xhrFactory();
                xhr.open(config.method, config.url);
                angular.forEach(config.headers, function (value, key) {
                    xhr.setRequestHeader(key, value);
                });
                xhr.onerror = function (err) {
                    _this.$log.debug('Request error:', err, config);
                    if (angular.isUndefined(retries)) {
                        retries = _this.maxRetries;
                    }
                    if (retries === 0) {
                        _this.$log.error('Given up trying.', config);
                        deferred.reject(err);
                    }
                    else {
                        var delay = 1000 * Math.pow(2, _this.maxRetries - retries); // exponential backoff, 1 second, then 2, then 4 ... etc
                        deferred.resolve(_this.$timeout(function () {
                            return _this.http(config, --retries);
                        }, delay));
                    }
                };
                xhr.onload = function (response) {
                    if (xhr.status != 200) {
                        xhr.onerror(response);
                    }
                    else {
                        deferred.resolve(response);
                    }
                };
                xhr.upload.onprogress = function (event) {
                    if (event.lengthComputable) {
                        var loaded = event.loaded / event.total;
                        deferred.notify(loaded);
                    }
                };
                xhr.send(config.data);
                config.timeout.then(function () {
                    xhr.abort();
                    deferred.reject('Request cancelled');
                });
                return deferred.promise;
            };
        }
        return RequestRetryService;
    })();
    AngularRequestRetry.RequestRetryService = RequestRetryService;
})(AngularRequestRetry || (AngularRequestRetry = {}));
///<reference path="_all.d.ts"/>
var AngularRequestRetry;
(function (AngularRequestRetry) {
    "use strict";
    var RequestRetryProvider = (function () {
        function RequestRetryProvider() {
            var _this = this;
            this.$inject = [];
            this.numRetries = 3;
            this.$get = function ($log, $q, $timeout, $xhrFactory) {
                return new AngularRequestRetry.RequestRetryService($log, $q, $timeout, $xhrFactory, _this.numRetries);
            };
            this.setNumRetries = function (value) {
                _this.numRetries = value;
            };
            this.$get.$inject = ['$log', '$q', '$timeout', '$xhrFactory'];
        }
        return RequestRetryProvider;
    })();
    AngularRequestRetry.RequestRetryProvider = RequestRetryProvider;
})(AngularRequestRetry || (AngularRequestRetry = {}));
///<reference path="_all.d.ts"/>
var AngularRequestRetry;
(function (AngularRequestRetry) {
    "use strict";
    angular.module('angular-request-retry', [])
        .provider('RequestRetryService', AngularRequestRetry.RequestRetryProvider);
})(AngularRequestRetry || (AngularRequestRetry = {}));
//# sourceMappingURL=angular.request.retry.js.map