(function () {
  'use strict';

  describe('Retrying HTTP request service', function () {
    var testService;
    var xhr;
    var $rootScope;
    var $timeout;
    var mockConfig;

    beforeEach(module('angular-request-retry'));
    beforeEach(module(function ($provide) {
      xhr = jasmine.createSpyObj(['open', 'setRequestHeader', 'send']);
      xhr.upload = jasmine.createSpyObj(['onprogress']);
      $provide.factory('$xhrFactory', function () {
        return function fakeRequestObject() {
          return xhr;
        }
      });
    }));

    beforeEach(inject(function (RequestRetryService, $q, _$rootScope_, _$timeout_) {
      testService = RequestRetryService;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
      mockConfig = {
        method: 'PUT',
        url: 'http://testserver.com/test/',
        timeout: $q.defer().promise
      };
    }));

    it('should make requests to the provided url', function () {
      testService.http(mockConfig);
      expect(xhr.open).toHaveBeenCalledWith(mockConfig.method, mockConfig.url);
    });

    it('should retry on error after a short delay', function () {
      testService.http(mockConfig);
      expect(xhr.send).toHaveBeenCalledTimes(1);
      xhr.onerror();
      $timeout.flush();
      expect(xhr.send).toHaveBeenCalledTimes(2);
    });

    it('should notify the caller on progress', function () {
      var notifyFn = jasmine.createSpy();
      testService.http(mockConfig)
        .then(null, null, notifyFn);

      expect(xhr.send).toHaveBeenCalledTimes(1);
      var fakeProgress = {lengthComputable: true, loaded: 500, total: 1000};
      xhr.upload.onprogress(fakeProgress);
      $rootScope.$apply();
      expect(notifyFn).toHaveBeenCalledWith(0.5);
    });

    it('should give up trying and reject after 3 failures', function () {
      var errorFn = jasmine.createSpy();
      var successFn = jasmine.createSpy();
      testService.http(mockConfig)
        .then(successFn)
        .catch(errorFn);

      expect(xhr.send).toHaveBeenCalledTimes(1);
      spyOn(testService, 'http').and.callThrough();
      // First failure
      xhr.onerror();
      $rootScope.$apply();
      $timeout.flush();
      expect(testService.http).toHaveBeenCalledTimes(1);
      expect(testService.http).toHaveBeenCalledWith(mockConfig, 2);
      expect(xhr.send).toHaveBeenCalledTimes(2);

      // Second and third failures;
      xhr.onerror();
      $rootScope.$apply();
      $timeout.flush();
      expect(testService.http).toHaveBeenCalledTimes(2);
      expect(testService.http).toHaveBeenCalledWith(mockConfig, 1);

      xhr.onerror();
      $rootScope.$apply();
      $timeout.flush();
      expect(testService.http).toHaveBeenCalledTimes(3);
      expect(testService.http).toHaveBeenCalledWith(mockConfig, 0);
      expect(xhr.send).toHaveBeenCalledTimes(4);
      expect(errorFn).not.toHaveBeenCalled();

      testService.http.calls.reset();
      // 4th failure, no 4th retry queued up, angular-file-upload notified of error
      xhr.onerror();
      $rootScope.$apply();
      $timeout.flush();
      expect(testService.http).not.toHaveBeenCalled();
      expect(xhr.send).toHaveBeenCalledTimes(4);

      expect(successFn).not.toHaveBeenCalled();
      expect(errorFn).toHaveBeenCalled();

    });
  });
})();
