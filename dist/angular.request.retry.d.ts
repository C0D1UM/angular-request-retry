/// <reference path="../src/_all.d.ts" />
declare module AngularRequestRetry {
    import IPromise = angular.IPromise;
    import IHttpPromise = angular.IHttpPromise;
    interface IRequestConfig extends ng.IRequestConfig {
        timeout: ng.IPromise<any>;
    }
    interface IXhrFactory<T> extends ng.IXhrFactory<T> {
        (): T;
    }
    interface IRequestRetryService {
        http<T>(config: IRequestConfig, retries?: number): IHttpPromise<T>;
    }
    class RequestRetryService implements IRequestRetryService {
        private $log;
        private $q;
        private $timeout;
        private $xhrFactory;
        private maxRetries;
        constructor($log: ng.ILogService, $q: ng.IQService, $timeout: ng.ITimeoutService, $xhrFactory: IXhrFactory<XMLHttpRequest>, maxRetries: number);
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
        http: (config: any, retries: any) => IPromise<{}>;
    }
}
declare module AngularRequestRetry {
    class RequestRetryProvider implements ng.IServiceProvider {
        constructor();
        $inject: string[];
        numRetries: number;
        $get: ($log: any, $q: any, $timeout: any, $xhrFactory: any) => RequestRetryService;
        setNumRetries: (value: number) => void;
    }
}
declare module AngularRequestRetry {
}
