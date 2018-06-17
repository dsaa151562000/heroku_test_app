/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.1.0
Copyright © 2018 Basecamp, LLC
 */

(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,e){return Turbolinks.controller.visit(t,e)},clearCache:function(){return Turbolinks.controller.clearCache()},setProgressBarDelay:function(t){return Turbolinks.controller.setProgressBarDelay(t)}}}).call(this),function(){var t,e,r,n=[].slice;Turbolinks.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},Turbolinks.closest=function(e,r){return t.call(e,r)},t=function(){var t,r;return t=document.documentElement,null!=(r=t.closest)?r:function(t){var r;for(r=this;r;){if(r.nodeType===Node.ELEMENT_NODE&&e.call(r,t))return r;r=r.parentNode}}}(),Turbolinks.defer=function(t){return setTimeout(t,1)},Turbolinks.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},Turbolinks.dispatch=function(t,e){var n,o,i,s,a,u;return a=null!=e?e:{},u=a.target,n=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,n===!0),i.data=null!=o?o:{},i.cancelable&&!r&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},r=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),Turbolinks.match=function(t,r){return e.call(t,r)},e=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),Turbolinks.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}.call(this),function(){Turbolinks.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.HttpRequest=function(){function e(e,r,n){this.delegate=e,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=Turbolinks.Location.wrap(r).requestURL,this.referrer=Turbolinks.Location.wrap(n).absoluteURL,this.createXHR()}return e.NETWORK_FAILURE=0,e.TIMEOUT_FAILURE=-1,e.timeout=60,e.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},e.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},e.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},e.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},e.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},e.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},e.prototype.requestCanceled=function(){return this.endRequest()},e.prototype.notifyApplicationBeforeRequestStart=function(){return Turbolinks.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},e.prototype.notifyApplicationAfterRequestEnd=function(){return Turbolinks.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},e.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},e.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},e.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},e.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.BrowserAdapter=function(){function e(e){this.controller=e,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new Turbolinks.ProgressBar}var r,n,o;return o=Turbolinks.HttpRequest,r=o.NETWORK_FAILURE,n=o.TIMEOUT_FAILURE,e.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},e.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},e.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},e.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},e.prototype.visitRequestCompleted=function(t){return t.loadResponse()},e.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case r:case n:return this.reload();default:return t.loadResponse()}},e.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},e.prototype.visitCompleted=function(t){return t.followRedirect()},e.prototype.pageInvalidated=function(){return this.reload()},e.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},e.prototype.showProgressBar=function(){return this.progressBar.show()},e.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},e.prototype.reload=function(){return window.location.reload()},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.History=function(){function e(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},e.prototype.push=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("push",t,e)},e.prototype.replace=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("replace",t,e)},e.prototype.onPopState=function(t){var e,r,n,o;return this.shouldHandlePopState()&&(o=null!=(r=t.state)?r.turbolinks:void 0)?(e=Turbolinks.Location.wrap(window.location),n=o.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(e,n)):void 0},e.prototype.onPageLoad=function(t){return Turbolinks.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},e.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},e.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},e.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},e}()}.call(this),function(){Turbolinks.Snapshot=function(){function t(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return t.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},t.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},t.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},t.prototype.clone=function(){return new t({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},t.prototype.getRootLocation=function(){var t,e;return e=null!=(t=this.getSetting("root"))?t:"/",new Turbolinks.Location(e)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.body.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},t}()}.call(this),function(){var t=[].slice;Turbolinks.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){Turbolinks.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.SnapshotRenderer=function(e){function r(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=new Turbolinks.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new Turbolinks.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return t(r,e),r.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},r.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},r.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},r.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},r.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},r.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},r.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},r.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.assignNewBody=function(){return document.body=this.newBody},r.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},r.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},r.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},r.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},r.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},r.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},r.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},r.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},r.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},r}(Turbolinks.Renderer)}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.ErrorRenderer=function(e){function r(t){this.html=t}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(Turbolinks.Renderer)}.call(this),function(){Turbolinks.View=function(){function t(t){this.delegate=t,this.element=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return Turbolinks.Snapshot.fromElement(this.element)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,e,r){return Turbolinks.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),Turbolinks.Snapshot.wrap(t),e)},t.prototype.renderError=function(t,e){return Turbolinks.ErrorRenderer.render(this.delegate,e,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ScrollManager=function(){function e(e){this.delegate=e,this.onScroll=t(this.onScroll,this),this.onScroll=Turbolinks.throttle(this.onScroll)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},e.prototype.scrollToElement=function(t){return t.scrollIntoView()},e.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},e.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},e.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},e}()}.call(this),function(){Turbolinks.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var e;return t.prototype.has=function(t){var r;return r=e(t),r in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var r;return r=e(t),this.snapshots[r]},t.prototype.write=function(t,r){var n;return n=e(t),this.snapshots[n]=r},t.prototype.touch=function(t){var r,n;return n=e(t),r=this.keys.indexOf(n),r>-1&&this.keys.splice(r,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},e=function(t){return Turbolinks.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Visit=function(){function e(e,r,n){this.controller=e,this.action=n,this.performScroll=t(this.performScroll,this),this.identifier=Turbolinks.uuid(),this.location=Turbolinks.Location.wrap(r),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var r;return e.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},e.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},e.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},e.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},e.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=r(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},e.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new Turbolinks.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},e.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},e.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},e.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},e.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},e.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},e.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},e.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},e.prototype.requestCompletedWithResponse=function(t,e){return this.response=t,null!=e&&(this.redirectedToLocation=Turbolinks.Location.wrap(e)),this.adapter.visitRequestCompleted(this)},e.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},e.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},e.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},e.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},e.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},e.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},e.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},e.prototype.getTimingMetrics=function(){return Turbolinks.copyObject(this.timingMetrics)},r=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},e.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},e.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},e.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},e.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Controller=function(){function e(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new Turbolinks.History(this),this.view=new Turbolinks.View(this),this.scrollManager=new Turbolinks.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return e.prototype.start=function(){return Turbolinks.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},e.prototype.disable=function(){return this.enabled=!1},e.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},e.prototype.clearCache=function(){return this.cache=new Turbolinks.SnapshotCache(10)},e.prototype.visit=function(t,e){var r,n;return null==e&&(e={}),t=Turbolinks.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(r=null!=(n=e.action)?n:"advance",this.adapter.visitProposedToLocationWithAction(t,r)):window.location=t:void 0},e.prototype.startVisitToLocationWithAction=function(t,e,r){var n;return Turbolinks.supported?(n=this.getRestorationDataForIdentifier(r),this.startVisit(t,e,{restorationData:n})):window.location=t},e.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},e.prototype.startHistory=function(){return this.location=Turbolinks.Location.wrap(window.location),this.restorationIdentifier=Turbolinks.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.stopHistory=function(){return this.history.stop()},e.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},e.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,e){var r;return this.restorationIdentifier=e,this.enabled?(r=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:r,historyChanged:!0}),this.location=Turbolinks.Location.wrap(t)):this.adapter.pageInvalidated()},e.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},e.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},e.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},e.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},e.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},e.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},e.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},e.prototype.render=function(t,e){return this.view.render(t,e)},e.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},e.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},e.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},e.prototype.pageLoaded=function(){
return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},e.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},e.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},e.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},e.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},e.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,e){return Turbolinks.dispatch("turbolinks:click",{target:t,data:{url:e.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationBeforeVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationAfterVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},e.prototype.notifyApplicationBeforeCachingSnapshot=function(){return Turbolinks.dispatch("turbolinks:before-cache")},e.prototype.notifyApplicationBeforeRender=function(t){return Turbolinks.dispatch("turbolinks:before-render",{data:{newBody:t}})},e.prototype.notifyApplicationAfterRender=function(){return Turbolinks.dispatch("turbolinks:render")},e.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),Turbolinks.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},e.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},e.prototype.createVisit=function(t,e,r){var n,o,i,s,a;return o=null!=r?r:{},s=o.restorationIdentifier,i=o.restorationData,n=o.historyChanged,a=new Turbolinks.Visit(this,t,e),a.restorationIdentifier=null!=s?s:Turbolinks.uuid(),a.restorationData=Turbolinks.copyObject(i),a.historyChanged=n,a.referrer=this.location,a},e.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},e.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},e.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?Turbolinks.closest(t,"a[href]:not([target]):not([download])"):void 0},e.prototype.getVisitableLocationForLink=function(t){var e;return e=new Turbolinks.Location(t.getAttribute("href")),this.locationIsVisitable(e)?e:void 0},e.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},e.prototype.nodeIsVisitable=function(t){var e;return(e=Turbolinks.closest(t,"[data-turbolinks]"))?"false"!==e.getAttribute("data-turbolinks"):!0},e.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},e.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},e.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},e}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,e,r;Turbolinks.start=function(){return e()?(null==Turbolinks.controller&&(Turbolinks.controller=t()),Turbolinks.controller.start()):void 0},e=function(){return null==window.Turbolinks&&(window.Turbolinks=Turbolinks),r()},t=function(){var t;return t=new Turbolinks.Controller,t.adapter=new Turbolinks.BrowserAdapter(t),t},r=function(){return window.Turbolinks===Turbolinks},r()&&Turbolinks.start()}.call(this);
(function() {


}).call(this);
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
/*!
 * clipboard.js v1.5.2
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */

!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Clipboard=t()}}(function(){var t,e,n;return function t(e,n,r){function o(a,c){if(!n[a]){if(!e[a]){var s="function"==typeof require&&require;if(!c&&s)return s(a,!0);if(i)return i(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var l=n[a]={exports:{}};e[a][0].call(l.exports,function(t){var n=e[a][1][t];return o(n?n:t)},l,l.exports,t,e,n,r)}return n[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)o(r[a]);return o}({1:[function(t,e,n){var r=t("matches-selector");e.exports=function(t,e,n){for(var o=n?t:t.parentNode;o&&o!==document;){if(r(o,e))return o;o=o.parentNode}}},{"matches-selector":2}],2:[function(t,e,n){function r(t,e){if(i)return i.call(t,e);for(var n=t.parentNode.querySelectorAll(e),r=0;r<n.length;++r)if(n[r]==t)return!0;return!1}var o=Element.prototype,i=o.matchesSelector||o.webkitMatchesSelector||o.mozMatchesSelector||o.msMatchesSelector||o.oMatchesSelector;e.exports=r},{}],3:[function(t,e,n){function r(t,e,n,r){var i=o.apply(this,arguments);return t.addEventListener(n,i),{destroy:function(){t.removeEventListener(n,i)}}}function o(t,e,n,r){return function(n){var o=i(n.target,e,!0);o&&(Object.defineProperty(n,"target",{value:o}),r.call(t,n))}}var i=t("closest");e.exports=r},{closest:1}],4:[function(t,e,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.function=function(t){var e=Object.prototype.toString.call(t);return"[object Function]"===e}},{}],5:[function(t,e,n){function r(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!c.string(e))throw new TypeError("Second argument must be a String");if(!c.function(n))throw new TypeError("Third argument must be a Function");if(c.node(t))return o(t,e,n);if(c.nodeList(t))return i(t,e,n);if(c.string(t))return a(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function o(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function i(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function a(t,e,n){return s(document.body,t,e,n)}var c=t("./is"),s=t("delegate");e.exports=r},{"./is":4,delegate:3}],6:[function(t,e,n){function r(t){var e;if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName)t.select(),e=t.value;else{var n=window.getSelection(),r=document.createRange();r.selectNodeContents(t),n.removeAllRanges(),n.addRange(r),e=n.toString()}return e}e.exports=r},{}],7:[function(t,e,n){function r(){}r.prototype={on:function(t,e,n){var r=this.e||(this.e={});return(r[t]||(r[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function r(){o.off(t,r),e.apply(n,arguments)}var o=this;return r._=e,this.on(t,r,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),r=0,o=n.length;for(r;o>r;r++)n[r].fn.apply(n[r].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),r=n[t],o=[];if(r&&e)for(var i=0,a=r.length;a>i;i++)r[i].fn!==e&&r[i].fn._!==e&&o.push(r[i]);return o.length?n[t]=o:delete n[t],this}},e.exports=r},{}],8:[function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}n.__esModule=!0;var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=t("select"),c=r(a),s=function(){function t(e){o(this,t),this.resolveOptions(e),this.initSelection()}return t.prototype.resolveOptions=function t(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.action=e.action,this.emitter=e.emitter,this.target=e.target,this.text=e.text,this.trigger=e.trigger,this.selectedText=""},t.prototype.initSelection=function t(){if(this.text&&this.target)throw new Error('Multiple attributes declared, use either "target" or "text"');if(this.text)this.selectFake();else{if(!this.target)throw new Error('Missing required attributes, use either "target" or "text"');this.selectTarget()}},t.prototype.selectFake=function t(){var e=this;this.removeFake(),this.fakeHandler=document.body.addEventListener("click",function(){return e.removeFake()}),this.fakeElem=document.createElement("textarea"),this.fakeElem.style.position="absolute",this.fakeElem.style.left="-9999px",this.fakeElem.style.top=(window.pageYOffset||document.documentElement.scrollTop)+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,document.body.appendChild(this.fakeElem),this.selectedText=c.default(this.fakeElem),this.copyText()},t.prototype.removeFake=function t(){this.fakeHandler&&(document.body.removeEventListener("click"),this.fakeHandler=null),this.fakeElem&&(document.body.removeChild(this.fakeElem),this.fakeElem=null)},t.prototype.selectTarget=function t(){this.selectedText=c.default(this.target),this.copyText()},t.prototype.copyText=function t(){var e=void 0;try{e=document.execCommand(this.action)}catch(n){e=!1}this.handleResult(e)},t.prototype.handleResult=function t(e){e?this.emitter.emit("success",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)}):this.emitter.emit("error",{action:this.action,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})},t.prototype.clearSelection=function t(){this.target&&this.target.blur(),window.getSelection().removeAllRanges()},t.prototype.destroy=function t(){this.removeFake()},i(t,[{key:"action",set:function t(){var e=arguments.length<=0||void 0===arguments[0]?"copy":arguments[0];if(this._action=e,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function t(){return this._action}},{key:"target",set:function t(e){if(void 0!==e){if(!e||"object"!=typeof e||1!==e.nodeType)throw new Error('Invalid "target" value, use a valid Element');this._target=e}},get:function t(){return this._target}}]),t}();n.default=s,e.exports=n.default},{select:6}],9:[function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function a(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}n.__esModule=!0;var c=t("./clipboard-action"),s=r(c),u=t("tiny-emitter"),l=r(u),f=t("good-listener"),d=r(f),h=function(t){function e(n,r){o(this,e),t.call(this),this.resolveOptions(r),this.listenClick(n)}return i(e,t),e.prototype.resolveOptions=function t(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.action="function"==typeof e.action?e.action:this.defaultAction,this.target="function"==typeof e.target?e.target:this.defaultTarget,this.text="function"==typeof e.text?e.text:this.defaultText},e.prototype.listenClick=function t(e){var n=this;this.listener=d.default(e,"click",function(t){return n.onClick(t)})},e.prototype.onClick=function t(e){this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new s.default({action:this.action(e.target),target:this.target(e.target),text:this.text(e.target),trigger:e.target,emitter:this})},e.prototype.defaultAction=function t(e){return a("action",e)},e.prototype.defaultTarget=function t(e){var n=a("target",e);return n?document.querySelector(n):void 0},e.prototype.defaultText=function t(e){return a("text",e)},e.prototype.destroy=function t(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)},e}(l.default);n.default=h,e.exports=n.default},{"./clipboard-action":8,"good-listener":5,"tiny-emitter":7}]},{},[9])(9)});
(function() {


}).call(this);
/*! jquery.cookie v1.4.1 | MIT */

!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});
(function() {


}).call(this);
/*
 * DetectAdBlock 3.2.1
 * Copyright (c) 2015 Valentin Allaire <valentin.allaire@sitexw.fr>
 * Released under the MIT license
 * https://github.com/sitexw/DetectAdBlock
 */

!function(t){var e=function(e){this._options={checkOnLoad:!1,resetOnEnd:!1,loopCheckTime:50,loopMaxNumber:5,baitClass:"pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links",baitStyle:"width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;",debug:!1},this._var={version:"3.2.1",bait:null,checking:!1,loop:null,loopNumber:0,event:{detected:[],notDetected:[]}},void 0!==e&&this.setOption(e);var i=this,o=function(){setTimeout(function(){i._options.checkOnLoad===!0&&(i._options.debug===!0&&i._log("onload->eventCallback","A check loading is launched"),null===i._var.bait&&i._creatBait(),setTimeout(function(){i.check()},1))},1)};void 0!==t.addEventListener?t.addEventListener("load",o,!1):t.attachEvent("onload",o)};e.prototype._options=null,e.prototype._var=null,e.prototype._bait=null,e.prototype._log=function(t,e){console.log("[DetectAdBlock]["+t+"] "+e)},e.prototype.setOption=function(t,e){if(void 0!==e){var i=t;t={},t[i]=e}for(var o in t)this._options[o]=t[o],this._options.debug===!0&&this._log("setOption",'The option "'+o+'" he was assigned to "'+t[o]+'"');return this},e.prototype._creatBait=function(){var e=document.createElement("div");e.setAttribute("class",this._options.baitClass),e.setAttribute("style",this._options.baitStyle),this._var.bait=t.document.body.appendChild(e),this._var.bait.offsetParent,this._var.bait.offsetHeight,this._var.bait.offsetLeft,this._var.bait.offsetTop,this._var.bait.offsetWidth,this._var.bait.clientHeight,this._var.bait.clientWidth,this._options.debug===!0&&this._log("_creatBait","Bait has been created")},e.prototype._destroyBait=function(){t.document.body.removeChild(this._var.bait),this._var.bait=null,this._options.debug===!0&&this._log("_destroyBait","Bait has been removed")},e.prototype.check=function(t){if(void 0===t&&(t=!0),this._options.debug===!0&&this._log("check","An audit was requested "+(t===!0?"with a":"without")+" loop"),this._var.checking===!0)return this._options.debug===!0&&this._log("check","A check was canceled because there is already an ongoing"),!1;this._var.checking=!0,null===this._var.bait&&this._creatBait();var e=this;return this._var.loopNumber=0,t===!0&&(this._var.loop=setInterval(function(){e._checkBait(t)},this._options.loopCheckTime)),setTimeout(function(){e._checkBait(t)},1),this._options.debug===!0&&this._log("check","A check is in progress ..."),!0},e.prototype._checkBait=function(e){var i=!1;if(null===this._var.bait&&this._creatBait(),(null!==t.document.body.getAttribute("abp")||null===this._var.bait.offsetParent||0==this._var.bait.offsetHeight||0==this._var.bait.offsetLeft||0==this._var.bait.offsetTop||0==this._var.bait.offsetWidth||0==this._var.bait.clientHeight||0==this._var.bait.clientWidth)&&(i=!0),void 0!==t.getComputedStyle){var o=t.getComputedStyle(this._var.bait,null);!o||"none"!=o.getPropertyValue("display")&&"hidden"!=o.getPropertyValue("visibility")||(i=!0)}this._options.debug===!0&&this._log("_checkBait","A check ("+(this._var.loopNumber+1)+"/"+this._options.loopMaxNumber+" ~"+(1+this._var.loopNumber*this._options.loopCheckTime)+"ms) was conducted and detection is "+(i===!0?"positive":"negative")),e===!0&&(this._var.loopNumber++,this._var.loopNumber<this._options.loopMaxNumber||this._stopLoop()),i===!0?(this._stopLoop(),this._destroyBait(),this.emitEvent(!0),e===!0&&(this._var.checking=!1)):(null===this._var.loop||e===!1)&&(this._destroyBait(),this.emitEvent(!1),e===!0&&(this._var.checking=!1))},e.prototype._stopLoop=function(){clearInterval(this._var.loop),this._var.loop=null,this._var.loopNumber=0,this._options.debug===!0&&this._log("_stopLoop","A loop has been stopped")},e.prototype.emitEvent=function(t){this._options.debug===!0&&this._log("emitEvent","An event with a "+(t===!0?"positive":"negative")+" detection was called");var e=this._var.event[t===!0?"detected":"notDetected"];for(var i in e)this._options.debug===!0&&this._log("emitEvent","Call function "+(parseInt(i)+1)+"/"+e.length),e.hasOwnProperty(i)&&e[i]();return this._options.resetOnEnd===!0&&this.clearEvent(),this},e.prototype.clearEvent=function(){this._var.event.detected=[],this._var.event.notDetected=[],this._options.debug===!0&&this._log("clearEvent","The event list has been cleared")},e.prototype.on=function(t,e){return this._var.event[t===!0?"detected":"notDetected"].push(e),this._options.debug===!0&&this._log("on",'A type of event "'+(t===!0?"detected":"notDetected")+'" was added'),this},e.prototype.onDetected=function(t){return this.on(!0,t)},e.prototype.onNotDetected=function(t){return this.on(!1,t)},t.DetectAdBlock=e,void 0===t.detectAdBlock&&(t.detectAdBlock=new e({checkOnLoad:!0,resetOnEnd:!0}))}(window);

// namespace
window.semantic = {
  handler: {}
};

// Allow for console.log to not break IE
if (typeof window.console == "undefined" || typeof window.console.log == "undefined") {
  window.console = {
    log  : function() {},
    info : function(){},
    warn : function(){}
  };
}
if(typeof window.console.group == 'undefined' || typeof window.console.groupEnd == 'undefined' || typeof window.console.groupCollapsed == 'undefined') {
  window.console.group = function(){};
  window.console.groupEnd = function(){};
  window.console.groupCollapsed = function(){};
}
if(typeof window.console.markTimeline == 'undefined') {
  window.console.markTimeline = function(){};
}
window.console.clear = function(){};

// ready event
semantic.ready = function() {

  // selector cache
  var
    $document            = $(document),
    $sortableTables      = $('.sortable.table'),
    $sticky              = $('.ui.sticky'),
    $tocSticky           = $('.toc .ui.sticky'),

    $themeDropdown       = $('.theme.dropdown'),

    $ui                  = $('.ui').not('.hover, .down'),
    $swap                = $('.theme.menu .item'),
    $menu                = $('#toc'),
    $hideMenu            = $('#toc .hide.item'),
    $search              = $('#search'),
    $sortTable           = $('.sortable.table'),
    $demo                = $('.demo'),
    $begSegment          = $('.beg.segment'),

    $fullHeightContainer = $('.pusher > .full.height'),
    $container           = $('.main.container'),
    $allHeaders          = $('.main.container > h2, .main.container > .tab > h2, .main.container > .tab > .examples h2'),
    $sectionHeaders      = $container.children('h2'),
    $followMenu          = $container.find('.following.menu'),
    $sectionExample      = $container.find('.example'),
    $exampleHeaders      = $sectionExample.children('h4'),
    $footer              = $('.page > .footer'),

    $menuMusic           = $('.ui.main.menu .music.item'),
    $menuPopup           = $('.ui.main.menu .popup.item'),
    $pageDropdown        = $('.ui.main.menu .page.dropdown'),
    $pageTabs            = $('.masthead.tab.segment .tabs.menu .item'),

    $languageDropdown    = $('.language.dropdown'),
    $chineseModal        = $('.chinese.modal'),
    $languageModal       = $('.language.modal'),

    $downloadPopup       = $('.download.button'),
    $downloads           = $('.download.popup'),
    $downloadFramework   = $('.framework.column .button'),
    $downloadInput       = $('.download.popup input'),
    $downloadStandalone  = $('.standalone.column .button'),

    $helpPopup           = $('.header .help'),

    $example             = $('.example'),
    $popupExample        = $example.not('.no'),
    $shownExample        = $example.filter('.shown'),
    $prerenderedExample  = $example.has('.ui.checkbox, .ui.dropdown, .ui.search, .ui.progress, .ui.rating, .ui.dimmer, .ui.embed'),

    $visibilityExample   = $example.filter('.visiblity').find('.overlay, .demo.segment, .items img'),


    $sidebarButton       = $('.fixed.launch.button'),
    $code                = $('div.code').not('.existing'),
    $existingCode        = $('.existing.code'),

    expertiseLevel       = ($.cookie !== undefined)
      ? $.cookie('expertiseLevel') || 0
      : 0,
    languageDropdownUsed = false,

    metadata,

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    // alias
    handler
  ;


  // event handlers
  handler = {

    getMetadata: function() {
      $.api({
        debug : false,
        on    : 'now',
        url   : '/metadata.json',
        cache : 'local',
        onSuccess: function(response) {
          metadata = response;
        }
      });
    },

    showBeg: function() {
      if(window.localStorage !== undefined) {
        $begSegment
          .find('.delete.icon')
            .on('click', handler.hideBeg)
        ;
        if(!window.localStorage.getItem('begDismissed')) {
          $begSegment.transition('slide down');
        }
      }
    },

    hideBeg: function() {
      $begSegment.transition('slide down');
      if(window.localStorage !== undefined) {
        window.localStorage.setItem('begDismissed', true);
      }
    },

    createIcon: function() {
      $example
        .each(function(){
          var
            $insertPoint = $(this).is('.another')
              ? $(this).children().eq(0)
              : $(this).children().eq(1)
          ;
          $('<i/>')
            .addClass('fitted icon code')
            .insertBefore( $insertPoint )
          ;
        })
        .find('i.code')
          .on('click', handler.createCode)
      ;
    },

    shortcut: {
      modal: function() {
        var
          $modal = $('#shortcuts'),
          shortcutModalExists,
          shortcut,
          index
        ;
        if(!shortcutModalExists) {
          var
            html = '<div class="ui small modal" id="shortcuts">'
          ;
          html += '<div class="header">Keyboard Shortcuts</div>';
          html += '<div class="content">';
          html += '<table class="ui striped basic table">';
          for (index = 0; index < shortcuts.length; index++) {
            shortcut = shortcuts[index];
            html     += '<tr><td><b>' + shortcut.aka + '</b></td><td>' + shortcut.description + '</td></tr>';
          }
          html += '</table>';
          html += '<div class="actions"><div class="ui small teal button">OK</div></div>';
          html += '</div></div>';
          $('body').append(html);
          $modal = $('#shortcuts');
        }
        $('#shortcuts').modal('show');
      }
    },

    createWaypoints: function() {
      $sectionHeaders
        .visibility({
          observeChanges: false,
          once: false,
          offset: 50,
          onTopPassed: handler.activate.section,
          onTopPassedReverse: handler.activate.previous
        })
      ;

      $sectionExample
        .visibility({
          observeChanges: false,
          once: false,
          offset: 50,
          onTopPassed: handler.activate.example,
          onBottomPassedReverse: handler.activate.example
        })
      ;
      $footer
        .visibility({
          observeChanges: false,
          once: false,
          onBottomVisible: function(calculations) {
            var
              $title = $followMenu.find('> .item > .title').last()
            ;
            $followMenu
              .accordion('open', $title)
            ;
          }
        })
      ;
    },

    activate: {
      previous: function() {
        var
          $menuItems  = $followMenu.children('.item'),
          $section    = $menuItems.filter('.active'),
          index       = $menuItems.index($section)
        ;
        if($section.prev().length > 0) {
          $section
            .removeClass('active')
            .prev('.item')
            .addClass('active')
          ;
          $followMenu
            .accordion('open', index - 1)
          ;
        }
      },
      accordion: function() {
        var
          $section       = $(this),
          index          = $sectionHeaders.index($section),
          $followSection = $followMenu.children('.item'),
          $activeSection = $followSection.eq(index)
        ;
      },
      section: function() {
        var
          $section       = $(this),
          index          = $sectionHeaders.index($section),
          $followSection = $followMenu.children('.item'),
          $activeSection = $followSection.eq(index),
          isActive       = $activeSection.hasClass('active')
        ;
        if(!isActive) {
          $followSection.filter('.active')
            .removeClass('active')
          ;
          $activeSection
            .addClass('active')
          ;
          $followMenu
            .accordion('open', index)
          ;
        }
      },
      example: function() {
        var
          $section       = $(this).children('h4').eq(0),
          index          = $exampleHeaders.index($section),
          $followSection = $followMenu.find('.menu > .item'),
          $activeSection = $followSection.eq(index),
          inClosedTab    = ($(this).closest('.tab:not(.active)').length > 0),
          anotherExample = ($(this).filter('.another.example').length > 0),
          isActive       = $activeSection.hasClass('active')
        ;
        if(index !== -1 && !inClosedTab && !anotherExample && !isActive) {
          $followSection.filter('.active')
            .removeClass('active')
          ;
          $activeSection
            .addClass('active')
          ;
        }
      }
    },

    translatePage: function(languageCode, text, $choice) {
      languageDropdownUsed = true;
      if(window.Transifex !== undefined) {
        window.Transifex.live.translateTo(languageCode, true);
      }
    },

    showLanguageModal: function(languageCode) {
      var
        $choice = $languageDropdown.find('[data-value="' + languageCode + '"]').eq(0),
        percent = $choice.data('percent') || 0,
        text    = $choice.text()
      ;
      // dont trigger on translate event every page load
      if(languageDropdownUsed) {
        if(languageCode == 'zh' && window.location.host.replace('www.','') !== 'semantic-ui.cn') {
          $chineseModal
            .modal({
              closable: false
            })
            .modal('show')
          ;
        }
        else if(percent < 100) {
          languageDropdownUsed = false;
          $languageModal
            .modal()
            .find('.header .name')
              .html(text)
              .end()
            .find('.complete')
              .html(percent)
              .end()
          ;
          $languageModal
            .modal('show', function() {
              $('.language.modal .progress .bar').css('width', percent + '%');
            })
          ;
        }
      }
    },

    tryCreateMenu: function(event) {
      if($(window).width() > 640 && !$('body').hasClass('basic')) {
        if($container.length > 0 && $container.find('.following.menu').length === 0) {
          handler.createMenu();
          handler.createWaypoints();
          $(window).off('resize.menu');
        }
      }
    },

    createAnchors: function() {
      $allHeaders
        .each(function() {
          var
            $section = $(this),
            text     = handler.getText($section),
            safeName = handler.getSafeName(text),
            id       = window.escape(safeName),
            $anchor  = $('<a />').addClass('anchor').attr('id', id)
          ;
          $section
            .append($anchor)
          ;
        })
      ;
      $example
        .each(function() {
          var
            $title   = $(this).children('h4').eq(0),
            text     = handler.getText($title),
            safeName = handler.getSafeName(text),
            id       = window.escape(safeName),
            $anchor  = $('<a />').addClass('anchor').attr('id', id)
          ;
          if($title.length > 0) {
            $title.after($anchor);
          }
        })
      ;

    },

    getPageTitle: function() {
      return $.trim($('h1').eq(0).contents().filter(function() { return this.nodeType == 3; }).text().toLowerCase());
    },
    getSafeName: function(text) {
      return text.replace(/\s+/g, '-').replace(/[^-,'A-Za-z0-9]+/g, '').toLowerCase();
    },

    getText: function($element) {
      $element = ($element.find('a').not('.label, .anchor').length > 0)
        ? $element.find('a')
        : $element
      ;
      var
        $text = $element.contents().filter(function(){
          return this.nodeType == 3;
        })
      ;
      return ($text.length > 0)
        ? $text[0].nodeValue.trim()
        : $element.find('a').text().trim()
      ;
    },

    createMenu: function() {
      // grab each h3
      var
        html      = '',
        pageTitle = handler.getPageTitle(),
        title     = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1),
        $sticky,
        $rail
      ;
      $sectionHeaders
        .each(function(index) {
          var
            $currentHeader = $(this),
            $nextElements  = $currentHeader.nextUntil('h2'),
            $examples      = $nextElements.find('.example:not(.another)').addBack().filter('.example:not(.another)'),
            activeClass    = (index === 0)
              ? 'active '
              : '',
            text     = handler.getText($currentHeader),
            safeName = handler.getSafeName(text),
            id       = window.escape(safeName),
            $anchor  = $('<a />').addClass('anchor').attr('id', id)
          ;
          html += '<div class="item">';
          if($examples.length === 0) {
            html += '<a class="'+activeClass+'title" href="#'+ id +'"><b>' + $(this).text() + '</b></a>';
          }
          else {
            html += '<a class="'+activeClass+'title"><i class="dropdown icon"></i> <b>' + $(this).text() + '</b></a>';
          }
          if($examples.length > 0) {
            html += '<div class="'+activeClass+'content menu">';
            $examples
              .each(function() {
                var
                  $title   = $(this).children('h4').eq(0),
                  text     = handler.getText($title),
                  safeName = handler.getSafeName(text),
                  id       = window.escape(safeName),
                  $anchor  = $('<a />').addClass('anchor').attr('id', id)
                ;
                if($title.length > 0) {
                  html += '<a class="item" href="#'+id+'">' + text + '</a>';
                }
              })
            ;
            html += '</div>';
          }
          html += '</div>';
        })
      ;
      $followMenu = $('<div />')
        .addClass('ui vertical following fluid accordion text menu')
        .html(html)
      ;
      /* Advert
      var $advertisement = $('<div />')
        .addClass('advertisement')
        .html('<script type="text/javascript" src="//cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=semanticuicom" id="_carbonads_js"></script>')
      ;
      */
      $sticky = $('<div />')
        .addClass('ui sticky')
        .html($followMenu)
        //.prepend($advertisement)
        .prepend('<h4 class="ui header">' + title + '</h4>')
      ;
      $rail = $('<div />')
        .addClass('ui dividing right rail')
        .html($sticky)
        .prependTo($container)
      ;
      requestAnimationFrame(function() {
        $sticky.sticky({
          silent: true,
          context: $container,
          container: $('html'),
          offset: 30
        });
        $followMenu
          .accordion({
            exclusive: false,
            animateChildren: false,
            onChange: function() {
              $('.ui.sticky').sticky('refresh');
            }
          })
          .find('.menu a[href], .title[href]')
            .on('click', handler.scrollTo)
        ;
      });
    },

    scrollTo: function(event) {
      var
        id       = $(this).attr('href').replace('#', ''),
        $element = $('#' + id),
        position = $element.offset().top + 10
      ;
      $element
        .addClass('active')
      ;
      $('html, body')
        .animate({
          scrollTop: position
        }, 500)
      ;
      location.hash = '#' + id;
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    },

    less: {

      parseFile: function(content) {
        var
          variables = {},
          lines = content.match(/^\s*(@[\s|\S]+?;)/gm),
          name,
          value
        ;
        if(lines) {
          $.each(lines, function(index, line) {
            // clear whitespace
            line = $.trim(line);
            // match variables only
            if(line[0] == '@') {
              name = line.match(/^@(.+?):/);
              value = line.match(/:\s*([\s|\S]+?;)/);
              if( ($.isArray(name) && name.length >= 2) && ($.isArray(value) && value.length >= 2) ) {
                name = name[1];
                value = value[1];
                variables[name] = value;
              }
            }
          });
        }
        console.log(variables);
        return variables;
      },

      changeTheme: function(theme) {
        var
          $themeDropdown = $(this),
          element        = $themeDropdown.data('element'),
          urlData     = {
            theme   : typeof(theme === 'string')
              ? theme.toLowerCase()
              : theme,
            type    : $themeDropdown.data('type'),
            element : $themeDropdown.data('element')
          },
          variables = {
            theme: urlData.theme
          }
        ;
        variables[element] = urlData.theme;
        window.less.modifyVars(variables);

        $themeDropdown
          .api({
            on       : 'now',
            debug    : true,
            action   : 'getVariables',
            dataType : 'text',
            urlData  : urlData,
            onSuccess: function(content) {
              window.less.modifyVars( handler.less.parseFile(content) );
              $themeDropdown
                .api({
                  on       : 'now',
                  action   : 'getOverrides',
                  dataType : 'text',
                  urlData  : urlData,
                  onSuccess: function(content) {
                    if( $('style.override').length > 0 ) {
                      $('style.override').remove();
                    }
                    console.log(content);
                    $('<style>' + content + '</style>')
                      .addClass('override')
                      .appendTo('body')
                    ;
                    $sticky.sticky('refresh');
                  }
                })
              ;
            }
          })
        ;
      }

    },

    create: {
      examples: function(json) {
        var
          types      = json['Types'],
          text       = json['Text'],
          states     = json['States'],
          variations = json['Variations'],

          $element,
          html
        ;
        $.each(types, function(name, type){
          html += '<h2 class="ui dividing header">' + name + '</h2';
          if($.isPlainObject(type)) {
            $.each(type, function(name, subType) {
              $element = $.zc(subType);
              $element = handler.create.text($element, text);
              html += '<h3 class="ui header">' + name + '</h3';
              html += handler.create.variations($element, variations);
            });
          }
          else {
            $element = $.zc(type);
            $element = handler.create.text($element);
            html += handler.create.variations($element, variations);
          }
        });
        // Each TYPE
        //   show type name
        //   html = koan (html)
        //   each text
        //     find label
        //     if(obj)
        //       replace random text
        //     else
        //       replace text
        //   end
        //   Each variation
        //     (if obj)
        //       each
        //         add class
        //     (else)
        //       add class
        //     label = property
        //     class = class
        //     show html
        //   end
        // end
      },
      element: function(koan, type, text, variation) {

      },
      variations: function($element, variations) {
        $.each(variations, function(name, variation){

        });
      },
      text: function($element, text) {
        $.each(text, function(selector, text) {
          $element.find(selector).text(text);
        });
        return $element;
      }
    },

    openMusic: function() {
      var
        url       = 'http://stratus.soundcloud.com/player?links=https://soundcloud.com/into-the-light/sets/sui-2&popup=true',
        newWindow = window.open(url,'name','height=196,width=733')
      ;
      if(window.focus) {
        newWindow.focus();
      }
    },

    getIndent: function(text) {
      var
        lines           = text.split("\n"),
        firstLine       = (lines[0] === '')
          ? lines[1]
          : lines[0],
        spacesPerIndent = 2,
        leadingSpaces   = (firstLine !== undefined)
          ? firstLine.length - firstLine.replace(/^\s*/g, '').length
          : false,
        indent
      ;
      if(!leadingSpaces) {
        return ($pageTabs.length > 0)
          ? 6
          : 4
        ;
      }
      if(leadingSpaces !== 0) {
        indent = leadingSpaces;
      }
      else {
        // string has already been trimmed, get first indented line and subtract 2
        $.each(lines, function(index, line) {
          leadingSpaces = line.length - line.replace(/^\s*/g, '').length;
          if(leadingSpaces !== 0) {
            indent = leadingSpaces - spacesPerIndent;
            return false;
          }
        });
      }
      return indent || 4;
    },

    generateCode: function() {
      var
        $example    = $(this).closest('.example'),
        $annotation = $example.find('.annotation'),
        $code       = $annotation.find('.code'),
        $intro      = $example.children().not('.ignored, h4:first-child').filter('.ui, i:not(.code)').eq(0).prevAll(),
        $ignored    = $('i.code:last-child, .wireframe, .anchor, .code, .existing, .instructive, .language.label, .annotation, br, .ignore, .ignored'),
        $demo       = $example.children().not($intro).not($ignored),
        code        = ''
      ;
      if( $code.length === 0) {
        $demo
          .each(function() {
            var
              $this      = $(this).clone(false),
              $wireframe = $this.find('.wireframe').add($this.filter('.wireframe'))
            ;
            $wireframe
              .each(function() {
                var
                  src       = $(this).attr('src'),
                  image     = (src.search('image') !== -1),
                  paragraph = (src.search('paragraph') !== -1)
                ;
                if(paragraph) {
                  $(this).replaceWith('<p></p>');
                }
                else if(image) {
                  $(this).replaceWith('<img>');
                }
              })
            ;

            // remove wireframe images
            $this.find('.wireframe').remove();

            if($this.not('br').not('.wireframe')) {
              // allow inline styles only with this one class
              if($this.is('.my-container')) {
                code += $this.get(0).outerHTML + "\n";
              }
              else {
                code += $this.removeAttr('style').get(0).outerHTML + "\n";
              }
            }
          })
        ;
      }
      $example.data('code', code);
      return code;
    },

    copyCode: function() {
      $(this)
        .popup('change content', 'Copied to clipboard')
      ;
    },

    createCode: function() {
      var
        $example        = $(this).closest('.example'),
        $intro          = $example.children().not('.ignored, h4:first-child').filter('.ui, i:not(.code)').eq(0).prevAll(),
        $annotation     = $example.find('.annotation'),
        $code           = $annotation.find('.code'),
        $html           = $example.children('.html'),
        $ignoredContent = $('.ui.popup, i.code:last-child, .anchor, .code, .existing.segment, .instructive, .language.label, .annotation, .ignore, style, script, .ignored'),
        $demo           = $example.children().not($intro).not($ignoredContent),
        code            = $example.data('code') || $.proxy(handler.generateCode, this)(),
        $copyCode,
        $label
      ;

      // process existing code first
      if( $code.hasClass('existing') ) {
        $code.removeClass('existing');
        $.proxy(handler.initializeCode, $code)(true);
      }

      // create annotation wrapper
      if($annotation.length === 0) {
        $annotation = $('<div/>')
          .addClass('annotation')
          .hide()
          .insertAfter($demo.last())
        ;
      }

      if($html.length === 0) {
        $html     = $('<div class="html">').insertBefore($annotation);
        $label    = $('<div class="ui top attached label">').html('Example <i data-content="Copy code" class="copy link icon"></i>');
        $copyCode = $label.find('i.copy');
        $copyCode
          .on('click', handler.copyCode)
          .popup({
            variation    : 'inverted',
            distanceAway : 6
          })
        ;
        $label
          .prependTo($html)
        ;
        new Clipboard($copyCode.get(0), {
          text: function() {
            var
              code = $copyCode.closest('.example').data('code') || ''
            ;
            return handler.formatCode(code);
          }
        });
        if($demo.length === 0) {
          $html.addClass('empty');
        }
        else {
          $demo
            .detach()
            .prependTo($html)
          ;
        }
      }

      // create code inside annotation wrapper
      if( $example.find('.instructive').length === 0) {
        $code = $('<div/>')
          .data('type', 'html')
          .addClass('code')
          .html(code)
          .hide()
          .appendTo($annotation)
        ;
        $.proxy(handler.initializeCode, $code)(true);
      }
      if( $annotation.hasClass('visible') ) {
        $annotation.transition('hide');
        $html.removeClass('ui top attached segment');
      }
      else {
        $html.addClass('ui top attached segment');
        $intro.css('display', '');
        $annotation.transition('show');
      }
      setTimeout(function() {
        handler.refreshSticky();
      }, 400);
    },

    refreshSticky: function() {
      $sectionHeaders.visibility('refresh');
      $sectionExample.visibility('refresh');
      $('.ui.sticky').sticky('refresh');
      $footer.visibility('refresh');
      $visibilityExample.visibility('refresh');
    },

    createAnnotation: function() {
      if(!$(this).data('type')) {
        $(this).data('type', 'html');
      }
      $(this)
        .wrap('<div class="annotation">')
        .parent()
        .hide()
      ;
    },

    makeCode: function() {
      if(window.hljs !== undefined) {
        $code
          .filter(':visible')
          .each(handler.initializeCode)
        ;
        $existingCode
          .each(handler.createAnnotation)
        ;
      }
      else {
        console.log('Syntax highlighting not found');
      }
    },

    highlightClasses: function($code) {
      var
        $closestExample = $code.closest('.example'),
        $example        = ($closestExample.length === 0)
          ? $code.closest('.segment').prevAll('.example').not('.another').eq(0)
          : ($closestExample.hasClass('another'))
            ? $closestExample.prevAll('.example').not('.another').eq(0)
            : $closestExample,
        $header     = $example.find('h4').eq(0),
        $attributes = $code.find('.attribute, .class'),
        $tags       = $code.find('.title'),
        pageName    = handler.getPageTitle(),
        name        = handler.getText($header).toLowerCase(),
        classes     = $example.data('class') || '',
        tags        = $example.data('tag')  || false,
        useContent  = $example.data('use-content') || false
      ;
      // Add title
      if(name) {
        if(name == pageName) {
          name = 'ui ' + name;
        }
        classes = (classes === '')
          ? name
          : classes + ',' + name
        ;
      }
      // Add common variations
      classes = classes.replace('text alignment', "left aligned, right aligned, justified, center aligned");
      classes = classes.replace('floated', "right floated,left floated,floated");
      classes = classes.replace('floating', "right floated,left floated,floated");
      classes = classes.replace('horizontally aligned', "left aligned, center aligned, right aligned, justified");
      classes = classes.replace('vertically aligned', "top aligned, middle aligned, bottom aligned");
      classes = classes.replace('vertically attached', "attached");
      classes = classes.replace('horizontally attached', "attached");
      classes = classes.replace('padded', "very padded, padded");
      classes = classes.replace('relaxed', "very relaxed, relaxed");
      classes = classes.replace('attached', "left attached,right attached,top attached,bottom attached,attached");
      classes = classes.replace('wide', "one wide,two wide,three wide,four wide,five wide,six wide,seven wide,eight wide,nine wide,ten wide,eleven wide,twelve wide,thirteen wide,fourteen wide,fifteen wide,sixteen wide");
      classes = classes.replace('count', "one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve,thirteen,fourteen,fifteen,sixteen");
      classes = classes.replace('column count', "one column,two column,three column,four column,five column,six column,seven column,eight column,nine column,ten column,eleven column,twelve column,thirteen column,fourteen column,fifteen column,sixteen column");
      classes = classes.replace('evenly divided', "one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve,thirteen,fourteen,fifteen,sixteen");
      classes = classes.replace('size', "mini,tiny,small,medium,large,big,huge,massive");
      classes = classes.replace('emphasis', "primary,secondary,tertiary");
      classes = classes.replace('colored', "red,orange,yellow,olive,green,teal,blue,violet,purple,pink,brown,grey,black");
      classes = (classes !== '')
        ? classes.split(',')
        : []
      ;
      // highlight tags if asked
      if(tags) {
        tags = (tags !== '')
          ? tags.split(',')
          : []
        ;
        $tags.each(function() {
          var
            $tag    = $(this),
            tagHTML = $tag.html(),
            newHTML = false
          ;
          $.each(tags, function(index, tag) {
            if(tagHTML == tag) {
              newHTML = tagHTML.replace(tag, '<b>' + tag + '</b>');
            }
          });
          if(newHTML) {
            $tag
              .addClass('class')
              .html(newHTML)
            ;
          }
        });
      }
      // highlight classes
      $attributes.each(function() {
        var
          $attribute    = $(this),
          attributeHTML = $attribute.html(),
          $tag,
          $value,
          tagHTML,
          isUI,
          isPageElement,
          isOtherUI,
          isOtherIcon,
          classNames,
          classString,
          html,
          newHTML
        ;
        // only parse classes
        if(attributeHTML.search('class') === -1) {
          return true;
        }
        $value        = $attribute.next('.value, .string').eq(0);
        $tag          = $attribute.prev('.title').eq(0);
        tagHTML       = $tag.html();
        html          = $value.html();
        classNames    = html.replace(/\"/g, '').split(' ');

        isUI          = (html.search('ui') !== -1);
        isPageElement = (html.search(pageName) > 0);
        isOtherUI     = (!isPageElement && isUI);
        isOtherIcon   = (!isPageElement && tagHTML === 'i' && html.search('icon') !== -1);
        // check if any class match
        $.each(classes, function(index, string) {
          var
            className      = $.trim(string),
            isClassMatch   = (html.search(className) !== -1)
          ;
          if(className === '') {
            return true;
          }
          // class match on current page element (or content if allowed)
          if(isClassMatch && (isPageElement || useContent) ) {
            newHTML = html.replace(className, '<b title="Required Class">' + className + '</b>');
            return false;
          }
        });

        // generate links to other UI
        if(isOtherUI || isOtherIcon) {
          html           = newHTML || html;
          classString    = /^\"(.*)\"/g.exec(html);
          if(!classString || classString.length < 2) {
            return true;
          }
          classString = classString[1];
          $.each(classNames, function(index, string){
            var
              className = string.replace('"', '')
            ;
            // yep..
            if(className == 'item') {
              return;
            }
            if(metadata && metadata[className] && metadata[className].url) {
              // we found a match
              newHTML = html.replace(classString, '<a href="' + metadata[className].url + '">' + classString + '</a>');
            }
          });
        }

        if(newHTML) {
          $value
            .addClass('class')
            .html(newHTML)
          ;
        }
      });

    },

    formatCode: function(code) {
      var
        indent     = handler.getIndent(code) || 2,
        whiteSpace = new RegExp('\\n\\s{' + indent + '}', 'g')
      ;
      return $.trim(code).replace(whiteSpace, '\n');
    },

    initializeCode: function(codeSample) {
      var
        $code         = $(this).show(),
        $codeTag      = $('<code />'),
        codeSample    = codeSample || false,
        code          = $code.html(),
        existingCode  = $code.hasClass('existing'),
        evaluatedCode = $code.hasClass('evaluated'),
        contentType   = $code.data('type')     || 'html',
        title         = $code.data('title')    || false,
        less          = $code.data('less')     || false,
        demo          = $code.data('demo')     || false,
        eval          = $code.data('eval')     || false,
        preview       = $code.data('preview')  || false,
        label         = $code.data('label')    || false,
        preserve      = $code.data('preserve') || false,
        escape        = $code.data('escape') || false,
        displayType   = {
          html       : 'HTML',
          javascript : 'Javascript',
          css        : 'CSS',
          text       : 'Command Line',
          sh         : 'Command Line'
        },
        padding    = 20,
        name = (codeSample === true)
          ? 'instructive bottom attached'
          : 'existing',
        formattedCode = code,
        styledCode,
        $example,
        $label,
        codeHeight
      ;
      var entityMap = {
        "&amp;"  : "&",
        "&lt;"   : "<",
        "&gt;"   : ">",
        '&quot;' : '"',
        '&#39;'  : "'",
        '&#x2F;' : "/"
      };
      contentType = contentType.toLowerCase();

      function escapeHTML(string) {
        return $('<div>').html(string).text();
      }


      // escape html entities
      if(contentType != 'html' || escape) {
        code = escapeHTML(code);
      }

      // evaluate if specified
      if(evaluatedCode) {
        window.eval(code);
      }

      // should trim whitespace
      if(preserve) {
        formattedCode = code;
      }
      else {
        formattedCode = handler.formatCode(code);
      }

      // color code
      formattedCode = window.hljs.highlightAuto(formattedCode);

      // create <code> tag
      $codeTag
        .addClass($code.attr('class'))
        .addClass(formattedCode.language)
        .html(formattedCode.value)
      ;
      // replace <div> with <code>
      $code.replaceWith($codeTag);
      $code = $codeTag;
      $code
        .wrap('<div class="ui ' + name + ' segment"></div>')
        .wrap('<pre></pre>')
      ;

      if(contentType == 'html') {
        // add class emphasis to used classes
        handler.highlightClasses($code);
      }

      // add label
      if(title) {
        $('<div>')
          .addClass('ui attached top label')
          .html('<span class="title">' + title + '</span>' + '<em>' + (displayType[contentType] || contentType) + '</em>')
          .prependTo( $code.closest('.segment') )
        ;
      }
      if(label) {
        $('<div>')
          .addClass('ui pointing below ignored language label')
          .html(displayType[contentType] || contentType)
          .insertBefore ( $code.closest('.segment') )
        ;
      }
      // add apply less button
      if(less) {
        $('<a>')
          .addClass('ui black pointing below ignored label')
          .html('Apply Theme')
          .on('click', function() {
            window.less.modifyVars( handler.less.parseFile( code ) );
          })
          .insertBefore ( $code.closest('.segment') )
        ;
      }
      // add run code button
      if(demo) {
        $('<a>')
          .addClass('ui black pointing below ignored label')
          .html('Run Code')
          .on('click', function() {
            if(eval) {
              window.eval(eval);
            }
            else {
              window.eval(code);
            }
          })
          .insertBefore ( $code.closest('.segment') )
        ;
      }
      // add preview if specified
      if(preview) {
        $(code)
          .insertAfter( $code.closest('.segment') )
        ;
      }

      $code.removeClass('hidden');

    },

    resetDownloads: function() {
      $downloads
        .find('.grid')
        .hide()
        .filter('.choice.grid')
          .show()
      ;
    },

    selectAll: function () {
      this.setSelectionRange(0, this.value.length);
    },

    chooseStandalone: function() {
      $downloads
        .find('.grid')
        .hide()
        .filter('.standalone.grid')
          .show()
      ;
      $downloadPopup.popup('reposition');
    },

    chooseFramework: function() {
      $downloads
        .find('.grid')
        .hide()
        .filter('.framework.grid')
          .show()
      ;
      $downloadPopup.popup('reposition');
    },

    swapStyle: function() {
      var
        theme = $(this).data('theme')
      ;
      $(this)
        .addClass('active')
        .siblings()
          .removeClass('active')
      ;
      $('head link.ui')
        .each(function() {
          var
            href         = $(this).attr('href'),
            subDirectory = href.split('/')[3],
            newLink      = href.replace(subDirectory, theme)
          ;
          $(this)
            .attr('href', newLink)
          ;
        })
      ;
    }
  };

  semantic.handler = handler;

  // code highlighting languages
  window.hljs.configure({
    classPrefix : '',
    languages   : [
      'xml',
      'bash',
      'css',
      'less',
      'javascript'
    ]
  });

  // add anchors to docs headers
  handler.createAnchors();

  // register less files
  window.less.registerStylesheets();

  // create sidebar sticky
  requestAnimationFrame(function() {

    $tocSticky
      .sticky({
        silent: true,
        container: $('html'),
        context: $fullHeightContainer
      })
    ;
  });

  // load page tabs
  if( $pageTabs.length > 0 ) {
    $pageTabs
      .tab({
        context      : '.main.container',
        childrenOnly : true,
        history      : true,
        onFirstLoad  : function() {
          handler.makeCode();

          $container = ($('.fixed.column').length > 0 )
            ? $(this).find('.examples')
            : $(this)
          ;
          $(this).find('> .rail .ui.sticky, .fixed .ui.sticky')
            .sticky({
              context: $container,
              container: $('html'),
              silent: true,
              offset: 30
            })
          ;
          $sectionHeaders = $container.children('h2');
          $sectionExample = $container.find('.example');
          $exampleHeaders = $sectionExample.children('h4');
          // create code
          handler.tryCreateMenu();
          $(window).on('resize.menu', function() {
            handler.tryCreateMenu();
          });
        },
        onLoad : function() {
          $tocSticky
            .sticky('refresh')
          ;
          $(this).find('.ui.sticky')
            .sticky('refresh')
          ;
        }
      })
    ;
  }
  else {
    handler.makeCode();
    handler.tryCreateMenu();
    $(window).on('resize.menu', function() {
      handler.tryCreateMenu();
    });
  }

  $shownExample
    .each(handler.createCode)
  ;
  $prerenderedExample
    .each(handler.generateCode)
  ;

  // main sidebar
  $menu
    .sidebar({
      dimPage          : true,
      transition       : 'overlay',
      mobileTransition : 'uncover'
    })
  ;

  // launch buttons
  $menu
    .sidebar('attach events', '.launch.button, .view-ui, .launch.item')
  ;

  handler.createIcon();

  if(expertiseLevel < 2 && $(window).width() > 640) {
    $popupExample
      .each(function() {
        $(this)
          .popup({
            preserve: false,
            on       : 'hover',
            variation: 'inverted',
            delay: {
              show: 500,
              hide: 100
            },
            position : 'top left',
            content  : 'View Source',
            target   : $(this).find('i.code')
          })
          .find('i.code')
            .on('click', function() {
              $.cookie('expertiseLevel', 2, {
                expires: 365
              });
            })
        ;
      })
    ;
  }

  $menuMusic
    .on('click', handler.openMusic)
  ;

  $downloadPopup
    .popup({
      transition : 'horizontal flip',
      duration   : 350,
      position   : 'bottom center',
      on         : 'click',
      onHidden   : handler.resetDownloads
    })
  ;
  $downloadInput
    .on('mouseup', handler.selectAll)
  ;
  $downloadFramework
    .on('click', handler.chooseFramework)
  ;
  $downloadStandalone
    .on('click', handler.chooseStandalone)
  ;

  $themeDropdown
    .dropdown({
      allowTab: false,
      onChange: handler.less.changeTheme
    })
  ;

  if($.fn.tablesort !== undefined && $sortTable.length > 0) {
    $sortTable
      .tablesort()
    ;
  }

  $helpPopup
    .popup({
      position: 'top left',
      variation: 'inverted'
    })
  ;

  $swap
    .on('click', handler.swapStyle)
  ;


  $menuPopup
    .add($languageDropdown)
    .popup({
      position  : 'bottom center',
      delay: {
        show: 100,
        hide: 50
      }
    })
  ;

  $pageDropdown
    .dropdown({
      on       : 'hover',
      action   : 'nothing',
      allowTab : false
    })
  ;

  $languageDropdown
    .dropdown({
      allowTab       : false,
      on             : 'click',
      fullTextSearch : 'exact',
      match          : 'text',
      onShow         : function() {
        $(this).popup('hide');
      },
      onChange        : handler.translatePage
    })
  ;

  //$.fn.api.settings.base = '//api.semantic-ui.com';
  $.extend($.fn.api.settings.api, {
    categorySearch     : '//api.semantic-ui.com/search/category/{query}',
    getOverrides       : '/src/themes/{$theme}/{$type}s/{$element}.overrides',
    getVariables       : '/src/themes/{$theme}/{$type}s/{$element}.variables',
    search             : '//api.semantic-ui.com/search/{query}'
  });

  if(window.Transifex !== undefined) {
    window.Transifex.live.onTranslatePage(handler.showLanguageModal);
  }

  if(typeof detectAdBlock === 'undefined') {
    handler.showBeg();
  }
  else {
    detectAdBlock.onDetected(handler.showBeg);
  }

  handler.getMetadata();

};


// attach ready event
$(document)
  .ready(semantic.ready)
;
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright Ã‚Â© 2001 Robert Penner
 * All rights reserved.
 *
*/

jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,f,a,h,g){return jQuery.easing[jQuery.easing.def](e,f,a,h,g)},easeInQuad:function(e,f,a,h,g){return h*(f/=g)*f+a},easeOutQuad:function(e,f,a,h,g){return -h*(f/=g)*(f-2)+a},easeInOutQuad:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f+a}return -h/2*((--f)*(f-2)-1)+a},easeInCubic:function(e,f,a,h,g){return h*(f/=g)*f*f+a},easeOutCubic:function(e,f,a,h,g){return h*((f=f/g-1)*f*f+1)+a},easeInOutCubic:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f+a}return h/2*((f-=2)*f*f+2)+a},easeInQuart:function(e,f,a,h,g){return h*(f/=g)*f*f*f+a},easeOutQuart:function(e,f,a,h,g){return -h*((f=f/g-1)*f*f*f-1)+a},easeInOutQuart:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f+a}return -h/2*((f-=2)*f*f*f-2)+a},easeInQuint:function(e,f,a,h,g){return h*(f/=g)*f*f*f*f+a},easeOutQuint:function(e,f,a,h,g){return h*((f=f/g-1)*f*f*f*f+1)+a},easeInOutQuint:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f*f+a}return h/2*((f-=2)*f*f*f*f+2)+a},easeInSine:function(e,f,a,h,g){return -h*Math.cos(f/g*(Math.PI/2))+h+a},easeOutSine:function(e,f,a,h,g){return h*Math.sin(f/g*(Math.PI/2))+a},easeInOutSine:function(e,f,a,h,g){return -h/2*(Math.cos(Math.PI*f/g)-1)+a},easeInExpo:function(e,f,a,h,g){return(f==0)?a:h*Math.pow(2,10*(f/g-1))+a},easeOutExpo:function(e,f,a,h,g){return(f==g)?a+h:h*(-Math.pow(2,-10*f/g)+1)+a},easeInOutExpo:function(e,f,a,h,g){if(f==0){return a}if(f==g){return a+h}if((f/=g/2)<1){return h/2*Math.pow(2,10*(f-1))+a}return h/2*(-Math.pow(2,-10*--f)+2)+a},easeInCirc:function(e,f,a,h,g){return -h*(Math.sqrt(1-(f/=g)*f)-1)+a},easeOutCirc:function(e,f,a,h,g){return h*Math.sqrt(1-(f=f/g-1)*f)+a},easeInOutCirc:function(e,f,a,h,g){if((f/=g/2)<1){return -h/2*(Math.sqrt(1-f*f)-1)+a}return h/2*(Math.sqrt(1-(f-=2)*f)+1)+a},easeInElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return -(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e},easeOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return g*Math.pow(2,-10*h)*Math.sin((h*k-i)*(2*Math.PI)/j)+l+e},easeInOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k/2)==2){return e+l}if(!j){j=k*(0.3*1.5)}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}if(h<1){return -0.5*(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e}return g*Math.pow(2,-10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j)*0.5+l+e},easeInBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*(f/=h)*f*((g+1)*f-g)+a},easeOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*((f=f/h-1)*f*((g+1)*f+g)+1)+a},easeInOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}if((f/=h/2)<1){return i/2*(f*f*(((g*=(1.525))+1)*f-g))+a}return i/2*((f-=2)*f*(((g*=(1.525))+1)*f+g)+2)+a},easeInBounce:function(e,f,a,h,g){return h-jQuery.easing.easeOutBounce(e,g-f,0,h,g)+a},easeOutBounce:function(e,f,a,h,g){if((f/=g)<(1/2.75)){return h*(7.5625*f*f)+a}else{if(f<(2/2.75)){return h*(7.5625*(f-=(1.5/2.75))*f+0.75)+a}else{if(f<(2.5/2.75)){return h*(7.5625*(f-=(2.25/2.75))*f+0.9375)+a}else{return h*(7.5625*(f-=(2.625/2.75))*f+0.984375)+a}}}},easeInOutBounce:function(e,f,a,h,g){if(f<g/2){return jQuery.easing.easeInBounce(e,f*2,0,h,g)*0.5+a}return jQuery.easing.easeOutBounce(e,f*2-g,0,h,g)*0.5+h*0.5+a}});
(function() {


}).call(this);
(function() {


}).call(this);
!function(e){"undefined"!=typeof exports?e(exports):(window.hljs=e({}),"function"==typeof define&&define.amd&&define("hljs",[],function(){return window.hljs}))}(function(e){function n(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(e){return e.nodeName.toLowerCase()}function r(e,n){var t=e&&e.exec(n);return t&&0==t.index}function a(e){return/no-?highlight|plain|text/.test(e)}function i(e){var n,t,r,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",t=/\blang(?:uage)?-([\w-]+)\b/.exec(i))return E(t[1])?t[1]:"no-highlight";for(i=i.split(/\s+/),n=0,r=i.length;r>n;n++)if(E(i[n])||a(i[n]))return i[n]}function o(e,n){var t,r={};for(t in e)r[t]=e[t];if(n)for(t in n)r[t]=n[t];return r}function u(e){var n=[];return function r(e,a){for(var i=e.firstChild;i;i=i.nextSibling)3==i.nodeType?a+=i.nodeValue.length:1==i.nodeType&&(n.push({event:"start",offset:a,node:i}),a=r(i,a),t(i).match(/br|hr|img|input/)||n.push({event:"stop",offset:a,node:i}));return a}(e,0),n}function c(e,r,a){function i(){return e.length&&r.length?e[0].offset!=r[0].offset?e[0].offset<r[0].offset?e:r:"start"==r[0].event?e:r:e.length?e:r}function o(e){function r(e){return" "+e.nodeName+'="'+n(e.value)+'"'}f+="<"+t(e)+Array.prototype.map.call(e.attributes,r).join("")+">"}function u(e){f+="</"+t(e)+">"}function c(e){("start"==e.event?o:u)(e.node)}for(var s=0,f="",l=[];e.length||r.length;){var g=i();if(f+=n(a.substr(s,g[0].offset-s)),s=g[0].offset,g==e){l.reverse().forEach(u);do c(g.splice(0,1)[0]),g=i();while(g==e&&g.length&&g[0].offset==s);l.reverse().forEach(o)}else"start"==g[0].event?l.push(g[0].node):l.pop(),c(g.splice(0,1)[0])}return f+n(a.substr(s))}function s(e){function n(e){return e&&e.source||e}function t(t,r){return new RegExp(n(t),"m"+(e.cI?"i":"")+(r?"g":""))}function r(a,i){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var u={},c=function(n,t){e.cI&&(t=t.toLowerCase()),t.split(" ").forEach(function(e){var t=e.split("|");u[t[0]]=[n,t[1]?Number(t[1]):1]})};"string"==typeof a.k?c("keyword",a.k):Object.keys(a.k).forEach(function(e){c(e,a.k[e])}),a.k=u}a.lR=t(a.l||/\b\w+\b/,!0),i&&(a.bK&&(a.b="\\b("+a.bK.split(" ").join("|")+")\\b"),a.b||(a.b=/\B|\b/),a.bR=t(a.b),a.e||a.eW||(a.e=/\B|\b/),a.e&&(a.eR=t(a.e)),a.tE=n(a.e)||"",a.eW&&i.tE&&(a.tE+=(a.e?"|":"")+i.tE)),a.i&&(a.iR=t(a.i)),void 0===a.r&&(a.r=1),a.c||(a.c=[]);var s=[];a.c.forEach(function(e){e.v?e.v.forEach(function(n){s.push(o(e,n))}):s.push("self"==e?a:e)}),a.c=s,a.c.forEach(function(e){r(e,a)}),a.starts&&r(a.starts,i);var f=a.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([a.tE,a.i]).map(n).filter(Boolean);a.t=f.length?t(f.join("|"),!0):{exec:function(){return null}}}}r(e)}function f(e,t,a,i){function o(e,n){for(var t=0;t<n.c.length;t++)if(r(n.c[t].bR,e))return n.c[t]}function u(e,n){if(r(e.eR,n)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?u(e.parent,n):void 0}function c(e,n){return!a&&r(n.iR,e)}function g(e,n){var t=N.cI?n[0].toLowerCase():n[0];return e.k.hasOwnProperty(t)&&e.k[t]}function h(e,n,t,r){var a=r?"":w.classPrefix,i='<span class="'+a,o=t?"":"</span>";return i+=e+'">',i+n+o}function p(){if(!L.k)return n(B);var e="",t=0;L.lR.lastIndex=0;for(var r=L.lR.exec(B);r;){e+=n(B.substr(t,r.index-t));var a=g(L,r);a?(y+=a[1],e+=h(a[0],n(r[0]))):e+=n(r[0]),t=L.lR.lastIndex,r=L.lR.exec(B)}return e+n(B.substr(t))}function d(){if(L.sL&&!x[L.sL])return n(B);var e=L.sL?f(L.sL,B,!0,M[L.sL]):l(B);return L.r>0&&(y+=e.r),"continuous"==L.subLanguageMode&&(M[L.sL]=e.top),h(e.language,e.value,!1,!0)}function b(){return void 0!==L.sL?d():p()}function v(e,t){var r=e.cN?h(e.cN,"",!0):"";e.rB?(k+=r,B=""):e.eB?(k+=n(t)+r,B=""):(k+=r,B=t),L=Object.create(e,{parent:{value:L}})}function m(e,t){if(B+=e,void 0===t)return k+=b(),0;var r=o(t,L);if(r)return k+=b(),v(r,t),r.rB?0:t.length;var a=u(L,t);if(a){var i=L;i.rE||i.eE||(B+=t),k+=b();do L.cN&&(k+="</span>"),y+=L.r,L=L.parent;while(L!=a.parent);return i.eE&&(k+=n(t)),B="",a.starts&&v(a.starts,""),i.rE?0:t.length}if(c(t,L))throw new Error('Illegal lexeme "'+t+'" for mode "'+(L.cN||"<unnamed>")+'"');return B+=t,t.length||1}var N=E(e);if(!N)throw new Error('Unknown language: "'+e+'"');s(N);var R,L=i||N,M={},k="";for(R=L;R!=N;R=R.parent)R.cN&&(k=h(R.cN,"",!0)+k);var B="",y=0;try{for(var C,j,I=0;;){if(L.t.lastIndex=I,C=L.t.exec(t),!C)break;j=m(t.substr(I,C.index-I),C[0]),I=C.index+j}for(m(t.substr(I)),R=L;R.parent;R=R.parent)R.cN&&(k+="</span>");return{r:y,value:k,language:e,top:L}}catch(O){if(-1!=O.message.indexOf("Illegal"))return{r:0,value:n(t)};throw O}}function l(e,t){t=t||w.languages||Object.keys(x);var r={r:0,value:n(e)},a=r;return t.forEach(function(n){if(E(n)){var t=f(n,e,!1);t.language=n,t.r>a.r&&(a=t),t.r>r.r&&(a=r,r=t)}}),a.language&&(r.second_best=a),r}function g(e){return w.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,n){return n.replace(/\t/g,w.tabReplace)})),w.useBR&&(e=e.replace(/\n/g,"<br>")),e}function h(e,n,t){var r=n?R[n]:t,a=[e.trim()];return e.match(/\bhljs\b/)||a.push("hljs"),-1===e.indexOf(r)&&a.push(r),a.join(" ").trim()}function p(e){var n=i(e);if(!a(n)){var t;w.useBR?(t=document.createElementNS("http://www.w3.org/1999/xhtml","div"),t.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):t=e;var r=t.textContent,o=n?f(n,r,!0):l(r),s=u(t);if(s.length){var p=document.createElementNS("http://www.w3.org/1999/xhtml","div");p.innerHTML=o.value,o.value=c(s,u(p),r)}o.value=g(o.value),e.innerHTML=o.value,e.className=h(e.className,n,o.language),e.result={language:o.language,re:o.r},o.second_best&&(e.second_best={language:o.second_best.language,re:o.second_best.r})}}function d(e){w=o(w,e)}function b(){if(!b.called){b.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,p)}}function v(){addEventListener("DOMContentLoaded",b,!1),addEventListener("load",b,!1)}function m(n,t){var r=x[n]=t(e);r.aliases&&r.aliases.forEach(function(e){R[e]=n})}function N(){return Object.keys(x)}function E(e){return x[e]||x[R[e]]}var w={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},x={},R={};return e.highlight=f,e.highlightAuto=l,e.fixMarkup=g,e.highlightBlock=p,e.configure=d,e.initHighlighting=b,e.initHighlightingOnLoad=v,e.registerLanguage=m,e.listLanguages=N,e.getLanguage=E,e.inherit=o,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="\\b(0[xX][a-fA-F0-9]+|(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/},e.C=function(n,t,r){var a=e.inherit({cN:"comment",b:n,e:t,c:[]},r||{});return a.c.push(e.PWM),a.c.push({cN:"doctag",bK:"TODO FIXME NOTE BUG XXX",r:0}),a},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e});hljs.registerLanguage("scss",function(e){var t="[a-zA-Z-][a-zA-Z0-9_-]*",i={cN:"variable",b:"(\\$"+t+")\\b"},r={cN:"function",b:t+"\\(",rB:!0,eE:!0,e:"\\("},o={cN:"hexcolor",b:"#[0-9A-Fa-f]+"};({cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:!0,i:"[^\\s]",starts:{cN:"value",eW:!0,eE:!0,c:[r,o,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"important",b:"!important"}]}});return{cI:!0,i:"[=/|']",c:[e.CLCM,e.CBCM,r,{cN:"id",b:"\\#[A-Za-z0-9_-]+",r:0},{cN:"class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"attr_selector",b:"\\[",e:"\\]",i:"$"},{cN:"tag",b:"\\b(a|abbr|acronym|address|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|frame|frameset|(h[1-6])|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|ul|var|video)\\b",r:0},{cN:"pseudo",b:":(visited|valid|root|right|required|read-write|read-only|out-range|optional|only-of-type|only-child|nth-of-type|nth-last-of-type|nth-last-child|nth-child|not|link|left|last-of-type|last-child|lang|invalid|indeterminate|in-range|hover|focus|first-of-type|first-line|first-letter|first-child|first|enabled|empty|disabled|default|checked|before|after|active)"},{cN:"pseudo",b:"::(after|before|choices|first-letter|first-line|repeat-index|repeat-item|selection|value)"},i,{cN:"attribute",b:"\\b(z-index|word-wrap|word-spacing|word-break|width|widows|white-space|visibility|vertical-align|unicode-bidi|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform-style|transform-origin|transform|top|text-underline-position|text-transform|text-shadow|text-rendering|text-overflow|text-indent|text-decoration-style|text-decoration-line|text-decoration-color|text-decoration|text-align-last|text-align|tab-size|table-layout|right|resize|quotes|position|pointer-events|perspective-origin|perspective|page-break-inside|page-break-before|page-break-after|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-y|overflow-x|overflow-wrap|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|order|opacity|object-position|object-fit|normal|none|nav-up|nav-right|nav-left|nav-index|nav-down|min-width|min-height|max-width|max-height|mask|marks|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|letter-spacing|left|justify-content|initial|inherit|ime-mode|image-orientation|image-resolution|image-rendering|icon|hyphens|height|font-weight|font-variant-ligatures|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-language-override|font-kerning|font-feature-settings|font-family|font|float|flex-wrap|flex-shrink|flex-grow|flex-flow|flex-direction|flex-basis|flex|filter|empty-cells|display|direction|cursor|counter-reset|counter-increment|content|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|columns|color|clip-path|clip|clear|caption-side|break-inside|break-before|break-after|box-sizing|box-shadow|box-decoration-break|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-left-width|border-left-style|border-left-color|border-left|border-image-width|border-image-source|border-image-slice|border-image-repeat|border-image-outset|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-attachment|background-blend-mode|background|backface-visibility|auto|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-fill-mode|animation-duration|animation-direction|animation-delay|animation|align-self|align-items|align-content)\\b",i:"[^\\s]"},{cN:"value",b:"\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b"},{cN:"value",b:":",e:";",c:[r,i,o,e.CSSNM,e.QSM,e.ASM,{cN:"important",b:"!important"}]},{cN:"at_rule",b:"@",e:"[{;]",k:"mixin include extend for if else each while charset import debug media page content font-face namespace warn",c:[r,i,e.QSM,e.ASM,o,e.CSSNM,{cN:"preprocessor",b:"\\s[A-Za-z0-9_.-]+",r:0}]}]}});hljs.registerLanguage("javascript",function(e){return{aliases:["js"],k:{keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},c:[{cN:"pi",r:10,b:/^\s*['"]use (strict|asm)['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\s*[);\]]/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:[e.CLCM,e.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{bK:"import",e:"[;$]",k:"import from as",c:[e.ASM,e.QSM]},{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]}]}});hljs.registerLanguage("http",function(t){return{aliases:["https"],i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:!0,e:"$",c:[{cN:"string",b:" ",e:" ",eB:!0,eE:!0}]},{cN:"attribute",b:"^\\w",e:": ",eE:!0,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:"",eW:!0}}]}});hljs.registerLanguage("less",function(e){var r="[\\w-]+",t="("+r+"|@{"+r+"})",a=[],c=[],n=function(e){return{cN:"string",b:"~?"+e+".*?"+e}},i=function(e,r,t){return{cN:e,b:r,r:t}},s=function(r,t,a){return e.inherit({cN:r,b:t+"\\(",e:"\\(",rB:!0,eE:!0,r:0},a)},b={b:"\\(",e:"\\)",c:c,r:0};c.push(e.CLCM,e.CBCM,n("'"),n('"'),e.CSSNM,i("hexcolor","#[0-9A-Fa-f]+\\b"),s("function","(url|data-uri)",{starts:{cN:"string",e:"[\\)\\n]",eE:!0}}),s("function",r),b,i("variable","@@?"+r,10),i("variable","@{"+r+"}"),i("built_in","~?`[^`]*?`"),{cN:"attribute",b:r+"\\s*:",e:":",rB:!0,eE:!0});var o=c.concat({b:"{",e:"}",c:a}),u={bK:"when",eW:!0,c:[{bK:"and not"}].concat(c)},C={cN:"attribute",b:t,e:":",eE:!0,c:[e.CLCM,e.CBCM],i:/\S/,starts:{e:"[;}]",rE:!0,c:c,i:"[<=$]"}},l={cN:"at_rule",b:"@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",starts:{e:"[;{}]",rE:!0,c:c,r:0}},d={cN:"variable",v:[{b:"@"+r+"\\s*:",r:15},{b:"@"+r}],starts:{e:"[;}]",rE:!0,c:o}},p={v:[{b:"[\\.#:&\\[]",e:"[;{}]"},{b:t+"[^;]*{",e:"{"}],rB:!0,rE:!0,i:"[<='$\"]",c:[e.CLCM,e.CBCM,u,i("keyword","all\\b"),i("variable","@{"+r+"}"),i("tag",t+"%?",0),i("id","#"+t),i("class","\\."+t,0),i("keyword","&",0),s("pseudo",":not"),s("keyword",":extend"),i("pseudo","::?"+t),{cN:"attr_selector",b:"\\[",e:"\\]"},{b:"\\(",e:"\\)",c:o},{b:"!important"}]};return a.push(e.CLCM,e.CBCM,l,d,p,C),{cI:!0,i:"[=>'/<($\"]",c:a}});hljs.registerLanguage("css",function(e){var c="[a-zA-Z-][a-zA-Z0-9_-]*",a={cN:"function",b:c+"\\(",rB:!0,eE:!0,e:"\\("},r={cN:"rule",b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{cN:"value",eW:!0,eE:!0,c:[a,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,r,{cN:"id",b:/\#[A-Za-z0-9_-]+/},{cN:"class",b:/\.[A-Za-z0-9_-]+/},{cN:"attr_selector",b:/\[/,e:/\]/,i:"$"},{cN:"pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[a,e.ASM,e.QSM,e.CSSNM]}]},{cN:"tag",b:c,r:0},{cN:"rules",b:"{",e:"}",i:/\S/,c:[e.CBCM,r]}]}});hljs.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"header",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"blockquote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"`.+?`"},{b:"^( {4}|	)",e:"$",r:0}]},{cN:"horizontal_rule",b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"link_label",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link_url",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"link_reference",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:"^\\[.+\\]:",rB:!0,c:[{cN:"link_reference",b:"\\[",e:"\\]:",eB:!0,eE:!0,starts:{cN:"link_url",e:"$"}}]}]}});hljs.registerLanguage("nginx",function(e){var r={cN:"variable",v:[{b:/\$\d+/},{b:/\$\{/,e:/}/},{b:"[\\$\\@]"+e.UIR}]},b={eW:!0,l:"[a-z/_]+",k:{built_in:"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"},r:0,i:"=>",c:[e.HCM,{cN:"string",c:[e.BE,r],v:[{b:/"/,e:/"/},{b:/'/,e:/'/}]},{cN:"url",b:"([a-z]+):/",e:"\\s",eW:!0,eE:!0,c:[r]},{cN:"regexp",c:[e.BE,r],v:[{b:"\\s\\^",e:"\\s|{|;",rE:!0},{b:"~\\*?\\s+",e:"\\s|{|;",rE:!0},{b:"\\*(\\.[a-z\\-]+)+"},{b:"([a-z\\-]+\\.)+\\*"}]},{cN:"number",b:"\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"},{cN:"number",b:"\\b\\d+[kKmMgGdshdwy]*\\b",r:0},r]};return{aliases:["nginxconf"],c:[e.HCM,{b:e.UIR+"\\s",e:";|{",rB:!0,c:[{cN:"title",b:e.UIR,starts:b}],r:0}],i:"[^\\s\\}]"}});hljs.registerLanguage("xml",function(t){var e="[A-Za-z0-9\\._:-]+",s={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"},c={eW:!0,i:/</,r:0,c:[s,{cN:"attribute",b:e,r:0},{b:"=",r:0,c:[{cN:"value",c:[s],v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:!0,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},t.C("<!--","-->",{r:10}),{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[c],starts:{e:"</style>",rE:!0,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[c],starts:{e:"</script>",rE:!0,sL:""}},s,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:/[^ \/><\n\t]+/,r:0},c]}]}});hljs.registerLanguage("json",function(e){var t={literal:"true false null"},i=[e.QSM,e.CNM],l={cN:"value",e:",",eW:!0,eE:!0,c:i,k:t},c={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:l}],i:"\\S"},n={b:"\\[",e:"\\]",c:[e.inherit(l,{cN:null})],i:"\\S"};return i.splice(i.length,0,c,n),{c:i,k:t,i:"\\S"}});hljs.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},s={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},a={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,e.NM,s,a,t]}});hljs.registerLanguage("diff",function(e){return{aliases:["patch"],c:[{cN:"chunk",r:10,v:[{b:/^@@ +\-\d+,\d+ +\+\d+,\d+ +@@$/},{b:/^\*\*\* +\d+,\d+ +\*\*\*\*$/},{b:/^\-\-\- +\d+,\d+ +\-\-\-\-$/}]},{cN:"header",v:[{b:/Index: /,e:/$/},{b:/=====/,e:/=====$/},{b:/^\-\-\-/,e:/$/},{b:/^\*{3} /,e:/$/},{b:/^\+\+\+/,e:/$/},{b:/\*{5}/,e:/\*{5}$/}]},{cN:"addition",b:"^\\+",e:"$"},{cN:"deletion",b:"^\\-",e:"$"},{cN:"change",b:"^\\!",e:"$"}]}});
!function(a){a.address=function(){var x,W,b=function(b){var c=a.extend(a.Event(b),function(){for(var b={},c=a.address.parameterNames(),d=0,e=c.length;e>d;d++)b[c[d]]=a.address.parameter(c[d]);return{value:a.address.value(),path:a.address.path(),pathNames:a.address.pathNames(),parameterNames:c,parameters:b,queryString:a.address.queryString()}}.call(a.address));return a(a.address).trigger(c),c},c=function(a){return Array.prototype.slice.call(a)},d=function(){return a().bind.apply(a(a.address),Array.prototype.slice.call(arguments)),a.address},e=function(){return a().unbind.apply(a(a.address),Array.prototype.slice.call(arguments)),a.address},f=function(){return P.pushState&&I.state!==x},g=function(){return("/"+Q.pathname.replace(new RegExp(I.state),"")+Q.search+(h()?"#"+h():"")).replace(T,"/")},h=function(){var a=Q.href.indexOf("#");return-1!=a?Q.href.substr(a+1):""},i=function(){return f()?g():h()},j=function(){try{return top.document!==x&&top.document.title!==x?top:window}catch(a){return window}},k=function(){return"javascript"},l=function(a){return a=a.toString(),(I.strict&&"/"!=a.substr(0,1)?"/":"")+a},m=function(a,b){return parseInt(a.css(b),10)},n=function(){if(!_){var a=i(),b=decodeURI(eb)!=decodeURI(a);b&&(M&&7>K?Q.reload():(M&&!V&&I.history&&S(q,50),eb=a,o(H)))}},o=function(a){return"null"!==I.tracker&&I.tracker!==y&&S(p,10),b(D).isDefaultPrevented()||b(a?E:F).isDefaultPrevented()},p=function(){if("null"!==I.tracker&&I.tracker!==y){var b=a.isFunction(I.tracker)?I.tracker:N[I.tracker],c=(Q.pathname+Q.search+(a.address&&!f()?a.address.value():"")).replace(/\/\//,"/").replace(/^\/$/,"");a.isFunction(b)?b(c):a.isFunction(N.urchinTracker)?N.urchinTracker(c):N.pageTracker!==x&&a.isFunction(N.pageTracker._trackPageview)?N.pageTracker._trackPageview(c):N._gaq!==x&&a.isFunction(N._gaq.push)&&N._gaq.push(["_trackPageview",decodeURI(c)])}},q=function(){var a=k()+":"+H+";document.open();document.writeln('<html><head><title>"+O.title.replace(/\'/g,"\\'")+"</title><script>var "+z+' = "'+encodeURIComponent(i()).replace(/\'/g,"\\'")+(O.domain!=Q.hostname?'";document.domain="'+O.domain:"")+'";</'+"script></head></html>');document.close();";7>K?W.src=a:W.contentWindow.location.replace(a)},r=function(){if(Y&&-1!=Z){var a,b,c=Y.substr(Z+1).split("&");for(a=0;a<c.length;a++)b=c[a].split("="),/^(autoUpdate|history|strict|wrap)$/.test(b[0])&&(I[b[0]]=isNaN(b[1])?/^(true|yes)$/i.test(b[1]):0!==parseInt(b[1],10)),/^(state|tracker)$/.test(b[0])&&(I[b[0]]=b[1]);Y=y}eb=i()},s=function(){if(!ab){if(ab=G,r(),a('a[rel*="address:"]').address(),I.wrap){var c=a("body");a("body > *").wrapAll('<div style="padding:'+(m(c,"marginTop")+m(c,"paddingTop"))+"px "+(m(c,"marginRight")+m(c,"paddingRight"))+"px "+(m(c,"marginBottom")+m(c,"paddingBottom"))+"px "+(m(c,"marginLeft")+m(c,"paddingLeft"))+'px;" />').parent().wrap('<div id="'+z+'" style="height:100%;overflow:auto;position:relative;'+(L&&!window.statusbar.visible?"resize:both;":"")+'" />'),a("html, body").css({height:"100%",margin:0,padding:0,overflow:"hidden"}),L&&a('<style type="text/css" />').appendTo("head").text("#"+z+"::-webkit-resizer { background-color: #fff; }")}if(M&&!V){var e=O.getElementsByTagName("frameset")[0];W=O.createElement((e?"":"i")+"frame"),W.src=k()+":"+H,e?(e.insertAdjacentElement("beforeEnd",W),e[e.cols?"cols":"rows"]+=",0",W.noResize=G,W.frameBorder=W.frameSpacing=0):(W.style.display="none",W.style.width=W.style.height=0,W.tabIndex=-1,O.body.insertAdjacentElement("afterBegin",W)),S(function(){a(W).bind("load",function(){var a=W.contentWindow;eb=a[z]!==x?a[z]:"",eb!=i()&&(o(H),Q.hash=eb)}),W.contentWindow[z]===x&&q()},50)}S(function(){b("init"),o(H)},1),f()||(M&&K>7||!M&&V?N.addEventListener?N.addEventListener(B,n,H):N.attachEvent&&N.attachEvent("on"+B,n):R(n,50)),"state"in window.history&&a(window).trigger("popstate")}},t=function(){decodeURI(eb)!=decodeURI(i())&&(eb=i(),o(H))},u=function(){N.removeEventListener?N.removeEventListener(B,n,H):N.detachEvent&&N.detachEvent("on"+B,n)},v=function(a){a=a.toLowerCase();var b=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},w=function(){var a={},b=v(navigator.userAgent);return b.browser&&(a[b.browser]=!0,a.version=b.version),a.chrome?a.webkit=!0:a.webkit&&(a.safari=!0),a},y=null,z="jQueryAddress",A="string",B="hashchange",C="init",D="change",E="internalChange",F="externalChange",G=!0,H=!1,I={autoUpdate:G,history:G,strict:G,wrap:H},J=w(),K=parseFloat(J.version),L=J.webkit||J.safari,M=J.msie,N=j(),O=N.document,P=N.history,Q=N.location,R=setInterval,S=setTimeout,T=/\/{2,9}/g,U=navigator.userAgent,V="on"+B in N,Y=a("script:last").attr("src"),Z=Y?Y.indexOf("?"):-1,$=O.title,_=H,ab=H,bb=G,cb=H,eb=i();if(M){K=parseFloat(U.substr(U.indexOf("MSIE")+4)),O.documentMode&&O.documentMode!=K&&(K=8!=O.documentMode?7:8);var fb=O.onpropertychange;O.onpropertychange=function(){fb&&fb.call(O),O.title!=$&&-1!=O.title.indexOf("#"+i())&&(O.title=$)}}if(P.navigationMode&&(P.navigationMode="compatible"),"complete"==document.readyState)var gb=setInterval(function(){a.address&&(s(),clearInterval(gb))},50);else r(),a(s);return a(window).bind("popstate",t).bind("unload",u),{bind:function(){return d.apply(this,c(arguments))},unbind:function(){return e.apply(this,c(arguments))},init:function(){return d.apply(this,[C].concat(c(arguments)))},change:function(){return d.apply(this,[D].concat(c(arguments)))},internalChange:function(){return d.apply(this,[E].concat(c(arguments)))},externalChange:function(){return d.apply(this,[F].concat(c(arguments)))},baseURL:function(){var a=Q.href;return-1!=a.indexOf("#")&&(a=a.substr(0,a.indexOf("#"))),/\/$/.test(a)&&(a=a.substr(0,a.length-1)),a},autoUpdate:function(a){return a!==x?(I.autoUpdate=a,this):I.autoUpdate},history:function(a){return a!==x?(I.history=a,this):I.history},state:function(a){if(a!==x){I.state=a;var b=g();return I.state!==x&&(P.pushState?"/#/"==b.substr(0,3)&&Q.replace(I.state.replace(/^\/$/,"")+b.substr(2)):"/"!=b&&b.replace(/^\/#/,"")!=h()&&S(function(){Q.replace(I.state.replace(/^\/$/,"")+"/#"+b)},1)),this}return I.state},strict:function(a){return a!==x?(I.strict=a,this):I.strict},tracker:function(a){return a!==x?(I.tracker=a,this):I.tracker},wrap:function(a){return a!==x?(I.wrap=a,this):I.wrap},update:function(){return cb=G,this.value(eb),cb=H,this},title:function(a){return a!==x?(S(function(){$=O.title=a,bb&&W&&W.contentWindow&&W.contentWindow.document&&(W.contentWindow.document.title=a,bb=H)},50),this):O.title},value:function(a){if(a!==x){if(a=l(a),"/"==a&&(a=""),eb==a&&!cb)return;if(eb=a,I.autoUpdate||cb){if(o(G))return this;f()?P[I.history?"pushState":"replaceState"]({},"",I.state.replace(/\/$/,"")+(""===eb?"/":eb)):(_=G,L?I.history?Q.hash="#"+eb:Q.replace("#"+eb):eb!=i()&&(I.history?Q.hash="#"+eb:Q.replace("#"+eb)),M&&!V&&I.history&&S(q,50),L?S(function(){_=H},1):_=H)}return this}return l(eb)},path:function(a){if(a!==x){var b=this.queryString(),c=this.hash();return this.value(a+(b?"?"+b:"")+(c?"#"+c:"")),this}return l(eb).split("#")[0].split("?")[0]},pathNames:function(){var a=this.path(),b=a.replace(T,"/").split("/");return("/"==a.substr(0,1)||0===a.length)&&b.splice(0,1),"/"==a.substr(a.length-1,1)&&b.splice(b.length-1,1),b},queryString:function(a){if(a!==x){var b=this.hash();return this.value(this.path()+(a?"?"+a:"")+(b?"#"+b:"")),this}var c=eb.split("?");return c.slice(1,c.length).join("?").split("#")[0]},parameter:function(b,c,d){var e,f;if(c!==x){var g=this.parameterNames();for(f=[],c=c===x||c===y?"":c.toString(),e=0;e<g.length;e++){var h=g[e],i=this.parameter(h);typeof i==A&&(i=[i]),h==b&&(i=c===y||""===c?[]:d?i.concat([c]):[c]);for(var j=0;j<i.length;j++)f.push(h+"="+i[j])}return-1==a.inArray(b,g)&&c!==y&&""!==c&&f.push(b+"="+c),this.queryString(f.join("&")),this}if(c=this.queryString()){var k=[];for(f=c.split("&"),e=0;e<f.length;e++){var l=f[e].split("=");l[0]==b&&k.push(l.slice(1).join("="))}if(0!==k.length)return 1!=k.length?k:k[0]}},parameterNames:function(){var b=this.queryString(),c=[];if(b&&-1!=b.indexOf("="))for(var d=b.split("&"),e=0;e<d.length;e++){var f=d[e].split("=")[0];-1==a.inArray(f,c)&&c.push(f)}return c},hash:function(a){if(a!==x)return this.value(eb.split("#")[0]+(a?"#"+a:"")),this;var b=eb.split("#");return b.slice(1,b.length).join("#")}}}(),a.fn.address=function(b){return this.data("address")||this.on("click",function(c){if(c.shiftKey||c.ctrlKey||c.metaKey||2==c.which)return!0;var d=c.currentTarget;if(a(d).is("a")){c.preventDefault();var e=b?b.call(d):/address:/.test(a(d).attr("rel"))?a(d).attr("rel").split("address:")[1].split(" ")[0]:void 0===a.address.state()||/^\/?$/.test(a.address.state())?a(d).attr("href").replace(/^(#\!?|\.)/,""):a(d).attr("href").replace(new RegExp("^(.*"+a.address.state()+"|\\.)"),"");a.address.value(e)}}).on("submit",function(c){var d=c.currentTarget;if(a(d).is("form")){c.preventDefault();var e=a(d).attr("action"),f=b?b.call(d):(-1!=e.indexOf("?")?e.replace(/&$/,""):e+"?")+a(d).serialize();a.address.value(f)}}).data("address",!0),this}}(jQuery);
(function() {


}).call(this);
/*! jQuery v3.1.1 | (c) jQuery Foundation | jquery.org/license */

!function(a,b){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){"use strict";var c=[],d=a.document,e=Object.getPrototypeOf,f=c.slice,g=c.concat,h=c.push,i=c.indexOf,j={},k=j.toString,l=j.hasOwnProperty,m=l.toString,n=m.call(Object),o={};function p(a,b){b=b||d;var c=b.createElement("script");c.text=a,b.head.appendChild(c).parentNode.removeChild(c)}var q="3.1.1",r=function(a,b){return new r.fn.init(a,b)},s=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,t=/^-ms-/,u=/-([a-z])/g,v=function(a,b){return b.toUpperCase()};r.fn=r.prototype={jquery:q,constructor:r,length:0,toArray:function(){return f.call(this)},get:function(a){return null==a?f.call(this):a<0?this[a+this.length]:this[a]},pushStack:function(a){var b=r.merge(this.constructor(),a);return b.prevObject=this,b},each:function(a){return r.each(this,a)},map:function(a){return this.pushStack(r.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(f.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(a<0?b:0);return this.pushStack(c>=0&&c<b?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:h,sort:c.sort,splice:c.splice},r.extend=r.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||r.isFunction(g)||(g={}),h===i&&(g=this,h--);h<i;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(r.isPlainObject(d)||(e=r.isArray(d)))?(e?(e=!1,f=c&&r.isArray(c)?c:[]):f=c&&r.isPlainObject(c)?c:{},g[b]=r.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},r.extend({expando:"jQuery"+(q+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===r.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=r.type(a);return("number"===b||"string"===b)&&!isNaN(a-parseFloat(a))},isPlainObject:function(a){var b,c;return!(!a||"[object Object]"!==k.call(a))&&(!(b=e(a))||(c=l.call(b,"constructor")&&b.constructor,"function"==typeof c&&m.call(c)===n))},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?j[k.call(a)]||"object":typeof a},globalEval:function(a){p(a)},camelCase:function(a){return a.replace(t,"ms-").replace(u,v)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(w(a)){for(c=a.length;d<c;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(s,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(w(Object(a))?r.merge(c,"string"==typeof a?[a]:a):h.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:i.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;d<c;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;f<g;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,f=0,h=[];if(w(a))for(d=a.length;f<d;f++)e=b(a[f],f,c),null!=e&&h.push(e);else for(f in a)e=b(a[f],f,c),null!=e&&h.push(e);return g.apply([],h)},guid:1,proxy:function(a,b){var c,d,e;if("string"==typeof b&&(c=a[b],b=a,a=c),r.isFunction(a))return d=f.call(arguments,2),e=function(){return a.apply(b||this,d.concat(f.call(arguments)))},e.guid=a.guid=a.guid||r.guid++,e},now:Date.now,support:o}),"function"==typeof Symbol&&(r.fn[Symbol.iterator]=c[Symbol.iterator]),r.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){j["[object "+b+"]"]=b.toLowerCase()});function w(a){var b=!!a&&"length"in a&&a.length,c=r.type(a);return"function"!==c&&!r.isWindow(a)&&("array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a)}var x=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C={}.hasOwnProperty,D=[],E=D.pop,F=D.push,G=D.push,H=D.slice,I=function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},J="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",K="[\\x20\\t\\r\\n\\f]",L="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",M="\\["+K+"*("+L+")(?:"+K+"*([*^$|!~]?=)"+K+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+L+"))|)"+K+"*\\]",N=":("+L+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+M+")*)|.*)\\)|)",O=new RegExp(K+"+","g"),P=new RegExp("^"+K+"+|((?:^|[^\\\\])(?:\\\\.)*)"+K+"+$","g"),Q=new RegExp("^"+K+"*,"+K+"*"),R=new RegExp("^"+K+"*([>+~]|"+K+")"+K+"*"),S=new RegExp("="+K+"*([^\\]'\"]*?)"+K+"*\\]","g"),T=new RegExp(N),U=new RegExp("^"+L+"$"),V={ID:new RegExp("^#("+L+")"),CLASS:new RegExp("^\\.("+L+")"),TAG:new RegExp("^("+L+"|[*])"),ATTR:new RegExp("^"+M),PSEUDO:new RegExp("^"+N),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+K+"*(even|odd|(([+-]|)(\\d*)n|)"+K+"*(?:([+-]|)"+K+"*(\\d+)|))"+K+"*\\)|)","i"),bool:new RegExp("^(?:"+J+")$","i"),needsContext:new RegExp("^"+K+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+K+"*((?:-\\d)?\\d*)"+K+"*\\)|)(?=[^-]|$)","i")},W=/^(?:input|select|textarea|button)$/i,X=/^h\d$/i,Y=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,$=/[+~]/,_=new RegExp("\\\\([\\da-f]{1,6}"+K+"?|("+K+")|.)","ig"),aa=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:d<0?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ba=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ca=function(a,b){return b?"\0"===a?"\ufffd":a.slice(0,-1)+"\\"+a.charCodeAt(a.length-1).toString(16)+" ":"\\"+a},da=function(){m()},ea=ta(function(a){return a.disabled===!0&&("form"in a||"label"in a)},{dir:"parentNode",next:"legend"});try{G.apply(D=H.call(v.childNodes),v.childNodes),D[v.childNodes.length].nodeType}catch(fa){G={apply:D.length?function(a,b){F.apply(a,H.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s=b&&b.ownerDocument,w=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==w&&9!==w&&11!==w)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==w&&(l=Z.exec(a)))if(f=l[1]){if(9===w){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(s&&(j=s.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(l[2])return G.apply(d,b.getElementsByTagName(a)),d;if((f=l[3])&&c.getElementsByClassName&&b.getElementsByClassName)return G.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==w)s=b,r=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(ba,ca):b.setAttribute("id",k=u),o=g(a),h=o.length;while(h--)o[h]="#"+k+" "+sa(o[h]);r=o.join(","),s=$.test(a)&&qa(b.parentNode)||b}if(r)try{return G.apply(d,s.querySelectorAll(r)),d}catch(x){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(P,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("fieldset");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&a.sourceIndex-b.sourceIndex;if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return function(b){return"form"in b?b.parentNode&&b.disabled===!1?"label"in b?"label"in b.parentNode?b.parentNode.disabled===a:b.disabled===a:b.isDisabled===a||b.isDisabled!==!a&&ea(b)===a:b.disabled===a:"label"in b&&b.disabled===a}}function pa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function qa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return!!b&&"HTML"!==b.nodeName},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),v!==n&&(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Y.test(n.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){return a.getAttribute("id")===b}},d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}}):(d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}},d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c,d,e,f=b.getElementById(a);if(f){if(c=f.getAttributeNode("id"),c&&c.value===a)return[f];e=b.getElementsByName(a),d=0;while(f=e[d++])if(c=f.getAttributeNode("id"),c&&c.value===a)return[f]}return[]}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){if("undefined"!=typeof b.getElementsByClassName&&p)return b.getElementsByClassName(a)},r=[],q=[],(c.qsa=Y.test(n.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+K+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+K+"*(?:value|"+J+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){a.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+K+"*[*^$|!~]?="),2!==a.querySelectorAll(":enabled").length&&q.push(":enabled",":disabled"),o.appendChild(a).disabled=!0,2!==a.querySelectorAll(":disabled").length&&q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Y.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"*"),s.call(a,"[s!='']:x"),r.push("!=",N)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Y.test(o.compareDocumentPosition),t=b||Y.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?I(k,a)-I(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?I(k,a)-I(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?la(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(S,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&C.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.escape=function(a){return(a+"").replace(ba,ca)},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(_,aa),a[3]=(a[3]||a[4]||a[5]||"").replace(_,aa),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return V.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&T.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(_,aa).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+K+")"+a+"("+K+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:!b||(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(O," ")+" ").indexOf(c)>-1:"|="===b&&(e===c||e.slice(0,c.length+1)===c+"-"))}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=I(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(P,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(_,aa),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return U.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(_,aa).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:oa(!1),disabled:oa(!0),checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return X.test(a.nodeName)},input:function(a){return W.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:pa(function(){return[0]}),last:pa(function(a,b){return[b-1]}),eq:pa(function(a,b,c){return[c<0?c+b:c]}),even:pa(function(a,b){for(var c=0;c<b;c+=2)a.push(c);return a}),odd:pa(function(a,b){for(var c=1;c<b;c+=2)a.push(c);return a}),lt:pa(function(a,b,c){for(var d=c<0?c+b:c;--d>=0;)a.push(d);return a}),gt:pa(function(a,b,c){for(var d=c<0?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function ra(){}ra.prototype=d.filters=d.pseudos,d.setFilters=new ra,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=Q.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=R.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(P," ")}),h=h.slice(c.length));for(g in d.filter)!(e=V[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function sa(a){for(var b=0,c=a.length,d="";b<c;b++)d+=a[b].value;return d}function ta(a,b,c){var d=b.dir,e=b.next,f=e||d,g=c&&"parentNode"===f,h=x++;return b.first?function(b,c,e){while(b=b[d])if(1===b.nodeType||g)return a(b,c,e);return!1}:function(b,c,i){var j,k,l,m=[w,h];if(i){while(b=b[d])if((1===b.nodeType||g)&&a(b,c,i))return!0}else while(b=b[d])if(1===b.nodeType||g)if(l=b[u]||(b[u]={}),k=l[b.uniqueID]||(l[b.uniqueID]={}),e&&e===b.nodeName.toLowerCase())b=b[d]||b;else{if((j=k[f])&&j[0]===w&&j[1]===h)return m[2]=j[2];if(k[f]=m,m[2]=a(b,c,i))return!0}return!1}}function ua(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function va(a,b,c){for(var d=0,e=b.length;d<e;d++)ga(a,b[d],c);return c}function wa(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;h<i;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function xa(a,b,c,d,e,f){return d&&!d[u]&&(d=xa(d)),e&&!e[u]&&(e=xa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||va(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:wa(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=wa(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?I(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=wa(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):G.apply(g,r)})}function ya(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ta(function(a){return a===b},h,!0),l=ta(function(a){return I(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];i<f;i++)if(c=d.relative[a[i].type])m=[ta(ua(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;e<f;e++)if(d.relative[a[e].type])break;return xa(i>1&&ua(m),i>1&&sa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(P,"$1"),c,i<e&&ya(a.slice(i,e)),e<f&&ya(a=a.slice(e)),e<f&&sa(a))}m.push(c)}return ua(m)}function za(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=E.call(i));u=wa(u)}G.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&ga.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=ya(b[c]),f[u]?d.push(f):e.push(f);f=A(a,za(e,d)),f.selector=a}return f},i=ga.select=function(a,b,c,e){var f,i,j,k,l,m="function"==typeof a&&a,n=!e&&g(a=m.selector||a);if(c=c||[],1===n.length){if(i=n[0]=n[0].slice(0),i.length>2&&"ID"===(j=i[0]).type&&9===b.nodeType&&p&&d.relative[i[1].type]){if(b=(d.find.ID(j.matches[0].replace(_,aa),b)||[])[0],!b)return c;m&&(b=b.parentNode),a=a.slice(i.shift().value.length)}f=V.needsContext.test(a)?0:i.length;while(f--){if(j=i[f],d.relative[k=j.type])break;if((l=d.find[k])&&(e=l(j.matches[0].replace(_,aa),$.test(i[0].type)&&qa(b.parentNode)||b))){if(i.splice(f,1),a=e.length&&sa(i),!a)return G.apply(c,e),c;break}}}return(m||h(a,n))(e,b,!p,c,!b||$.test(a)&&qa(b.parentNode)||b),c},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("fieldset"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){if(!c)return a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){if(!c&&"input"===a.nodeName.toLowerCase())return a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(J,function(a,b,c){var d;if(!c)return a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);r.find=x,r.expr=x.selectors,r.expr[":"]=r.expr.pseudos,r.uniqueSort=r.unique=x.uniqueSort,r.text=x.getText,r.isXMLDoc=x.isXML,r.contains=x.contains,r.escapeSelector=x.escape;var y=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&r(a).is(c))break;d.push(a)}return d},z=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},A=r.expr.match.needsContext,B=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i,C=/^.[^:#\[\.,]*$/;function D(a,b,c){return r.isFunction(b)?r.grep(a,function(a,d){return!!b.call(a,d,a)!==c}):b.nodeType?r.grep(a,function(a){return a===b!==c}):"string"!=typeof b?r.grep(a,function(a){return i.call(b,a)>-1!==c}):C.test(b)?r.filter(b,a,c):(b=r.filter(b,a),r.grep(a,function(a){return i.call(b,a)>-1!==c&&1===a.nodeType}))}r.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?r.find.matchesSelector(d,a)?[d]:[]:r.find.matches(a,r.grep(b,function(a){return 1===a.nodeType}))},r.fn.extend({find:function(a){var b,c,d=this.length,e=this;if("string"!=typeof a)return this.pushStack(r(a).filter(function(){for(b=0;b<d;b++)if(r.contains(e[b],this))return!0}));for(c=this.pushStack([]),b=0;b<d;b++)r.find(a,e[b],c);return d>1?r.uniqueSort(c):c},filter:function(a){return this.pushStack(D(this,a||[],!1))},not:function(a){return this.pushStack(D(this,a||[],!0))},is:function(a){return!!D(this,"string"==typeof a&&A.test(a)?r(a):a||[],!1).length}});var E,F=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,G=r.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||E,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:F.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof r?b[0]:b,r.merge(this,r.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),B.test(e[1])&&r.isPlainObject(b))for(e in b)r.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&(this[0]=f,this.length=1),this}return a.nodeType?(this[0]=a,this.length=1,this):r.isFunction(a)?void 0!==c.ready?c.ready(a):a(r):r.makeArray(a,this)};G.prototype=r.fn,E=r(d);var H=/^(?:parents|prev(?:Until|All))/,I={children:!0,contents:!0,next:!0,prev:!0};r.fn.extend({has:function(a){var b=r(a,this),c=b.length;return this.filter(function(){for(var a=0;a<c;a++)if(r.contains(this,b[a]))return!0})},closest:function(a,b){var c,d=0,e=this.length,f=[],g="string"!=typeof a&&r(a);if(!A.test(a))for(;d<e;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&r.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?r.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?i.call(r(a),this[0]):i.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(r.uniqueSort(r.merge(this.get(),r(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function J(a,b){while((a=a[b])&&1!==a.nodeType);return a}r.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return y(a,"parentNode")},parentsUntil:function(a,b,c){return y(a,"parentNode",c)},next:function(a){return J(a,"nextSibling")},prev:function(a){return J(a,"previousSibling")},nextAll:function(a){return y(a,"nextSibling")},prevAll:function(a){return y(a,"previousSibling")},nextUntil:function(a,b,c){return y(a,"nextSibling",c)},prevUntil:function(a,b,c){return y(a,"previousSibling",c)},siblings:function(a){return z((a.parentNode||{}).firstChild,a)},children:function(a){return z(a.firstChild)},contents:function(a){return a.contentDocument||r.merge([],a.childNodes)}},function(a,b){r.fn[a]=function(c,d){var e=r.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=r.filter(d,e)),this.length>1&&(I[a]||r.uniqueSort(e),H.test(a)&&e.reverse()),this.pushStack(e)}});var K=/[^\x20\t\r\n\f]+/g;function L(a){var b={};return r.each(a.match(K)||[],function(a,c){b[c]=!0}),b}r.Callbacks=function(a){a="string"==typeof a?L(a):r.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){r.each(b,function(b,c){r.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==r.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return r.each(arguments,function(a,b){var c;while((c=r.inArray(b,f,c))>-1)f.splice(c,1),c<=h&&h--}),this},has:function(a){return a?r.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||b||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j};function M(a){return a}function N(a){throw a}function O(a,b,c){var d;try{a&&r.isFunction(d=a.promise)?d.call(a).done(b).fail(c):a&&r.isFunction(d=a.then)?d.call(a,b,c):b.call(void 0,a)}catch(a){c.call(void 0,a)}}r.extend({Deferred:function(b){var c=[["notify","progress",r.Callbacks("memory"),r.Callbacks("memory"),2],["resolve","done",r.Callbacks("once memory"),r.Callbacks("once memory"),0,"resolved"],["reject","fail",r.Callbacks("once memory"),r.Callbacks("once memory"),1,"rejected"]],d="pending",e={state:function(){return d},always:function(){return f.done(arguments).fail(arguments),this},"catch":function(a){return e.then(null,a)},pipe:function(){var a=arguments;return r.Deferred(function(b){r.each(c,function(c,d){var e=r.isFunction(a[d[4]])&&a[d[4]];f[d[1]](function(){var a=e&&e.apply(this,arguments);a&&r.isFunction(a.promise)?a.promise().progress(b.notify).done(b.resolve).fail(b.reject):b[d[0]+"With"](this,e?[a]:arguments)})}),a=null}).promise()},then:function(b,d,e){var f=0;function g(b,c,d,e){return function(){var h=this,i=arguments,j=function(){var a,j;if(!(b<f)){if(a=d.apply(h,i),a===c.promise())throw new TypeError("Thenable self-resolution");j=a&&("object"==typeof a||"function"==typeof a)&&a.then,r.isFunction(j)?e?j.call(a,g(f,c,M,e),g(f,c,N,e)):(f++,j.call(a,g(f,c,M,e),g(f,c,N,e),g(f,c,M,c.notifyWith))):(d!==M&&(h=void 0,i=[a]),(e||c.resolveWith)(h,i))}},k=e?j:function(){try{j()}catch(a){r.Deferred.exceptionHook&&r.Deferred.exceptionHook(a,k.stackTrace),b+1>=f&&(d!==N&&(h=void 0,i=[a]),c.rejectWith(h,i))}};b?k():(r.Deferred.getStackHook&&(k.stackTrace=r.Deferred.getStackHook()),a.setTimeout(k))}}return r.Deferred(function(a){c[0][3].add(g(0,a,r.isFunction(e)?e:M,a.notifyWith)),c[1][3].add(g(0,a,r.isFunction(b)?b:M)),c[2][3].add(g(0,a,r.isFunction(d)?d:N))}).promise()},promise:function(a){return null!=a?r.extend(a,e):e}},f={};return r.each(c,function(a,b){var g=b[2],h=b[5];e[b[1]]=g.add,h&&g.add(function(){d=h},c[3-a][2].disable,c[0][2].lock),g.add(b[3].fire),f[b[0]]=function(){return f[b[0]+"With"](this===f?void 0:this,arguments),this},f[b[0]+"With"]=g.fireWith}),e.promise(f),b&&b.call(f,f),f},when:function(a){var b=arguments.length,c=b,d=Array(c),e=f.call(arguments),g=r.Deferred(),h=function(a){return function(c){d[a]=this,e[a]=arguments.length>1?f.call(arguments):c,--b||g.resolveWith(d,e)}};if(b<=1&&(O(a,g.done(h(c)).resolve,g.reject),"pending"===g.state()||r.isFunction(e[c]&&e[c].then)))return g.then();while(c--)O(e[c],h(c),g.reject);return g.promise()}});var P=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;r.Deferred.exceptionHook=function(b,c){a.console&&a.console.warn&&b&&P.test(b.name)&&a.console.warn("jQuery.Deferred exception: "+b.message,b.stack,c)},r.readyException=function(b){a.setTimeout(function(){throw b})};var Q=r.Deferred();r.fn.ready=function(a){return Q.then(a)["catch"](function(a){r.readyException(a)}),this},r.extend({isReady:!1,readyWait:1,holdReady:function(a){a?r.readyWait++:r.ready(!0)},ready:function(a){(a===!0?--r.readyWait:r.isReady)||(r.isReady=!0,a!==!0&&--r.readyWait>0||Q.resolveWith(d,[r]))}}),r.ready.then=Q.then;function R(){d.removeEventListener("DOMContentLoaded",R),
a.removeEventListener("load",R),r.ready()}"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(r.ready):(d.addEventListener("DOMContentLoaded",R),a.addEventListener("load",R));var S=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===r.type(c)){e=!0;for(h in c)S(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,r.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(r(a),c)})),b))for(;h<i;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},T=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function U(){this.expando=r.expando+U.uid++}U.uid=1,U.prototype={cache:function(a){var b=a[this.expando];return b||(b={},T(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[r.camelCase(b)]=c;else for(d in b)e[r.camelCase(d)]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][r.camelCase(b)]},access:function(a,b,c){return void 0===b||b&&"string"==typeof b&&void 0===c?this.get(a,b):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d=a[this.expando];if(void 0!==d){if(void 0!==b){r.isArray(b)?b=b.map(r.camelCase):(b=r.camelCase(b),b=b in d?[b]:b.match(K)||[]),c=b.length;while(c--)delete d[b[c]]}(void 0===b||r.isEmptyObject(d))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!r.isEmptyObject(b)}};var V=new U,W=new U,X=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Y=/[A-Z]/g;function Z(a){return"true"===a||"false"!==a&&("null"===a?null:a===+a+""?+a:X.test(a)?JSON.parse(a):a)}function $(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Y,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c=Z(c)}catch(e){}W.set(a,b,c)}else c=void 0;return c}r.extend({hasData:function(a){return W.hasData(a)||V.hasData(a)},data:function(a,b,c){return W.access(a,b,c)},removeData:function(a,b){W.remove(a,b)},_data:function(a,b,c){return V.access(a,b,c)},_removeData:function(a,b){V.remove(a,b)}}),r.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=W.get(f),1===f.nodeType&&!V.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=r.camelCase(d.slice(5)),$(f,d,e[d])));V.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){W.set(this,a)}):S(this,function(b){var c;if(f&&void 0===b){if(c=W.get(f,a),void 0!==c)return c;if(c=$(f,a),void 0!==c)return c}else this.each(function(){W.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){W.remove(this,a)})}}),r.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=V.get(a,b),c&&(!d||r.isArray(c)?d=V.access(a,b,r.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=r.queue(a,b),d=c.length,e=c.shift(),f=r._queueHooks(a,b),g=function(){r.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return V.get(a,c)||V.access(a,c,{empty:r.Callbacks("once memory").add(function(){V.remove(a,[b+"queue",c])})})}}),r.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?r.queue(this[0],a):void 0===b?this:this.each(function(){var c=r.queue(this,a,b);r._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&r.dequeue(this,a)})},dequeue:function(a){return this.each(function(){r.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=r.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=V.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var _=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,aa=new RegExp("^(?:([+-])=|)("+_+")([a-z%]*)$","i"),ba=["Top","Right","Bottom","Left"],ca=function(a,b){return a=b||a,"none"===a.style.display||""===a.style.display&&r.contains(a.ownerDocument,a)&&"none"===r.css(a,"display")},da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};function ea(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return r.css(a,b,"")},i=h(),j=c&&c[3]||(r.cssNumber[b]?"":"px"),k=(r.cssNumber[b]||"px"!==j&&+i)&&aa.exec(r.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,r.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var fa={};function ga(a){var b,c=a.ownerDocument,d=a.nodeName,e=fa[d];return e?e:(b=c.body.appendChild(c.createElement(d)),e=r.css(b,"display"),b.parentNode.removeChild(b),"none"===e&&(e="block"),fa[d]=e,e)}function ha(a,b){for(var c,d,e=[],f=0,g=a.length;f<g;f++)d=a[f],d.style&&(c=d.style.display,b?("none"===c&&(e[f]=V.get(d,"display")||null,e[f]||(d.style.display="")),""===d.style.display&&ca(d)&&(e[f]=ga(d))):"none"!==c&&(e[f]="none",V.set(d,"display",c)));for(f=0;f<g;f++)null!=e[f]&&(a[f].style.display=e[f]);return a}r.fn.extend({show:function(){return ha(this,!0)},hide:function(){return ha(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){ca(this)?r(this).show():r(this).hide()})}});var ia=/^(?:checkbox|radio)$/i,ja=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i,ka=/^$|\/(?:java|ecma)script/i,la={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};la.optgroup=la.option,la.tbody=la.tfoot=la.colgroup=la.caption=la.thead,la.th=la.td;function ma(a,b){var c;return c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[],void 0===b||b&&r.nodeName(a,b)?r.merge([a],c):c}function na(a,b){for(var c=0,d=a.length;c<d;c++)V.set(a[c],"globalEval",!b||V.get(b[c],"globalEval"))}var oa=/<|&#?\w+;/;function pa(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],n=0,o=a.length;n<o;n++)if(f=a[n],f||0===f)if("object"===r.type(f))r.merge(m,f.nodeType?[f]:f);else if(oa.test(f)){g=g||l.appendChild(b.createElement("div")),h=(ja.exec(f)||["",""])[1].toLowerCase(),i=la[h]||la._default,g.innerHTML=i[1]+r.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;r.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",n=0;while(f=m[n++])if(d&&r.inArray(f,d)>-1)e&&e.push(f);else if(j=r.contains(f.ownerDocument,f),g=ma(l.appendChild(f),"script"),j&&na(g),c){k=0;while(f=g[k++])ka.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),o.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",o.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var qa=d.documentElement,ra=/^key/,sa=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,ta=/^([^.]*)(?:\.(.+)|)/;function ua(){return!0}function va(){return!1}function wa(){try{return d.activeElement}catch(a){}}function xa(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)xa(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=va;else if(!e)return a;return 1===f&&(g=e,e=function(a){return r().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=r.guid++)),a.each(function(){r.event.add(this,b,e,d,c)})}r.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=V.get(a);if(q){c.handler&&(f=c,c=f.handler,e=f.selector),e&&r.find.matchesSelector(qa,e),c.guid||(c.guid=r.guid++),(i=q.events)||(i=q.events={}),(g=q.handle)||(g=q.handle=function(b){return"undefined"!=typeof r&&r.event.triggered!==b.type?r.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(K)||[""],j=b.length;while(j--)h=ta.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n&&(l=r.event.special[n]||{},n=(e?l.delegateType:l.bindType)||n,l=r.event.special[n]||{},k=r.extend({type:n,origType:p,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&r.expr.match.needsContext.test(e),namespace:o.join(".")},f),(m=i[n])||(m=i[n]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,o,g)!==!1||a.addEventListener&&a.addEventListener(n,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),r.event.global[n]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=V.hasData(a)&&V.get(a);if(q&&(i=q.events)){b=(b||"").match(K)||[""],j=b.length;while(j--)if(h=ta.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n){l=r.event.special[n]||{},n=(d?l.delegateType:l.bindType)||n,m=i[n]||[],h=h[2]&&new RegExp("(^|\\.)"+o.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&p!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,o,q.handle)!==!1||r.removeEvent(a,n,q.handle),delete i[n])}else for(n in i)r.event.remove(a,n+b[j],c,d,!0);r.isEmptyObject(i)&&V.remove(a,"handle events")}},dispatch:function(a){var b=r.event.fix(a),c,d,e,f,g,h,i=new Array(arguments.length),j=(V.get(this,"events")||{})[b.type]||[],k=r.event.special[b.type]||{};for(i[0]=b,c=1;c<arguments.length;c++)i[c]=arguments[c];if(b.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,b)!==!1){h=r.event.handlers.call(this,b,j),c=0;while((f=h[c++])&&!b.isPropagationStopped()){b.currentTarget=f.elem,d=0;while((g=f.handlers[d++])&&!b.isImmediatePropagationStopped())b.rnamespace&&!b.rnamespace.test(g.namespace)||(b.handleObj=g,b.data=g.data,e=((r.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(b.result=e)===!1&&(b.preventDefault(),b.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,b),b.result}},handlers:function(a,b){var c,d,e,f,g,h=[],i=b.delegateCount,j=a.target;if(i&&j.nodeType&&!("click"===a.type&&a.button>=1))for(;j!==this;j=j.parentNode||this)if(1===j.nodeType&&("click"!==a.type||j.disabled!==!0)){for(f=[],g={},c=0;c<i;c++)d=b[c],e=d.selector+" ",void 0===g[e]&&(g[e]=d.needsContext?r(e,this).index(j)>-1:r.find(e,this,null,[j]).length),g[e]&&f.push(d);f.length&&h.push({elem:j,handlers:f})}return j=this,i<b.length&&h.push({elem:j,handlers:b.slice(i)}),h},addProp:function(a,b){Object.defineProperty(r.Event.prototype,a,{enumerable:!0,configurable:!0,get:r.isFunction(b)?function(){if(this.originalEvent)return b(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[a]},set:function(b){Object.defineProperty(this,a,{enumerable:!0,configurable:!0,writable:!0,value:b})}})},fix:function(a){return a[r.expando]?a:new r.Event(a)},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==wa()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===wa()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&r.nodeName(this,"input"))return this.click(),!1},_default:function(a){return r.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},r.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},r.Event=function(a,b){return this instanceof r.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ua:va,this.target=a.target&&3===a.target.nodeType?a.target.parentNode:a.target,this.currentTarget=a.currentTarget,this.relatedTarget=a.relatedTarget):this.type=a,b&&r.extend(this,b),this.timeStamp=a&&a.timeStamp||r.now(),void(this[r.expando]=!0)):new r.Event(a,b)},r.Event.prototype={constructor:r.Event,isDefaultPrevented:va,isPropagationStopped:va,isImmediatePropagationStopped:va,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ua,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ua,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ua,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},r.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(a){var b=a.button;return null==a.which&&ra.test(a.type)?null!=a.charCode?a.charCode:a.keyCode:!a.which&&void 0!==b&&sa.test(a.type)?1&b?1:2&b?3:4&b?2:0:a.which}},r.event.addProp),r.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){r.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||r.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),r.fn.extend({on:function(a,b,c,d){return xa(this,a,b,c,d)},one:function(a,b,c,d){return xa(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,r(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=va),this.each(function(){r.event.remove(this,a,c,b)})}});var ya=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,za=/<script|<style|<link/i,Aa=/checked\s*(?:[^=]|=\s*.checked.)/i,Ba=/^true\/(.*)/,Ca=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function Da(a,b){return r.nodeName(a,"table")&&r.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a:a}function Ea(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function Fa(a){var b=Ba.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function Ga(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(V.hasData(a)&&(f=V.access(a),g=V.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;c<d;c++)r.event.add(b,e,j[e][c])}W.hasData(a)&&(h=W.access(a),i=r.extend({},h),W.set(b,i))}}function Ha(a,b){var c=b.nodeName.toLowerCase();"input"===c&&ia.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function Ia(a,b,c,d){b=g.apply([],b);var e,f,h,i,j,k,l=0,m=a.length,n=m-1,q=b[0],s=r.isFunction(q);if(s||m>1&&"string"==typeof q&&!o.checkClone&&Aa.test(q))return a.each(function(e){var f=a.eq(e);s&&(b[0]=q.call(this,e,f.html())),Ia(f,b,c,d)});if(m&&(e=pa(b,a[0].ownerDocument,!1,a,d),f=e.firstChild,1===e.childNodes.length&&(e=f),f||d)){for(h=r.map(ma(e,"script"),Ea),i=h.length;l<m;l++)j=e,l!==n&&(j=r.clone(j,!0,!0),i&&r.merge(h,ma(j,"script"))),c.call(a[l],j,l);if(i)for(k=h[h.length-1].ownerDocument,r.map(h,Fa),l=0;l<i;l++)j=h[l],ka.test(j.type||"")&&!V.access(j,"globalEval")&&r.contains(k,j)&&(j.src?r._evalUrl&&r._evalUrl(j.src):p(j.textContent.replace(Ca,""),k))}return a}function Ja(a,b,c){for(var d,e=b?r.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||r.cleanData(ma(d)),d.parentNode&&(c&&r.contains(d.ownerDocument,d)&&na(ma(d,"script")),d.parentNode.removeChild(d));return a}r.extend({htmlPrefilter:function(a){return a.replace(ya,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=r.contains(a.ownerDocument,a);if(!(o.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||r.isXMLDoc(a)))for(g=ma(h),f=ma(a),d=0,e=f.length;d<e;d++)Ha(f[d],g[d]);if(b)if(c)for(f=f||ma(a),g=g||ma(h),d=0,e=f.length;d<e;d++)Ga(f[d],g[d]);else Ga(a,h);return g=ma(h,"script"),g.length>0&&na(g,!i&&ma(a,"script")),h},cleanData:function(a){for(var b,c,d,e=r.event.special,f=0;void 0!==(c=a[f]);f++)if(T(c)){if(b=c[V.expando]){if(b.events)for(d in b.events)e[d]?r.event.remove(c,d):r.removeEvent(c,d,b.handle);c[V.expando]=void 0}c[W.expando]&&(c[W.expando]=void 0)}}}),r.fn.extend({detach:function(a){return Ja(this,a,!0)},remove:function(a){return Ja(this,a)},text:function(a){return S(this,function(a){return void 0===a?r.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return Ia(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Da(this,a);b.appendChild(a)}})},prepend:function(){return Ia(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Da(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return Ia(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return Ia(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(r.cleanData(ma(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null!=a&&a,b=null==b?a:b,this.map(function(){return r.clone(this,a,b)})},html:function(a){return S(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!za.test(a)&&!la[(ja.exec(a)||["",""])[1].toLowerCase()]){a=r.htmlPrefilter(a);try{for(;c<d;c++)b=this[c]||{},1===b.nodeType&&(r.cleanData(ma(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return Ia(this,arguments,function(b){var c=this.parentNode;r.inArray(this,a)<0&&(r.cleanData(ma(this)),c&&c.replaceChild(b,this))},a)}}),r.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){r.fn[a]=function(a){for(var c,d=[],e=r(a),f=e.length-1,g=0;g<=f;g++)c=g===f?this:this.clone(!0),r(e[g])[b](c),h.apply(d,c.get());return this.pushStack(d)}});var Ka=/^margin/,La=new RegExp("^("+_+")(?!px)[a-z%]+$","i"),Ma=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)};!function(){function b(){if(i){i.style.cssText="box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",i.innerHTML="",qa.appendChild(h);var b=a.getComputedStyle(i);c="1%"!==b.top,g="2px"===b.marginLeft,e="4px"===b.width,i.style.marginRight="50%",f="4px"===b.marginRight,qa.removeChild(h),i=null}}var c,e,f,g,h=d.createElement("div"),i=d.createElement("div");i.style&&(i.style.backgroundClip="content-box",i.cloneNode(!0).style.backgroundClip="",o.clearCloneStyle="content-box"===i.style.backgroundClip,h.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",h.appendChild(i),r.extend(o,{pixelPosition:function(){return b(),c},boxSizingReliable:function(){return b(),e},pixelMarginRight:function(){return b(),f},reliableMarginLeft:function(){return b(),g}}))}();function Na(a,b,c){var d,e,f,g,h=a.style;return c=c||Ma(a),c&&(g=c.getPropertyValue(b)||c[b],""!==g||r.contains(a.ownerDocument,a)||(g=r.style(a,b)),!o.pixelMarginRight()&&La.test(g)&&Ka.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function Oa(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Pa=/^(none|table(?!-c[ea]).+)/,Qa={position:"absolute",visibility:"hidden",display:"block"},Ra={letterSpacing:"0",fontWeight:"400"},Sa=["Webkit","Moz","ms"],Ta=d.createElement("div").style;function Ua(a){if(a in Ta)return a;var b=a[0].toUpperCase()+a.slice(1),c=Sa.length;while(c--)if(a=Sa[c]+b,a in Ta)return a}function Va(a,b,c){var d=aa.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Wa(a,b,c,d,e){var f,g=0;for(f=c===(d?"border":"content")?4:"width"===b?1:0;f<4;f+=2)"margin"===c&&(g+=r.css(a,c+ba[f],!0,e)),d?("content"===c&&(g-=r.css(a,"padding"+ba[f],!0,e)),"margin"!==c&&(g-=r.css(a,"border"+ba[f]+"Width",!0,e))):(g+=r.css(a,"padding"+ba[f],!0,e),"padding"!==c&&(g+=r.css(a,"border"+ba[f]+"Width",!0,e)));return g}function Xa(a,b,c){var d,e=!0,f=Ma(a),g="border-box"===r.css(a,"boxSizing",!1,f);if(a.getClientRects().length&&(d=a.getBoundingClientRect()[b]),d<=0||null==d){if(d=Na(a,b,f),(d<0||null==d)&&(d=a.style[b]),La.test(d))return d;e=g&&(o.boxSizingReliable()||d===a.style[b]),d=parseFloat(d)||0}return d+Wa(a,b,c||(g?"border":"content"),e,f)+"px"}r.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Na(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=r.camelCase(b),i=a.style;return b=r.cssProps[h]||(r.cssProps[h]=Ua(h)||h),g=r.cssHooks[b]||r.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=aa.exec(c))&&e[1]&&(c=ea(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(r.cssNumber[h]?"":"px")),o.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=r.camelCase(b);return b=r.cssProps[h]||(r.cssProps[h]=Ua(h)||h),g=r.cssHooks[b]||r.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Na(a,b,d)),"normal"===e&&b in Ra&&(e=Ra[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),r.each(["height","width"],function(a,b){r.cssHooks[b]={get:function(a,c,d){if(c)return!Pa.test(r.css(a,"display"))||a.getClientRects().length&&a.getBoundingClientRect().width?Xa(a,b,d):da(a,Qa,function(){return Xa(a,b,d)})},set:function(a,c,d){var e,f=d&&Ma(a),g=d&&Wa(a,b,d,"border-box"===r.css(a,"boxSizing",!1,f),f);return g&&(e=aa.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=r.css(a,b)),Va(a,c,g)}}}),r.cssHooks.marginLeft=Oa(o.reliableMarginLeft,function(a,b){if(b)return(parseFloat(Na(a,"marginLeft"))||a.getBoundingClientRect().left-da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px"}),r.each({margin:"",padding:"",border:"Width"},function(a,b){r.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];d<4;d++)e[a+ba[d]+b]=f[d]||f[d-2]||f[0];return e}},Ka.test(a)||(r.cssHooks[a+b].set=Va)}),r.fn.extend({css:function(a,b){return S(this,function(a,b,c){var d,e,f={},g=0;if(r.isArray(b)){for(d=Ma(a),e=b.length;g<e;g++)f[b[g]]=r.css(a,b[g],!1,d);return f}return void 0!==c?r.style(a,b,c):r.css(a,b)},a,b,arguments.length>1)}});function Ya(a,b,c,d,e){return new Ya.prototype.init(a,b,c,d,e)}r.Tween=Ya,Ya.prototype={constructor:Ya,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||r.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(r.cssNumber[c]?"":"px")},cur:function(){var a=Ya.propHooks[this.prop];return a&&a.get?a.get(this):Ya.propHooks._default.get(this)},run:function(a){var b,c=Ya.propHooks[this.prop];return this.options.duration?this.pos=b=r.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ya.propHooks._default.set(this),this}},Ya.prototype.init.prototype=Ya.prototype,Ya.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=r.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){r.fx.step[a.prop]?r.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[r.cssProps[a.prop]]&&!r.cssHooks[a.prop]?a.elem[a.prop]=a.now:r.style(a.elem,a.prop,a.now+a.unit)}}},Ya.propHooks.scrollTop=Ya.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},r.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},r.fx=Ya.prototype.init,r.fx.step={};var Za,$a,_a=/^(?:toggle|show|hide)$/,ab=/queueHooks$/;function bb(){$a&&(a.requestAnimationFrame(bb),r.fx.tick())}function cb(){return a.setTimeout(function(){Za=void 0}),Za=r.now()}function db(a,b){var c,d=0,e={height:a};for(b=b?1:0;d<4;d+=2-b)c=ba[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function eb(a,b,c){for(var d,e=(hb.tweeners[b]||[]).concat(hb.tweeners["*"]),f=0,g=e.length;f<g;f++)if(d=e[f].call(c,b,a))return d}function fb(a,b,c){var d,e,f,g,h,i,j,k,l="width"in b||"height"in b,m=this,n={},o=a.style,p=a.nodeType&&ca(a),q=V.get(a,"fxshow");c.queue||(g=r._queueHooks(a,"fx"),null==g.unqueued&&(g.unqueued=0,h=g.empty.fire,g.empty.fire=function(){g.unqueued||h()}),g.unqueued++,m.always(function(){m.always(function(){g.unqueued--,r.queue(a,"fx").length||g.empty.fire()})}));for(d in b)if(e=b[d],_a.test(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}n[d]=q&&q[d]||r.style(a,d)}if(i=!r.isEmptyObject(b),i||!r.isEmptyObject(n)){l&&1===a.nodeType&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=q&&q.display,null==j&&(j=V.get(a,"display")),k=r.css(a,"display"),"none"===k&&(j?k=j:(ha([a],!0),j=a.style.display||j,k=r.css(a,"display"),ha([a]))),("inline"===k||"inline-block"===k&&null!=j)&&"none"===r.css(a,"float")&&(i||(m.done(function(){o.display=j}),null==j&&(k=o.display,j="none"===k?"":k)),o.display="inline-block")),c.overflow&&(o.overflow="hidden",m.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]})),i=!1;for(d in n)i||(q?"hidden"in q&&(p=q.hidden):q=V.access(a,"fxshow",{display:j}),f&&(q.hidden=!p),p&&ha([a],!0),m.done(function(){p||ha([a]),V.remove(a,"fxshow");for(d in n)r.style(a,d,n[d])})),i=eb(p?q[d]:0,d,m),d in q||(q[d]=i.start,p&&(i.end=i.start,i.start=0))}}function gb(a,b){var c,d,e,f,g;for(c in a)if(d=r.camelCase(c),e=b[d],f=a[c],r.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=r.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function hb(a,b,c){var d,e,f=0,g=hb.prefilters.length,h=r.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Za||cb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;g<i;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),f<1&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:r.extend({},b),opts:r.extend(!0,{specialEasing:{},easing:r.easing._default},c),originalProperties:b,originalOptions:c,startTime:Za||cb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=r.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;c<d;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for(gb(k,j.opts.specialEasing);f<g;f++)if(d=hb.prefilters[f].call(j,a,k,j.opts))return r.isFunction(d.stop)&&(r._queueHooks(j.elem,j.opts.queue).stop=r.proxy(d.stop,d)),d;return r.map(k,eb,j),r.isFunction(j.opts.start)&&j.opts.start.call(a,j),r.fx.timer(r.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}r.Animation=r.extend(hb,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return ea(c.elem,a,aa.exec(b),c),c}]},tweener:function(a,b){r.isFunction(a)?(b=a,a=["*"]):a=a.match(K);for(var c,d=0,e=a.length;d<e;d++)c=a[d],hb.tweeners[c]=hb.tweeners[c]||[],hb.tweeners[c].unshift(b)},prefilters:[fb],prefilter:function(a,b){b?hb.prefilters.unshift(a):hb.prefilters.push(a)}}),r.speed=function(a,b,c){var e=a&&"object"==typeof a?r.extend({},a):{complete:c||!c&&b||r.isFunction(a)&&a,duration:a,easing:c&&b||b&&!r.isFunction(b)&&b};return r.fx.off||d.hidden?e.duration=0:"number"!=typeof e.duration&&(e.duration in r.fx.speeds?e.duration=r.fx.speeds[e.duration]:e.duration=r.fx.speeds._default),null!=e.queue&&e.queue!==!0||(e.queue="fx"),e.old=e.complete,e.complete=function(){r.isFunction(e.old)&&e.old.call(this),e.queue&&r.dequeue(this,e.queue)},e},r.fn.extend({fadeTo:function(a,b,c,d){return this.filter(ca).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=r.isEmptyObject(a),f=r.speed(b,c,d),g=function(){var b=hb(this,r.extend({},a),f);(e||V.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=r.timers,g=V.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&ab.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||r.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=V.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=r.timers,g=d?d.length:0;for(c.finish=!0,r.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;b<g;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),r.each(["toggle","show","hide"],function(a,b){var c=r.fn[b];r.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(db(b,!0),a,d,e)}}),r.each({slideDown:db("show"),slideUp:db("hide"),slideToggle:db("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){r.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),r.timers=[],r.fx.tick=function(){var a,b=0,c=r.timers;for(Za=r.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||r.fx.stop(),Za=void 0},r.fx.timer=function(a){r.timers.push(a),a()?r.fx.start():r.timers.pop()},r.fx.interval=13,r.fx.start=function(){$a||($a=a.requestAnimationFrame?a.requestAnimationFrame(bb):a.setInterval(r.fx.tick,r.fx.interval))},r.fx.stop=function(){a.cancelAnimationFrame?a.cancelAnimationFrame($a):a.clearInterval($a),$a=null},r.fx.speeds={slow:600,fast:200,_default:400},r.fn.delay=function(b,c){return b=r.fx?r.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",o.checkOn=""!==a.value,o.optSelected=c.selected,a=d.createElement("input"),a.value="t",a.type="radio",o.radioValue="t"===a.value}();var ib,jb=r.expr.attrHandle;r.fn.extend({attr:function(a,b){return S(this,r.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){r.removeAttr(this,a)})}}),r.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?r.prop(a,b,c):(1===f&&r.isXMLDoc(a)||(e=r.attrHooks[b.toLowerCase()]||(r.expr.match.bool.test(b)?ib:void 0)),
void 0!==c?null===c?void r.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=r.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!o.radioValue&&"radio"===b&&r.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d=0,e=b&&b.match(K);if(e&&1===a.nodeType)while(c=e[d++])a.removeAttribute(c)}}),ib={set:function(a,b,c){return b===!1?r.removeAttr(a,c):a.setAttribute(c,c),c}},r.each(r.expr.match.bool.source.match(/\w+/g),function(a,b){var c=jb[b]||r.find.attr;jb[b]=function(a,b,d){var e,f,g=b.toLowerCase();return d||(f=jb[g],jb[g]=e,e=null!=c(a,b,d)?g:null,jb[g]=f),e}});var kb=/^(?:input|select|textarea|button)$/i,lb=/^(?:a|area)$/i;r.fn.extend({prop:function(a,b){return S(this,r.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[r.propFix[a]||a]})}}),r.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&r.isXMLDoc(a)||(b=r.propFix[b]||b,e=r.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=r.find.attr(a,"tabindex");return b?parseInt(b,10):kb.test(a.nodeName)||lb.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),o.optSelected||(r.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),r.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){r.propFix[this.toLowerCase()]=this});function mb(a){var b=a.match(K)||[];return b.join(" ")}function nb(a){return a.getAttribute&&a.getAttribute("class")||""}r.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(r.isFunction(a))return this.each(function(b){r(this).addClass(a.call(this,b,nb(this)))});if("string"==typeof a&&a){b=a.match(K)||[];while(c=this[i++])if(e=nb(c),d=1===c.nodeType&&" "+mb(e)+" "){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=mb(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(r.isFunction(a))return this.each(function(b){r(this).removeClass(a.call(this,b,nb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(K)||[];while(c=this[i++])if(e=nb(c),d=1===c.nodeType&&" "+mb(e)+" "){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=mb(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):r.isFunction(a)?this.each(function(c){r(this).toggleClass(a.call(this,c,nb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=r(this),f=a.match(K)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=nb(this),b&&V.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":V.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+mb(nb(c))+" ").indexOf(b)>-1)return!0;return!1}});var ob=/\r/g;r.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=r.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,r(this).val()):a,null==e?e="":"number"==typeof e?e+="":r.isArray(e)&&(e=r.map(e,function(a){return null==a?"":a+""})),b=r.valHooks[this.type]||r.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=r.valHooks[e.type]||r.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(ob,""):null==c?"":c)}}}),r.extend({valHooks:{option:{get:function(a){var b=r.find.attr(a,"value");return null!=b?b:mb(r.text(a))}},select:{get:function(a){var b,c,d,e=a.options,f=a.selectedIndex,g="select-one"===a.type,h=g?null:[],i=g?f+1:e.length;for(d=f<0?i:g?f:0;d<i;d++)if(c=e[d],(c.selected||d===f)&&!c.disabled&&(!c.parentNode.disabled||!r.nodeName(c.parentNode,"optgroup"))){if(b=r(c).val(),g)return b;h.push(b)}return h},set:function(a,b){var c,d,e=a.options,f=r.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=r.inArray(r.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),r.each(["radio","checkbox"],function(){r.valHooks[this]={set:function(a,b){if(r.isArray(b))return a.checked=r.inArray(r(a).val(),b)>-1}},o.checkOn||(r.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var pb=/^(?:focusinfocus|focusoutblur)$/;r.extend(r.event,{trigger:function(b,c,e,f){var g,h,i,j,k,m,n,o=[e||d],p=l.call(b,"type")?b.type:b,q=l.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!pb.test(p+r.event.triggered)&&(p.indexOf(".")>-1&&(q=p.split("."),p=q.shift(),q.sort()),k=p.indexOf(":")<0&&"on"+p,b=b[r.expando]?b:new r.Event(p,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=q.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+q.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:r.makeArray(c,[b]),n=r.event.special[p]||{},f||!n.trigger||n.trigger.apply(e,c)!==!1)){if(!f&&!n.noBubble&&!r.isWindow(e)){for(j=n.delegateType||p,pb.test(j+p)||(h=h.parentNode);h;h=h.parentNode)o.push(h),i=h;i===(e.ownerDocument||d)&&o.push(i.defaultView||i.parentWindow||a)}g=0;while((h=o[g++])&&!b.isPropagationStopped())b.type=g>1?j:n.bindType||p,m=(V.get(h,"events")||{})[b.type]&&V.get(h,"handle"),m&&m.apply(h,c),m=k&&h[k],m&&m.apply&&T(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=p,f||b.isDefaultPrevented()||n._default&&n._default.apply(o.pop(),c)!==!1||!T(e)||k&&r.isFunction(e[p])&&!r.isWindow(e)&&(i=e[k],i&&(e[k]=null),r.event.triggered=p,e[p](),r.event.triggered=void 0,i&&(e[k]=i)),b.result}},simulate:function(a,b,c){var d=r.extend(new r.Event,c,{type:a,isSimulated:!0});r.event.trigger(d,null,b)}}),r.fn.extend({trigger:function(a,b){return this.each(function(){r.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];if(c)return r.event.trigger(a,b,c,!0)}}),r.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(a,b){r.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),r.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),o.focusin="onfocusin"in a,o.focusin||r.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){r.event.simulate(b,a.target,r.event.fix(a))};r.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=V.access(d,b);e||d.addEventListener(a,c,!0),V.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=V.access(d,b)-1;e?V.access(d,b,e):(d.removeEventListener(a,c,!0),V.remove(d,b))}}});var qb=a.location,rb=r.now(),sb=/\?/;r.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||r.error("Invalid XML: "+b),c};var tb=/\[\]$/,ub=/\r?\n/g,vb=/^(?:submit|button|image|reset|file)$/i,wb=/^(?:input|select|textarea|keygen)/i;function xb(a,b,c,d){var e;if(r.isArray(b))r.each(b,function(b,e){c||tb.test(a)?d(a,e):xb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==r.type(b))d(a,b);else for(e in b)xb(a+"["+e+"]",b[e],c,d)}r.param=function(a,b){var c,d=[],e=function(a,b){var c=r.isFunction(b)?b():b;d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(null==c?"":c)};if(r.isArray(a)||a.jquery&&!r.isPlainObject(a))r.each(a,function(){e(this.name,this.value)});else for(c in a)xb(c,a[c],b,e);return d.join("&")},r.fn.extend({serialize:function(){return r.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=r.prop(this,"elements");return a?r.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!r(this).is(":disabled")&&wb.test(this.nodeName)&&!vb.test(a)&&(this.checked||!ia.test(a))}).map(function(a,b){var c=r(this).val();return null==c?null:r.isArray(c)?r.map(c,function(a){return{name:b.name,value:a.replace(ub,"\r\n")}}):{name:b.name,value:c.replace(ub,"\r\n")}}).get()}});var yb=/%20/g,zb=/#.*$/,Ab=/([?&])_=[^&]*/,Bb=/^(.*?):[ \t]*([^\r\n]*)$/gm,Cb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Db=/^(?:GET|HEAD)$/,Eb=/^\/\//,Fb={},Gb={},Hb="*/".concat("*"),Ib=d.createElement("a");Ib.href=qb.href;function Jb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(K)||[];if(r.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function Kb(a,b,c,d){var e={},f=a===Gb;function g(h){var i;return e[h]=!0,r.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function Lb(a,b){var c,d,e=r.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&r.extend(!0,a,d),a}function Mb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}if(f)return f!==i[0]&&i.unshift(f),c[f]}function Nb(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}r.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:qb.href,type:"GET",isLocal:Cb.test(qb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Hb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":r.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Lb(Lb(a,r.ajaxSettings),b):Lb(r.ajaxSettings,a)},ajaxPrefilter:Jb(Fb),ajaxTransport:Jb(Gb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m,n,o=r.ajaxSetup({},c),p=o.context||o,q=o.context&&(p.nodeType||p.jquery)?r(p):r.event,s=r.Deferred(),t=r.Callbacks("once memory"),u=o.statusCode||{},v={},w={},x="canceled",y={readyState:0,getResponseHeader:function(a){var b;if(k){if(!h){h={};while(b=Bb.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return k?g:null},setRequestHeader:function(a,b){return null==k&&(a=w[a.toLowerCase()]=w[a.toLowerCase()]||a,v[a]=b),this},overrideMimeType:function(a){return null==k&&(o.mimeType=a),this},statusCode:function(a){var b;if(a)if(k)y.always(a[y.status]);else for(b in a)u[b]=[u[b],a[b]];return this},abort:function(a){var b=a||x;return e&&e.abort(b),A(0,b),this}};if(s.promise(y),o.url=((b||o.url||qb.href)+"").replace(Eb,qb.protocol+"//"),o.type=c.method||c.type||o.method||o.type,o.dataTypes=(o.dataType||"*").toLowerCase().match(K)||[""],null==o.crossDomain){j=d.createElement("a");try{j.href=o.url,j.href=j.href,o.crossDomain=Ib.protocol+"//"+Ib.host!=j.protocol+"//"+j.host}catch(z){o.crossDomain=!0}}if(o.data&&o.processData&&"string"!=typeof o.data&&(o.data=r.param(o.data,o.traditional)),Kb(Fb,o,c,y),k)return y;l=r.event&&o.global,l&&0===r.active++&&r.event.trigger("ajaxStart"),o.type=o.type.toUpperCase(),o.hasContent=!Db.test(o.type),f=o.url.replace(zb,""),o.hasContent?o.data&&o.processData&&0===(o.contentType||"").indexOf("application/x-www-form-urlencoded")&&(o.data=o.data.replace(yb,"+")):(n=o.url.slice(f.length),o.data&&(f+=(sb.test(f)?"&":"?")+o.data,delete o.data),o.cache===!1&&(f=f.replace(Ab,"$1"),n=(sb.test(f)?"&":"?")+"_="+rb++ +n),o.url=f+n),o.ifModified&&(r.lastModified[f]&&y.setRequestHeader("If-Modified-Since",r.lastModified[f]),r.etag[f]&&y.setRequestHeader("If-None-Match",r.etag[f])),(o.data&&o.hasContent&&o.contentType!==!1||c.contentType)&&y.setRequestHeader("Content-Type",o.contentType),y.setRequestHeader("Accept",o.dataTypes[0]&&o.accepts[o.dataTypes[0]]?o.accepts[o.dataTypes[0]]+("*"!==o.dataTypes[0]?", "+Hb+"; q=0.01":""):o.accepts["*"]);for(m in o.headers)y.setRequestHeader(m,o.headers[m]);if(o.beforeSend&&(o.beforeSend.call(p,y,o)===!1||k))return y.abort();if(x="abort",t.add(o.complete),y.done(o.success),y.fail(o.error),e=Kb(Gb,o,c,y)){if(y.readyState=1,l&&q.trigger("ajaxSend",[y,o]),k)return y;o.async&&o.timeout>0&&(i=a.setTimeout(function(){y.abort("timeout")},o.timeout));try{k=!1,e.send(v,A)}catch(z){if(k)throw z;A(-1,z)}}else A(-1,"No Transport");function A(b,c,d,h){var j,m,n,v,w,x=c;k||(k=!0,i&&a.clearTimeout(i),e=void 0,g=h||"",y.readyState=b>0?4:0,j=b>=200&&b<300||304===b,d&&(v=Mb(o,y,d)),v=Nb(o,v,y,j),j?(o.ifModified&&(w=y.getResponseHeader("Last-Modified"),w&&(r.lastModified[f]=w),w=y.getResponseHeader("etag"),w&&(r.etag[f]=w)),204===b||"HEAD"===o.type?x="nocontent":304===b?x="notmodified":(x=v.state,m=v.data,n=v.error,j=!n)):(n=x,!b&&x||(x="error",b<0&&(b=0))),y.status=b,y.statusText=(c||x)+"",j?s.resolveWith(p,[m,x,y]):s.rejectWith(p,[y,x,n]),y.statusCode(u),u=void 0,l&&q.trigger(j?"ajaxSuccess":"ajaxError",[y,o,j?m:n]),t.fireWith(p,[y,x]),l&&(q.trigger("ajaxComplete",[y,o]),--r.active||r.event.trigger("ajaxStop")))}return y},getJSON:function(a,b,c){return r.get(a,b,c,"json")},getScript:function(a,b){return r.get(a,void 0,b,"script")}}),r.each(["get","post"],function(a,b){r[b]=function(a,c,d,e){return r.isFunction(c)&&(e=e||d,d=c,c=void 0),r.ajax(r.extend({url:a,type:b,dataType:e,data:c,success:d},r.isPlainObject(a)&&a))}}),r._evalUrl=function(a){return r.ajax({url:a,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,"throws":!0})},r.fn.extend({wrapAll:function(a){var b;return this[0]&&(r.isFunction(a)&&(a=a.call(this[0])),b=r(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this},wrapInner:function(a){return r.isFunction(a)?this.each(function(b){r(this).wrapInner(a.call(this,b))}):this.each(function(){var b=r(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=r.isFunction(a);return this.each(function(c){r(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(a){return this.parent(a).not("body").each(function(){r(this).replaceWith(this.childNodes)}),this}}),r.expr.pseudos.hidden=function(a){return!r.expr.pseudos.visible(a)},r.expr.pseudos.visible=function(a){return!!(a.offsetWidth||a.offsetHeight||a.getClientRects().length)},r.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Ob={0:200,1223:204},Pb=r.ajaxSettings.xhr();o.cors=!!Pb&&"withCredentials"in Pb,o.ajax=Pb=!!Pb,r.ajaxTransport(function(b){var c,d;if(o.cors||Pb&&!b.crossDomain)return{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Ob[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}}),r.ajaxPrefilter(function(a){a.crossDomain&&(a.contents.script=!1)}),r.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return r.globalEval(a),a}}}),r.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),r.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=r("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Qb=[],Rb=/(=)\?(?=&|$)|\?\?/;r.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Qb.pop()||r.expando+"_"+rb++;return this[a]=!0,a}}),r.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Rb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Rb.test(b.data)&&"data");if(h||"jsonp"===b.dataTypes[0])return e=b.jsonpCallback=r.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Rb,"$1"+e):b.jsonp!==!1&&(b.url+=(sb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||r.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?r(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Qb.push(e)),g&&r.isFunction(f)&&f(g[0]),g=f=void 0}),"script"}),o.createHTMLDocument=function(){var a=d.implementation.createHTMLDocument("").body;return a.innerHTML="<form></form><form></form>",2===a.childNodes.length}(),r.parseHTML=function(a,b,c){if("string"!=typeof a)return[];"boolean"==typeof b&&(c=b,b=!1);var e,f,g;return b||(o.createHTMLDocument?(b=d.implementation.createHTMLDocument(""),e=b.createElement("base"),e.href=d.location.href,b.head.appendChild(e)):b=d),f=B.exec(a),g=!c&&[],f?[b.createElement(f[1])]:(f=pa([a],b,g),g&&g.length&&r(g).remove(),r.merge([],f.childNodes))},r.fn.load=function(a,b,c){var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=mb(a.slice(h)),a=a.slice(0,h)),r.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&r.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?r("<div>").append(r.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},r.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){r.fn[b]=function(a){return this.on(b,a)}}),r.expr.pseudos.animated=function(a){return r.grep(r.timers,function(b){return a===b.elem}).length};function Sb(a){return r.isWindow(a)?a:9===a.nodeType&&a.defaultView}r.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=r.css(a,"position"),l=r(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=r.css(a,"top"),i=r.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),r.isFunction(b)&&(b=b.call(a,c,r.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},r.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){r.offset.setOffset(this,a,b)});var b,c,d,e,f=this[0];if(f)return f.getClientRects().length?(d=f.getBoundingClientRect(),d.width||d.height?(e=f.ownerDocument,c=Sb(e),b=e.documentElement,{top:d.top+c.pageYOffset-b.clientTop,left:d.left+c.pageXOffset-b.clientLeft}):d):{top:0,left:0}},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===r.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),r.nodeName(a[0],"html")||(d=a.offset()),d={top:d.top+r.css(a[0],"borderTopWidth",!0),left:d.left+r.css(a[0],"borderLeftWidth",!0)}),{top:b.top-d.top-r.css(c,"marginTop",!0),left:b.left-d.left-r.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===r.css(a,"position"))a=a.offsetParent;return a||qa})}}),r.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;r.fn[a]=function(d){return S(this,function(a,d,e){var f=Sb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),r.each(["top","left"],function(a,b){r.cssHooks[b]=Oa(o.pixelPosition,function(a,c){if(c)return c=Na(a,b),La.test(c)?r(a).position()[b]+"px":c})}),r.each({Height:"height",Width:"width"},function(a,b){r.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){r.fn[d]=function(e,f){var g=arguments.length&&(c||"boolean"!=typeof e),h=c||(e===!0||f===!0?"margin":"border");return S(this,function(b,c,e){var f;return r.isWindow(b)?0===d.indexOf("outer")?b["inner"+a]:b.document.documentElement["client"+a]:9===b.nodeType?(f=b.documentElement,Math.max(b.body["scroll"+a],f["scroll"+a],b.body["offset"+a],f["offset"+a],f["client"+a])):void 0===e?r.css(b,c,h):r.style(b,c,e,h)},b,g?e:void 0,g)}})}),r.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}}),r.parseJSON=JSON.parse,"function"==typeof define&&define.amd&&define("jquery",[],function(){return r});var Tb=a.jQuery,Ub=a.$;return r.noConflict=function(b){return a.$===r&&(a.$=Ub),b&&a.jQuery===r&&(a.jQuery=Tb),r},b||(a.jQuery=a.$=r),r});
/*!
 * Less - Leaner CSS v2.5.1
 * http://lesscss.org
 *
 * Copyright (c) 2009-2015, Alexis Sellier <self@cloudhead.net>
 * Licensed under the Apache v2 License.
 *
 */

 /** * @license Apache v2
 */


!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.less=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;d.length>g;g++)e(d[g]);return e}({1:[function(a,b){var c=a("./utils").addDataAttr,d=a("./browser");b.exports=function(a,b){c(b,d.currentScript(a)),void 0===b.isFileProtocol&&(b.isFileProtocol=/^(file|(chrome|safari)(-extension)?|resource|qrc|app):/.test(a.location.protocol)),b.async=b.async||!1,b.fileAsync=b.fileAsync||!1,b.poll=b.poll||(b.isFileProtocol?1e3:1500),b.env=b.env||("127.0.0.1"==a.location.hostname||"0.0.0.0"==a.location.hostname||"localhost"==a.location.hostname||a.location.port&&a.location.port.length>0||b.isFileProtocol?"development":"production");var e=/!dumpLineNumbers:(comments|mediaquery|all)/.exec(a.location.hash);e&&(b.dumpLineNumbers=e[1]),void 0===b.useFileCache&&(b.useFileCache=!0),void 0===b.onReady&&(b.onReady=!0)}},{"./browser":3,"./utils":9}],2:[function(a,b){a("promise/polyfill.js");var c=window.less||{};a("./add-default-options")(window,c);var d=b.exports=a("./index")(window,c);window.less=d,c.onReady&&(/!watch/.test(window.location.hash)&&d.watch(),d.registerStylesheetsImmediately(),d.pageLoadFinished=d.refresh("development"===d.env))},{"./add-default-options":1,"./index":7,"promise/polyfill.js":94}],3:[function(a,b){var c=a("./utils");b.exports={createCSS:function(a,b,d){var e=d.href||"",f="less:"+(d.title||c.extractId(e)),g=a.getElementById(f),h=!1,i=a.createElement("style");i.setAttribute("type","text/css"),d.media&&i.setAttribute("media",d.media),i.id=f,i.styleSheet||(i.appendChild(a.createTextNode(b)),h=null!==g&&g.childNodes.length>0&&i.childNodes.length>0&&g.firstChild.nodeValue===i.firstChild.nodeValue);var j=a.getElementsByTagName("head")[0];if(null===g||h===!1){var k=d&&d.nextSibling||null;k?k.parentNode.insertBefore(i,k):j.appendChild(i)}if(g&&h===!1&&g.parentNode.removeChild(g),i.styleSheet)try{i.styleSheet.cssText=b}catch(l){throw new Error("Couldn't reassign styleSheet.cssText.")}},currentScript:function(a){var b=a.document;return b.currentScript||function(){var a=b.getElementsByTagName("script");return a[a.length-1]}()}}},{"./utils":9}],4:[function(a,b){b.exports=function(a,b,c){var d=null;if("development"!==b.env)try{d="undefined"==typeof a.localStorage?null:a.localStorage}catch(e){}return{setCSS:function(a,b,e){if(d){c.info("saving "+a+" to cache.");try{d.setItem(a,e),d.setItem(a+":timestamp",b)}catch(f){c.error('failed to save "'+a+'" to local storage for caching.')}}},getCSS:function(a,b){var c=d&&d.getItem(a),e=d&&d.getItem(a+":timestamp");return e&&b.lastModified&&new Date(b.lastModified).valueOf()===new Date(e).valueOf()?c:void 0}}}},{}],5:[function(a,b){var c=a("./utils"),d=a("./browser");b.exports=function(a,b,e){function f(b,f){var g,h,i="less-error-message:"+c.extractId(f||""),j='<li><label>{line}</label><pre class="{class}">{content}</pre></li>',k=a.document.createElement("div"),l=[],m=b.filename||f,n=m.match(/([^\/]+(\?.*)?)$/)[1];k.id=i,k.className="less-error-message",h="<h3>"+(b.type||"Syntax")+"Error: "+(b.message||"There is an error in your .less file")+'</h3><p>in <a href="'+m+'">'+n+"</a> ";var o=function(a,b,c){void 0!==a.extract[b]&&l.push(j.replace(/\{line\}/,(parseInt(a.line,10)||0)+(b-1)).replace(/\{class\}/,c).replace(/\{content\}/,a.extract[b]))};b.extract&&(o(b,0,""),o(b,1,"line"),o(b,2,""),h+="on line "+b.line+", column "+(b.column+1)+":</p><ul>"+l.join("")+"</ul>"),b.stack&&(b.extract||e.logLevel>=4)&&(h+="<br/>Stack Trace</br />"+b.stack.split("\n").slice(1).join("<br/>")),k.innerHTML=h,d.createCSS(a.document,[".less-error-message ul, .less-error-message li {","list-style-type: none;","margin-right: 15px;","padding: 4px 0;","margin: 0;","}",".less-error-message label {","font-size: 12px;","margin-right: 15px;","padding: 4px 0;","color: #cc7777;","}",".less-error-message pre {","color: #dd6666;","padding: 4px 0;","margin: 0;","display: inline-block;","}",".less-error-message pre.line {","color: #ff0000;","}",".less-error-message h3 {","font-size: 20px;","font-weight: bold;","padding: 15px 0 5px 0;","margin: 0;","}",".less-error-message a {","color: #10a","}",".less-error-message .error {","color: red;","font-weight: bold;","padding-bottom: 2px;","border-bottom: 1px dashed red;","}"].join("\n"),{title:"error-message"}),k.style.cssText=["font-family: Arial, sans-serif","border: 1px solid #e00","background-color: #eee","border-radius: 5px","-webkit-border-radius: 5px","-moz-border-radius: 5px","color: #e00","padding: 15px","margin-bottom: 15px"].join(";"),"development"===e.env&&(g=setInterval(function(){var b=a.document,c=b.body;c&&(b.getElementById(i)?c.replaceChild(k,b.getElementById(i)):c.insertBefore(k,c.firstChild),clearInterval(g))},10))}function g(a,b){e.errorReporting&&"html"!==e.errorReporting?"console"===e.errorReporting?k(a,b):"function"==typeof e.errorReporting&&e.errorReporting("add",a,b):f(a,b)}function h(b){var d=a.document.getElementById("less-error-message:"+c.extractId(b));d&&d.parentNode.removeChild(d)}function i(){}function j(a){e.errorReporting&&"html"!==e.errorReporting?"console"===e.errorReporting?i(a):"function"==typeof e.errorReporting&&e.errorReporting("remove",a):h(a)}function k(a,c){var d="{line} {content}",f=a.filename||c,g=[],h=(a.type||"Syntax")+"Error: "+(a.message||"There is an error in your .less file")+" in "+f+" ",i=function(a,b,c){void 0!==a.extract[b]&&g.push(d.replace(/\{line\}/,(parseInt(a.line,10)||0)+(b-1)).replace(/\{class\}/,c).replace(/\{content\}/,a.extract[b]))};a.extract&&(i(a,0,""),i(a,1,"line"),i(a,2,""),h+="on line "+a.line+", column "+(a.column+1)+":\n"+g.join("\n")),a.stack&&(a.extract||e.logLevel>=4)&&(h+="\nStack Trace\n"+a.stack),b.logger.error(h)}return{add:g,remove:j}}},{"./browser":3,"./utils":9}],6:[function(a,b){b.exports=function(b,c){function d(){if(window.XMLHttpRequest&&!("file:"===window.location.protocol&&"ActiveXObject"in window))return new XMLHttpRequest;try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(a){return c.error("browser doesn't support AJAX."),null}}var e=a("../less/environment/abstract-file-manager.js"),f={},g=function(){};return g.prototype=new e,g.prototype.alwaysMakePathsAbsolute=function(){return!0},g.prototype.join=function(a,b){return a?this.extractUrlParts(b,a).path:b},g.prototype.doXHR=function(a,e,f,g){function h(b,c,d){b.status>=200&&300>b.status?c(b.responseText,b.getResponseHeader("Last-Modified")):"function"==typeof d&&d(b.status,a)}var i=d(),j=b.isFileProtocol?b.fileAsync:b.async;"function"==typeof i.overrideMimeType&&i.overrideMimeType("text/css"),c.debug("XHR: Getting '"+a+"'"),i.open("GET",a,j),i.setRequestHeader("Accept",e||"text/x-less, text/css; q=0.9, */*; q=0.5"),i.send(null),b.isFileProtocol&&!b.fileAsync?0===i.status||i.status>=200&&300>i.status?f(i.responseText):g(i.status,a):j?i.onreadystatechange=function(){4==i.readyState&&h(i,f,g)}:h(i,f,g)},g.prototype.supports=function(){return!0},g.prototype.clearFileCache=function(){f={}},g.prototype.loadFile=function(a,b,c,d,e){b&&!this.isPathAbsolute(a)&&(a=b+a),c=c||{};var g=this.extractUrlParts(a,window.location.href),h=g.url;if(c.useFileCache&&f[h])try{var i=f[h];e(null,{contents:i,filename:h,webInfo:{lastModified:new Date}})}catch(j){e({filename:h,message:"Error loading file "+h+" error was "+j.message})}else this.doXHR(h,c.mime,function(a,b){f[h]=a,e(null,{contents:a,filename:h,webInfo:{lastModified:b}})},function(a,b){e({type:"File",message:"'"+b+"' wasn't found ("+a+")",href:h})})},g}},{"../less/environment/abstract-file-manager.js":14}],7:[function(a,b){var c=a("./utils").addDataAttr,d=a("./browser");b.exports=function(b,e){function f(a){return e.postProcessor&&"function"==typeof e.postProcessor&&(a=e.postProcessor.call(a,a)||a),a}function g(a){var b={};for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b}function h(a,b){var c=Array.prototype.slice.call(arguments,2);return function(){var d=c.concat(Array.prototype.slice.call(arguments,0));return a.apply(b,d)}}function i(a){for(var b,c=m.getElementsByTagName("style"),d=0;c.length>d;d++)if(b=c[d],b.type.match(t)){var f=g(e);f.modifyVars=a;var i=b.innerHTML||"";f.filename=m.location.href.replace(/#.*$/,""),n.render(i,f,h(function(a,b,c){b?r.add(b,"inline"):(a.type="text/css",a.styleSheet?a.styleSheet.cssText=c.css:a.innerHTML=c.css)},null,b))}}function j(a,b,d,h,i){function j(c){var e=c.contents,g=c.filename,i=c.webInfo,j={currentDirectory:q.getPath(g),filename:g,rootFilename:g,relativeUrls:k.relativeUrls};if(j.entryPath=j.currentDirectory,j.rootpath=k.rootpath||j.currentDirectory,i&&(i.remaining=h,!k.modifyVars)){var l=s.getCSS(g,i);if(!d&&l)return i.local=!0,void b(null,l,e,a,i,g)}r.remove(g),k.rootFileInfo=j,n.render(e,k,function(c,d){c?(c.href=g,b(c)):(d.css=f(d.css),k.modifyVars||s.setCSS(a.href,i.lastModified,d.css),b(null,d.css,e,a,i,g))})}var k=g(e);c(k,a),k.mime=a.type,i&&(k.modifyVars=i),q.loadFile(a.href,null,k,o,function(a,c){return a?void b(a):void j(c)})}function k(a,b,c){for(var d=0;n.sheets.length>d;d++)j(n.sheets[d],a,b,n.sheets.length-(d+1),c)}function l(){"development"===n.env&&(n.watchTimer=setInterval(function(){n.watchMode&&(q.clearFileCache(),k(function(a,c,e,f){a?r.add(a,a.href||f.href):c&&d.createCSS(b.document,c,f)}))},e.poll))}var m=b.document,n=a("../less")();n.options=e;var o=n.environment,p=a("./file-manager")(e,n.logger),q=new p;o.addFileManager(q),n.FileManager=p,a("./log-listener")(n,e);var r=a("./error-reporting")(b,n,e),s=n.cache=e.cache||a("./cache")(b,e,n.logger);e.functions&&n.functions.functionRegistry.addMultiple(e.functions);var t=/^text\/(x-)?less$/;return n.watch=function(){return n.watchMode||(n.env="development",l()),this.watchMode=!0,!0},n.unwatch=function(){return clearInterval(n.watchTimer),this.watchMode=!1,!1},n.registerStylesheetsImmediately=function(){var a=m.getElementsByTagName("link");n.sheets=[];for(var b=0;a.length>b;b++)("stylesheet/less"===a[b].rel||a[b].rel.match(/stylesheet/)&&a[b].type.match(t))&&n.sheets.push(a[b])},n.registerStylesheets=function(){return new Promise(function(a){n.registerStylesheetsImmediately(),a()})},n.modifyVars=function(a){return n.refresh(!0,a,!1)},n.refresh=function(a,c,e){return(a||e)&&e!==!1&&q.clearFileCache(),new Promise(function(e,f){var g,h,j;g=h=new Date,k(function(a,c,i,k,l){return a?(r.add(a,a.href||k.href),void f(a)):(n.logger.info(l.local?"loading "+k.href+" from cache.":"rendered "+k.href+" successfully."),d.createCSS(b.document,c,k),n.logger.info("css for "+k.href+" generated in "+(new Date-h)+"ms"),0===l.remaining&&(j=new Date-g,n.logger.info("less has finished. css generated in "+j+"ms"),e({startTime:g,endTime:h,totalMilliseconds:j,sheets:n.sheets.length})),void(h=new Date))},a,c),i(c)})},n.refreshStyles=i,n}},{"../less":29,"./browser":3,"./cache":4,"./error-reporting":5,"./file-manager":6,"./log-listener":8,"./utils":9}],8:[function(a,b){b.exports=function(a,b){var c=4,d=3,e=2,f=1;b.logLevel="undefined"!=typeof b.logLevel?b.logLevel:"development"===b.env?d:f,b.loggers||(b.loggers=[{debug:function(a){b.logLevel>=c&&console.log(a)},info:function(a){b.logLevel>=d&&console.log(a)},warn:function(a){b.logLevel>=e&&console.warn(a)},error:function(a){b.logLevel>=f&&console.error(a)}}]);for(var g=0;b.loggers.length>g;g++)a.logger.addListener(b.loggers[g])}},{}],9:[function(a,b){b.exports={extractId:function(a){return a.replace(/^[a-z-]+:\/+?[^\/]+/,"").replace(/[\?\&]livereload=\w+/,"").replace(/^\//,"").replace(/\.[a-zA-Z]+$/,"").replace(/[^\.\w-]+/g,"-").replace(/\./g,":")},addDataAttr:function(a,b){for(var c in b.dataset)if(b.dataset.hasOwnProperty(c))if("env"===c||"dumpLineNumbers"===c||"rootpath"===c||"errorReporting"===c)a[c]=b.dataset[c];else try{a[c]=JSON.parse(b.dataset[c])}catch(d){}}}},{}],10:[function(a,b){var c={};b.exports=c;var d=function(a,b,c){if(a)for(var d=0;c.length>d;d++)a.hasOwnProperty(c[d])&&(b[c[d]]=a[c[d]])},e=["paths","relativeUrls","rootpath","strictImports","insecure","dumpLineNumbers","compress","syncImport","chunkInput","mime","useFileCache","processImports","reference","pluginManager"];c.Parse=function(a){d(a,this,e),"string"==typeof this.paths&&(this.paths=[this.paths])};var f=["paths","compress","ieCompat","strictMath","strictUnits","sourceMap","importMultiple","urlArgs","javascriptEnabled","pluginManager","importantScope"];c.Eval=function(a,b){d(a,this,f),"string"==typeof this.paths&&(this.paths=[this.paths]),this.frames=b||[],this.importantScope=this.importantScope||[]},c.Eval.prototype.inParenthesis=function(){this.parensStack||(this.parensStack=[]),this.parensStack.push(!0)},c.Eval.prototype.outOfParenthesis=function(){this.parensStack.pop()},c.Eval.prototype.isMathOn=function(){return this.strictMath?this.parensStack&&this.parensStack.length:!0},c.Eval.prototype.isPathRelative=function(a){return!/^(?:[a-z-]+:|\/|#)/i.test(a)},c.Eval.prototype.normalizePath=function(a){var b,c=a.split("/").reverse();for(a=[];0!==c.length;)switch(b=c.pop()){case".":break;case"..":0===a.length||".."===a[a.length-1]?a.push(b):a.pop();break;default:a.push(b)}return a.join("/")}},{}],11:[function(a,b){b.exports={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgrey:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",grey:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"}},{}],12:[function(a,b){b.exports={colors:a("./colors"),unitConversions:a("./unit-conversions")}},{"./colors":11,"./unit-conversions":13}],13:[function(a,b){b.exports={length:{m:1,cm:.01,mm:.001,"in":.0254,px:.0254/96,pt:.0254/72,pc:.0254/72*12},duration:{s:1,ms:.001},angle:{rad:1/(2*Math.PI),deg:1/360,grad:.0025,turn:1}}},{}],14:[function(a,b){var c=function(){};c.prototype.getPath=function(a){var b=a.lastIndexOf("?");return b>0&&(a=a.slice(0,b)),b=a.lastIndexOf("/"),0>b&&(b=a.lastIndexOf("\\")),0>b?"":a.slice(0,b+1)},c.prototype.tryAppendExtension=function(a,b){return/(\.[a-z]*$)|([\?;].*)$/.test(a)?a:a+b},c.prototype.tryAppendLessExtension=function(a){return this.tryAppendExtension(a,".less")},c.prototype.supportsSync=function(){return!1},c.prototype.alwaysMakePathsAbsolute=function(){return!1},c.prototype.isPathAbsolute=function(a){return/^(?:[a-z-]+:|\/|\\|#)/i.test(a)},c.prototype.join=function(a,b){return a?a+b:b},c.prototype.pathDiff=function(a,b){var c,d,e,f,g=this.extractUrlParts(a),h=this.extractUrlParts(b),i="";if(g.hostPart!==h.hostPart)return"";for(d=Math.max(h.directories.length,g.directories.length),c=0;d>c&&h.directories[c]===g.directories[c];c++);for(f=h.directories.slice(c),e=g.directories.slice(c),c=0;f.length-1>c;c++)i+="../";for(c=0;e.length-1>c;c++)i+=e[c]+"/";return i},c.prototype.extractUrlParts=function(a,b){var c,d,e=/^((?:[a-z-]+:)?\/+?(?:[^\/\?#]*\/)|([\/\\]))?((?:[^\/\\\?#]*[\/\\])*)([^\/\\\?#]*)([#\?].*)?$/i,f=a.match(e),g={},h=[];if(!f)throw new Error("Could not parse sheet href - '"+a+"'");if(b&&(!f[1]||f[2])){if(d=b.match(e),!d)throw new Error("Could not parse page url - '"+b+"'");f[1]=f[1]||d[1]||"",f[2]||(f[3]=d[3]+f[3])}if(f[3]){for(h=f[3].replace(/\\/g,"/").split("/"),c=0;h.length>c;c++)"."===h[c]&&(h.splice(c,1),c-=1);for(c=0;h.length>c;c++)".."===h[c]&&c>0&&(h.splice(c-1,2),c-=2)}return g.hostPart=f[1],g.directories=h,g.path=(f[1]||"")+h.join("/"),g.fileUrl=g.path+(f[4]||""),g.url=g.fileUrl+(f[5]||""),g},b.exports=c},{}],15:[function(a,b){var c=a("../logger"),d=function(a,b){this.fileManagers=b||[],a=a||{};for(var c=["encodeBase64","mimeLookup","charsetLookup","getSourceMapGenerator"],d=[],e=d.concat(c),f=0;e.length>f;f++){var g=e[f],h=a[g];h?this[g]=h.bind(a):d.length>f&&this.warn("missing required function in environment - "+g)}};d.prototype.getFileManager=function(a,b,d,e,f){a||c.warn("getFileManager called with no filename.. Please report this issue. continuing."),null==b&&c.warn("getFileManager called with null directory.. Please report this issue. continuing.");var g=this.fileManagers;d.pluginManager&&(g=[].concat(g).concat(d.pluginManager.getFileManagers()));for(var h=g.length-1;h>=0;h--){var i=g[h];if(i[f?"supportsSync":"supports"](a,b,d,e))return i}return null},d.prototype.addFileManager=function(a){this.fileManagers.push(a)},d.prototype.clearFileManagers=function(){this.fileManagers=[]},b.exports=d},{"../logger":31}],16:[function(a){function b(a,b,d){var e,f,g,h,i=b.alpha,j=d.alpha,k=[];g=j+i*(1-j);for(var l=0;3>l;l++)e=b.rgb[l]/255,f=d.rgb[l]/255,h=a(e,f),g&&(h=(j*f+i*(e-j*(e+f-h)))/g),k[l]=255*h;return new c(k,g)}var c=a("../tree/color"),d=a("./function-registry"),e={multiply:function(a,b){return a*b},screen:function(a,b){return a+b-a*b},overlay:function(a,b){return a*=2,1>=a?e.multiply(a,b):e.screen(a-1,b)},softlight:function(a,b){var c=1,d=a;return b>.5&&(d=1,c=a>.25?Math.sqrt(a):((16*a-12)*a+4)*a),a-(1-2*b)*d*(c-a)},hardlight:function(a,b){return e.overlay(b,a)},difference:function(a,b){return Math.abs(a-b)},exclusion:function(a,b){return a+b-2*a*b},average:function(a,b){return(a+b)/2},negation:function(a,b){return 1-Math.abs(a+b-1)}};for(var f in e)e.hasOwnProperty(f)&&(b[f]=b.bind(null,e[f]));d.addMultiple(b)},{"../tree/color":48,"./function-registry":21}],17:[function(a){function b(a){return Math.min(1,Math.max(0,a))}function c(a){return f.hsla(a.h,a.s,a.l,a.a)}function d(a){if(a instanceof g)return parseFloat(a.unit.is("%")?a.value/100:a.value);if("number"==typeof a)return a;throw{type:"Argument",message:"color functions take numbers as parameters"}}function e(a,b){return a instanceof g&&a.unit.is("%")?parseFloat(a.value*b/100):d(a)}var f,g=a("../tree/dimension"),h=a("../tree/color"),i=a("../tree/quoted"),j=a("../tree/anonymous"),k=a("./function-registry");f={rgb:function(a,b,c){return f.rgba(a,b,c,1)},rgba:function(a,b,c,f){var g=[a,b,c].map(function(a){return e(a,255)});return f=d(f),new h(g,f)},hsl:function(a,b,c){return f.hsla(a,b,c,1)},hsla:function(a,c,e,g){function h(a){return a=0>a?a+1:a>1?a-1:a,1>6*a?j+(i-j)*a*6:1>2*a?i:2>3*a?j+(i-j)*(2/3-a)*6:j}a=d(a)%360/360,c=b(d(c)),e=b(d(e)),g=b(d(g));var i=.5>=e?e*(c+1):e+c-e*c,j=2*e-i;return f.rgba(255*h(a+1/3),255*h(a),255*h(a-1/3),g)},hsv:function(a,b,c){return f.hsva(a,b,c,1)},hsva:function(a,b,c,e){a=d(a)%360/360*360,b=d(b),c=d(c),e=d(e);var g,h;g=Math.floor(a/60%6),h=a/60-g;var i=[c,c*(1-b),c*(1-h*b),c*(1-(1-h)*b)],j=[[0,3,1],[2,0,1],[1,0,3],[1,2,0],[3,1,0],[0,1,2]];return f.rgba(255*i[j[g][0]],255*i[j[g][1]],255*i[j[g][2]],e)},hue:function(a){return new g(a.toHSL().h)},saturation:function(a){return new g(100*a.toHSL().s,"%")},lightness:function(a){return new g(100*a.toHSL().l,"%")},hsvhue:function(a){return new g(a.toHSV().h)},hsvsaturation:function(a){return new g(100*a.toHSV().s,"%")},hsvvalue:function(a){return new g(100*a.toHSV().v,"%")},red:function(a){return new g(a.rgb[0])},green:function(a){return new g(a.rgb[1])},blue:function(a){return new g(a.rgb[2])},alpha:function(a){return new g(a.toHSL().a)},luma:function(a){return new g(a.luma()*a.alpha*100,"%")},luminance:function(a){var b=.2126*a.rgb[0]/255+.7152*a.rgb[1]/255+.0722*a.rgb[2]/255;return new g(b*a.alpha*100,"%")},saturate:function(a,d,e){if(!a.rgb)return null;var f=a.toHSL();return f.s+="undefined"!=typeof e&&"relative"===e.value?f.s*d.value/100:d.value/100,f.s=b(f.s),c(f)},desaturate:function(a,d,e){var f=a.toHSL();return f.s-="undefined"!=typeof e&&"relative"===e.value?f.s*d.value/100:d.value/100,f.s=b(f.s),c(f)},lighten:function(a,d,e){var f=a.toHSL();return f.l+="undefined"!=typeof e&&"relative"===e.value?f.l*d.value/100:d.value/100,f.l=b(f.l),c(f)},darken:function(a,d,e){var f=a.toHSL();return f.l-="undefined"!=typeof e&&"relative"===e.value?f.l*d.value/100:d.value/100,f.l=b(f.l),c(f)},fadein:function(a,d,e){var f=a.toHSL();return f.a+="undefined"!=typeof e&&"relative"===e.value?f.a*d.value/100:d.value/100,f.a=b(f.a),c(f)},fadeout:function(a,d,e){var f=a.toHSL();return f.a-="undefined"!=typeof e&&"relative"===e.value?f.a*d.value/100:d.value/100,f.a=b(f.a),c(f)},fade:function(a,d){var e=a.toHSL();return e.a=d.value/100,e.a=b(e.a),c(e)},spin:function(a,b){var d=a.toHSL(),e=(d.h+b.value)%360;return d.h=0>e?360+e:e,c(d)},mix:function(a,b,c){a.toHSL&&b.toHSL||(console.log(b.type),console.dir(b)),c||(c=new g(50));var d=c.value/100,e=2*d-1,f=a.toHSL().a-b.toHSL().a,i=((e*f==-1?e:(e+f)/(1+e*f))+1)/2,j=1-i,k=[a.rgb[0]*i+b.rgb[0]*j,a.rgb[1]*i+b.rgb[1]*j,a.rgb[2]*i+b.rgb[2]*j],l=a.alpha*d+b.alpha*(1-d);return new h(k,l)},greyscale:function(a){return f.desaturate(a,new g(100))},contrast:function(a,b,c,e){if(!a.rgb)return null;if("undefined"==typeof c&&(c=f.rgba(255,255,255,1)),"undefined"==typeof b&&(b=f.rgba(0,0,0,1)),b.luma()>c.luma()){var g=c;c=b,b=g}return e="undefined"==typeof e?.43:d(e),a.luma()<e?c:b},argb:function(a){return new j(a.toARGB())},color:function(a){if(a instanceof i&&/^#([a-f0-9]{6}|[a-f0-9]{3})$/i.test(a.value))return new h(a.value.slice(1));if(a instanceof h||(a=h.fromKeyword(a.value)))return a.value=void 0,a;throw{type:"Argument",message:"argument must be a color keyword or 3/6 digit hex e.g. #FFF"}},tint:function(a,b){return f.mix(f.rgb(255,255,255),a,b)},shade:function(a,b){return f.mix(f.rgb(0,0,0),a,b)}},k.addMultiple(f)},{"../tree/anonymous":44,"../tree/color":48,"../tree/dimension":54,"../tree/quoted":71,"./function-registry":21}],18:[function(a,b){b.exports=function(b){var c=a("../tree/quoted"),d=a("../tree/url"),e=a("./function-registry"),f=function(a,b){return new d(b,a.index,a.currentFileInfo).eval(a.context)},g=a("../logger");e.add("data-uri",function(a,e){e||(e=a,a=null);var h=a&&a.value,i=e.value,j=this.currentFileInfo,k=j.relativeUrls?j.currentDirectory:j.entryPath,l=i.indexOf("#"),m="";-1!==l&&(m=i.slice(l),i=i.slice(0,l));var n=b.getFileManager(i,k,this.context,b,!0);if(!n)return f(this,e);var o=!1;if(a)o=/;base64$/.test(h);else{if(h=b.mimeLookup(i),"image/svg+xml"===h)o=!1;else{var p=b.charsetLookup(h);o=["US-ASCII","UTF-8"].indexOf(p)<0}o&&(h+=";base64")}var q=n.loadFileSync(i,k,this.context,b);if(!q.contents)return g.warn("Skipped data-uri embedding of "+i+" because file not found"),f(this,e||a);var r=q.contents;if(o&&!b.encodeBase64)return f(this,e);r=o?b.encodeBase64(r):encodeURIComponent(r);var s="data:"+h+","+r+m,t=32768;return s.length>=t&&this.context.ieCompat!==!1?(g.warn("Skipped data-uri embedding of "+i+" because its size ("+s.length+" characters) exceeds IE8-safe "+t+" characters!"),f(this,e||a)):new d(new c('"'+s+'"',s,!1,this.index,this.currentFileInfo),this.index,this.currentFileInfo)})}},{"../logger":31,"../tree/quoted":71,"../tree/url":78,"./function-registry":21}],19:[function(a,b){var c=a("../tree/keyword"),d=a("./function-registry"),e={eval:function(){var a=this.value_,b=this.error_;if(b)throw b;return null!=a?a?c.True:c.False:void 0},value:function(a){this.value_=a},error:function(a){this.error_=a},reset:function(){this.value_=this.error_=null}};d.add("default",e.eval.bind(e)),b.exports=e},{"../tree/keyword":63,"./function-registry":21}],20:[function(a,b){var c=a("../tree/expression"),d=function(a,b,c,d){this.name=a.toLowerCase(),this.index=c,this.context=b,this.currentFileInfo=d,this.func=b.frames[0].functionRegistry.get(this.name)};d.prototype.isValid=function(){return Boolean(this.func)},d.prototype.call=function(a){return Array.isArray(a)&&(a=a.filter(function(a){return"Comment"===a.type?!1:!0}).map(function(a){if("Expression"===a.type){var b=a.value.filter(function(a){return"Comment"===a.type?!1:!0});return 1===b.length?b[0]:new c(b)}return a})),this.func.apply(this,a)},b.exports=d},{"../tree/expression":57}],21:[function(a,b){function c(a){return{_data:{},add:function(a,b){a=a.toLowerCase(),this._data.hasOwnProperty(a),this._data[a]=b},addMultiple:function(a){Object.keys(a).forEach(function(b){this.add(b,a[b])}.bind(this))},get:function(b){return this._data[b]||a&&a.get(b)},inherit:function(){return c(this)}}}b.exports=c(null)},{}],22:[function(a,b){b.exports=function(b){var c={functionRegistry:a("./function-registry"),functionCaller:a("./function-caller")};return a("./default"),a("./color"),a("./color-blending"),a("./data-uri")(b),a("./math"),a("./number"),a("./string"),a("./svg")(b),a("./types"),c}},{"./color":17,"./color-blending":16,"./data-uri":18,"./default":19,"./function-caller":20,"./function-registry":21,"./math":23,"./number":24,"./string":25,"./svg":26,"./types":27}],23:[function(a){function b(a,b,d){if(!(d instanceof c))throw{type:"Argument",message:"argument must be a number"};return null==b?b=d.unit:d=d.unify(),new c(a(parseFloat(d.value)),b)}var c=a("../tree/dimension"),d=a("./function-registry"),e={ceil:null,floor:null,sqrt:null,abs:null,tan:"",sin:"",cos:"",atan:"rad",asin:"rad",acos:"rad"};for(var f in e)e.hasOwnProperty(f)&&(e[f]=b.bind(null,Math[f],e[f]));e.round=function(a,c){var d="undefined"==typeof c?0:c.value;return b(function(a){return a.toFixed(d)},null,a)},d.addMultiple(e)},{"../tree/dimension":54,"./function-registry":21}],24:[function(a){var b=a("../tree/dimension"),c=a("../tree/anonymous"),d=a("./function-registry"),e=function(a,d){switch(d=Array.prototype.slice.call(d),d.length){case 0:throw{type:"Argument",message:"one or more arguments required"}}var e,f,g,h,i,j,k,l,m=[],n={};for(e=0;d.length>e;e++)if(g=d[e],g instanceof b)if(h=""===g.unit.toString()&&void 0!==l?new b(g.value,l).unify():g.unify(),j=""===h.unit.toString()&&void 0!==k?k:h.unit.toString(),k=""!==j&&void 0===k||""!==j&&""===m[0].unify().unit.toString()?j:k,l=""!==j&&void 0===l?g.unit.toString():l,f=void 0!==n[""]&&""!==j&&j===k?n[""]:n[j],void 0!==f)i=""===m[f].unit.toString()&&void 0!==l?new b(m[f].value,l).unify():m[f].unify(),(a&&i.value>h.value||!a&&h.value>i.value)&&(m[f]=g);else{if(void 0!==k&&j!==k)throw{type:"Argument",message:"incompatible types"};n[j]=m.length,m.push(g)}else Array.isArray(d[e].value)&&Array.prototype.push.apply(d,Array.prototype.slice.call(d[e].value));return 1==m.length?m[0]:(d=m.map(function(a){return a.toCSS(this.context)}).join(this.context.compress?",":", "),new c((a?"min":"max")+"("+d+")"))};d.addMultiple({min:function(){return e(!0,arguments)},max:function(){return e(!1,arguments)},convert:function(a,b){return a.convertTo(b.value)},pi:function(){return new b(Math.PI)},mod:function(a,c){return new b(a.value%c.value,a.unit)},pow:function(a,c){if("number"==typeof a&&"number"==typeof c)a=new b(a),c=new b(c);else if(!(a instanceof b&&c instanceof b))throw{type:"Argument",message:"arguments must be numbers"};return new b(Math.pow(a.value,c.value),a.unit)},percentage:function(a){return new b(100*a.value,"%")}})},{"../tree/anonymous":44,"../tree/dimension":54,"./function-registry":21}],25:[function(a){var b=a("../tree/quoted"),c=a("../tree/anonymous"),d=a("../tree/javascript"),e=a("./function-registry");e.addMultiple({e:function(a){return new c(a instanceof d?a.evaluated:a.value)},escape:function(a){return new c(encodeURI(a.value).replace(/=/g,"%3D").replace(/:/g,"%3A").replace(/#/g,"%23").replace(/;/g,"%3B").replace(/\(/g,"%28").replace(/\)/g,"%29"))},replace:function(a,c,d,e){var f=a.value;return d="Quoted"===d.type?d.value:d.toCSS(),f=f.replace(new RegExp(c.value,e?e.value:""),d),new b(a.quote||"",f,a.escaped)},"%":function(a){for(var c=Array.prototype.slice.call(arguments,1),d=a.value,e=0;c.length>e;e++)d=d.replace(/%[sda]/i,function(a){var b="Quoted"===c[e].type&&a.match(/s/i)?c[e].value:c[e].toCSS();return a.match(/[A-Z]$/)?encodeURIComponent(b):b});return d=d.replace(/%%/g,"%"),new b(a.quote||"",d,a.escaped)}})},{"../tree/anonymous":44,"../tree/javascript":61,"../tree/quoted":71,"./function-registry":21}],26:[function(a,b){b.exports=function(){var b=a("../tree/dimension"),c=a("../tree/color"),d=a("../tree/expression"),e=a("../tree/quoted"),f=a("../tree/url"),g=a("./function-registry");g.add("svg-gradient",function(a){function g(){throw{type:"Argument",message:"svg-gradient expects direction, start_color [start_position], [color position,]..., end_color [end_position] or direction, color list"}}var h,i,j,k,l,m,n,o,p="linear",q='x="0" y="0" width="1" height="1"',r={compress:!1},s=a.toCSS(r);switch(2==arguments.length?(arguments[1].value.length<2&&g(),h=arguments[1].value):arguments.length<3?g():h=Array.prototype.slice.call(arguments,1),s){case"to bottom":i='x1="0%" y1="0%" x2="0%" y2="100%"';break;case"to right":i='x1="0%" y1="0%" x2="100%" y2="0%"';break;case"to bottom right":i='x1="0%" y1="0%" x2="100%" y2="100%"';break;case"to top right":i='x1="0%" y1="100%" x2="100%" y2="0%"';break;case"ellipse":case"ellipse at center":p="radial",i='cx="50%" cy="50%" r="75%"',q='x="-50" y="-50" width="101" height="101"';break;default:throw{type:"Argument",message:"svg-gradient direction must be 'to bottom', 'to right', 'to bottom right', 'to top right' or 'ellipse at center'"}}for(j='<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><'+p+'Gradient id="gradient" gradientUnits="userSpaceOnUse" '+i+">",
k=0;h.length>k;k+=1)h[k]instanceof d?(l=h[k].value[0],m=h[k].value[1]):(l=h[k],m=void 0),l instanceof c&&((0===k||k+1===h.length)&&void 0===m||m instanceof b)||g(),n=m?m.toCSS(r):0===k?"0%":"100%",o=l.alpha,j+='<stop offset="'+n+'" stop-color="'+l.toRGB()+'"'+(1>o?' stop-opacity="'+o+'"':"")+"/>";return j+="</"+p+"Gradient><rect "+q+' fill="url(#gradient)" /></svg>',j=encodeURIComponent(j),j="data:image/svg+xml,"+j,new f(new e("'"+j+"'",j,!1,this.index,this.currentFileInfo),this.index,this.currentFileInfo)})}},{"../tree/color":48,"../tree/dimension":54,"../tree/expression":57,"../tree/quoted":71,"../tree/url":78,"./function-registry":21}],27:[function(a){var b=a("../tree/keyword"),c=a("../tree/detached-ruleset"),d=a("../tree/dimension"),e=a("../tree/color"),f=a("../tree/quoted"),g=a("../tree/anonymous"),h=a("../tree/url"),i=a("../tree/operation"),j=a("./function-registry"),k=function(a,c){return a instanceof c?b.True:b.False},l=function(a,c){if(void 0===c)throw{type:"Argument",message:"missing the required second argument to isunit."};if(c="string"==typeof c.value?c.value:c,"string"!=typeof c)throw{type:"Argument",message:"Second argument to isunit should be a unit or a string."};return a instanceof d&&a.unit.is(c)?b.True:b.False},m=function(a){var b=Array.isArray(a.value)?a.value:Array(a);return b};j.addMultiple({isruleset:function(a){return k(a,c)},iscolor:function(a){return k(a,e)},isnumber:function(a){return k(a,d)},isstring:function(a){return k(a,f)},iskeyword:function(a){return k(a,b)},isurl:function(a){return k(a,h)},ispixel:function(a){return l(a,"px")},ispercentage:function(a){return l(a,"%")},isem:function(a){return l(a,"em")},isunit:l,unit:function(a,c){if(!(a instanceof d))throw{type:"Argument",message:"the first argument to unit must be a number"+(a instanceof i?". Have you forgotten parenthesis?":"")};return c=c?c instanceof b?c.value:c.toCSS():"",new d(a.value,c)},"get-unit":function(a){return new g(a.unit)},extract:function(a,b){return b=b.value-1,m(a)[b]},length:function(a){return new d(m(a).length)}})},{"../tree/anonymous":44,"../tree/color":48,"../tree/detached-ruleset":53,"../tree/dimension":54,"../tree/keyword":63,"../tree/operation":69,"../tree/quoted":71,"../tree/url":78,"./function-registry":21}],28:[function(a,b){var c=a("./contexts"),d=a("./parser/parser"),e=a("./plugins/function-importer");b.exports=function(a){var b=function(a,b){this.rootFilename=b.filename,this.paths=a.paths||[],this.contents={},this.contentsIgnoredChars={},this.mime=a.mime,this.error=null,this.context=a,this.queue=[],this.files={}};return b.prototype.push=function(b,f,g,h,i){var j=this;this.queue.push(b);var k=function(a,c,d){j.queue.splice(j.queue.indexOf(b),1);var e=d===j.rootFilename;h.optional&&a?i(null,{rules:[]},!1,null):(j.files[d]=c,a&&!j.error&&(j.error=a),i(a,c,e,d))},l={relativeUrls:this.context.relativeUrls,entryPath:g.entryPath,rootpath:g.rootpath,rootFilename:g.rootFilename},m=a.getFileManager(b,g.currentDirectory,this.context,a);if(!m)return void k({message:"Could not find a file-manager for "+b});f&&(b=m.tryAppendExtension(b,h.plugin?".js":".less"));var n=function(a){var b=a.filename,f=a.contents.replace(/^\uFEFF/,"");l.currentDirectory=m.getPath(b),l.relativeUrls&&(l.rootpath=m.join(j.context.rootpath||"",m.pathDiff(l.currentDirectory,l.entryPath)),!m.isPathAbsolute(l.rootpath)&&m.alwaysMakePathsAbsolute()&&(l.rootpath=m.join(l.entryPath,l.rootpath))),l.filename=b;var i=new c.Parse(j.context);i.processImports=!1,j.contents[b]=f,(g.reference||h.reference)&&(l.reference=!0),h.plugin?new e(i,l).eval(f,function(a,c){k(a,c,b)}):h.inline?k(null,f,b):new d(i,j,l).parse(f,function(a,c){k(a,c,b)})},o=m.loadFile(b,g.currentDirectory,this.context,a,function(a,b){a?k(a):n(b)});o&&o.then(n,k)},b}},{"./contexts":10,"./parser/parser":36,"./plugins/function-importer":38}],29:[function(a,b){b.exports=function(b,c){var d,e,f,g,h,i={version:[2,5,1],data:a("./data"),tree:a("./tree"),Environment:h=a("./environment/environment"),AbstractFileManager:a("./environment/abstract-file-manager"),environment:b=new h(b,c),visitors:a("./visitors"),Parser:a("./parser/parser"),functions:a("./functions")(b),contexts:a("./contexts"),SourceMapOutput:d=a("./source-map-output")(b),SourceMapBuilder:e=a("./source-map-builder")(d,b),ParseTree:f=a("./parse-tree")(e),ImportManager:g=a("./import-manager")(b),render:a("./render")(b,f,g),parse:a("./parse")(b,f,g),LessError:a("./less-error"),transformTree:a("./transform-tree"),utils:a("./utils"),PluginManager:a("./plugin-manager"),logger:a("./logger")};return i}},{"./contexts":10,"./data":12,"./environment/abstract-file-manager":14,"./environment/environment":15,"./functions":22,"./import-manager":28,"./less-error":30,"./logger":31,"./parse":33,"./parse-tree":32,"./parser/parser":36,"./plugin-manager":37,"./render":39,"./source-map-builder":40,"./source-map-output":41,"./transform-tree":42,"./tree":60,"./utils":81,"./visitors":85}],30:[function(a,b){var c=a("./utils"),d=b.exports=function(a,b,d){Error.call(this);var e=a.filename||d;if(b&&e){var f=b.contents[e],g=c.getLocation(a.index,f),h=g.line,i=g.column,j=a.call&&c.getLocation(a.call,f).line,k=f.split("\n");this.type=a.type||"Syntax",this.filename=e,this.index=a.index,this.line="number"==typeof h?h+1:null,this.callLine=j+1,this.callExtract=k[j],this.column=i,this.extract=[k[h-1],k[h],k[h+1]]}this.message=a.message,this.stack=a.stack};if("undefined"==typeof Object.create){var e=function(){};e.prototype=Error.prototype,d.prototype=new e}else d.prototype=Object.create(Error.prototype);d.prototype.constructor=d},{"./utils":81}],31:[function(a,b){b.exports={error:function(a){this._fireEvent("error",a)},warn:function(a){this._fireEvent("warn",a)},info:function(a){this._fireEvent("info",a)},debug:function(a){this._fireEvent("debug",a)},addListener:function(a){this._listeners.push(a)},removeListener:function(a){for(var b=0;this._listeners.length>b;b++)if(this._listeners[b]===a)return void this._listeners.splice(b,1)},_fireEvent:function(a,b){for(var c=0;this._listeners.length>c;c++){var d=this._listeners[c][a];d&&d(b)}},_listeners:[]}},{}],32:[function(a,b){var c=a("./less-error"),d=a("./transform-tree"),e=a("./logger");b.exports=function(a){var b=function(a,b){this.root=a,this.imports=b};return b.prototype.toCSS=function(b){var f,g,h={};try{f=d(this.root,b)}catch(i){throw new c(i,this.imports)}try{var j=Boolean(b.compress);j&&e.warn("The compress option has been deprecated. We recommend you use a dedicated css minifier, for instance see less-plugin-clean-css.");var k={compress:j,dumpLineNumbers:b.dumpLineNumbers,strictUnits:Boolean(b.strictUnits),numPrecision:8};b.sourceMap?(g=new a(b.sourceMap),h.css=g.toCSS(f,k,this.imports)):h.css=f.toCSS(k)}catch(i){throw new c(i,this.imports)}if(b.pluginManager)for(var l=b.pluginManager.getPostProcessors(),m=0;l.length>m;m++)h.css=l[m].process(h.css,{sourceMap:g,options:b,imports:this.imports});b.sourceMap&&(h.map=g.getExternalSourceMap()),h.imports=[];for(var n in this.imports.files)this.imports.files.hasOwnProperty(n)&&n!==this.imports.rootFilename&&h.imports.push(n);return h},b}},{"./less-error":30,"./logger":31,"./transform-tree":42}],33:[function(a,b){var c,d=a("./contexts"),e=a("./parser/parser"),f=a("./plugin-manager");b.exports=function(b,g,h){var i=function(b,g,j){if(g=g||{},"function"==typeof g&&(j=g,g={}),!j){c||(c="undefined"==typeof Promise?a("promise"):Promise);var k=this;return new c(function(a,c){i.call(k,b,g,function(b,d){b?c(b):a(d)})})}var l,m,n=new f(this);if(n.addPlugins(g.plugins),g.pluginManager=n,l=new d.Parse(g),g.rootFileInfo)m=g.rootFileInfo;else{var o=g.filename||"input",p=o.replace(/[^\/\\]*$/,"");m={filename:o,relativeUrls:l.relativeUrls,rootpath:l.rootpath||"",currentDirectory:p,entryPath:p,rootFilename:o},m.rootpath&&"/"!==m.rootpath.slice(-1)&&(m.rootpath+="/")}var q=new h(l,m);new e(l,q,m).parse(b,function(a,b){return a?j(a):void j(null,b,q,g)},g)};return i}},{"./contexts":10,"./parser/parser":36,"./plugin-manager":37,promise:void 0}],34:[function(a,b){b.exports=function(a,b){function c(b){var c=h-q;512>c&&!b||!c||(p.push(a.slice(q,h+1)),q=h+1)}var d,e,f,g,h,i,j,k,l,m=a.length,n=0,o=0,p=[],q=0;for(h=0;m>h;h++)if(j=a.charCodeAt(h),!(j>=97&&122>=j||34>j))switch(j){case 40:o++,e=h;continue;case 41:if(--o<0)return b("missing opening `(`",h);continue;case 59:o||c();continue;case 123:n++,d=h;continue;case 125:if(--n<0)return b("missing opening `{`",h);n||o||c();continue;case 92:if(m-1>h){h++;continue}return b("unescaped `\\`",h);case 34:case 39:case 96:for(l=0,i=h,h+=1;m>h;h++)if(k=a.charCodeAt(h),!(k>96)){if(k==j){l=1;break}if(92==k){if(h==m-1)return b("unescaped `\\`",h);h++}}if(l)continue;return b("unmatched `"+String.fromCharCode(j)+"`",i);case 47:if(o||h==m-1)continue;if(k=a.charCodeAt(h+1),47==k)for(h+=2;m>h&&(k=a.charCodeAt(h),!(13>=k)||10!=k&&13!=k);h++);else if(42==k){for(f=i=h,h+=2;m-1>h&&(k=a.charCodeAt(h),125==k&&(g=h),42!=k||47!=a.charCodeAt(h+1));h++);if(h==m-1)return b("missing closing `*/`",i);h++}continue;case 42:if(m-1>h&&47==a.charCodeAt(h+1))return b("unmatched `/*`",h);continue}return 0!==n?f>d&&g>f?b("missing closing `}` or `*/`",d):b("missing closing `}`",d):0!==o?b("missing closing `)`",e):(c(!0),p)}},{}],35:[function(a,b){var c=a("./chunker");b.exports=function(){var a,b,d,e,f,g,h,i=[],j={};j.save=function(){h=j.i,i.push({current:g,i:j.i,j:b})},j.restore=function(a){(j.i>d||j.i===d&&a&&!e)&&(d=j.i,e=a);var c=i.pop();g=c.current,h=j.i=c.i,b=c.j},j.forget=function(){i.pop()},j.isWhitespace=function(b){var c=j.i+(b||0),d=a.charCodeAt(c);return d===k||d===n||d===l||d===m},j.$re=function(a){j.i>h&&(g=g.slice(j.i-h),h=j.i);var b=a.exec(g);return b?(s(b[0].length),"string"==typeof b?b:1===b.length?b[0]:b):null},j.$char=function(b){return a.charAt(j.i)!==b?null:(s(1),b)},j.$str=function(b){for(var c=b.length,d=0;c>d;d++)if(a.charAt(j.i+d)!==b.charAt(d))return null;return s(c),b},j.$quoted=function(){var b=a.charAt(j.i);if("'"===b||'"'===b){for(var c=a.length,d=j.i,e=1;c>e+d;e++){var f=a.charAt(e+d);switch(f){case"\\":e++;continue;case"\r":case"\n":break;case b:var g=a.substr(d,e+1);return s(e+1),g}}return null}};var k=32,l=9,m=10,n=13,o=43,p=44,q=47,r=57;j.autoCommentAbsorb=!0,j.commentStore=[],j.finished=!1;var s=function(c){for(var d,e,i,o=j.i,p=b,r=j.i-h,t=j.i+g.length-r,u=j.i+=c,v=a;t>j.i;j.i++){if(d=v.charCodeAt(j.i),j.autoCommentAbsorb&&d===q){if(e=v.charAt(j.i+1),"/"===e){i={index:j.i,isLineComment:!0};var w=v.indexOf("\n",j.i+2);0>w&&(w=t),j.i=w,i.text=v.substr(i.i,j.i-i.i),j.commentStore.push(i);continue}if("*"===e){var x=v.indexOf("*/",j.i+2);if(x>=0){i={index:j.i,text:v.substr(j.i,x+2-j.i),isLineComment:!1},j.i+=i.text.length-1,j.commentStore.push(i);continue}}break}if(d!==k&&d!==m&&d!==l&&d!==n)break}if(g=g.slice(c+j.i-u+r),h=j.i,!g.length){if(f.length-1>b)return g=f[++b],s(0),!0;j.finished=!0}return o!==j.i||p!==b};return j.peek=function(b){if("string"==typeof b){for(var c=0;b.length>c;c++)if(a.charAt(j.i+c)!==b.charAt(c))return!1;return!0}return b.test(g)},j.peekChar=function(b){return a.charAt(j.i)===b},j.currentChar=function(){return a.charAt(j.i)},j.getInput=function(){return a},j.peekNotNumeric=function(){var b=a.charCodeAt(j.i);return b>r||o>b||b===q||b===p},j.start=function(e,i,k){a=e,j.i=b=h=d=0,f=i?c(e,k):[e],g=f[0],s(0)},j.end=function(){var b,c=j.i>=a.length;return d>j.i&&(b=e,j.i=d),{isFinished:c,furthest:j.i,furthestPossibleErrorMessage:b,furthestReachedEnd:j.i>=a.length-1,furthestChar:a[j.i]}},j}},{"./chunker":34}],36:[function(a,b){var c=a("../less-error"),d=a("../tree"),e=a("../visitors"),f=a("./parser-input"),g=a("../utils"),h=function i(a,b,h){function j(a,b){var c="[object Function]"===Object.prototype.toString.call(a)?a.call(n):o.$re(a);return c?c:void l(b||("string"==typeof a?"expected '"+a+"' got '"+o.currentChar()+"'":"unexpected token"))}function k(a,b){return o.$char(a)?a:void l(b||"expected '"+a+"' got '"+o.currentChar()+"'")}function l(a,d){throw new c({index:o.i,filename:h.filename,type:d||"Syntax",message:a},b)}function m(a){var b=h.filename;return{lineNumber:g.getLocation(a,o.getInput()).line+1,fileName:b}}var n,o=f();return{parse:function(f,g,j){var k,l,m,n,p=null,q="";if(l=j&&j.globalVars?i.serializeVars(j.globalVars)+"\n":"",m=j&&j.modifyVars?"\n"+i.serializeVars(j.modifyVars):"",a.pluginManager)for(var r=a.pluginManager.getPreProcessors(),s=0;r.length>s;s++)f=r[s].process(f,{context:a,imports:b,fileInfo:h});(l||j&&j.banner)&&(q=(j&&j.banner?j.banner:"")+l,n=b.contentsIgnoredChars,n[h.filename]=n[h.filename]||0,n[h.filename]+=q.length),f=f.replace(/\r\n?/g,"\n"),f=q+f.replace(/^\uFEFF/,"")+m,b.contents[h.filename]=f;try{o.start(f,a.chunkInput,function(a,d){throw new c({index:d,type:"Parse",message:a,filename:h.filename},b)}),k=new d.Ruleset(null,this.parsers.primary()),k.root=!0,k.firstRoot=!0}catch(t){return g(new c(t,b,h.filename))}var u=o.end();if(!u.isFinished){var v=u.furthestPossibleErrorMessage;v||(v="Unrecognised input","}"===u.furthestChar?v+=". Possibly missing opening '{'":")"===u.furthestChar?v+=". Possibly missing opening '('":u.furthestReachedEnd&&(v+=". Possibly missing something")),p=new c({type:"Parse",message:v,index:u.furthest,filename:h.filename},b)}var w=function(a){return a=p||a||b.error,a?(a instanceof c||(a=new c(a,b,h.filename)),g(a)):g(null,k)};return a.processImports===!1?w():void new e.ImportVisitor(b,w).run(k)},parsers:n={primary:function(){for(var a,b=this.mixin,c=[];;){for(;;){if(a=this.comment(),!a)break;c.push(a)}if(o.finished)break;if(o.peek("}"))break;if(a=this.extendRule())c=c.concat(a);else if(a=b.definition()||this.rule()||this.ruleset()||b.call()||this.rulesetCall()||this.directive())c.push(a);else{for(var d=!1;o.$char(";");)d=!0;if(!d)break}}return c},comment:function(){if(o.commentStore.length){var a=o.commentStore.shift();return new d.Comment(a.text,a.isLineComment,a.index,h)}},entities:{quoted:function(){var a,b=o.i,c=!1;return o.save(),o.$char("~")&&(c=!0),(a=o.$quoted())?(o.forget(),new d.Quoted(a.charAt(0),a.substr(1,a.length-2),c,b,h)):void o.restore()},keyword:function(){var a=o.$char("%")||o.$re(/^[_A-Za-z-][_A-Za-z0-9-]*/);return a?d.Color.fromKeyword(a)||new d.Keyword(a):void 0},call:function(){var a,b,c,e,f=o.i;if(!o.peek(/^url\(/i))return o.save(),(a=o.$re(/^([\w-]+|%|progid:[\w\.]+)\(/))?(a=a[1],b=a.toLowerCase(),"alpha"===b&&(e=n.alpha())?(o.forget(),e):(c=this.arguments(),o.$char(")")?(o.forget(),new d.Call(a,c,f,h)):void o.restore("Could not parse call arguments or missing ')'"))):void o.forget()},arguments:function(){for(var a,b=[];;){if(a=this.assignment()||n.expression(),!a)break;if(b.push(a),!o.$char(","))break}return b},literal:function(){return this.dimension()||this.color()||this.quoted()||this.unicodeDescriptor()},assignment:function(){var a,b;return o.save(),(a=o.$re(/^\w+(?=\s?=)/i))&&o.$char("=")&&(b=n.entity())?(o.forget(),new d.Assignment(a,b)):void o.restore()},url:function(){var a,b=o.i;return o.autoCommentAbsorb=!1,o.$str("url(")?(a=this.quoted()||this.variable()||o.$re(/^(?:(?:\\[\(\)'"])|[^\(\)'"])+/)||"",o.autoCommentAbsorb=!0,k(")"),new d.URL(null!=a.value||a instanceof d.Variable?a:new d.Anonymous(a),b,h)):void(o.autoCommentAbsorb=!0)},variable:function(){var a,b=o.i;return"@"===o.currentChar()&&(a=o.$re(/^@@?[\w-]+/))?new d.Variable(a,b,h):void 0},variableCurly:function(){var a,b=o.i;return"@"===o.currentChar()&&(a=o.$re(/^@\{([\w-]+)\}/))?new d.Variable("@"+a[1],b,h):void 0},color:function(){var a;if("#"===o.currentChar()&&(a=o.$re(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/))){var b=a.input.match(/^#([\w]+).*/);return b=b[1],b.match(/^[A-Fa-f0-9]+$/)||l("Invalid HEX color code"),new d.Color(a[1])}},dimension:function(){if(!o.peekNotNumeric()){var a=o.$re(/^([+-]?\d*\.?\d+)(%|[a-z]+)?/i);return a?new d.Dimension(a[1],a[2]):void 0}},unicodeDescriptor:function(){var a;return a=o.$re(/^U\+[0-9a-fA-F?]+(\-[0-9a-fA-F?]+)?/),a?new d.UnicodeDescriptor(a[0]):void 0},javascript:function(){var a,b=o.i;o.save();var c=o.$char("~"),e=o.$char("`");return e?(a=o.$re(/^[^`]*`/))?(o.forget(),new d.JavaScript(a.substr(0,a.length-1),Boolean(c),b,h)):void o.restore("invalid javascript definition"):void o.restore()}},variable:function(){var a;return"@"===o.currentChar()&&(a=o.$re(/^(@[\w-]+)\s*:/))?a[1]:void 0},rulesetCall:function(){var a;return"@"===o.currentChar()&&(a=o.$re(/^(@[\w-]+)\s*\(\s*\)\s*;/))?new d.RulesetCall(a[1]):void 0},extend:function(a){var b,c,e,f,g,h=o.i;if(o.$str(a?"&:extend(":":extend(")){do{for(e=null,b=null;!(e=o.$re(/^(all)(?=\s*(\)|,))/))&&(c=this.element());)b?b.push(c):b=[c];e=e&&e[1],b||l("Missing target selector for :extend()."),g=new d.Extend(new d.Selector(b),e,h),f?f.push(g):f=[g]}while(o.$char(","));return j(/^\)/),a&&j(/^;/),f}},extendRule:function(){return this.extend(!0)},mixin:{call:function(){var a,b,c,e,f,g,i=o.currentChar(),j=!1,l=o.i;if("."===i||"#"===i){for(o.save();;){if(a=o.i,e=o.$re(/^[#.](?:[\w-]|\\(?:[A-Fa-f0-9]{1,6} ?|[^A-Fa-f0-9]))+/),!e)break;c=new d.Element(f,e,a,h),b?b.push(c):b=[c],f=o.$char(">")}return b&&(o.$char("(")&&(g=this.args(!0).args,k(")")),n.important()&&(j=!0),n.end())?(o.forget(),new d.mixin.Call(b,g,l,h,j)):void o.restore()}},args:function(a){var b,c,e,f,g,h,i=n.entities,j={args:null,variadic:!1},k=[],m=[],p=[];for(o.save();;){if(a)h=n.detachedRuleset()||n.expression();else{if(o.commentStore.length=0,o.$str("...")){j.variadic=!0,o.$char(";")&&!b&&(b=!0),(b?m:p).push({variadic:!0});break}h=i.variable()||i.literal()||i.keyword()}if(!h)break;f=null,h.throwAwayComments&&h.throwAwayComments(),g=h;var q=null;if(a?h.value&&1==h.value.length&&(q=h.value[0]):q=h,q&&q instanceof d.Variable)if(o.$char(":")){if(k.length>0&&(b&&l("Cannot mix ; and , as delimiter types"),c=!0),g=n.detachedRuleset()||n.expression(),!g){if(!a)return o.restore(),j.args=[],j;l("could not understand value for named argument")}f=e=q.name}else{if(!a&&o.$str("...")){j.variadic=!0,o.$char(";")&&!b&&(b=!0),(b?m:p).push({name:h.name,variadic:!0});break}a||(e=f=q.name,g=null)}g&&k.push(g),p.push({name:f,value:g}),o.$char(",")||(o.$char(";")||b)&&(c&&l("Cannot mix ; and , as delimiter types"),b=!0,k.length>1&&(g=new d.Value(k)),m.push({name:e,value:g}),e=null,k=[],c=!1)}return o.forget(),j.args=b?m:p,j},definition:function(){var a,b,c,e,f=[],g=!1;if(!("."!==o.currentChar()&&"#"!==o.currentChar()||o.peek(/^[^{]*\}/)))if(o.save(),b=o.$re(/^([#.](?:[\w-]|\\(?:[A-Fa-f0-9]{1,6} ?|[^A-Fa-f0-9]))+)\s*\(/)){a=b[1];var h=this.args(!1);if(f=h.args,g=h.variadic,!o.$char(")"))return void o.restore("Missing closing ')'");if(o.commentStore.length=0,o.$str("when")&&(e=j(n.conditions,"expected condition")),c=n.block())return o.forget(),new d.mixin.Definition(a,f,c,e,g);o.restore()}else o.forget()}},entity:function(){var a=this.entities;return this.comment()||a.literal()||a.variable()||a.url()||a.call()||a.keyword()||a.javascript()},end:function(){return o.$char(";")||o.peek("}")},alpha:function(){var a;if(o.$re(/^opacity=/i))return a=o.$re(/^\d+/),a||(a=j(this.entities.variable,"Could not parse alpha")),k(")"),new d.Alpha(a)},element:function(){var a,b,c,e=o.i;return b=this.combinator(),a=o.$re(/^(?:\d+\.\d+|\d+)%/)||o.$re(/^(?:[.#]?|:*)(?:[\w-]|[^\x00-\x9f]|\\(?:[A-Fa-f0-9]{1,6} ?|[^A-Fa-f0-9]))+/)||o.$char("*")||o.$char("&")||this.attribute()||o.$re(/^\([^&()@]+\)/)||o.$re(/^[\.#:](?=@)/)||this.entities.variableCurly(),a||(o.save(),o.$char("(")?(c=this.selector())&&o.$char(")")?(a=new d.Paren(c),o.forget()):o.restore("Missing closing ')'"):o.forget()),a?new d.Element(b,a,e,h):void 0},combinator:function(){var a=o.currentChar();if("/"===a){o.save();var b=o.$re(/^\/[a-z]+\//i);if(b)return o.forget(),new d.Combinator(b);o.restore()}if(">"===a||"+"===a||"~"===a||"|"===a||"^"===a){for(o.i++,"^"===a&&"^"===o.currentChar()&&(a="^^",o.i++);o.isWhitespace();)o.i++;return new d.Combinator(a)}return new d.Combinator(o.isWhitespace(-1)?" ":null)},lessSelector:function(){return this.selector(!0)},selector:function(a){for(var b,c,e,f,g,i,k,m=o.i;(a&&(c=this.extend())||a&&(i=o.$str("when"))||(f=this.element()))&&(i?k=j(this.conditions,"expected condition"):k?l("CSS guard can only be used at the end of selector"):c?g=g?g.concat(c):c:(g&&l("Extend can only be used at the end of selector"),e=o.currentChar(),b?b.push(f):b=[f],f=null),"{"!==e&&"}"!==e&&";"!==e&&","!==e&&")"!==e););return b?new d.Selector(b,g,k,m,h):void(g&&l("Extend must be used to extend a selector, it cannot be used on its own"))},attribute:function(){if(o.$char("[")){var a,b,c,e=this.entities;return(a=e.variableCurly())||(a=j(/^(?:[_A-Za-z0-9-\*]*\|)?(?:[_A-Za-z0-9-]|\\.)+/)),c=o.$re(/^[|~*$^]?=/),c&&(b=e.quoted()||o.$re(/^[0-9]+%/)||o.$re(/^[\w-]+/)||e.variableCurly()),k("]"),new d.Attribute(a,c,b)}},block:function(){var a;return o.$char("{")&&(a=this.primary())&&o.$char("}")?a:void 0},blockRuleset:function(){var a=this.block();return a&&(a=new d.Ruleset(null,a)),a},detachedRuleset:function(){var a=this.blockRuleset();return a?new d.DetachedRuleset(a):void 0},ruleset:function(){var b,c,e,f;for(o.save(),a.dumpLineNumbers&&(f=m(o.i));;){if(c=this.lessSelector(),!c)break;if(b?b.push(c):b=[c],o.commentStore.length=0,c.condition&&b.length>1&&l("Guards are only currently allowed on a single selector."),!o.$char(","))break;c.condition&&l("Guards are only currently allowed on a single selector."),o.commentStore.length=0}if(b&&(e=this.block())){o.forget();var g=new d.Ruleset(b,e,a.strictImports);return a.dumpLineNumbers&&(g.debugInfo=f),g}o.restore()},rule:function(b){var c,e,f,g,i,j=o.i,k=o.currentChar();if("."!==k&&"#"!==k&&"&"!==k&&":"!==k)if(o.save(),c=this.variable()||this.ruleProperty()){if(i="string"==typeof c,i&&(e=this.detachedRuleset()),o.commentStore.length=0,!e){g=!i&&c.length>1&&c.pop().value;var l=!b&&(a.compress||i);if(l&&(e=this.value()),!e&&(e=this.anonymousValue()))return o.forget(),new d.Rule(c,e,!1,g,j,h);l||e||(e=this.value()),f=this.important()}if(e&&this.end())return o.forget(),new d.Rule(c,e,f,g,j,h);if(o.restore(),e&&!b)return this.rule(!0)}else o.forget()},anonymousValue:function(){var a=o.$re(/^([^@+\/'"*`(;{}-]*);/);return a?new d.Anonymous(a[1]):void 0},"import":function(){var a,b,c=o.i,e=o.$re(/^@import?\s+/);if(e){var f=(e?this.importOptions():null)||{};if(a=this.entities.quoted()||this.entities.url())return b=this.mediaFeatures(),o.$char(";")||(o.i=c,l("missing semi-colon or unrecognised media features on import")),b=b&&new d.Value(b),new d.Import(a,b,f,c,h);o.i=c,l("malformed import statement")}},importOptions:function(){var a,b,c,d={};if(!o.$char("("))return null;do if(a=this.importOption()){switch(b=a,c=!0,b){case"css":b="less",c=!1;break;case"once":b="multiple",c=!1}if(d[b]=c,!o.$char(","))break}while(a);return k(")"),d},importOption:function(){var a=o.$re(/^(less|css|multiple|once|inline|reference|optional)/);return a?a[1]:void 0},mediaFeature:function(){var a,b,c=this.entities,e=[];o.save();do if(a=c.keyword()||c.variable())e.push(a);else if(o.$char("(")){if(b=this.property(),a=this.value(),!o.$char(")"))return o.restore("Missing closing ')'"),null;if(b&&a)e.push(new d.Paren(new d.Rule(b,a,null,null,o.i,h,!0)));else{if(!a)return o.restore("badly formed media feature definition"),null;e.push(new d.Paren(a))}}while(a);return o.forget(),e.length>0?new d.Expression(e):void 0},mediaFeatures:function(){var a,b=this.entities,c=[];do if(a=this.mediaFeature()){if(c.push(a),!o.$char(","))break}else if(a=b.variable(),a&&(c.push(a),!o.$char(",")))break;while(a);return c.length>0?c:null},media:function(){var b,c,e,f;return a.dumpLineNumbers&&(f=m(o.i)),o.save(),o.$str("@media")?(b=this.mediaFeatures(),(c=this.block())?(o.forget(),e=new d.Media(c,b,o.i,h),a.dumpLineNumbers&&(e.debugInfo=f),e):void o.restore("media definitions require block statements after any features")):void o.restore()},plugin:function(){var a,b=o.i,c=o.$re(/^@plugin?\s+/);if(c){var e={plugin:!0};if(a=this.entities.quoted()||this.entities.url())return o.$char(";")||(o.i=b,l("missing semi-colon on plugin")),new d.Import(a,null,e,b,h);o.i=b,l("malformed plugin statement")}},directive:function(){var b,c,e,f,g,i,j,k=o.i,n=!0,p=!0;if("@"===o.currentChar()){if(c=this["import"]()||this.plugin()||this.media())return c;if(o.save(),b=o.$re(/^@[a-z-]+/)){switch(f=b,"-"==b.charAt(1)&&b.indexOf("-",2)>0&&(f="@"+b.slice(b.indexOf("-",2)+1)),f){case"@counter-style":g=!0,n=!0;break;case"@charset":g=!0,n=!1;break;case"@namespace":i=!0,n=!1;break;case"@keyframes":g=!0;break;case"@host":case"@page":j=!0;break;case"@document":case"@supports":j=!0,p=!1}return o.commentStore.length=0,g?(c=this.entity(),c||l("expected "+b+" identifier")):i?(c=this.expression(),c||l("expected "+b+" expression")):j&&(c=(o.$re(/^[^{;]+/)||"").trim(),c&&(c=new d.Anonymous(c))),n&&(e=this.blockRuleset()),e||!n&&c&&o.$char(";")?(o.forget(),new d.Directive(b,c,e,k,h,a.dumpLineNumbers?m(k):null,!1,p)):void o.restore("directive options not recognised")}}},value:function(){var a,b=[];do if(a=this.expression(),a&&(b.push(a),!o.$char(",")))break;while(a);return b.length>0?new d.Value(b):void 0},important:function(){return"!"===o.currentChar()?o.$re(/^! *important/):void 0},sub:function(){var a,b;return o.save(),o.$char("(")?(a=this.addition(),a&&o.$char(")")?(o.forget(),b=new d.Expression([a]),b.parens=!0,b):void o.restore("Expected ')'")):void o.restore()},multiplication:function(){var a,b,c,e,f;if(a=this.operand()){for(f=o.isWhitespace(-1);;){if(o.peek(/^\/[*\/]/))break;if(o.save(),c=o.$char("/")||o.$char("*"),!c){o.forget();break}if(b=this.operand(),!b){o.restore();break}o.forget(),a.parensInOp=!0,b.parensInOp=!0,e=new d.Operation(c,[e||a,b],f),f=o.isWhitespace(-1)}return e||a}},addition:function(){var a,b,c,e,f;if(a=this.multiplication()){for(f=o.isWhitespace(-1);;){if(c=o.$re(/^[-+]\s+/)||!f&&(o.$char("+")||o.$char("-")),!c)break;if(b=this.multiplication(),!b)break;a.parensInOp=!0,b.parensInOp=!0,e=new d.Operation(c,[e||a,b],f),f=o.isWhitespace(-1)}return e||a}},conditions:function(){var a,b,c,e=o.i;if(a=this.condition()){for(;;){if(!o.peek(/^,\s*(not\s*)?\(/)||!o.$char(","))break;if(b=this.condition(),!b)break;c=new d.Condition("or",c||a,b,e)}return c||a}},condition:function(){var a,b,c,e,f=this.entities,g=o.i,h=!1;return o.$str("not")&&(h=!0),k("("),a=this.addition()||f.keyword()||f.quoted(),a?(o.$char(">")?e=o.$char("=")?">=":">":o.$char("<")?e=o.$char("=")?"<=":"<":o.$char("=")&&(e=o.$char(">")?"=>":o.$char("<")?"=<":"="),e?(b=this.addition()||f.keyword()||f.quoted(),b?c=new d.Condition(e,a,b,g,h):l("expected expression")):c=new d.Condition("=",a,new d.Keyword("true"),g,h),k(")"),o.$str("and")?new d.Condition("and",c,this.condition()):c):void 0},operand:function(){var a,b=this.entities;o.peek(/^-[@\(]/)&&(a=o.$char("-"));var c=this.sub()||b.dimension()||b.color()||b.variable()||b.call();return a&&(c.parensInOp=!0,c=new d.Negative(c)),c},expression:function(){var a,b,c=[];do a=this.comment(),a?c.push(a):(a=this.addition()||this.entity(),a&&(c.push(a),o.peek(/^\/[\/*]/)||(b=o.$char("/"),b&&c.push(new d.Anonymous(b)))));while(a);return c.length>0?new d.Expression(c):void 0},property:function(){var a=o.$re(/^(\*?-?[_a-zA-Z0-9-]+)\s*:/);return a?a[1]:void 0},ruleProperty:function(){function a(a){var b=o.i,c=o.$re(a);return c?(f.push(b),e.push(c[1])):void 0}var b,c,e=[],f=[];o.save();var g=o.$re(/^([_a-zA-Z0-9-]+)\s*:/);if(g)return e=[new d.Keyword(g[1])],o.forget(),e;for(a(/^(\*?)/);;)if(!a(/^((?:[\w-]+)|(?:@\{[\w-]+\}))/))break;if(e.length>1&&a(/^((?:\+_|\+)?)\s*:/)){for(o.forget(),""===e[0]&&(e.shift(),f.shift()),c=0;e.length>c;c++)b=e[c],e[c]="@"!==b.charAt(0)?new d.Keyword(b):new d.Variable("@"+b.slice(2,-1),f[c],h);return e}o.restore()}}}};h.serializeVars=function(a){var b="";for(var c in a)if(Object.hasOwnProperty.call(a,c)){var d=a[c];b+=("@"===c[0]?"":"@")+c+": "+d+(";"===String(d).slice(-1)?"":";")}return b},b.exports=h},{"../less-error":30,"../tree":60,"../utils":81,"../visitors":85,"./parser-input":35}],37:[function(a,b){var c=function(a){this.less=a,this.visitors=[],this.preProcessors=[],this.postProcessors=[],this.installedPlugins=[],this.fileManagers=[]};c.prototype.addPlugins=function(a){if(a)for(var b=0;a.length>b;b++)this.addPlugin(a[b])},c.prototype.addPlugin=function(a){this.installedPlugins.push(a),a.install(this.less,this)},c.prototype.addVisitor=function(a){this.visitors.push(a)},c.prototype.addPreProcessor=function(a,b){var c;for(c=0;this.preProcessors.length>c&&!(this.preProcessors[c].priority>=b);c++);this.preProcessors.splice(c,0,{preProcessor:a,priority:b})},c.prototype.addPostProcessor=function(a,b){var c;for(c=0;this.postProcessors.length>c&&!(this.postProcessors[c].priority>=b);c++);this.postProcessors.splice(c,0,{postProcessor:a,priority:b})},c.prototype.addFileManager=function(a){this.fileManagers.push(a)},c.prototype.getPreProcessors=function(){for(var a=[],b=0;this.preProcessors.length>b;b++)a.push(this.preProcessors[b].preProcessor);return a},c.prototype.getPostProcessors=function(){for(var a=[],b=0;this.postProcessors.length>b;b++)a.push(this.postProcessors[b].postProcessor);return a},c.prototype.getVisitors=function(){return this.visitors},c.prototype.getFileManagers=function(){return this.fileManagers},b.exports=c},{}],38:[function(a,b){var c=a("../less-error"),d=a("../tree"),e=b.exports=function(a,b){this.fileInfo=b};e.prototype.eval=function(a,b){var e,f,g={};f={add:function(a,b){g[a]=b},addMultiple:function(a){Object.keys(a).forEach(function(b){g[b]=a[b]})}};try{e=new Function("functions","tree","fileInfo",a),e(f,d,this.fileInfo)}catch(h){b(new c({message:"Plugin evaluation error: '"+h.name+": "+h.message.replace(/["]/g,"'")+"'",filename:this.fileInfo.filename}),null)}b(null,{functions:g})}},{"../less-error":30,"../tree":60}],39:[function(a,b){var c;b.exports=function(b,d){var e=function(b,f,g){if("function"==typeof f&&(g=f,f={}),!g){c||(c="undefined"==typeof Promise?a("promise"):Promise);var h=this;return new c(function(a,c){e.call(h,b,f,function(b,d){b?c(b):a(d)})})}this.parse(b,f,function(a,b,c,e){if(a)return g(a);var f;try{var h=new d(b,c);f=h.toCSS(e)}catch(a){return g(a)}g(null,f)})};return e}},{promise:void 0}],40:[function(a,b){b.exports=function(a,b){var c=function(a){this.options=a};return c.prototype.toCSS=function(b,c,d){var e=new a({contentsIgnoredCharsMap:d.contentsIgnoredChars,rootNode:b,contentsMap:d.contents,sourceMapFilename:this.options.sourceMapFilename,sourceMapURL:this.options.sourceMapURL,outputFilename:this.options.sourceMapOutputFilename,sourceMapBasepath:this.options.sourceMapBasepath,sourceMapRootpath:this.options.sourceMapRootpath,outputSourceFiles:this.options.outputSourceFiles,sourceMapGenerator:this.options.sourceMapGenerator,sourceMapFileInline:this.options.sourceMapFileInline}),f=e.toCSS(c);return this.sourceMap=e.sourceMap,this.sourceMapURL=e.sourceMapURL,this.options.sourceMapInputFilename&&(this.sourceMapInputFilename=e.normalizeFilename(this.options.sourceMapInputFilename)),f+this.getCSSAppendage()},c.prototype.getCSSAppendage=function(){var a=this.sourceMapURL;if(this.options.sourceMapFileInline){if(void 0===this.sourceMap)return"";a="data:application/json;base64,"+b.encodeBase64(this.sourceMap)}return a?"/*# sourceMappingURL="+a+" */":""},c.prototype.getExternalSourceMap=function(){return this.sourceMap},c.prototype.setExternalSourceMap=function(a){this.sourceMap=a},c.prototype.isInline=function(){return this.options.sourceMapFileInline},c.prototype.getSourceMapURL=function(){return this.sourceMapURL},c.prototype.getOutputFilename=function(){return this.options.sourceMapOutputFilename},c.prototype.getInputFilename=function(){return this.sourceMapInputFilename},c}},{}],41:[function(a,b){b.exports=function(a){var b=function(b){this._css=[],this._rootNode=b.rootNode,this._contentsMap=b.contentsMap,this._contentsIgnoredCharsMap=b.contentsIgnoredCharsMap,b.sourceMapFilename&&(this._sourceMapFilename=b.sourceMapFilename.replace(/\\/g,"/")),this._outputFilename=b.outputFilename,this.sourceMapURL=b.sourceMapURL,b.sourceMapBasepath&&(this._sourceMapBasepath=b.sourceMapBasepath.replace(/\\/g,"/")),
b.sourceMapRootpath?(this._sourceMapRootpath=b.sourceMapRootpath.replace(/\\/g,"/"),"/"!==this._sourceMapRootpath.charAt(this._sourceMapRootpath.length-1)&&(this._sourceMapRootpath+="/")):this._sourceMapRootpath="",this._outputSourceFiles=b.outputSourceFiles,this._sourceMapGeneratorConstructor=a.getSourceMapGenerator(),this._lineNumber=0,this._column=0};return b.prototype.normalizeFilename=function(a){return a=a.replace(/\\/g,"/"),this._sourceMapBasepath&&0===a.indexOf(this._sourceMapBasepath)&&(a=a.substring(this._sourceMapBasepath.length),("\\"===a.charAt(0)||"/"===a.charAt(0))&&(a=a.substring(1))),(this._sourceMapRootpath||"")+a},b.prototype.add=function(a,b,c,d){if(a){var e,f,g,h,i;if(b){var j=this._contentsMap[b.filename];this._contentsIgnoredCharsMap[b.filename]&&(c-=this._contentsIgnoredCharsMap[b.filename],0>c&&(c=0),j=j.slice(this._contentsIgnoredCharsMap[b.filename])),j=j.substring(0,c),f=j.split("\n"),h=f[f.length-1]}if(e=a.split("\n"),g=e[e.length-1],b)if(d)for(i=0;e.length>i;i++)this._sourceMapGenerator.addMapping({generated:{line:this._lineNumber+i+1,column:0===i?this._column:0},original:{line:f.length+i,column:0===i?h.length:0},source:this.normalizeFilename(b.filename)});else this._sourceMapGenerator.addMapping({generated:{line:this._lineNumber+1,column:this._column},original:{line:f.length,column:h.length},source:this.normalizeFilename(b.filename)});1===e.length?this._column+=g.length:(this._lineNumber+=e.length-1,this._column=g.length),this._css.push(a)}},b.prototype.isEmpty=function(){return 0===this._css.length},b.prototype.toCSS=function(a){if(this._sourceMapGenerator=new this._sourceMapGeneratorConstructor({file:this._outputFilename,sourceRoot:null}),this._outputSourceFiles)for(var b in this._contentsMap)if(this._contentsMap.hasOwnProperty(b)){var c=this._contentsMap[b];this._contentsIgnoredCharsMap[b]&&(c=c.slice(this._contentsIgnoredCharsMap[b])),this._sourceMapGenerator.setSourceContent(this.normalizeFilename(b),c)}if(this._rootNode.genCSS(a,this),this._css.length>0){var d,e=JSON.stringify(this._sourceMapGenerator.toJSON());this.sourceMapURL?d=this.sourceMapURL:this._sourceMapFilename&&(d=this._sourceMapFilename),this.sourceMapURL=d,this.sourceMap=e}return this._css.join("")},b}},{}],42:[function(a,b){var c=a("./contexts"),d=a("./visitors"),e=a("./tree");b.exports=function(a,b){b=b||{};var f,g=b.variables,h=new c.Eval(b);"object"!=typeof g||Array.isArray(g)||(g=Object.keys(g).map(function(a){var b=g[a];return b instanceof e.Value||(b instanceof e.Expression||(b=new e.Expression([b])),b=new e.Value([b])),new e.Rule("@"+a,b,!1,null,0)}),h.frames=[new e.Ruleset(null,g)]);var i,j=[],k=[new d.JoinSelectorVisitor,new d.ExtendVisitor,new d.ToCSSVisitor({compress:Boolean(b.compress)})];if(b.pluginManager){var l=b.pluginManager.getVisitors();for(i=0;l.length>i;i++){var m=l[i];m.isPreEvalVisitor?j.push(m):m.isPreVisitor?k.splice(0,0,m):k.push(m)}}for(i=0;j.length>i;i++)j[i].run(a);for(f=a.eval(h),i=0;k.length>i;i++)k[i].run(f);return f}},{"./contexts":10,"./tree":60,"./visitors":85}],43:[function(a,b){var c=a("./node"),d=function(a){this.value=a};d.prototype=new c,d.prototype.type="Alpha",d.prototype.accept=function(a){this.value=a.visit(this.value)},d.prototype.eval=function(a){return this.value.eval?new d(this.value.eval(a)):this},d.prototype.genCSS=function(a,b){b.add("alpha(opacity="),this.value.genCSS?this.value.genCSS(a,b):b.add(this.value),b.add(")")},b.exports=d},{"./node":68}],44:[function(a,b){var c=a("./node"),d=function(a,b,c,d,e){this.value=a,this.index=b,this.mapLines=d,this.currentFileInfo=c,this.rulesetLike="undefined"==typeof e?!1:e};d.prototype=new c,d.prototype.type="Anonymous",d.prototype.eval=function(){return new d(this.value,this.index,this.currentFileInfo,this.mapLines,this.rulesetLike)},d.prototype.compare=function(a){return a.toCSS&&this.toCSS()===a.toCSS()?0:void 0},d.prototype.isRulesetLike=function(){return this.rulesetLike},d.prototype.genCSS=function(a,b){b.add(this.value,this.currentFileInfo,this.index,this.mapLines)},b.exports=d},{"./node":68}],45:[function(a,b){var c=a("./node"),d=function(a,b){this.key=a,this.value=b};d.prototype=new c,d.prototype.type="Assignment",d.prototype.accept=function(a){this.value=a.visit(this.value)},d.prototype.eval=function(a){return this.value.eval?new d(this.key,this.value.eval(a)):this},d.prototype.genCSS=function(a,b){b.add(this.key+"="),this.value.genCSS?this.value.genCSS(a,b):b.add(this.value)},b.exports=d},{"./node":68}],46:[function(a,b){var c=a("./node"),d=function(a,b,c){this.key=a,this.op=b,this.value=c};d.prototype=new c,d.prototype.type="Attribute",d.prototype.eval=function(a){return new d(this.key.eval?this.key.eval(a):this.key,this.op,this.value&&this.value.eval?this.value.eval(a):this.value)},d.prototype.genCSS=function(a,b){b.add(this.toCSS(a))},d.prototype.toCSS=function(a){var b=this.key.toCSS?this.key.toCSS(a):this.key;return this.op&&(b+=this.op,b+=this.value.toCSS?this.value.toCSS(a):this.value),"["+b+"]"},b.exports=d},{"./node":68}],47:[function(a,b){var c=a("./node"),d=a("../functions/function-caller"),e=function(a,b,c,d){this.name=a,this.args=b,this.index=c,this.currentFileInfo=d};e.prototype=new c,e.prototype.type="Call",e.prototype.accept=function(a){this.args&&(this.args=a.visitArray(this.args))},e.prototype.eval=function(a){var b,c=this.args.map(function(b){return b.eval(a)}),f=new d(this.name,a,this.index,this.currentFileInfo);if(f.isValid())try{if(b=f.call(c),null!=b)return b}catch(g){throw{type:g.type||"Runtime",message:"error evaluating function `"+this.name+"`"+(g.message?": "+g.message:""),index:this.index,filename:this.currentFileInfo.filename}}return new e(this.name,c,this.index,this.currentFileInfo)},e.prototype.genCSS=function(a,b){b.add(this.name+"(",this.currentFileInfo,this.index);for(var c=0;this.args.length>c;c++)this.args[c].genCSS(a,b),this.args.length>c+1&&b.add(", ");b.add(")")},b.exports=e},{"../functions/function-caller":20,"./node":68}],48:[function(a,b){function c(a,b){return Math.min(Math.max(a,0),b)}function d(a){return"#"+a.map(function(a){return a=c(Math.round(a),255),(16>a?"0":"")+a.toString(16)}).join("")}var e=a("./node"),f=a("../data/colors"),g=function(a,b){this.rgb=Array.isArray(a)?a:6==a.length?a.match(/.{2}/g).map(function(a){return parseInt(a,16)}):a.split("").map(function(a){return parseInt(a+a,16)}),this.alpha="number"==typeof b?b:1};g.prototype=new e,g.prototype.type="Color",g.prototype.luma=function(){var a=this.rgb[0]/255,b=this.rgb[1]/255,c=this.rgb[2]/255;return a=.03928>=a?a/12.92:Math.pow((a+.055)/1.055,2.4),b=.03928>=b?b/12.92:Math.pow((b+.055)/1.055,2.4),c=.03928>=c?c/12.92:Math.pow((c+.055)/1.055,2.4),.2126*a+.7152*b+.0722*c},g.prototype.genCSS=function(a,b){b.add(this.toCSS(a))},g.prototype.toCSS=function(a,b){var d,e,f=a&&a.compress&&!b;if(this.value)return this.value;if(e=this.fround(a,this.alpha),1>e)return"rgba("+this.rgb.map(function(a){return c(Math.round(a),255)}).concat(c(e,1)).join(","+(f?"":" "))+")";if(d=this.toRGB(),f){var g=d.split("");g[1]===g[2]&&g[3]===g[4]&&g[5]===g[6]&&(d="#"+g[1]+g[3]+g[5])}return d},g.prototype.operate=function(a,b,c){for(var d=[],e=this.alpha*(1-c.alpha)+c.alpha,f=0;3>f;f++)d[f]=this._operate(a,b,this.rgb[f],c.rgb[f]);return new g(d,e)},g.prototype.toRGB=function(){return d(this.rgb)},g.prototype.toHSL=function(){var a,b,c=this.rgb[0]/255,d=this.rgb[1]/255,e=this.rgb[2]/255,f=this.alpha,g=Math.max(c,d,e),h=Math.min(c,d,e),i=(g+h)/2,j=g-h;if(g===h)a=b=0;else{switch(b=i>.5?j/(2-g-h):j/(g+h),g){case c:a=(d-e)/j+(e>d?6:0);break;case d:a=(e-c)/j+2;break;case e:a=(c-d)/j+4}a/=6}return{h:360*a,s:b,l:i,a:f}},g.prototype.toHSV=function(){var a,b,c=this.rgb[0]/255,d=this.rgb[1]/255,e=this.rgb[2]/255,f=this.alpha,g=Math.max(c,d,e),h=Math.min(c,d,e),i=g,j=g-h;if(b=0===g?0:j/g,g===h)a=0;else{switch(g){case c:a=(d-e)/j+(e>d?6:0);break;case d:a=(e-c)/j+2;break;case e:a=(c-d)/j+4}a/=6}return{h:360*a,s:b,v:i,a:f}},g.prototype.toARGB=function(){return d([255*this.alpha].concat(this.rgb))},g.prototype.compare=function(a){return a.rgb&&a.rgb[0]===this.rgb[0]&&a.rgb[1]===this.rgb[1]&&a.rgb[2]===this.rgb[2]&&a.alpha===this.alpha?0:void 0},g.fromKeyword=function(a){var b,c=a.toLowerCase();return f.hasOwnProperty(c)?b=new g(f[c].slice(1)):"transparent"===c&&(b=new g([0,0,0],0)),b?(b.value=a,b):void 0},b.exports=g},{"../data/colors":11,"./node":68}],49:[function(a,b){var c=a("./node"),d=function(a){" "===a?(this.value=" ",this.emptyOrWhitespace=!0):(this.value=a?a.trim():"",this.emptyOrWhitespace=""===this.value)};d.prototype=new c,d.prototype.type="Combinator";var e={"":!0," ":!0,"|":!0};d.prototype.genCSS=function(a,b){var c=a.compress||e[this.value]?"":" ";b.add(c+this.value+c)},b.exports=d},{"./node":68}],50:[function(a,b){var c=a("./node"),d=a("./debug-info"),e=function(a,b,c,d){this.value=a,this.isLineComment=b,this.currentFileInfo=d};e.prototype=new c,e.prototype.type="Comment",e.prototype.genCSS=function(a,b){this.debugInfo&&b.add(d(a,this),this.currentFileInfo,this.index),b.add(this.value)},e.prototype.isSilent=function(a){var b=this.currentFileInfo&&this.currentFileInfo.reference&&!this.isReferenced,c=a.compress&&"!"!==this.value[2];return this.isLineComment||b||c},e.prototype.markReferenced=function(){this.isReferenced=!0},b.exports=e},{"./debug-info":52,"./node":68}],51:[function(a,b){var c=a("./node"),d=function(a,b,c,d,e){this.op=a.trim(),this.lvalue=b,this.rvalue=c,this.index=d,this.negate=e};d.prototype=new c,d.prototype.type="Condition",d.prototype.accept=function(a){this.lvalue=a.visit(this.lvalue),this.rvalue=a.visit(this.rvalue)},d.prototype.eval=function(a){var b=function(a,b,d){switch(a){case"and":return b&&d;case"or":return b||d;default:switch(c.compare(b,d)){case-1:return"<"===a||"=<"===a||"<="===a;case 0:return"="===a||">="===a||"=<"===a||"<="===a;case 1:return">"===a||">="===a;default:return!1}}}(this.op,this.lvalue.eval(a),this.rvalue.eval(a));return this.negate?!b:b},b.exports=d},{"./node":68}],52:[function(a,b){var c=function(a,b,d){var e="";if(a.dumpLineNumbers&&!a.compress)switch(a.dumpLineNumbers){case"comments":e=c.asComment(b);break;case"mediaquery":e=c.asMediaQuery(b);break;case"all":e=c.asComment(b)+(d||"")+c.asMediaQuery(b)}return e};c.asComment=function(a){return"/* line "+a.debugInfo.lineNumber+", "+a.debugInfo.fileName+" */\n"},c.asMediaQuery=function(a){var b=a.debugInfo.fileName;return/^[a-z]+:\/\//i.test(b)||(b="file://"+b),"@media -sass-debug-info{filename{font-family:"+b.replace(/([.:\/\\])/g,function(a){return"\\"==a&&(a="/"),"\\"+a})+"}line{font-family:\\00003"+a.debugInfo.lineNumber+"}}\n"},b.exports=c},{}],53:[function(a,b){var c=a("./node"),d=a("../contexts"),e=function(a,b){this.ruleset=a,this.frames=b};e.prototype=new c,e.prototype.type="DetachedRuleset",e.prototype.evalFirst=!0,e.prototype.accept=function(a){this.ruleset=a.visit(this.ruleset)},e.prototype.eval=function(a){var b=this.frames||a.frames.slice(0);return new e(this.ruleset,b)},e.prototype.callEval=function(a){return this.ruleset.eval(this.frames?new d.Eval(a,this.frames.concat(a.frames)):a)},b.exports=e},{"../contexts":10,"./node":68}],54:[function(a,b){var c=a("./node"),d=a("../data/unit-conversions"),e=a("./unit"),f=a("./color"),g=function(a,b){this.value=parseFloat(a),this.unit=b&&b instanceof e?b:new e(b?[b]:void 0)};g.prototype=new c,g.prototype.type="Dimension",g.prototype.accept=function(a){this.unit=a.visit(this.unit)},g.prototype.eval=function(){return this},g.prototype.toColor=function(){return new f([this.value,this.value,this.value])},g.prototype.genCSS=function(a,b){if(a&&a.strictUnits&&!this.unit.isSingular())throw new Error("Multiple units in dimension. Correct the units or use the unit function. Bad unit: "+this.unit.toString());var c=this.fround(a,this.value),d=String(c);if(0!==c&&1e-6>c&&c>-1e-6&&(d=c.toFixed(20).replace(/0+$/,"")),a&&a.compress){if(0===c&&this.unit.isLength())return void b.add(d);c>0&&1>c&&(d=d.substr(1))}b.add(d),this.unit.genCSS(a,b)},g.prototype.operate=function(a,b,c){var d=this._operate(a,b,this.value,c.value),e=this.unit.clone();if("+"===b||"-"===b)if(0===e.numerator.length&&0===e.denominator.length)e=c.unit.clone(),this.unit.backupUnit&&(e.backupUnit=this.unit.backupUnit);else if(0===c.unit.numerator.length&&0===e.denominator.length);else{if(c=c.convertTo(this.unit.usedUnits()),a.strictUnits&&c.unit.toString()!==e.toString())throw new Error("Incompatible units. Change the units or use the unit function. Bad units: '"+e.toString()+"' and '"+c.unit.toString()+"'.");d=this._operate(a,b,this.value,c.value)}else"*"===b?(e.numerator=e.numerator.concat(c.unit.numerator).sort(),e.denominator=e.denominator.concat(c.unit.denominator).sort(),e.cancel()):"/"===b&&(e.numerator=e.numerator.concat(c.unit.denominator).sort(),e.denominator=e.denominator.concat(c.unit.numerator).sort(),e.cancel());return new g(d,e)},g.prototype.compare=function(a){var b,d;if(!(a instanceof g))return void 0;if(this.unit.isEmpty()||a.unit.isEmpty())b=this,d=a;else if(b=this.unify(),d=a.unify(),0!==b.unit.compare(d.unit))return void 0;return c.numericCompare(b.value,d.value)},g.prototype.unify=function(){return this.convertTo({length:"px",duration:"s",angle:"rad"})},g.prototype.convertTo=function(a){var b,c,e,f,h,i=this.value,j=this.unit.clone(),k={};if("string"==typeof a){for(b in d)d[b].hasOwnProperty(a)&&(k={},k[b]=a);a=k}h=function(a,b){return e.hasOwnProperty(a)?(b?i/=e[a]/e[f]:i*=e[a]/e[f],f):a};for(c in a)a.hasOwnProperty(c)&&(f=a[c],e=d[c],j.map(h));return j.cancel(),new g(i,j)},b.exports=g},{"../data/unit-conversions":13,"./color":48,"./node":68,"./unit":77}],55:[function(a,b){var c=a("./node"),d=a("./selector"),e=a("./ruleset"),f=function(a,b,c,e,f,g,h,i){var j;if(this.name=a,this.value=b,c)for(Array.isArray(c)?this.rules=c:(this.rules=[c],this.rules[0].selectors=new d([],null,null,this.index,f).createEmptySelectors()),j=0;this.rules.length>j;j++)this.rules[j].allowImports=!0;this.index=e,this.currentFileInfo=f,this.debugInfo=g,this.isReferenced=h,this.isRooted=i||!1};f.prototype=new c,f.prototype.type="Directive",f.prototype.accept=function(a){var b=this.value,c=this.rules;c&&(this.rules=a.visitArray(c)),b&&(this.value=a.visit(b))},f.prototype.isRulesetLike=function(){return this.rules||!this.isCharset()},f.prototype.isCharset=function(){return"@charset"===this.name},f.prototype.genCSS=function(a,b){var c=this.value,d=this.rules;b.add(this.name,this.currentFileInfo,this.index),c&&(b.add(" "),c.genCSS(a,b)),d?this.outputRuleset(a,b,d):b.add(";")},f.prototype.eval=function(a){var b,c,d=this.value,e=this.rules;return b=a.mediaPath,c=a.mediaBlocks,a.mediaPath=[],a.mediaBlocks=[],d&&(d=d.eval(a)),e&&(e=[e[0].eval(a)],e[0].root=!0),a.mediaPath=b,a.mediaBlocks=c,new f(this.name,d,e,this.index,this.currentFileInfo,this.debugInfo,this.isReferenced,this.isRooted)},f.prototype.variable=function(a){return this.rules?e.prototype.variable.call(this.rules[0],a):void 0},f.prototype.find=function(){return this.rules?e.prototype.find.apply(this.rules[0],arguments):void 0},f.prototype.rulesets=function(){return this.rules?e.prototype.rulesets.apply(this.rules[0]):void 0},f.prototype.markReferenced=function(){var a,b;if(this.isReferenced=!0,this.rules)for(b=this.rules,a=0;b.length>a;a++)b[a].markReferenced&&b[a].markReferenced()},f.prototype.getIsReferenced=function(){return!this.currentFileInfo||!this.currentFileInfo.reference||this.isReferenced},f.prototype.outputRuleset=function(a,b,c){var d,e=c.length;if(a.tabLevel=(0|a.tabLevel)+1,a.compress){for(b.add("{"),d=0;e>d;d++)c[d].genCSS(a,b);return b.add("}"),void a.tabLevel--}var f="\n"+Array(a.tabLevel).join("  "),g=f+"  ";if(e){for(b.add(" {"+g),c[0].genCSS(a,b),d=1;e>d;d++)b.add(g),c[d].genCSS(a,b);b.add(f+"}")}else b.add(" {"+f+"}");a.tabLevel--},b.exports=f},{"./node":68,"./ruleset":74,"./selector":75}],56:[function(a,b){var c=a("./node"),d=a("./paren"),e=a("./combinator"),f=function(a,b,c,d){this.combinator=a instanceof e?a:new e(a),this.value="string"==typeof b?b.trim():b?b:"",this.index=c,this.currentFileInfo=d};f.prototype=new c,f.prototype.type="Element",f.prototype.accept=function(a){var b=this.value;this.combinator=a.visit(this.combinator),"object"==typeof b&&(this.value=a.visit(b))},f.prototype.eval=function(a){return new f(this.combinator,this.value.eval?this.value.eval(a):this.value,this.index,this.currentFileInfo)},f.prototype.genCSS=function(a,b){b.add(this.toCSS(a),this.currentFileInfo,this.index)},f.prototype.toCSS=function(a){a=a||{};var b=this.value,c=a.firstSelector;return b instanceof d&&(a.firstSelector=!0),b=b.toCSS?b.toCSS(a):b,a.firstSelector=c,""===b&&"&"===this.combinator.value.charAt(0)?"":this.combinator.toCSS(a)+b},b.exports=f},{"./combinator":49,"./node":68,"./paren":70}],57:[function(a,b){var c=a("./node"),d=a("./paren"),e=a("./comment"),f=function(a){if(this.value=a,!a)throw new Error("Expression requires an array parameter")};f.prototype=new c,f.prototype.type="Expression",f.prototype.accept=function(a){this.value=a.visitArray(this.value)},f.prototype.eval=function(a){var b,c=this.parens&&!this.parensInOp,e=!1;return c&&a.inParenthesis(),this.value.length>1?b=new f(this.value.map(function(b){return b.eval(a)})):1===this.value.length?(this.value[0].parens&&!this.value[0].parensInOp&&(e=!0),b=this.value[0].eval(a)):b=this,c&&a.outOfParenthesis(),this.parens&&this.parensInOp&&!a.isMathOn()&&!e&&(b=new d(b)),b},f.prototype.genCSS=function(a,b){for(var c=0;this.value.length>c;c++)this.value[c].genCSS(a,b),this.value.length>c+1&&b.add(" ")},f.prototype.throwAwayComments=function(){this.value=this.value.filter(function(a){return!(a instanceof e)})},b.exports=f},{"./comment":50,"./node":68,"./paren":70}],58:[function(a,b){var c=a("./node"),d=function e(a,b,c){switch(this.selector=a,this.option=b,this.index=c,this.object_id=e.next_id++,this.parent_ids=[this.object_id],b){case"all":this.allowBefore=!0,this.allowAfter=!0;break;default:this.allowBefore=!1,this.allowAfter=!1}};d.next_id=0,d.prototype=new c,d.prototype.type="Extend",d.prototype.accept=function(a){this.selector=a.visit(this.selector)},d.prototype.eval=function(a){return new d(this.selector.eval(a),this.option,this.index)},d.prototype.clone=function(){return new d(this.selector,this.option,this.index)},d.prototype.findSelfSelectors=function(a){var b,c,d=[];for(b=0;a.length>b;b++)c=a[b].elements,b>0&&c.length&&""===c[0].combinator.value&&(c[0].combinator.value=" "),d=d.concat(a[b].elements);this.selfSelectors=[{elements:d}]},b.exports=d},{"./node":68}],59:[function(a,b){var c=a("./node"),d=a("./media"),e=a("./url"),f=a("./quoted"),g=a("./ruleset"),h=a("./anonymous"),i=function(a,b,c,d,e){if(this.options=c,this.index=d,this.path=a,this.features=b,this.currentFileInfo=e,void 0!==this.options.less||this.options.inline)this.css=!this.options.less||this.options.inline;else{var f=this.getPath();f&&/[#\.\&\?\/]css([\?;].*)?$/.test(f)&&(this.css=!0)}};i.prototype=new c,i.prototype.type="Import",i.prototype.accept=function(a){this.features&&(this.features=a.visit(this.features)),this.path=a.visit(this.path),this.options.plugin||this.options.inline||!this.root||(this.root=a.visit(this.root))},i.prototype.genCSS=function(a,b){this.css&&void 0===this.path.currentFileInfo.reference&&(b.add("@import ",this.currentFileInfo,this.index),this.path.genCSS(a,b),this.features&&(b.add(" "),this.features.genCSS(a,b)),b.add(";"))},i.prototype.getPath=function(){return this.path instanceof e?this.path.value.value:this.path.value},i.prototype.isVariableImport=function(){var a=this.path;return a instanceof e&&(a=a.value),a instanceof f?a.containsVariables():!0},i.prototype.evalForImport=function(a){var b=this.path;return b instanceof e&&(b=b.value),new i(b.eval(a),this.features,this.options,this.index,this.currentFileInfo)},i.prototype.evalPath=function(a){var b=this.path.eval(a),c=this.currentFileInfo&&this.currentFileInfo.rootpath;if(!(b instanceof e)){if(c){var d=b.value;d&&a.isPathRelative(d)&&(b.value=c+d)}b.value=a.normalizePath(b.value)}return b},i.prototype.eval=function(a){var b,c,e=this.features&&this.features.eval(a);if(this.options.plugin)return c=a.frames[0]&&a.frames[0].functionRegistry,c&&this.root&&this.root.functions&&c.addMultiple(this.root.functions),[];if(this.skip&&("function"==typeof this.skip&&(this.skip=this.skip()),this.skip))return[];if(this.options.inline){var f=new h(this.root,0,{filename:this.importedFilename},!0,!0);return this.features?new d([f],this.features.value):[f]}if(this.css){var j=new i(this.evalPath(a),e,this.options,this.index);if(!j.css&&this.error)throw this.error;return j}return b=new g(null,this.root.rules.slice(0)),b.evalImports(a),this.features?new d(b.rules,this.features.value):b.rules},b.exports=i},{"./anonymous":44,"./media":64,"./node":68,"./quoted":71,"./ruleset":74,"./url":78}],60:[function(a,b){var c={};c.Node=a("./node"),c.Alpha=a("./alpha"),c.Color=a("./color"),c.Directive=a("./directive"),c.DetachedRuleset=a("./detached-ruleset"),c.Operation=a("./operation"),c.Dimension=a("./dimension"),c.Unit=a("./unit"),c.Keyword=a("./keyword"),c.Variable=a("./variable"),c.Ruleset=a("./ruleset"),c.Element=a("./element"),c.Attribute=a("./attribute"),c.Combinator=a("./combinator"),c.Selector=a("./selector"),c.Quoted=a("./quoted"),c.Expression=a("./expression"),c.Rule=a("./rule"),c.Call=a("./call"),c.URL=a("./url"),c.Import=a("./import"),c.mixin={Call:a("./mixin-call"),Definition:a("./mixin-definition")},c.Comment=a("./comment"),c.Anonymous=a("./anonymous"),c.Value=a("./value"),c.JavaScript=a("./javascript"),c.Assignment=a("./assignment"),c.Condition=a("./condition"),c.Paren=a("./paren"),c.Media=a("./media"),c.UnicodeDescriptor=a("./unicode-descriptor"),c.Negative=a("./negative"),c.Extend=a("./extend"),c.RulesetCall=a("./ruleset-call"),b.exports=c},{"./alpha":43,"./anonymous":44,"./assignment":45,"./attribute":46,"./call":47,"./color":48,"./combinator":49,"./comment":50,"./condition":51,"./detached-ruleset":53,"./dimension":54,"./directive":55,"./element":56,"./expression":57,"./extend":58,"./import":59,"./javascript":61,"./keyword":63,"./media":64,"./mixin-call":65,"./mixin-definition":66,"./negative":67,"./node":68,"./operation":69,"./paren":70,"./quoted":71,"./rule":72,"./ruleset":74,"./ruleset-call":73,"./selector":75,"./unicode-descriptor":76,"./unit":77,"./url":78,"./value":79,"./variable":80}],61:[function(a,b){var c=a("./js-eval-node"),d=a("./dimension"),e=a("./quoted"),f=a("./anonymous"),g=function(a,b,c,d){this.escaped=b,this.expression=a,this.index=c,this.currentFileInfo=d};g.prototype=new c,g.prototype.type="JavaScript",g.prototype.eval=function(a){var b=this.evaluateJavaScript(this.expression,a);return"number"==typeof b?new d(b):"string"==typeof b?new e('"'+b+'"',b,this.escaped,this.index):new f(Array.isArray(b)?b.join(", "):b)},b.exports=g},{"./anonymous":44,"./dimension":54,"./js-eval-node":62,"./quoted":71}],62:[function(a,b){var c=a("./node"),d=a("./variable"),e=function(){};e.prototype=new c,e.prototype.evaluateJavaScript=function(a,b){var c,e=this,f={};if(void 0!==b.javascriptEnabled&&!b.javascriptEnabled)throw{message:"You are using JavaScript, which has been disabled.",filename:this.currentFileInfo.filename,index:this.index};a=a.replace(/@\{([\w-]+)\}/g,function(a,c){return e.jsify(new d("@"+c,e.index,e.currentFileInfo).eval(b))});try{a=new Function("return ("+a+")")}catch(g){throw{message:"JavaScript evaluation error: "+g.message+" from `"+a+"`",filename:this.currentFileInfo.filename,index:this.index}}var h=b.frames[0].variables();for(var i in h)h.hasOwnProperty(i)&&(f[i.slice(1)]={value:h[i].value,toJS:function(){return this.value.eval(b).toCSS()}});try{c=a.call(f)}catch(g){throw{message:"JavaScript evaluation error: '"+g.name+": "+g.message.replace(/["]/g,"'")+"'",filename:this.currentFileInfo.filename,index:this.index}}return c},e.prototype.jsify=function(a){return Array.isArray(a.value)&&a.value.length>1?"["+a.value.map(function(a){return a.toCSS()}).join(", ")+"]":a.toCSS()},b.exports=e},{"./node":68,"./variable":80}],63:[function(a,b){var c=a("./node"),d=function(a){this.value=a};d.prototype=new c,d.prototype.type="Keyword",d.prototype.genCSS=function(a,b){if("%"===this.value)throw{type:"Syntax",message:"Invalid % without number"};b.add(this.value)},d.True=new d("true"),d.False=new d("false"),b.exports=d},{"./node":68}],64:[function(a,b){var c=a("./ruleset"),d=a("./value"),e=a("./selector"),f=a("./anonymous"),g=a("./expression"),h=a("./directive"),i=function(a,b,f,g){this.index=f,this.currentFileInfo=g;var h=new e([],null,null,this.index,this.currentFileInfo).createEmptySelectors();this.features=new d(b),this.rules=[new c(h,a)],this.rules[0].allowImports=!0};i.prototype=new h,i.prototype.type="Media",i.prototype.isRulesetLike=!0,i.prototype.accept=function(a){this.features&&(this.features=a.visit(this.features)),this.rules&&(this.rules=a.visitArray(this.rules))},i.prototype.genCSS=function(a,b){b.add("@media ",this.currentFileInfo,this.index),this.features.genCSS(a,b),this.outputRuleset(a,b,this.rules)},i.prototype.eval=function(a){a.mediaBlocks||(a.mediaBlocks=[],a.mediaPath=[]);var b=new i(null,[],this.index,this.currentFileInfo);this.debugInfo&&(this.rules[0].debugInfo=this.debugInfo,b.debugInfo=this.debugInfo);var c=!1;a.strictMath||(c=!0,a.strictMath=!0);try{b.features=this.features.eval(a)}finally{c&&(a.strictMath=!1)}return a.mediaPath.push(b),a.mediaBlocks.push(b),this.rules[0].functionRegistry=a.frames[0].functionRegistry.inherit(),a.frames.unshift(this.rules[0]),b.rules=[this.rules[0].eval(a)],a.frames.shift(),a.mediaPath.pop(),0===a.mediaPath.length?b.evalTop(a):b.evalNested(a)},i.prototype.evalTop=function(a){var b=this;if(a.mediaBlocks.length>1){var d=new e([],null,null,this.index,this.currentFileInfo).createEmptySelectors();b=new c(d,a.mediaBlocks),b.multiMedia=!0}return delete a.mediaBlocks,delete a.mediaPath,b},i.prototype.evalNested=function(a){var b,e,h=a.mediaPath.concat([this]);for(b=0;h.length>b;b++)e=h[b].features instanceof d?h[b].features.value:h[b].features,h[b]=Array.isArray(e)?e:[e];return this.features=new d(this.permute(h).map(function(a){for(a=a.map(function(a){return a.toCSS?a:new f(a)}),b=a.length-1;b>0;b--)a.splice(b,0,new f("and"));return new g(a)})),new c([],[])},i.prototype.permute=function(a){if(0===a.length)return[];if(1===a.length)return a[0];for(var b=[],c=this.permute(a.slice(1)),d=0;c.length>d;d++)for(var e=0;a[0].length>e;e++)b.push([a[0][e]].concat(c[d]));return b},i.prototype.bubbleSelectors=function(a){a&&(this.rules=[new c(a.slice(0),[this.rules[0]])])},b.exports=i},{"./anonymous":44,"./directive":55,"./expression":57,"./ruleset":74,"./selector":75,"./value":79}],65:[function(a,b){var c=a("./node"),d=a("./selector"),e=a("./mixin-definition"),f=a("../functions/default"),g=function(a,b,c,e,f){this.selector=new d(a),this.arguments=b&&b.length?b:null,this.index=c,this.currentFileInfo=e,this.important=f};g.prototype=new c,g.prototype.type="MixinCall",g.prototype.accept=function(a){this.selector&&(this.selector=a.visit(this.selector)),this.arguments&&(this.arguments=a.visitArray(this.arguments))},g.prototype.eval=function(a){function b(b,c){var d,e;for(k=0;2>k;k++){for(w[k]=!0,f.value(k),d=0;c.length>d&&w[k];d++)e=c[d],e.matchCondition&&(w[k]=w[k]&&e.matchCondition(null,a));b.matchCondition&&(w[k]=w[k]&&b.matchCondition(h,a))}return w[0]||w[1]?w[0]!=w[1]?w[1]?z:A:y:x}var c,d,g,h,i,j,k,l,m,n,o,p,q,r,s,t=[],u=!1,v=[],w=[],x=-1,y=0,z=1,A=2;for(h=this.arguments&&this.arguments.map(function(b){return{name:b.name,value:b.value.eval(a)}}),s=function(b){return b.matchArgs(null,a)},i=0;a.frames.length>i;i++)if((c=a.frames[i].find(this.selector,null,s)).length>0){for(m=!0,j=0;c.length>j;j++){for(d=c[j].rule,g=c[j].path,l=!1,k=0;a.frames.length>k;k++)if(!(d instanceof e)&&d===(a.frames[k].originalRuleset||a.frames[k])){l=!0;break}l||d.matchArgs(h,a)&&(o={mixin:d,group:b(d,g)},o.group!==x&&v.push(o),u=!0)}for(f.reset(),q=[0,0,0],j=0;v.length>j;j++)q[v[j].group]++;if(q[y]>0)p=A;else if(p=z,q[z]+q[A]>1)throw{type:"Runtime",message:"Ambiguous use of `default()` found when matching for `"+this.format(h)+"`",index:this.index,filename:this.currentFileInfo.filename};for(j=0;v.length>j;j++)if(o=v[j].group,o===y||o===p)try{d=v[j].mixin,d instanceof e||(r=d.originalRuleset||d,d=new e("",[],d.rules,null,!1),d.originalRuleset=r),Array.prototype.push.apply(t,d.evalCall(a,h,this.important).rules)}catch(B){throw{message:B.message,index:this.index,filename:this.currentFileInfo.filename,stack:B.stack}}if(u){if(!this.currentFileInfo||!this.currentFileInfo.reference)for(i=0;t.length>i;i++)n=t[i],n.markReferenced&&n.markReferenced();return t}}throw m?{type:"Runtime",message:"No matching definition was found for `"+this.format(h)+"`",index:this.index,filename:this.currentFileInfo.filename}:{type:"Name",message:this.selector.toCSS().trim()+" is undefined",index:this.index,filename:this.currentFileInfo.filename}},g.prototype.format=function(a){return this.selector.toCSS().trim()+"("+(a?a.map(function(a){var b="";return a.name&&(b+=a.name+":"),b+=a.value.toCSS?a.value.toCSS():"???"}).join(", "):"")+")"},b.exports=g},{"../functions/default":19,"./mixin-definition":66,"./node":68,"./selector":75}],66:[function(a,b){var c=a("./selector"),d=a("./element"),e=a("./ruleset"),f=a("./rule"),g=a("./expression"),h=a("../contexts"),i=function(a,b,e,f,g,h){this.name=a,this.selectors=[new c([new d(null,a,this.index,this.currentFileInfo)])],this.params=b,this.condition=f,this.variadic=g,this.arity=b.length,this.rules=e,this._lookups={},this.required=b.reduce(function(a,b){return!b.name||b.name&&!b.value?a+1:a},0),this.frames=h};i.prototype=new e,i.prototype.type="MixinDefinition",i.prototype.evalFirst=!0,i.prototype.accept=function(a){this.params&&this.params.length&&(this.params=a.visitArray(this.params)),this.rules=a.visitArray(this.rules),this.condition&&(this.condition=a.visit(this.condition))},i.prototype.evalParams=function(a,b,c,d){var i,j,k,l,m,n,o,p,q=new e(null,null),r=this.params.slice(0),s=0;if(b.frames&&b.frames[0]&&b.frames[0].functionRegistry&&(q.functionRegistry=b.frames[0].functionRegistry.inherit()),b=new h.Eval(b,[q].concat(b.frames)),c)for(c=c.slice(0),s=c.length,k=0;s>k;k++)if(j=c[k],n=j&&j.name){for(o=!1,l=0;r.length>l;l++)if(!d[l]&&n===r[l].name){d[l]=j.value.eval(a),q.prependRule(new f(n,j.value.eval(a))),o=!0;break}if(o){c.splice(k,1),k--;continue}throw{type:"Runtime",message:"Named argument for "+this.name+" "+c[k].name+" not found"}}for(p=0,k=0;r.length>k;k++)if(!d[k]){if(j=c&&c[p],n=r[k].name)if(r[k].variadic){for(i=[],l=p;s>l;l++)i.push(c[l].value.eval(a));q.prependRule(new f(n,new g(i).eval(a)))}else{if(m=j&&j.value)m=m.eval(a);else{if(!r[k].value)throw{type:"Runtime",message:"wrong number of arguments for "+this.name+" ("+s+" for "+this.arity+")"};m=r[k].value.eval(b),q.resetCache()}q.prependRule(new f(n,m)),d[k]=m}if(r[k].variadic&&c)for(l=p;s>l;l++)d[l]=c[l].value.eval(a);p++}return q},i.prototype.makeImportant=function(){var a=this.rules?this.rules.map(function(a){return a.makeImportant?a.makeImportant(!0):a}):this.rules,b=new i(this.name,this.params,a,this.condition,this.variadic,this.frames);return b},i.prototype.eval=function(a){return new i(this.name,this.params,this.rules,this.condition,this.variadic,this.frames||a.frames.slice(0))},i.prototype.evalCall=function(a,b,c){var d,i,j=[],k=this.frames?this.frames.concat(a.frames):a.frames,l=this.evalParams(a,new h.Eval(a,k),b,j);return l.prependRule(new f("@arguments",new g(j).eval(a))),d=this.rules.slice(0),i=new e(null,d),i.originalRuleset=this,i=i.eval(new h.Eval(a,[this,l].concat(k))),c&&(i=i.makeImportant()),i},i.prototype.matchCondition=function(a,b){return this.condition&&!this.condition.eval(new h.Eval(b,[this.evalParams(b,new h.Eval(b,this.frames?this.frames.concat(b.frames):b.frames),a,[])].concat(this.frames||[]).concat(b.frames)))?!1:!0},i.prototype.matchArgs=function(a,b){var c,d=a&&a.length||0;if(this.variadic){if(this.required-1>d)return!1}else{
if(this.required>d)return!1;if(d>this.params.length)return!1}c=Math.min(d,this.arity);for(var e=0;c>e;e++)if(!this.params[e].name&&!this.params[e].variadic&&a[e].value.eval(b).toCSS()!=this.params[e].value.eval(b).toCSS())return!1;return!0},b.exports=i},{"../contexts":10,"./element":56,"./expression":57,"./rule":72,"./ruleset":74,"./selector":75}],67:[function(a,b){var c=a("./node"),d=a("./operation"),e=a("./dimension"),f=function(a){this.value=a};f.prototype=new c,f.prototype.type="Negative",f.prototype.genCSS=function(a,b){b.add("-"),this.value.genCSS(a,b)},f.prototype.eval=function(a){return a.isMathOn()?new d("*",[new e(-1),this.value]).eval(a):new f(this.value.eval(a))},b.exports=f},{"./dimension":54,"./node":68,"./operation":69}],68:[function(a,b){var c=function(){};c.prototype.toCSS=function(a){var b=[];return this.genCSS(a,{add:function(a){b.push(a)},isEmpty:function(){return 0===b.length}}),b.join("")},c.prototype.genCSS=function(a,b){b.add(this.value)},c.prototype.accept=function(a){this.value=a.visit(this.value)},c.prototype.eval=function(){return this},c.prototype._operate=function(a,b,c,d){switch(b){case"+":return c+d;case"-":return c-d;case"*":return c*d;case"/":return c/d}},c.prototype.fround=function(a,b){var c=a&&a.numPrecision;return null==c?b:Number((b+2e-16).toFixed(c))},c.compare=function(a,b){if(a.compare&&"Quoted"!==b.type&&"Anonymous"!==b.type)return a.compare(b);if(b.compare)return-b.compare(a);if(a.type!==b.type)return void 0;if(a=a.value,b=b.value,!Array.isArray(a))return a===b?0:void 0;if(a.length!==b.length)return void 0;for(var d=0;a.length>d;d++)if(0!==c.compare(a[d],b[d]))return void 0;return 0},c.numericCompare=function(a,b){return b>a?-1:a===b?0:a>b?1:void 0},b.exports=c},{}],69:[function(a,b){var c=a("./node"),d=a("./color"),e=a("./dimension"),f=function(a,b,c){this.op=a.trim(),this.operands=b,this.isSpaced=c};f.prototype=new c,f.prototype.type="Operation",f.prototype.accept=function(a){this.operands=a.visit(this.operands)},f.prototype.eval=function(a){var b=this.operands[0].eval(a),c=this.operands[1].eval(a);if(a.isMathOn()){if(b instanceof e&&c instanceof d&&(b=b.toColor()),c instanceof e&&b instanceof d&&(c=c.toColor()),!b.operate)throw{type:"Operation",message:"Operation on an invalid type"};return b.operate(a,this.op,c)}return new f(this.op,[b,c],this.isSpaced)},f.prototype.genCSS=function(a,b){this.operands[0].genCSS(a,b),this.isSpaced&&b.add(" "),b.add(this.op),this.isSpaced&&b.add(" "),this.operands[1].genCSS(a,b)},b.exports=f},{"./color":48,"./dimension":54,"./node":68}],70:[function(a,b){var c=a("./node"),d=function(a){this.value=a};d.prototype=new c,d.prototype.type="Paren",d.prototype.genCSS=function(a,b){b.add("("),this.value.genCSS(a,b),b.add(")")},d.prototype.eval=function(a){return new d(this.value.eval(a))},b.exports=d},{"./node":68}],71:[function(a,b){var c=a("./node"),d=a("./js-eval-node"),e=a("./variable"),f=function(a,b,c,d,e){this.escaped=null==c?!0:c,this.value=b||"",this.quote=a.charAt(0),this.index=d,this.currentFileInfo=e};f.prototype=new d,f.prototype.type="Quoted",f.prototype.genCSS=function(a,b){this.escaped||b.add(this.quote,this.currentFileInfo,this.index),b.add(this.value),this.escaped||b.add(this.quote)},f.prototype.containsVariables=function(){return this.value.match(/(`([^`]+)`)|@\{([\w-]+)\}/)},f.prototype.eval=function(a){function b(a,b,c){var d=a;do a=d,d=a.replace(b,c);while(a!==d);return d}var c=this,d=this.value,g=function(b,d){return String(c.evaluateJavaScript(d,a))},h=function(b,d){var g=new e("@"+d,c.index,c.currentFileInfo).eval(a,!0);return g instanceof f?g.value:g.toCSS()};return d=b(d,/`([^`]+)`/g,g),d=b(d,/@\{([\w-]+)\}/g,h),new f(this.quote+d+this.quote,d,this.escaped,this.index,this.currentFileInfo)},f.prototype.compare=function(a){return"Quoted"!==a.type||this.escaped||a.escaped?a.toCSS&&this.toCSS()===a.toCSS()?0:void 0:c.numericCompare(this.value,a.value)},b.exports=f},{"./js-eval-node":62,"./node":68,"./variable":80}],72:[function(a,b){function c(a,b){var c,d="",e=b.length,f={add:function(a){d+=a}};for(c=0;e>c;c++)b[c].eval(a).genCSS(a,f);return d}var d=a("./node"),e=a("./value"),f=a("./keyword"),g=function(a,b,c,f,g,h,i,j){this.name=a,this.value=b instanceof d?b:new e([b]),this.important=c?" "+c.trim():"",this.merge=f,this.index=g,this.currentFileInfo=h,this.inline=i||!1,this.variable=void 0!==j?j:a.charAt&&"@"===a.charAt(0)};g.prototype=new d,g.prototype.type="Rule",g.prototype.genCSS=function(a,b){b.add(this.name+(a.compress?":":": "),this.currentFileInfo,this.index);try{this.value.genCSS(a,b)}catch(c){throw c.index=this.index,c.filename=this.currentFileInfo.filename,c}b.add(this.important+(this.inline||a.lastRule&&a.compress?"":";"),this.currentFileInfo,this.index)},g.prototype.eval=function(a){var b,d=!1,e=this.name,h=this.variable;"string"!=typeof e&&(e=1===e.length&&e[0]instanceof f?e[0].value:c(a,e),h=!1),"font"!==e||a.strictMath||(d=!0,a.strictMath=!0);try{if(a.importantScope.push({}),b=this.value.eval(a),!this.variable&&"DetachedRuleset"===b.type)throw{message:"Rulesets cannot be evaluated on a property.",index:this.index,filename:this.currentFileInfo.filename};var i=this.important,j=a.importantScope.pop();return!i&&j.important&&(i=j.important),new g(e,b,i,this.merge,this.index,this.currentFileInfo,this.inline,h)}catch(k){throw"number"!=typeof k.index&&(k.index=this.index,k.filename=this.currentFileInfo.filename),k}finally{d&&(a.strictMath=!1)}},g.prototype.makeImportant=function(){return new g(this.name,this.value,"!important",this.merge,this.index,this.currentFileInfo,this.inline)},b.exports=g},{"./keyword":63,"./node":68,"./value":79}],73:[function(a,b){var c=a("./node"),d=a("./variable"),e=function(a){this.variable=a};e.prototype=new c,e.prototype.type="RulesetCall",e.prototype.eval=function(a){var b=new d(this.variable).eval(a);return b.callEval(a)},b.exports=e},{"./node":68,"./variable":80}],74:[function(a,b){var c=a("./node"),d=a("./rule"),e=a("./selector"),f=a("./element"),g=a("./paren"),h=a("../contexts"),i=a("../functions/function-registry"),j=a("../functions/default"),k=a("./debug-info"),l=function(a,b,c){this.selectors=a,this.rules=b,this._lookups={},this.strictImports=c};l.prototype=new c,l.prototype.type="Ruleset",l.prototype.isRuleset=!0,l.prototype.isRulesetLike=!0,l.prototype.accept=function(a){this.paths?a.visitArray(this.paths,!0):this.selectors&&(this.selectors=a.visitArray(this.selectors)),this.rules&&this.rules.length&&(this.rules=a.visitArray(this.rules))},l.prototype.eval=function(a){var b,c,e,f,g=this.selectors,h=!1;if(g&&(c=g.length)){for(b=[],j.error({type:"Syntax",message:"it is currently only allowed in parametric mixin guards,"}),f=0;c>f;f++)e=g[f].eval(a),b.push(e),e.evaldCondition&&(h=!0);j.reset()}else h=!0;var k,m,n=this.rules?this.rules.slice(0):null,o=new l(b,n,this.strictImports);o.originalRuleset=this,o.root=this.root,o.firstRoot=this.firstRoot,o.allowImports=this.allowImports,this.debugInfo&&(o.debugInfo=this.debugInfo),h||(n.length=0),o.functionRegistry=function(a){for(var b,c=0,d=a.length;c!==d;++c)if(b=a[c].functionRegistry)return b;return i}(a.frames).inherit();var p=a.frames;p.unshift(o);var q=a.selectors;q||(a.selectors=q=[]),q.unshift(this.selectors),(o.root||o.allowImports||!o.strictImports)&&o.evalImports(a);var r=o.rules,s=r?r.length:0;for(f=0;s>f;f++)r[f].evalFirst&&(r[f]=r[f].eval(a));var t=a.mediaBlocks&&a.mediaBlocks.length||0;for(f=0;s>f;f++)"MixinCall"===r[f].type?(n=r[f].eval(a).filter(function(a){return a instanceof d&&a.variable?!o.variable(a.name):!0}),r.splice.apply(r,[f,1].concat(n)),s+=n.length-1,f+=n.length-1,o.resetCache()):"RulesetCall"===r[f].type&&(n=r[f].eval(a).rules.filter(function(a){return a instanceof d&&a.variable?!1:!0}),r.splice.apply(r,[f,1].concat(n)),s+=n.length-1,f+=n.length-1,o.resetCache());for(f=0;r.length>f;f++)k=r[f],k.evalFirst||(r[f]=k=k.eval?k.eval(a):k);for(f=0;r.length>f;f++)if(k=r[f],k instanceof l&&k.selectors&&1===k.selectors.length&&k.selectors[0].isJustParentSelector()){r.splice(f--,1);for(var u=0;k.rules.length>u;u++)m=k.rules[u],m instanceof d&&m.variable||r.splice(++f,0,m)}if(p.shift(),q.shift(),a.mediaBlocks)for(f=t;a.mediaBlocks.length>f;f++)a.mediaBlocks[f].bubbleSelectors(b);return o},l.prototype.evalImports=function(a){var b,c,d=this.rules;if(d)for(b=0;d.length>b;b++)"Import"===d[b].type&&(c=d[b].eval(a),c&&c.length?(d.splice.apply(d,[b,1].concat(c)),b+=c.length-1):d.splice(b,1,c),this.resetCache())},l.prototype.makeImportant=function(){var a=new l(this.selectors,this.rules.map(function(a){return a.makeImportant?a.makeImportant():a}),this.strictImports);return a},l.prototype.matchArgs=function(a){return!a||0===a.length},l.prototype.matchCondition=function(a,b){var c=this.selectors[this.selectors.length-1];return c.evaldCondition?c.condition&&!c.condition.eval(new h.Eval(b,b.frames))?!1:!0:!1},l.prototype.resetCache=function(){this._rulesets=null,this._variables=null,this._lookups={}},l.prototype.variables=function(){return this._variables||(this._variables=this.rules?this.rules.reduce(function(a,b){if(b instanceof d&&b.variable===!0&&(a[b.name]=b),"Import"===b.type&&b.root&&b.root.variables){var c=b.root.variables();for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e])}return a},{}):{}),this._variables},l.prototype.variable=function(a){return this.variables()[a]},l.prototype.rulesets=function(){if(!this.rules)return[];var a,b,c=[],d=this.rules,e=d.length;for(a=0;e>a;a++)b=d[a],b.isRuleset&&c.push(b);return c},l.prototype.prependRule=function(a){var b=this.rules;b?b.unshift(a):this.rules=[a]},l.prototype.find=function(a,b,c){b=b||this;var d,f,g=[],h=a.toCSS();return h in this._lookups?this._lookups[h]:(this.rulesets().forEach(function(h){if(h!==b)for(var i=0;h.selectors.length>i;i++)if(d=a.match(h.selectors[i])){if(a.elements.length>d){if(!c||c(h)){f=h.find(new e(a.elements.slice(d)),b,c);for(var j=0;f.length>j;++j)f[j].path.push(h);Array.prototype.push.apply(g,f)}}else g.push({rule:h,path:[]});break}}),this._lookups[h]=g,g)},l.prototype.genCSS=function(a,b){function c(a){return"boolean"==typeof a.isRulesetLike?a.isRulesetLike:"function"==typeof a.isRulesetLike?a.isRulesetLike():!1}var d,e,f,g,h,i=[],j=[];a.tabLevel=a.tabLevel||0,this.root||a.tabLevel++;var l,m=a.compress?"":Array(a.tabLevel+1).join("  "),n=a.compress?"":Array(a.tabLevel).join("  "),o=0,p=0;for(d=0;this.rules.length>d;d++)g=this.rules[d],"Comment"===g.type?(p===d&&p++,j.push(g)):g.isCharset&&g.isCharset()?(j.splice(o,0,g),o++,p++):"Import"===g.type?(j.splice(p,0,g),p++):j.push(g);if(j=i.concat(j),!this.root){f=k(a,this,n),f&&(b.add(f),b.add(n));var q,r=this.paths,s=r.length;for(l=a.compress?",":",\n"+n,d=0;s>d;d++)if(h=r[d],q=h.length)for(d>0&&b.add(l),a.firstSelector=!0,h[0].genCSS(a,b),a.firstSelector=!1,e=1;q>e;e++)h[e].genCSS(a,b);b.add((a.compress?"{":" {\n")+m)}for(d=0;j.length>d;d++){g=j[d],d+1===j.length&&(a.lastRule=!0);var t=a.lastRule;c(g)&&(a.lastRule=!1),g.genCSS?g.genCSS(a,b):g.value&&b.add(g.value.toString()),a.lastRule=t,a.lastRule?a.lastRule=!1:b.add(a.compress?"":"\n"+m)}this.root||(b.add(a.compress?"}":"\n"+n+"}"),a.tabLevel--),b.isEmpty()||a.compress||!this.firstRoot||b.add("\n")},l.prototype.markReferenced=function(){var a;if(this.selectors)for(a=0;this.selectors.length>a;a++)this.selectors[a].markReferenced();if(this.rules)for(a=0;this.rules.length>a;a++)this.rules[a].markReferenced&&this.rules[a].markReferenced()},l.prototype.getIsReferenced=function(){var a,b,c,d;if(this.paths)for(a=0;this.paths.length>a;a++)for(c=this.paths[a],b=0;c.length>b;b++)if(c[b].getIsReferenced&&c[b].getIsReferenced())return!0;if(this.selectors)for(a=0;this.selectors.length>a;a++)if(d=this.selectors[a],d.getIsReferenced&&d.getIsReferenced())return!0;return!1},l.prototype.joinSelectors=function(a,b,c){for(var d=0;c.length>d;d++)this.joinSelector(a,b,c[d])},l.prototype.joinSelector=function(a,b,c){function d(a,b){var c,d;if(0===a.length)c=new g(a[0]);else{var h=[];for(d=0;a.length>d;d++)h.push(new f(null,a[d],b.index,b.currentFileInfo));c=new g(new e(h))}return c}function h(a,b){var c,d;return c=new f(null,a,b.index,b.currentFileInfo),d=new e([c])}function i(a,b,c){function e(a){var b;return"Paren"!==a.value.type?null:(b=a.value.value,"Selector"!==b.type?null:b)}var g,m,n,o,p,q,r,s,t,u,v=!1;for(o=[],p=[[]],g=0;c.elements.length>g;g++)if(s=c.elements[g],"&"!==s.value){var w=e(s);if(null!=w){l(o,p);var x,y=[],z=[];for(x=i(y,b,w),v=v||x,n=0;y.length>n;n++){var A=h(d(y[n],s),s);k(p,[A],s,c,z)}p=z,o=[]}else o.push(s)}else{for(v=!0,q=[],l(o,p),m=0;p.length>m;m++)if(r=p[m],0===b.length)r.length>0&&r[0].elements.push(new f(s.combinator,"",s.index,s.currentFileInfo)),q.push(r);else for(n=0;b.length>n;n++){var B=j(r,b[n],s,c);q.push(B)}p=q,o=[]}for(l(o,p),g=0;p.length>g;g++)t=p[g].length,t>0&&(a.push(p[g]),u=p[g][t-1],p[g][t-1]=u.createDerived(u.elements,c.extendList));return v}function j(a,b,c,d){var e,g,h;if(e=[],a.length>0?(e=a.slice(0),g=e.pop(),h=d.createDerived(g.elements.slice(0))):h=d.createDerived([]),b.length>0){var i=c.combinator,j=b[0].elements[0];i.emptyOrWhitespace&&!j.combinator.emptyOrWhitespace&&(i=j.combinator),h.elements.push(new f(i,j.value,c.index,c.currentFileInfo)),h.elements=h.elements.concat(b[0].elements.slice(1))}return 0!==h.elements.length&&e.push(h),b.length>1&&(e=e.concat(b.slice(1))),e}function k(a,b,c,d,e){var f;for(f=0;a.length>f;f++){var g=j(a[f],b,c,d);e.push(g)}return e}function l(a,b){var c,d;if(0!==a.length){if(0===b.length)return void b.push([new e(a)]);for(c=0;b.length>c;c++)d=b[c],d.length>0?d[d.length-1]=d[d.length-1].createDerived(d[d.length-1].elements.concat(a)):d.push(new e(a))}}var m,n,o;if(n=[],o=i(n,b,c),!o)if(b.length>0)for(n=[],m=0;b.length>m;m++)n.push(b[m].concat(c));else n=[[c]];for(m=0;n.length>m;m++)a.push(n[m])},b.exports=l},{"../contexts":10,"../functions/default":19,"../functions/function-registry":21,"./debug-info":52,"./element":56,"./node":68,"./paren":70,"./rule":72,"./selector":75}],75:[function(a,b){var c=a("./node"),d=a("./element"),e=function(a,b,c,d,e,f){this.elements=a,this.extendList=b,this.condition=c,this.currentFileInfo=e||{},this.isReferenced=f,c||(this.evaldCondition=!0)};e.prototype=new c,e.prototype.type="Selector",e.prototype.accept=function(a){this.elements&&(this.elements=a.visitArray(this.elements)),this.extendList&&(this.extendList=a.visitArray(this.extendList)),this.condition&&(this.condition=a.visit(this.condition))},e.prototype.createDerived=function(a,b,c){c=null!=c?c:this.evaldCondition;var d=new e(a,b||this.extendList,null,this.index,this.currentFileInfo,this.isReferenced);return d.evaldCondition=c,d.mediaEmpty=this.mediaEmpty,d},e.prototype.createEmptySelectors=function(){var a=new d("","&",this.index,this.currentFileInfo),b=[new e([a],null,null,this.index,this.currentFileInfo)];return b[0].mediaEmpty=!0,b},e.prototype.match=function(a){var b,c,d=this.elements,e=d.length;if(a.CacheElements(),b=a._elements.length,0===b||b>e)return 0;for(c=0;b>c;c++)if(d[c].value!==a._elements[c])return 0;return b},e.prototype.CacheElements=function(){if(!this._elements){var a=this.elements.map(function(a){return a.combinator.value+(a.value.value||a.value)}).join("").match(/[,&#\*\.\w-]([\w-]|(\\.))*/g);a?"&"===a[0]&&a.shift():a=[],this._elements=a}},e.prototype.isJustParentSelector=function(){return!this.mediaEmpty&&1===this.elements.length&&"&"===this.elements[0].value&&(" "===this.elements[0].combinator.value||""===this.elements[0].combinator.value)},e.prototype.eval=function(a){var b=this.condition&&this.condition.eval(a),c=this.elements,d=this.extendList;return c=c&&c.map(function(b){return b.eval(a)}),d=d&&d.map(function(b){return b.eval(a)}),this.createDerived(c,d,b)},e.prototype.genCSS=function(a,b){var c,d;if(a&&a.firstSelector||""!==this.elements[0].combinator.value||b.add(" ",this.currentFileInfo,this.index),!this._css)for(c=0;this.elements.length>c;c++)d=this.elements[c],d.genCSS(a,b)},e.prototype.markReferenced=function(){this.isReferenced=!0},e.prototype.getIsReferenced=function(){return!this.currentFileInfo.reference||this.isReferenced},e.prototype.getIsOutput=function(){return this.evaldCondition},b.exports=e},{"./element":56,"./node":68}],76:[function(a,b){var c=a("./node"),d=function(a){this.value=a};d.prototype=new c,d.prototype.type="UnicodeDescriptor",b.exports=d},{"./node":68}],77:[function(a,b){var c=a("./node"),d=a("../data/unit-conversions"),e=function(a,b,c){this.numerator=a?a.slice(0).sort():[],this.denominator=b?b.slice(0).sort():[],c?this.backupUnit=c:a&&a.length&&(this.backupUnit=a[0])};e.prototype=new c,e.prototype.type="Unit",e.prototype.clone=function(){return new e(this.numerator.slice(0),this.denominator.slice(0),this.backupUnit)},e.prototype.genCSS=function(a,b){var c=a&&a.strictUnits;1===this.numerator.length?b.add(this.numerator[0]):!c&&this.backupUnit?b.add(this.backupUnit):!c&&this.denominator.length&&b.add(this.denominator[0])},e.prototype.toString=function(){var a,b=this.numerator.join("*");for(a=0;this.denominator.length>a;a++)b+="/"+this.denominator[a];return b},e.prototype.compare=function(a){return this.is(a.toString())?0:void 0},e.prototype.is=function(a){return this.toString().toUpperCase()===a.toUpperCase()},e.prototype.isLength=function(){return Boolean(this.toCSS().match(/px|em|%|in|cm|mm|pc|pt|ex/))},e.prototype.isEmpty=function(){return 0===this.numerator.length&&0===this.denominator.length},e.prototype.isSingular=function(){return 1>=this.numerator.length&&0===this.denominator.length},e.prototype.map=function(a){var b;for(b=0;this.numerator.length>b;b++)this.numerator[b]=a(this.numerator[b],!1);for(b=0;this.denominator.length>b;b++)this.denominator[b]=a(this.denominator[b],!0)},e.prototype.usedUnits=function(){var a,b,c={};b=function(b){return a.hasOwnProperty(b)&&!c[e]&&(c[e]=b),b};for(var e in d)d.hasOwnProperty(e)&&(a=d[e],this.map(b));return c},e.prototype.cancel=function(){var a,b,c={};for(b=0;this.numerator.length>b;b++)a=this.numerator[b],c[a]=(c[a]||0)+1;for(b=0;this.denominator.length>b;b++)a=this.denominator[b],c[a]=(c[a]||0)-1;this.numerator=[],this.denominator=[];for(a in c)if(c.hasOwnProperty(a)){var d=c[a];if(d>0)for(b=0;d>b;b++)this.numerator.push(a);else if(0>d)for(b=0;-d>b;b++)this.denominator.push(a)}this.numerator.sort(),this.denominator.sort()},b.exports=e},{"../data/unit-conversions":13,"./node":68}],78:[function(a,b){var c=a("./node"),d=function(a,b,c,d){this.value=a,this.currentFileInfo=c,this.index=b,this.isEvald=d};d.prototype=new c,d.prototype.type="Url",d.prototype.accept=function(a){this.value=a.visit(this.value)},d.prototype.genCSS=function(a,b){b.add("url("),this.value.genCSS(a,b),b.add(")")},d.prototype.eval=function(a){var b,c=this.value.eval(a);if(!this.isEvald&&(b=this.currentFileInfo&&this.currentFileInfo.rootpath,b&&"string"==typeof c.value&&a.isPathRelative(c.value)&&(c.quote||(b=b.replace(/[\(\)'"\s]/g,function(a){return"\\"+a})),c.value=b+c.value),c.value=a.normalizePath(c.value),a.urlArgs&&!c.value.match(/^\s*data:/))){var e=-1===c.value.indexOf("?")?"?":"&",f=e+a.urlArgs;-1!==c.value.indexOf("#")?c.value=c.value.replace("#",f+"#"):c.value+=f}return new d(c,this.index,this.currentFileInfo,!0)},b.exports=d},{"./node":68}],79:[function(a,b){var c=a("./node"),d=function(a){if(this.value=a,!a)throw new Error("Value requires an array argument")};d.prototype=new c,d.prototype.type="Value",d.prototype.accept=function(a){this.value&&(this.value=a.visitArray(this.value))},d.prototype.eval=function(a){return 1===this.value.length?this.value[0].eval(a):new d(this.value.map(function(b){return b.eval(a)}))},d.prototype.genCSS=function(a,b){var c;for(c=0;this.value.length>c;c++)this.value[c].genCSS(a,b),this.value.length>c+1&&b.add(a&&a.compress?",":", ")},b.exports=d},{"./node":68}],80:[function(a,b){var c=a("./node"),d=function(a,b,c){this.name=a,this.index=b,this.currentFileInfo=c||{}};d.prototype=new c,d.prototype.type="Variable",d.prototype.eval=function(a){var b,c=this.name;if(0===c.indexOf("@@")&&(c="@"+new d(c.slice(1),this.index,this.currentFileInfo).eval(a).value),this.evaluating)throw{type:"Name",message:"Recursive variable definition for "+c,filename:this.currentFileInfo.filename,index:this.index};if(this.evaluating=!0,b=this.find(a.frames,function(b){var d=b.variable(c);if(d){if(d.important){var e=a.importantScope[a.importantScope.length-1];e.important=d.important}return d.value.eval(a)}}))return this.evaluating=!1,b;throw{type:"Name",message:"variable "+c+" is undefined",filename:this.currentFileInfo.filename,index:this.index}},d.prototype.find=function(a,b){for(var c,d=0;a.length>d;d++)if(c=b.call(a,a[d]))return c;return null},b.exports=d},{"./node":68}],81:[function(a,b){b.exports={getLocation:function(a,b){for(var c=a+1,d=null,e=-1;--c>=0&&"\n"!==b.charAt(c);)e++;return"number"==typeof a&&(d=(b.slice(0,a).match(/\n/g)||"").length),{line:d,column:e}}}},{}],82:[function(a,b){var c=a("../tree"),d=a("./visitor"),e=a("../logger"),f=function(){this._visitor=new d(this),this.contexts=[],this.allExtendsStack=[[]]};f.prototype={run:function(a){return a=this._visitor.visit(a),a.allExtends=this.allExtendsStack[0],a},visitRule:function(a,b){b.visitDeeper=!1},visitMixinDefinition:function(a,b){b.visitDeeper=!1},visitRuleset:function(a){if(!a.root){var b,d,e,f,g=[],h=a.rules,i=h?h.length:0;for(b=0;i>b;b++)a.rules[b]instanceof c.Extend&&(g.push(h[b]),a.extendOnEveryPath=!0);var j=a.paths;for(b=0;j.length>b;b++){var k=j[b],l=k[k.length-1],m=l.extendList;for(f=m?m.slice(0).concat(g):g,f&&(f=f.map(function(a){return a.clone()})),d=0;f.length>d;d++)this.foundExtends=!0,e=f[d],e.findSelfSelectors(k),e.ruleset=a,0===d&&(e.firstExtendOnThisSelectorPath=!0),this.allExtendsStack[this.allExtendsStack.length-1].push(e)}this.contexts.push(a.selectors)}},visitRulesetOut:function(a){a.root||(this.contexts.length=this.contexts.length-1)},visitMedia:function(a){a.allExtends=[],this.allExtendsStack.push(a.allExtends)},visitMediaOut:function(){this.allExtendsStack.length=this.allExtendsStack.length-1},visitDirective:function(a){a.allExtends=[],this.allExtendsStack.push(a.allExtends)},visitDirectiveOut:function(){this.allExtendsStack.length=this.allExtendsStack.length-1}};var g=function(){this._visitor=new d(this)};g.prototype={run:function(a){var b=new f;if(this.extendIndicies={},b.run(a),!b.foundExtends)return a;a.allExtends=a.allExtends.concat(this.doExtendChaining(a.allExtends,a.allExtends)),this.allExtendsStack=[a.allExtends];var c=this._visitor.visit(a);return this.checkExtendsForNonMatched(a.allExtends),c},checkExtendsForNonMatched:function(a){var b=this.extendIndicies;a.filter(function(a){return!a.hasFoundMatches&&1==a.parent_ids.length}).forEach(function(a){var c="_unknown_";try{c=a.selector.toCSS({})}catch(d){}b[a.index+" "+c]||(b[a.index+" "+c]=!0,e.warn("extend '"+c+"' has no matches"))})},doExtendChaining:function(a,b,d){var e,f,g,h,i,j,k,l,m=[],n=this;for(d=d||0,e=0;a.length>e;e++)for(f=0;b.length>f;f++)j=a[e],k=b[f],j.parent_ids.indexOf(k.object_id)>=0||(i=[k.selfSelectors[0]],g=n.findMatch(j,i),g.length&&(j.hasFoundMatches=!0,j.selfSelectors.forEach(function(a){h=n.extendSelector(g,i,a),l=new c.Extend(k.selector,k.option,0),l.selfSelectors=h,h[h.length-1].extendList=[l],m.push(l),l.ruleset=k.ruleset,l.parent_ids=l.parent_ids.concat(k.parent_ids,j.parent_ids),k.firstExtendOnThisSelectorPath&&(l.firstExtendOnThisSelectorPath=!0,k.ruleset.paths.push(h))})));if(m.length){if(this.extendChainCount++,d>100){var o="{unable to calculate}",p="{unable to calculate}";try{o=m[0].selfSelectors[0].toCSS(),p=m[0].selector.toCSS()}catch(q){}throw{message:"extend circular reference detected. One of the circular extends is currently:"+o+":extend("+p+")"}}return m.concat(n.doExtendChaining(m,b,d+1))}return m},visitRule:function(a,b){b.visitDeeper=!1},visitMixinDefinition:function(a,b){b.visitDeeper=!1},visitSelector:function(a,b){b.visitDeeper=!1},visitRuleset:function(a){if(!a.root){var b,c,d,e,f=this.allExtendsStack[this.allExtendsStack.length-1],g=[],h=this;for(d=0;f.length>d;d++)for(c=0;a.paths.length>c;c++)if(e=a.paths[c],!a.extendOnEveryPath){var i=e[e.length-1].extendList;i&&i.length||(b=this.findMatch(f[d],e),b.length&&(f[d].hasFoundMatches=!0,f[d].selfSelectors.forEach(function(a){g.push(h.extendSelector(b,e,a))})))}a.paths=a.paths.concat(g)}},findMatch:function(a,b){var c,d,e,f,g,h,i,j=this,k=a.selector.elements,l=[],m=[];for(c=0;b.length>c;c++)for(d=b[c],e=0;d.elements.length>e;e++)for(f=d.elements[e],(a.allowBefore||0===c&&0===e)&&l.push({pathIndex:c,index:e,matched:0,initialCombinator:f.combinator}),h=0;l.length>h;h++)i=l[h],g=f.combinator.value,""===g&&0===e&&(g=" "),!j.isElementValuesEqual(k[i.matched].value,f.value)||i.matched>0&&k[i.matched].combinator.value!==g?i=null:i.matched++,i&&(i.finished=i.matched===k.length,i.finished&&!a.allowAfter&&(d.elements.length>e+1||b.length>c+1)&&(i=null)),i?i.finished&&(i.length=k.length,i.endPathIndex=c,i.endPathElementIndex=e+1,l.length=0,m.push(i)):(l.splice(h,1),h--);return m},isElementValuesEqual:function(a,b){if("string"==typeof a||"string"==typeof b)return a===b;if(a instanceof c.Attribute)return a.op!==b.op||a.key!==b.key?!1:a.value&&b.value?(a=a.value.value||a.value,b=b.value.value||b.value,a===b):a.value||b.value?!1:!0;if(a=a.value,b=b.value,a instanceof c.Selector){if(!(b instanceof c.Selector)||a.elements.length!==b.elements.length)return!1;for(var d=0;a.elements.length>d;d++){if(a.elements[d].combinator.value!==b.elements[d].combinator.value&&(0!==d||(a.elements[d].combinator.value||" ")!==(b.elements[d].combinator.value||" ")))return!1;if(!this.isElementValuesEqual(a.elements[d].value,b.elements[d].value))return!1}return!0}return!1},extendSelector:function(a,b,d){var e,f,g,h,i,j=0,k=0,l=[];for(e=0;a.length>e;e++)h=a[e],f=b[h.pathIndex],g=new c.Element(h.initialCombinator,d.elements[0].value,d.elements[0].index,d.elements[0].currentFileInfo),h.pathIndex>j&&k>0&&(l[l.length-1].elements=l[l.length-1].elements.concat(b[j].elements.slice(k)),k=0,j++),i=f.elements.slice(k,h.index).concat([g]).concat(d.elements.slice(1)),j===h.pathIndex&&e>0?l[l.length-1].elements=l[l.length-1].elements.concat(i):(l=l.concat(b.slice(j,h.pathIndex)),l.push(new c.Selector(i))),j=h.endPathIndex,k=h.endPathElementIndex,k>=b[j].elements.length&&(k=0,j++);return b.length>j&&k>0&&(l[l.length-1].elements=l[l.length-1].elements.concat(b[j].elements.slice(k)),j++),l=l.concat(b.slice(j,b.length))},visitRulesetOut:function(){},visitMedia:function(a){var b=a.allExtends.concat(this.allExtendsStack[this.allExtendsStack.length-1]);b=b.concat(this.doExtendChaining(b,a.allExtends)),this.allExtendsStack.push(b)},visitMediaOut:function(){var a=this.allExtendsStack.length-1;this.allExtendsStack.length=a},visitDirective:function(a){var b=a.allExtends.concat(this.allExtendsStack[this.allExtendsStack.length-1]);b=b.concat(this.doExtendChaining(b,a.allExtends)),this.allExtendsStack.push(b)},visitDirectiveOut:function(){var a=this.allExtendsStack.length-1;this.allExtendsStack.length=a}},b.exports=g},{"../logger":31,"../tree":60,"./visitor":88}],83:[function(a,b){function c(a){this.imports=[],this.variableImports=[],this._onSequencerEmpty=a,this._currentDepth=0}c.prototype.addImport=function(a){var b=this,c={callback:a,args:null,isReady:!1};return this.imports.push(c),function(){c.args=Array.prototype.slice.call(arguments,0),c.isReady=!0,b.tryRun()}},c.prototype.addVariableImport=function(a){this.variableImports.push(a)},c.prototype.tryRun=function(){this._currentDepth++;try{for(;;){for(;this.imports.length>0;){var a=this.imports[0];if(!a.isReady)return;this.imports=this.imports.slice(1),a.callback.apply(null,a.args)}if(0===this.variableImports.length)break;var b=this.variableImports[0];this.variableImports=this.variableImports.slice(1),b()}}finally{this._currentDepth--}0===this._currentDepth&&this._onSequencerEmpty&&this._onSequencerEmpty()},b.exports=c},{}],84:[function(a,b){var c=a("../contexts"),d=a("./visitor"),e=a("./import-sequencer"),f=function(a,b){this._visitor=new d(this),this._importer=a,this._finish=b,this.context=new c.Eval,this.importCount=0,this.onceFileDetectionMap={},this.recursionDetector={},this._sequencer=new e(this._onSequencerEmpty.bind(this))};f.prototype={isReplacing:!1,run:function(a){try{this._visitor.visit(a)}catch(b){this.error=b}this.isFinished=!0,this._sequencer.tryRun()},_onSequencerEmpty:function(){this.isFinished&&this._finish(this.error)},visitImport:function(a,b){var d=a.options.inline;if(!a.css||d){var e=new c.Eval(this.context,this.context.frames.slice(0)),f=e.frames[0];this.importCount++,a.isVariableImport()?this._sequencer.addVariableImport(this.processImportNode.bind(this,a,e,f)):this.processImportNode(a,e,f)}b.visitDeeper=!1},processImportNode:function(a,b,c){var d,e=a.options.inline;try{d=a.evalForImport(b)}catch(f){f.filename||(f.index=a.index,f.filename=a.currentFileInfo.filename),a.css=!0,a.error=f}if(!d||d.css&&!e)this.importCount--,this.isFinished&&this._sequencer.tryRun();else{d.options.multiple&&(b.importMultiple=!0);for(var g=void 0===d.css,h=0;c.rules.length>h;h++)if(c.rules[h]===a){c.rules[h]=d;break}var i=this.onImported.bind(this,d,b),j=this._sequencer.addImport(i);this._importer.push(d.getPath(),g,d.currentFileInfo,d.options,j)}},onImported:function(a,b,c,d,e,f){c&&(c.filename||(c.index=a.index,c.filename=a.currentFileInfo.filename),this.error=c);var g=this,h=a.options.inline,i=a.options.plugin,j=e||f in g.recursionDetector;if(b.importMultiple||(a.skip=j?!0:function(){return f in g.onceFileDetectionMap?!0:(g.onceFileDetectionMap[f]=!0,!1)}),d&&(a.root=d,a.importedFilename=f,!(h||i||!b.importMultiple&&j))){g.recursionDetector[f]=!0;var k=this.context;this.context=b;try{this._visitor.visit(d)}catch(c){this.error=c}this.context=k}g.importCount--,g.isFinished&&g._sequencer.tryRun()},visitRule:function(a,b){"DetachedRuleset"===a.value.type?this.context.frames.unshift(a):b.visitDeeper=!1},visitRuleOut:function(a){"DetachedRuleset"===a.value.type&&this.context.frames.shift()},visitDirective:function(a){this.context.frames.unshift(a)},visitDirectiveOut:function(){this.context.frames.shift()},visitMixinDefinition:function(a){this.context.frames.unshift(a)},visitMixinDefinitionOut:function(){this.context.frames.shift()},visitRuleset:function(a){this.context.frames.unshift(a)},visitRulesetOut:function(){this.context.frames.shift()},visitMedia:function(a){this.context.frames.unshift(a.rules[0])},visitMediaOut:function(){this.context.frames.shift()}},b.exports=f},{"../contexts":10,"./import-sequencer":83,"./visitor":88}],85:[function(a,b){var c={Visitor:a("./visitor"),ImportVisitor:a("./import-visitor"),ExtendVisitor:a("./extend-visitor"),JoinSelectorVisitor:a("./join-selector-visitor"),ToCSSVisitor:a("./to-css-visitor")};b.exports=c},{"./extend-visitor":82,"./import-visitor":84,"./join-selector-visitor":86,"./to-css-visitor":87,"./visitor":88}],86:[function(a,b){var c=a("./visitor"),d=function(){this.contexts=[[]],this._visitor=new c(this)};d.prototype={run:function(a){return this._visitor.visit(a)},visitRule:function(a,b){b.visitDeeper=!1},visitMixinDefinition:function(a,b){b.visitDeeper=!1},visitRuleset:function(a){var b,c=this.contexts[this.contexts.length-1],d=[];this.contexts.push(d),a.root||(b=a.selectors,b&&(b=b.filter(function(a){return a.getIsOutput()}),a.selectors=b.length?b:b=null,b&&a.joinSelectors(d,c,b)),b||(a.rules=null),a.paths=d)},visitRulesetOut:function(){this.contexts.length=this.contexts.length-1},visitMedia:function(a){var b=this.contexts[this.contexts.length-1];a.rules[0].root=0===b.length||b[0].multiMedia},visitDirective:function(a){var b=this.contexts[this.contexts.length-1];a.rules&&a.rules.length&&(a.rules[0].root=a.isRooted||0===b.length||null)}},b.exports=d},{"./visitor":88}],87:[function(a,b){var c=a("../tree"),d=a("./visitor"),e=function(a){this._visitor=new d(this),this._context=a};e.prototype={isReplacing:!0,run:function(a){return this._visitor.visit(a)},visitRule:function(a){return a.variable?void 0:a},visitMixinDefinition:function(a){
a.frames=[]},visitExtend:function(){},visitComment:function(a){return a.isSilent(this._context)?void 0:a},visitMedia:function(a,b){return a.accept(this._visitor),b.visitDeeper=!1,a.rules.length?a:void 0},visitImport:function(a){return void 0!==a.path.currentFileInfo.reference&&a.css?void 0:a},visitDirective:function(a,b){function d(a){var b,c=a.rules;1!==c.length||c[0].paths&&0!==c[0].paths.length||(c=c[0].rules);for(var d=0;c.length>d;d++)if(b=c[d],b.getIsReferenced&&b.getIsReferenced())return!0;return!1}if("@charset"===a.name){if(!a.getIsReferenced())return;if(this.charset){if(a.debugInfo){var e=new c.Comment("/* "+a.toCSS(this._context).replace(/\n/g,"")+" */\n");return e.debugInfo=a.debugInfo,this._visitor.visit(e)}return}this.charset=!0}if(a.rules&&a.rules.length){if(this._mergeRules(a.rules[0].rules),a.accept(this._visitor),b.visitDeeper=!1,a.getIsReferenced())return a;if(!a.rules||!a.rules.length)return;if(d(a))return a.markReferenced(),a}else if(a.getIsReferenced())return a},checkPropertiesInRoot:function(a){for(var b,d=0;a.length>d;d++)if(b=a[d],b instanceof c.Rule&&!b.variable)throw{message:"properties must be inside selector blocks, they cannot be in the root.",index:b.index,filename:b.currentFileInfo?b.currentFileInfo.filename:null}},visitRuleset:function(a,b){var d,e=[];if(a.firstRoot&&this.checkPropertiesInRoot(a.rules),a.root)a.accept(this._visitor),b.visitDeeper=!1,(a.firstRoot||a.rules&&a.rules.length>0)&&e.splice(0,0,a);else{a.paths&&(a.paths=a.paths.filter(function(a){var b;for(" "===a[0].elements[0].combinator.value&&(a[0].elements[0].combinator=new c.Combinator("")),b=0;a.length>b;b++)if(a[b].getIsReferenced()&&a[b].getIsOutput())return!0;return!1}));for(var f=a.rules,g=f?f.length:0,h=0;g>h;)d=f[h],d&&d.rules?(e.push(this._visitor.visit(d)),f.splice(h,1),g--):h++;g>0?a.accept(this._visitor):a.rules=null,b.visitDeeper=!1,f=a.rules,f&&(this._mergeRules(f),f=a.rules),f&&(this._removeDuplicateRules(f),f=a.rules),f&&f.length>0&&a.paths.length>0&&e.splice(0,0,a)}return 1===e.length?e[0]:e},_removeDuplicateRules:function(a){if(a){var b,d,e,f={};for(e=a.length-1;e>=0;e--)if(d=a[e],d instanceof c.Rule)if(f[d.name]){b=f[d.name],b instanceof c.Rule&&(b=f[d.name]=[f[d.name].toCSS(this._context)]);var g=d.toCSS(this._context);-1!==b.indexOf(g)?a.splice(e,1):b.push(g)}else f[d.name]=d}},_mergeRules:function(a){if(a){for(var b,d,e,f={},g=0;a.length>g;g++)d=a[g],d instanceof c.Rule&&d.merge&&(e=[d.name,d.important?"!":""].join(","),f[e]?a.splice(g--,1):f[e]=[],f[e].push(d));Object.keys(f).map(function(a){function e(a){return new c.Expression(a.map(function(a){return a.value}))}function g(a){return new c.Value(a.map(function(a){return a}))}if(b=f[a],b.length>1){d=b[0];var h=[],i=[];b.map(function(a){"+"===a.merge&&(i.length>0&&h.push(e(i)),i=[]),i.push(a)}),h.push(e(i)),d.value=g(h)}})}}},b.exports=e},{"../tree":60,"./visitor":88}],88:[function(a,b){function c(a){return a}function d(a,b){var c,e;for(c in a)if(a.hasOwnProperty(c))switch(e=a[c],typeof e){case"function":e.prototype&&e.prototype.type&&(e.prototype.typeIndex=b++);break;case"object":b=d(e,b)}return b}var e=a("../tree"),f={visitDeeper:!0},g=!1,h=function(a){this._implementation=a,this._visitFnCache=[],g||(d(e,1),g=!0)};h.prototype={visit:function(a){if(!a)return a;var b=a.typeIndex;if(!b)return a;var d,e=this._visitFnCache,g=this._implementation,h=b<<1,i=1|h,j=e[h],k=e[i],l=f;if(l.visitDeeper=!0,j||(d="visit"+a.type,j=g[d]||c,k=g[d+"Out"]||c,e[h]=j,e[i]=k),j!==c){var m=j.call(g,a,l);g.isReplacing&&(a=m)}return l.visitDeeper&&a&&a.accept&&a.accept(this),k!=c&&k.call(g,a),a},visitArray:function(a,b){if(!a)return a;var c,d=a.length;if(b||!this._implementation.isReplacing){for(c=0;d>c;c++)this.visit(a[c]);return a}var e=[];for(c=0;d>c;c++){var f=this.visit(a[c]);void 0!==f&&(f.splice?f.length&&this.flatten(f,e):e.push(f))}return e},flatten:function(a,b){b||(b=[]);var c,d,e,f,g,h;for(d=0,c=a.length;c>d;d++)if(e=a[d],void 0!==e)if(e.splice)for(g=0,f=e.length;f>g;g++)h=e[g],void 0!==h&&(h.splice?h.length&&this.flatten(h,b):b.push(h));else b.push(e);return b}},b.exports=h},{"../tree":60}],89:[function(a,b){function c(){if(!g){g=!0;for(var a,b=f.length;b;){a=f,f=[];for(var c=-1;++c<b;)a[c]();b=f.length}g=!1}}function d(){}var e=b.exports={},f=[],g=!1;e.nextTick=function(a){f.push(a),g||setTimeout(c,0)},e.title="browser",e.browser=!0,e.env={},e.argv=[],e.version="",e.versions={},e.on=d,e.addListener=d,e.once=d,e.off=d,e.removeListener=d,e.removeAllListeners=d,e.emit=d,e.binding=function(){throw new Error("process.binding is not supported")},e.cwd=function(){return"/"},e.chdir=function(){throw new Error("process.chdir is not supported")},e.umask=function(){return 0}},{}],90:[function(a,b){"use strict";function c(a){function b(a){return null===i?void k.push(a):void f(function(){var b=i?a.onFulfilled:a.onRejected;if(null===b)return void(i?a.resolve:a.reject)(j);var c;try{c=b(j)}catch(d){return void a.reject(d)}a.resolve(c)})}function c(a){try{if(a===l)throw new TypeError("A promise cannot be resolved with itself.");if(a&&("object"==typeof a||"function"==typeof a)){var b=a.then;if("function"==typeof b)return void e(b.bind(a),c,g)}i=!0,j=a,h()}catch(d){g(d)}}function g(a){i=!1,j=a,h()}function h(){for(var a=0,c=k.length;c>a;a++)b(k[a]);k=null}if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof a)throw new TypeError("not a function");var i=null,j=null,k=[],l=this;this.then=function(a,c){return new l.constructor(function(e,f){b(new d(a,c,e,f))})},e(a,c,g)}function d(a,b,c,d){this.onFulfilled="function"==typeof a?a:null,this.onRejected="function"==typeof b?b:null,this.resolve=c,this.reject=d}function e(a,b,c){var d=!1;try{a(function(a){d||(d=!0,b(a))},function(a){d||(d=!0,c(a))})}catch(e){if(d)return;d=!0,c(e)}}var f=a("asap");b.exports=c},{asap:92}],91:[function(a,b){"use strict";function c(a){this.then=function(b){return"function"!=typeof b?this:new d(function(c,d){e(function(){try{c(b(a))}catch(e){d(e)}})})}}var d=a("./core.js"),e=a("asap");b.exports=d,c.prototype=d.prototype;var f=new c(!0),g=new c(!1),h=new c(null),i=new c(void 0),j=new c(0),k=new c("");d.resolve=function(a){if(a instanceof d)return a;if(null===a)return h;if(void 0===a)return i;if(a===!0)return f;if(a===!1)return g;if(0===a)return j;if(""===a)return k;if("object"==typeof a||"function"==typeof a)try{var b=a.then;if("function"==typeof b)return new d(b.bind(a))}catch(e){return new d(function(a,b){b(e)})}return new c(a)},d.all=function(a){var b=Array.prototype.slice.call(a);return new d(function(a,c){function d(f,g){try{if(g&&("object"==typeof g||"function"==typeof g)){var h=g.then;if("function"==typeof h)return void h.call(g,function(a){d(f,a)},c)}b[f]=g,0===--e&&a(b)}catch(i){c(i)}}if(0===b.length)return a([]);for(var e=b.length,f=0;b.length>f;f++)d(f,b[f])})},d.reject=function(a){return new d(function(b,c){c(a)})},d.race=function(a){return new d(function(b,c){a.forEach(function(a){d.resolve(a).then(b,c)})})},d.prototype["catch"]=function(a){return this.then(null,a)}},{"./core.js":90,asap:92}],92:[function(a,b){(function(a){function c(){for(;e.next;){e=e.next;var a=e.task;e.task=void 0;var b=e.domain;b&&(e.domain=void 0,b.enter());try{a()}catch(d){if(i)throw b&&b.exit(),setTimeout(c,0),b&&b.enter(),d;setTimeout(function(){throw d},0)}b&&b.exit()}g=!1}function d(b){f=f.next={task:b,domain:i&&a.domain,next:null},g||(g=!0,h())}var e={task:void 0,next:null},f=e,g=!1,h=void 0,i=!1;if("undefined"!=typeof a&&a.nextTick)i=!0,h=function(){a.nextTick(c)};else if("function"==typeof setImmediate)h="undefined"!=typeof window?setImmediate.bind(window,c):function(){setImmediate(c)};else if("undefined"!=typeof MessageChannel){var j=new MessageChannel;j.port1.onmessage=c,h=function(){j.port2.postMessage(0)}}else h=function(){setTimeout(c,0)};b.exports=d}).call(this,a("_process"))},{_process:89}],93:[function(){"function"!=typeof Promise.prototype.done&&(Promise.prototype.done=function(){var a=arguments.length?this.then.apply(this,arguments):this;a.then(null,function(a){setTimeout(function(){throw a},0)})})},{}],94:[function(a){a("asap");"undefined"==typeof Promise&&(Promise=a("./lib/core.js"),a("./lib/es6-extensions.js")),a("./polyfill-done.js")},{"./lib/core.js":90,"./lib/es6-extensions.js":91,"./polyfill-done.js":93,asap:92}]},{},[2])(2)});
(function() {


}).call(this);
 /*
 * # Semantic UI - 2.3.1
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

!function(e,t,n,i){e.site=e.fn.site=function(o){var a,r,s=(new Date).getTime(),l=[],c=arguments[0],u="string"==typeof c,d=[].slice.call(arguments,1),f=e.isPlainObject(o)?e.extend(!0,{},e.site.settings,o):e.extend({},e.site.settings),m=f.namespace,g=f.error,p="module-"+m,h=e(n),v=this,b=h.data(p);return a={initialize:function(){a.instantiate()},instantiate:function(){a.verbose("Storing instance of site",a),b=a,h.data(p,a)},normalize:function(){a.fix.console(),a.fix.requestAnimationFrame()},fix:{console:function(){a.debug("Normalizing window.console"),console!==i&&console.log!==i||(a.verbose("Console not available, normalizing events"),a.disable.console()),void 0!==console.group&&void 0!==console.groupEnd&&void 0!==console.groupCollapsed||(a.verbose("Console group not available, normalizing events"),t.console.group=function(){},t.console.groupEnd=function(){},t.console.groupCollapsed=function(){}),void 0===console.markTimeline&&(a.verbose("Mark timeline not available, normalizing events"),t.console.markTimeline=function(){})},consoleClear:function(){a.debug("Disabling programmatic console clearing"),t.console.clear=function(){}},requestAnimationFrame:function(){a.debug("Normalizing requestAnimationFrame"),t.requestAnimationFrame===i&&(a.debug("RequestAnimationFrame not available, normalizing event"),t.requestAnimationFrame=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)})}},moduleExists:function(t){return e.fn[t]!==i&&e.fn[t].settings!==i},enabled:{modules:function(t){var n=[];return t=t||f.modules,e.each(t,function(e,t){a.moduleExists(t)&&n.push(t)}),n}},disabled:{modules:function(t){var n=[];return t=t||f.modules,e.each(t,function(e,t){a.moduleExists(t)||n.push(t)}),n}},change:{setting:function(t,n,o,r){o="string"==typeof o?"all"===o?f.modules:[o]:o||f.modules,r=r===i||r,e.each(o,function(i,o){var s,l=!a.moduleExists(o)||(e.fn[o].settings.namespace||!1);a.moduleExists(o)&&(a.verbose("Changing default setting",t,n,o),e.fn[o].settings[t]=n,r&&l&&(s=e(":data(module-"+l+")")).length>0&&(a.verbose("Modifying existing settings",s),s[o]("setting",t,n)))})},settings:function(t,n,o){n="string"==typeof n?[n]:n||f.modules,o=o===i||o,e.each(n,function(n,i){var r;a.moduleExists(i)&&(a.verbose("Changing default setting",t,i),e.extend(!0,e.fn[i].settings,t),o&&m&&(r=e(":data(module-"+m+")")).length>0&&(a.verbose("Modifying existing settings",r),r[i]("setting",t)))})}},enable:{console:function(){a.console(!0)},debug:function(e,t){e=e||f.modules,a.debug("Enabling debug for modules",e),a.change.setting("debug",!0,e,t)},verbose:function(e,t){e=e||f.modules,a.debug("Enabling verbose debug for modules",e),a.change.setting("verbose",!0,e,t)}},disable:{console:function(){a.console(!1)},debug:function(e,t){e=e||f.modules,a.debug("Disabling debug for modules",e),a.change.setting("debug",!1,e,t)},verbose:function(e,t){e=e||f.modules,a.debug("Disabling verbose debug for modules",e),a.change.setting("verbose",!1,e,t)}},console:function(e){if(e){if(b.cache.console===i)return void a.error(g.console);a.debug("Restoring console function"),t.console=b.cache.console}else a.debug("Disabling console function"),b.cache.console=t.console,t.console={clear:function(){},error:function(){},group:function(){},groupCollapsed:function(){},groupEnd:function(){},info:function(){},log:function(){},markTimeline:function(){},warn:function(){}}},destroy:function(){a.verbose("Destroying previous site for",h),h.removeData(p)},cache:{},setting:function(t,n){if(e.isPlainObject(t))e.extend(!0,f,t);else{if(n===i)return f[t];f[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,a,t);else{if(n===i)return a[t];a[t]=n}},debug:function(){f.debug&&(f.performance?a.performance.log(arguments):(a.debug=Function.prototype.bind.call(console.info,console,f.name+":"),a.debug.apply(console,arguments)))},verbose:function(){f.verbose&&f.debug&&(f.performance?a.performance.log(arguments):(a.verbose=Function.prototype.bind.call(console.info,console,f.name+":"),a.verbose.apply(console,arguments)))},error:function(){a.error=Function.prototype.bind.call(console.error,console,f.name+":"),a.error.apply(console,arguments)},performance:{log:function(e){var t,n;f.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Element:v,Name:e[0],Arguments:[].slice.call(e,1)||"","Execution Time":n})),clearTimeout(a.performance.timer),a.performance.timer=setTimeout(a.performance.display,500)},display:function(){var t=f.name+":",n=0;s=!1,clearTimeout(a.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,o){var s,l,c,u=b;return n=n||d,o=v||o,"string"==typeof t&&u!==i&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(n,o){var r=n!=s?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(u[r])&&n!=s)u=u[r];else{if(u[r]!==i)return l=u[r],!1;if(!e.isPlainObject(u[o])||n==s)return u[o]!==i?(l=u[o],!1):(a.error(g.method,t),!1);u=u[o]}})),e.isFunction(l)?c=l.apply(o,n):l!==i&&(c=l),e.isArray(r)?r.push(c):r!==i?r=[r,c]:c!==i&&(r=c),l}},u?(b===i&&a.initialize(),a.invoke(c)):(b!==i&&a.destroy(),a.initialize()),r!==i?r:this},e.site.settings={name:"Site",namespace:"site",error:{console:"Console cannot be restored, most likely it was overwritten outside of module",method:"The method you called is not defined."},debug:!1,verbose:!1,performance:!0,modules:["accordion","api","checkbox","dimmer","dropdown","embed","form","modal","nag","popup","rating","shape","sidebar","state","sticky","tab","transition","visit","visibility"],siteNamespace:"site",namespaceStub:{cache:{},config:{},sections:{},section:{},utilities:{}}},e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(n){return!!e.data(n,t)}}):function(t,n,i){return!!e.data(t,i[3])}})}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.form=function(t){var o,a=e(this),r=a.selector||"",s=(new Date).getTime(),l=[],c=arguments[0],u=arguments[1],d="string"==typeof c,f=[].slice.call(arguments,1);return a.each(function(){var m,g,p,h,v,b,y,x,C,w,S,k,T,A,R,P,E=e(this),F=this,O=[],D=!1;(P={initialize:function(){P.get.settings(),d?(R===i&&P.instantiate(),P.invoke(c)):(R!==i&&R.invoke("destroy"),P.verbose("Initializing form validation",E,v),P.bindEvents(),P.set.defaults(),P.instantiate())},instantiate:function(){P.verbose("Storing instance of module",P),R=P,E.data(T,P)},destroy:function(){P.verbose("Destroying previous module",R),P.removeEvents(),E.removeData(T)},refresh:function(){P.verbose("Refreshing selector cache"),m=E.find(x.field),g=E.find(x.group),p=E.find(x.message),E.find(x.prompt),h=E.find(x.submit),E.find(x.clear),E.find(x.reset)},submit:function(){P.verbose("Submitting form",E),E.submit()},attachEvents:function(t,n){n=n||"submit",e(t).on("click"+A,function(e){P[n](),e.preventDefault()})},bindEvents:function(){P.verbose("Attaching form events"),E.on("submit"+A,P.validate.form).on("blur"+A,x.field,P.event.field.blur).on("click"+A,x.submit,P.submit).on("click"+A,x.reset,P.reset).on("click"+A,x.clear,P.clear),v.keyboardShortcuts&&E.on("keydown"+A,x.field,P.event.field.keydown),m.each(function(){var t=e(this),n=t.prop("type"),i=P.get.changeEvent(n,t);e(this).on(i+A,P.event.field.change)})},clear:function(){m.each(function(){var t=e(this),n=t.parent(),i=t.closest(g),o=i.find(x.prompt),a=t.data(y.defaultValue)||"",r=n.is(x.uiCheckbox),s=n.is(x.uiDropdown);i.hasClass(C.error)&&(P.verbose("Resetting error on field",i),i.removeClass(C.error),o.remove()),s?(P.verbose("Resetting dropdown value",n,a),n.dropdown("clear")):r?t.prop("checked",!1):(P.verbose("Resetting field value",t,a),t.val(""))})},reset:function(){m.each(function(){var t=e(this),n=t.parent(),o=t.closest(g),a=o.find(x.prompt),r=t.data(y.defaultValue),s=n.is(x.uiCheckbox),l=n.is(x.uiDropdown),c=o.hasClass(C.error);r!==i&&(c&&(P.verbose("Resetting error on field",o),o.removeClass(C.error),a.remove()),l?(P.verbose("Resetting dropdown value",n,r),n.dropdown("restore defaults")):s?(P.verbose("Resetting checkbox value",n,r),t.prop("checked",r)):(P.verbose("Resetting field value",t,r),t.val(r)))})},determine:{isValid:function(){var t=!0;return e.each(b,function(e,n){P.validate.field(n,e,!0)||(t=!1)}),t}},is:{bracketedRule:function(e){return e.type&&e.type.match(v.regExp.bracket)},shorthandFields:function(e){var t=e[Object.keys(e)[0]];return P.is.shorthandRules(t)},shorthandRules:function(t){return"string"==typeof t||e.isArray(t)},empty:function(e){return!e||0===e.length||(e.is('input[type="checkbox"]')?!e.is(":checked"):P.is.blank(e))},blank:function(t){return""===e.trim(t.val())},valid:function(t){var n=!0;return t?(P.verbose("Checking if field is valid",t),P.validate.field(b[t],t,!1)):(P.verbose("Checking if form is valid"),e.each(b,function(e,t){P.is.valid(e)||(n=!1)}),n)}},removeEvents:function(){E.off(A),m.off(A),h.off(A),m.off(A)},event:{field:{keydown:function(t){var n=e(this),i=t.which,o=n.is(x.input),a=n.is(x.checkbox),r=n.closest(x.uiDropdown).length>0,s=13;i==27&&(P.verbose("Escape key pressed blurring field"),n.blur()),t.ctrlKey||i!=s||!o||r||a||(D||(n.one("keyup"+A,P.event.field.keyup),P.submit(),P.debug("Enter pressed on input submitting form")),D=!0)},keyup:function(){D=!1},blur:function(t){var n=e(this),i=n.closest(g),o=P.get.validation(n);i.hasClass(C.error)?(P.debug("Revalidating field",n,o),o&&P.validate.field(o)):"blur"==v.on&&o&&P.validate.field(o)},change:function(t){var n=e(this),i=n.closest(g),o=P.get.validation(n);o&&("change"==v.on||i.hasClass(C.error)&&v.revalidate)&&(clearTimeout(P.timer),P.timer=setTimeout(function(){P.debug("Revalidating field",n,P.get.validation(n)),P.validate.field(o)},v.delay))}}},get:{ancillaryValue:function(e){return!(!e.type||!e.value&&!P.is.bracketedRule(e))&&(e.value!==i?e.value:e.type.match(v.regExp.bracket)[1]+"")},ruleName:function(e){return P.is.bracketedRule(e)?e.type.replace(e.type.match(v.regExp.bracket)[0],""):e.type},changeEvent:function(e,t){return"checkbox"==e||"radio"==e||"hidden"==e||t.is("select")?"change":P.get.inputEvent()},inputEvent:function(){return n.createElement("input").oninput!==i?"input":n.createElement("input").onpropertychange!==i?"propertychange":"keyup"},fieldsFromShorthand:function(t){var n={};return e.each(t,function(t,i){"string"==typeof i&&(i=[i]),n[t]={rules:[]},e.each(i,function(e,i){n[t].rules.push({type:i})})}),n},prompt:function(t,n){var i,o,a=P.get.ruleName(t),r=P.get.ancillaryValue(t),s=P.get.field(n.identifier),l=s.val(),c=e.isFunction(t.prompt)?t.prompt(l):t.prompt||v.prompt[a]||v.text.unspecifiedRule,u=-1!==c.search("{value}"),d=-1!==c.search("{name}");return u&&(c=c.replace("{value}",s.val())),d&&(o=1==(i=s.closest(x.group).find("label").eq(0)).length?i.text():s.prop("placeholder")||v.text.unspecifiedField,c=c.replace("{name}",o)),c=(c=c.replace("{identifier}",n.identifier)).replace("{ruleValue}",r),t.prompt||P.verbose("Using default validation prompt for type",c,a),c},settings:function(){if(e.isPlainObject(t)){var n=Object.keys(t);n.length>0&&(t[n[0]].identifier!==i&&t[n[0]].rules!==i)?(v=e.extend(!0,{},e.fn.form.settings,u),b=e.extend({},e.fn.form.settings.defaults,t),P.error(v.error.oldSyntax,F),P.verbose("Extending settings from legacy parameters",b,v)):(t.fields&&P.is.shorthandFields(t.fields)&&(t.fields=P.get.fieldsFromShorthand(t.fields)),v=e.extend(!0,{},e.fn.form.settings,t),b=e.extend({},e.fn.form.settings.defaults,v.fields),P.verbose("Extending settings",b,v))}else v=e.fn.form.settings,b=e.fn.form.settings.defaults,P.verbose("Using default form validation",b,v);k=v.namespace,y=v.metadata,x=v.selector,C=v.className,w=v.regExp,S=v.error,T="module-"+k,A="."+k,R=E.data(T),P.refresh()},field:function(t){return P.verbose("Finding field with identifier",t),t=P.escape.string(t),m.filter("#"+t).length>0?m.filter("#"+t):m.filter('[name="'+t+'"]').length>0?m.filter('[name="'+t+'"]'):m.filter('[name="'+t+'[]"]').length>0?m.filter('[name="'+t+'[]"]'):m.filter("[data-"+y.validate+'="'+t+'"]').length>0?m.filter("[data-"+y.validate+'="'+t+'"]'):e("<input/>")},fields:function(t){var n=e();return e.each(t,function(e,t){n=n.add(P.get.field(t))}),n},validation:function(t){var n,i;return!!b&&(e.each(b,function(e,o){i=o.identifier||e,P.get.field(i)[0]==t[0]&&(o.identifier=i,n=o)}),n||!1)},value:function(e){var t=[];return t.push(e),P.get.values.call(F,t)[e]},values:function(t){var n={};return(e.isArray(t)?P.get.fields(t):m).each(function(t,o){var a=e(o),r=(a.prop("type"),a.prop("name")),s=a.val(),l=a.is(x.checkbox),c=a.is(x.radio),u=-1!==r.indexOf("[]"),d=!!l&&a.is(":checked");r&&(u?(r=r.replace("[]",""),n[r]||(n[r]=[]),l?d?n[r].push(s||!0):n[r].push(!1):n[r].push(s)):c?n[r]!==i&&0!=n[r]||(n[r]=!!d&&(s||!0)):n[r]=l?!!d&&(s||!0):s)}),n}},has:{field:function(e){return P.verbose("Checking for existence of a field with identifier",e),"string"!=typeof(e=P.escape.string(e))&&P.error(S.identifier,e),m.filter("#"+e).length>0||(m.filter('[name="'+e+'"]').length>0||m.filter("[data-"+y.validate+'="'+e+'"]').length>0)}},escape:{string:function(e){return(e=String(e)).replace(w.escape,"\\$&")}},add:{rule:function(e,t){P.add.field(e,t)},field:function(t,n){var i={};P.is.shorthandRules(n)?(n=e.isArray(n)?n:[n],i[t]={rules:[]},e.each(n,function(e,n){i[t].rules.push({type:n})})):i[t]=n,b=e.extend({},b,i),P.debug("Adding rules",i,b)},fields:function(t){var n;n=t&&P.is.shorthandFields(t)?P.get.fieldsFromShorthand(t):t,b=e.extend({},b,n)},prompt:function(t,n){var o=P.get.field(t).closest(g),a=o.children(x.prompt),r=0!==a.length;n="string"==typeof n?[n]:n,P.verbose("Adding field error state",t),o.addClass(C.error),v.inline&&(r||(a=v.templates.prompt(n)).appendTo(o),a.html(n[0]),r?P.verbose("Inline errors are disabled, no inline error added",t):v.transition&&e.fn.transition!==i&&E.transition("is supported")?(P.verbose("Displaying error with css transition",v.transition),a.transition(v.transition+" in",v.duration)):(P.verbose("Displaying error with fallback javascript animation"),a.fadeIn(v.duration)))},errors:function(e){P.debug("Adding form error messages",e),P.set.error(),p.html(v.templates.error(e))}},remove:{rule:function(t,n){var o=e.isArray(n)?n:[n];if(n==i)return P.debug("Removed all rules"),void(b[t].rules=[]);b[t]!=i&&e.isArray(b[t].rules)&&e.each(b[t].rules,function(e,n){-1!==o.indexOf(n.type)&&(P.debug("Removed rule",n.type),b[t].rules.splice(e,1))})},field:function(t){var n=e.isArray(t)?t:[t];e.each(n,function(e,t){P.remove.rule(t)})},rules:function(t,n){e.isArray(t)?e.each(fields,function(e,t){P.remove.rule(t,n)}):P.remove.rule(t,n)},fields:function(e){P.remove.field(e)},prompt:function(t){var n=P.get.field(t).closest(g),o=n.children(x.prompt);n.removeClass(C.error),v.inline&&o.is(":visible")&&(P.verbose("Removing prompt for field",t),v.transition&&e.fn.transition!==i&&E.transition("is supported")?o.transition(v.transition+" out",v.duration,function(){o.remove()}):o.fadeOut(v.duration,function(){o.remove()}))}},set:{success:function(){E.removeClass(C.error).addClass(C.success)},defaults:function(){m.each(function(){var t=e(this),n=t.filter(x.checkbox).length>0?t.is(":checked"):t.val();t.data(y.defaultValue,n)})},error:function(){E.removeClass(C.success).addClass(C.error)},value:function(e,t){var n={};return n[e]=t,P.set.values.call(F,n)},values:function(t){e.isEmptyObject(t)||e.each(t,function(t,n){var i,o=P.get.field(t),a=o.parent(),r=e.isArray(n),s=a.is(x.uiCheckbox),l=a.is(x.uiDropdown),c=o.is(x.radio)&&s;o.length>0&&(r&&s?(P.verbose("Selecting multiple",n,o),a.checkbox("uncheck"),e.each(n,function(e,t){i=o.filter('[value="'+t+'"]'),a=i.parent(),i.length>0&&a.checkbox("check")})):c?(P.verbose("Selecting radio value",n,o),o.filter('[value="'+n+'"]').parent(x.uiCheckbox).checkbox("check")):s?(P.verbose("Setting checkbox value",n,a),!0===n?a.checkbox("check"):a.checkbox("uncheck")):l?(P.verbose("Setting dropdown value",n,a),a.dropdown("set selected",n)):(P.verbose("Setting field value",n,o),o.val(n)))})}},validate:{form:function(e,t){var n=P.get.values();if(D)return!1;if(O=[],P.determine.isValid()){if(P.debug("Form has no validation errors, submitting"),P.set.success(),!0!==t)return v.onSuccess.call(F,e,n)}else if(P.debug("Form has errors"),P.set.error(),v.inline||P.add.errors(O),E.data("moduleApi")!==i&&e.stopImmediatePropagation(),!0!==t)return v.onFailure.call(F,O,n)},field:function(t,n,o){o=o===i||o,"string"==typeof t&&(P.verbose("Validating field",t),n=t,t=b[t]);var a=t.identifier||n,r=P.get.field(a),s=!!t.depends&&P.get.field(t.depends),l=!0,c=[];return t.identifier||(P.debug("Using field name as identifier",a),t.identifier=a),r.prop("disabled")?(P.debug("Field is disabled. Skipping",a),l=!0):t.optional&&P.is.blank(r)?(P.debug("Field is optional and blank. Skipping",a),l=!0):t.depends&&P.is.empty(s)?(P.debug("Field depends on another value that is not present or empty. Skipping",s),l=!0):t.rules!==i&&e.each(t.rules,function(e,n){P.has.field(a)&&!P.validate.rule(t,n)&&(P.debug("Field is invalid",a,n.type),c.push(P.get.prompt(n,t)),l=!1)}),l?(o&&(P.remove.prompt(a,c),v.onValid.call(r)),!0):(o&&(O=O.concat(c),P.add.prompt(a,c),v.onInvalid.call(r,c)),!1)},rule:function(t,n){var o=P.get.field(t.identifier),a=(n.type,o.val()),r=P.get.ancillaryValue(n),s=P.get.ruleName(n),l=v.rules[s];if(e.isFunction(l))return a=a===i||""===a||null===a?"":e.trim(a+""),l.call(o,a,r);P.error(S.noRule,s)}},setting:function(t,n){if(e.isPlainObject(t))e.extend(!0,v,t);else{if(n===i)return v[t];v[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,P,t);else{if(n===i)return P[t];P[t]=n}},debug:function(){!v.silent&&v.debug&&(v.performance?P.performance.log(arguments):(P.debug=Function.prototype.bind.call(console.info,console,v.name+":"),P.debug.apply(console,arguments)))},verbose:function(){!v.silent&&v.verbose&&v.debug&&(v.performance?P.performance.log(arguments):(P.verbose=Function.prototype.bind.call(console.info,console,v.name+":"),P.verbose.apply(console,arguments)))},error:function(){v.silent||(P.error=Function.prototype.bind.call(console.error,console,v.name+":"),P.error.apply(console,arguments))},performance:{log:function(e){var t,n;v.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:F,"Execution Time":n})),clearTimeout(P.performance.timer),P.performance.timer=setTimeout(P.performance.display,500)},display:function(){var t=v.name+":",n=0;s=!1,clearTimeout(P.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",r&&(t+=" '"+r+"'"),a.length>1&&(t+=" ("+a.length+")"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,a){var r,s,l,c=R;return n=n||f,a=F||a,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(a,n):s!==i&&(l=s),e.isArray(o)?o.push(l):o!==i?o=[o,l]:l!==i&&(o=l),s}}).initialize()}),o!==i?o:this},e.fn.form.settings={name:"Form",namespace:"form",debug:!1,verbose:!1,performance:!0,fields:!1,keyboardShortcuts:!0,on:"submit",inline:!1,delay:200,revalidate:!0,transition:"scale",duration:200,onValid:function(){},onInvalid:function(){},onSuccess:function(){return!0},onFailure:function(){return!1},metadata:{defaultValue:"default",validate:"validate"},regExp:{htmlID:/^[a-zA-Z][\w:.-]*$/g,bracket:/\[(.*)\]/i,decimal:/^\d+\.?\d*$/,email:/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,escape:/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,flags:/^\/(.*)\/(.*)?/,integer:/^\-?\d+$/,number:/^\-?\d*(\.\d+)?$/,url:/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/i},text:{unspecifiedRule:"Please enter a valid value",unspecifiedField:"This field"},prompt:{empty:"{name} must have a value",checked:"{name} must be checked",email:"{name} must be a valid e-mail",url:"{name} must be a valid url",regExp:"{name} is not formatted correctly",integer:"{name} must be an integer",decimal:"{name} must be a decimal number",number:"{name} must be set to a number",is:'{name} must be "{ruleValue}"',isExactly:'{name} must be exactly "{ruleValue}"',not:'{name} cannot be set to "{ruleValue}"',notExactly:'{name} cannot be set to exactly "{ruleValue}"',contain:'{name} must contain "{ruleValue}"',containExactly:'{name} must contain exactly "{ruleValue}"',doesntContain:'{name} cannot contain  "{ruleValue}"',doesntContainExactly:'{name} cannot contain exactly "{ruleValue}"',minLength:"{name} must be at least {ruleValue} characters",length:"{name} must be at least {ruleValue} characters",exactLength:"{name} must be exactly {ruleValue} characters",maxLength:"{name} cannot be longer than {ruleValue} characters",match:"{name} must match {ruleValue} field",different:"{name} must have a different value than {ruleValue} field",creditCard:"{name} must be a valid credit card number",minCount:"{name} must have at least {ruleValue} choices",exactCount:"{name} must have exactly {ruleValue} choices",maxCount:"{name} must have {ruleValue} or less choices"},selector:{checkbox:'input[type="checkbox"], input[type="radio"]',clear:".clear",field:"input, textarea, select",group:".field",input:"input",message:".error.message",prompt:".prompt.label",radio:'input[type="radio"]',reset:'.reset:not([type="reset"])',submit:'.submit:not([type="submit"])',uiCheckbox:".ui.checkbox",uiDropdown:".ui.dropdown"},className:{error:"error",label:"ui prompt label",pressed:"down",success:"success"},error:{identifier:"You must specify a string identifier for each field",method:"The method you called is not defined.",noRule:"There is no rule matching the one you specified",oldSyntax:"Starting in 2.0 forms now only take a single settings object. Validation settings converted to new syntax automatically."},templates:{error:function(t){var n='<ul class="list">';return e.each(t,function(e,t){n+="<li>"+t+"</li>"}),e(n+="</ul>")},prompt:function(t){return e("<div/>").addClass("ui basic red pointing prompt label").html(t[0])}},rules:{empty:function(t){return!(t===i||""===t||e.isArray(t)&&0===t.length)},checked:function(){return e(this).filter(":checked").length>0},email:function(t){return e.fn.form.settings.regExp.email.test(t)},url:function(t){return e.fn.form.settings.regExp.url.test(t)},regExp:function(t,n){if(n instanceof RegExp)return t.match(n);var i,o=n.match(e.fn.form.settings.regExp.flags);return o&&(n=o.length>=2?o[1]:n,i=o.length>=3?o[2]:""),t.match(new RegExp(n,i))},integer:function(t,n){var o,a,r,s=e.fn.form.settings.regExp.integer;return n&&-1===["",".."].indexOf(n)&&(-1==n.indexOf("..")?s.test(n)&&(o=a=n-0):(r=n.split("..",2),s.test(r[0])&&(o=r[0]-0),s.test(r[1])&&(a=r[1]-0))),s.test(t)&&(o===i||t>=o)&&(a===i||t<=a)},decimal:function(t){return e.fn.form.settings.regExp.decimal.test(t)},number:function(t){return e.fn.form.settings.regExp.number.test(t)},is:function(e,t){return t="string"==typeof t?t.toLowerCase():t,(e="string"==typeof e?e.toLowerCase():e)==t},isExactly:function(e,t){return e==t},not:function(e,t){return(e="string"==typeof e?e.toLowerCase():e)!=(t="string"==typeof t?t.toLowerCase():t)},notExactly:function(e,t){return e!=t},contains:function(t,n){return n=n.replace(e.fn.form.settings.regExp.escape,"\\$&"),-1!==t.search(new RegExp(n,"i"))},containsExactly:function(t,n){return n=n.replace(e.fn.form.settings.regExp.escape,"\\$&"),-1!==t.search(new RegExp(n))},doesntContain:function(t,n){return n=n.replace(e.fn.form.settings.regExp.escape,"\\$&"),-1===t.search(new RegExp(n,"i"))},doesntContainExactly:function(t,n){return n=n.replace(e.fn.form.settings.regExp.escape,"\\$&"),-1===t.search(new RegExp(n))},minLength:function(e,t){return e!==i&&e.length>=t},length:function(e,t){return e!==i&&e.length>=t},exactLength:function(e,t){return e!==i&&e.length==t},maxLength:function(e,t){return e!==i&&e.length<=t},match:function(t,n){var o;e(this);return e('[data-validate="'+n+'"]').length>0?o=e('[data-validate="'+n+'"]').val():e("#"+n).length>0?o=e("#"+n).val():e('[name="'+n+'"]').length>0?o=e('[name="'+n+'"]').val():e('[name="'+n+'[]"]').length>0&&(o=e('[name="'+n+'[]"]')),o!==i&&t.toString()==o.toString()},different:function(t,n){var o;e(this);return e('[data-validate="'+n+'"]').length>0?o=e('[data-validate="'+n+'"]').val():e("#"+n).length>0?o=e("#"+n).val():e('[name="'+n+'"]').length>0?o=e('[name="'+n+'"]').val():e('[name="'+n+'[]"]').length>0&&(o=e('[name="'+n+'[]"]')),o!==i&&t.toString()!==o.toString()},creditCard:function(t,n){var i,o,a={visa:{pattern:/^4/,length:[16]},amex:{pattern:/^3[47]/,length:[15]},mastercard:{pattern:/^5[1-5]/,length:[16]},discover:{pattern:/^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,length:[16]},unionPay:{pattern:/^(62|88)/,length:[16,17,18,19]},jcb:{pattern:/^35(2[89]|[3-8][0-9])/,length:[16]},maestro:{pattern:/^(5018|5020|5038|6304|6759|676[1-3])/,length:[12,13,14,15,16,17,18,19]},dinersClub:{pattern:/^(30[0-5]|^36)/,length:[14]},laser:{pattern:/^(6304|670[69]|6771)/,length:[16,17,18,19]},visaElectron:{pattern:/^(4026|417500|4508|4844|491(3|7))/,length:[16]}},r={},s=!1,l="string"==typeof n&&n.split(",");if("string"==typeof t&&0!==t.length){if(t=t.replace(/[\-]/g,""),l&&(e.each(l,function(n,i){(o=a[i])&&(r={length:-1!==e.inArray(t.length,o.length),pattern:-1!==t.search(o.pattern)}).length&&r.pattern&&(s=!0)}),!s))return!1;if((i={number:-1!==e.inArray(t.length,a.unionPay.length),pattern:-1!==t.search(a.unionPay.pattern)}).number&&i.pattern)return!0;for(var c=t.length,u=0,d=[[0,1,2,3,4,5,6,7,8,9],[0,2,4,6,8,1,3,5,7,9]],f=0;c--;)f+=d[u][parseInt(t.charAt(c),10)],u^=1;return f%10==0&&f>0}},minCount:function(e,t){return 0==t||(1==t?""!==e:e.split(",").length>=t)},exactCount:function(e,t){return 0==t?""===e:1==t?""!==e&&-1===e.search(","):e.split(",").length==t},maxCount:function(e,t){return 0!=t&&(1==t?-1===e.search(","):e.split(",").length<=t)}}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.accordion=function(n){var o,a=e(this),r=(new Date).getTime(),s=[],l=arguments[0],c="string"==typeof l,u=[].slice.call(arguments,1);t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame;return a.each(function(){var d,f,m=e.isPlainObject(n)?e.extend(!0,{},e.fn.accordion.settings,n):e.extend({},e.fn.accordion.settings),g=m.className,p=m.namespace,h=m.selector,v=m.error,b="."+p,y="module-"+p,x=a.selector||"",C=e(this),w=C.find(h.title),S=C.find(h.content),k=this,T=C.data(y);f={initialize:function(){f.debug("Initializing",C),f.bind.events(),m.observeChanges&&f.observeChanges(),f.instantiate()},instantiate:function(){T=f,C.data(y,f)},destroy:function(){f.debug("Destroying previous instance",C),C.off(b).removeData(y)},refresh:function(){w=C.find(h.title),S=C.find(h.content)},observeChanges:function(){"MutationObserver"in t&&((d=new MutationObserver(function(e){f.debug("DOM tree modified, updating selector cache"),f.refresh()})).observe(k,{childList:!0,subtree:!0}),f.debug("Setting up mutation observer",d))},bind:{events:function(){f.debug("Binding delegated events"),C.on(m.on+b,h.trigger,f.event.click)}},event:{click:function(){f.toggle.call(this)}},toggle:function(t){var n=t!==i?"number"==typeof t?w.eq(t):e(t).closest(h.title):e(this).closest(h.title),o=n.next(S),a=o.hasClass(g.animating),r=o.hasClass(g.active),s=r&&!a,l=!r&&a;f.debug("Toggling visibility of content",n),s||l?m.collapsible?f.close.call(n):f.debug("Cannot close accordion content collapsing is disabled"):f.open.call(n)},open:function(t){var n=t!==i?"number"==typeof t?w.eq(t):e(t).closest(h.title):e(this).closest(h.title),o=n.next(S),a=o.hasClass(g.animating);o.hasClass(g.active)||a?f.debug("Accordion already open, skipping",o):(f.debug("Opening accordion content",n),m.onOpening.call(o),m.onChanging.call(o),m.exclusive&&f.closeOthers.call(n),n.addClass(g.active),o.stop(!0,!0).addClass(g.animating),m.animateChildren&&(e.fn.transition!==i&&C.transition("is supported")?o.children().transition({animation:"fade in",queue:!1,useFailSafe:!0,debug:m.debug,verbose:m.verbose,duration:m.duration}):o.children().stop(!0,!0).animate({opacity:1},m.duration,f.resetOpacity)),o.slideDown(m.duration,m.easing,function(){o.removeClass(g.animating).addClass(g.active),f.reset.display.call(this),m.onOpen.call(this),m.onChange.call(this)}))},close:function(t){var n=t!==i?"number"==typeof t?w.eq(t):e(t).closest(h.title):e(this).closest(h.title),o=n.next(S),a=o.hasClass(g.animating),r=o.hasClass(g.active);!r&&!(!r&&a)||r&&a||(f.debug("Closing accordion content",o),m.onClosing.call(o),m.onChanging.call(o),n.removeClass(g.active),o.stop(!0,!0).addClass(g.animating),m.animateChildren&&(e.fn.transition!==i&&C.transition("is supported")?o.children().transition({animation:"fade out",queue:!1,useFailSafe:!0,debug:m.debug,verbose:m.verbose,duration:m.duration}):o.children().stop(!0,!0).animate({opacity:0},m.duration,f.resetOpacity)),o.slideUp(m.duration,m.easing,function(){o.removeClass(g.animating).removeClass(g.active),f.reset.display.call(this),m.onClose.call(this),m.onChange.call(this)}))},closeOthers:function(t){var n,o,a,r=t!==i?w.eq(t):e(this).closest(h.title),s=r.parents(h.content).prev(h.title),l=r.closest(h.accordion),c=h.title+"."+g.active+":visible",u=h.content+"."+g.active+":visible";m.closeNested?a=(n=l.find(c).not(s)).next(S):(n=l.find(c).not(s),o=l.find(u).find(c).not(s),a=(n=n.not(o)).next(S)),n.length>0&&(f.debug("Exclusive enabled, closing other content",n),n.removeClass(g.active),a.removeClass(g.animating).stop(!0,!0),m.animateChildren&&(e.fn.transition!==i&&C.transition("is supported")?a.children().transition({animation:"fade out",useFailSafe:!0,debug:m.debug,verbose:m.verbose,duration:m.duration}):a.children().stop(!0,!0).animate({opacity:0},m.duration,f.resetOpacity)),a.slideUp(m.duration,m.easing,function(){e(this).removeClass(g.active),f.reset.display.call(this)}))},reset:{display:function(){f.verbose("Removing inline display from element",this),e(this).css("display",""),""===e(this).attr("style")&&e(this).attr("style","").removeAttr("style")},opacity:function(){f.verbose("Removing inline opacity from element",this),e(this).css("opacity",""),""===e(this).attr("style")&&e(this).attr("style","").removeAttr("style")}},setting:function(t,n){if(f.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,m,t);else{if(n===i)return m[t];e.isPlainObject(m[t])?e.extend(!0,m[t],n):m[t]=n}},internal:function(t,n){if(f.debug("Changing internal",t,n),n===i)return f[t];e.isPlainObject(t)?e.extend(!0,f,t):f[t]=n},debug:function(){!m.silent&&m.debug&&(m.performance?f.performance.log(arguments):(f.debug=Function.prototype.bind.call(console.info,console,m.name+":"),f.debug.apply(console,arguments)))},verbose:function(){!m.silent&&m.verbose&&m.debug&&(m.performance?f.performance.log(arguments):(f.verbose=Function.prototype.bind.call(console.info,console,m.name+":"),f.verbose.apply(console,arguments)))},error:function(){m.silent||(f.error=Function.prototype.bind.call(console.error,console,m.name+":"),f.error.apply(console,arguments))},performance:{log:function(e){var t,n;m.performance&&(n=(t=(new Date).getTime())-(r||t),r=t,s.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:k,"Execution Time":n})),clearTimeout(f.performance.timer),f.performance.timer=setTimeout(f.performance.display,500)},display:function(){var t=m.name+":",n=0;r=!1,clearTimeout(f.performance.timer),e.each(s,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",x&&(t+=" '"+x+"'"),(console.group!==i||console.table!==i)&&s.length>0&&(console.groupCollapsed(t),console.table?console.table(s):e.each(s,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),s=[]}},invoke:function(t,n,a){var r,s,l,c=T;return n=n||u,a=k||a,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(f.error(v.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(a,n):s!==i&&(l=s),e.isArray(o)?o.push(l):o!==i?o=[o,l]:l!==i&&(o=l),s}},c?(T===i&&f.initialize(),f.invoke(l)):(T!==i&&T.invoke("destroy"),f.initialize())}),o!==i?o:this},e.fn.accordion.settings={name:"Accordion",namespace:"accordion",silent:!1,debug:!1,verbose:!1,performance:!0,on:"click",observeChanges:!0,exclusive:!0,collapsible:!0,closeNested:!1,animateChildren:!0,duration:350,easing:"easeOutQuad",onOpening:function(){},onClosing:function(){},onChanging:function(){},onOpen:function(){},onClose:function(){},onChange:function(){},error:{method:"The method you called is not defined"},className:{active:"active",animating:"animating"},selector:{accordion:".accordion",title:".title",trigger:".title",content:".content"}},e.extend(e.easing,{easeOutQuad:function(e,t,n,i,o){return-i*(t/=o)*(t-2)+n}})}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.checkbox=function(o){var a,r=e(this),s=r.selector||"",l=(new Date).getTime(),c=[],u=arguments[0],d="string"==typeof u,f=[].slice.call(arguments,1);return r.each(function(){var r,m,g=e.extend(!0,{},e.fn.checkbox.settings,o),p=g.className,h=g.namespace,v=g.selector,b=g.error,y="."+h,x="module-"+h,C=e(this),w=e(this).children(v.label),S=e(this).children(v.input),k=S[0],T=!1,A=!1,R=C.data(x),P=this;m={initialize:function(){m.verbose("Initializing checkbox",g),m.create.label(),m.bind.events(),m.set.tabbable(),m.hide.input(),m.observeChanges(),m.instantiate(),m.setup()},instantiate:function(){m.verbose("Storing instance of module",m),R=m,C.data(x,m)},destroy:function(){m.verbose("Destroying module"),m.unbind.events(),m.show.input(),C.removeData(x)},fix:{reference:function(){C.is(v.input)&&(m.debug("Behavior called on <input> adjusting invoked element"),C=C.closest(v.checkbox),m.refresh())}},setup:function(){m.set.initialLoad(),m.is.indeterminate()?(m.debug("Initial value is indeterminate"),m.indeterminate()):m.is.checked()?(m.debug("Initial value is checked"),m.check()):(m.debug("Initial value is unchecked"),m.uncheck()),m.remove.initialLoad()},refresh:function(){w=C.children(v.label),S=C.children(v.input),k=S[0]},hide:{input:function(){m.verbose("Modifying <input> z-index to be unselectable"),S.addClass(p.hidden)}},show:{input:function(){m.verbose("Modifying <input> z-index to be selectable"),S.removeClass(p.hidden)}},observeChanges:function(){"MutationObserver"in t&&((r=new MutationObserver(function(e){m.debug("DOM tree modified, updating selector cache"),m.refresh()})).observe(P,{childList:!0,subtree:!0}),m.debug("Setting up mutation observer",r))},attachEvents:function(t,n){var i=e(t);n=e.isFunction(m[n])?m[n]:m.toggle,i.length>0?(m.debug("Attaching checkbox events to element",t,n),i.on("click"+y,n)):m.error(b.notFound)},event:{click:function(t){var n=e(t.target);n.is(v.input)?m.verbose("Using default check action on initialized checkbox"):n.is(v.link)?m.debug("Clicking link inside checkbox, skipping toggle"):(m.toggle(),S.focus(),t.preventDefault())},keydown:function(e){var t=e.which,n=13,i=32;t==27?(m.verbose("Escape key pressed blurring field"),S.blur(),A=!0):e.ctrlKey||t!=i&&t!=n?A=!1:(m.verbose("Enter/space key pressed, toggling checkbox"),m.toggle(),A=!0)},keyup:function(e){A&&e.preventDefault()}},check:function(){m.should.allowCheck()&&(m.debug("Checking checkbox",S),m.set.checked(),m.should.ignoreCallbacks()||(g.onChecked.call(k),g.onChange.call(k)))},uncheck:function(){m.should.allowUncheck()&&(m.debug("Unchecking checkbox"),m.set.unchecked(),m.should.ignoreCallbacks()||(g.onUnchecked.call(k),g.onChange.call(k)))},indeterminate:function(){m.should.allowIndeterminate()?m.debug("Checkbox is already indeterminate"):(m.debug("Making checkbox indeterminate"),m.set.indeterminate(),m.should.ignoreCallbacks()||(g.onIndeterminate.call(k),g.onChange.call(k)))},determinate:function(){m.should.allowDeterminate()?m.debug("Checkbox is already determinate"):(m.debug("Making checkbox determinate"),m.set.determinate(),m.should.ignoreCallbacks()||(g.onDeterminate.call(k),g.onChange.call(k)))},enable:function(){m.is.enabled()?m.debug("Checkbox is already enabled"):(m.debug("Enabling checkbox"),m.set.enabled(),g.onEnable.call(k),g.onEnabled.call(k))},disable:function(){m.is.disabled()?m.debug("Checkbox is already disabled"):(m.debug("Disabling checkbox"),m.set.disabled(),g.onDisable.call(k),g.onDisabled.call(k))},get:{radios:function(){var t=m.get.name();return e('input[name="'+t+'"]').closest(v.checkbox)},otherRadios:function(){return m.get.radios().not(C)},name:function(){return S.attr("name")}},is:{initialLoad:function(){return T},radio:function(){return S.hasClass(p.radio)||"radio"==S.attr("type")},indeterminate:function(){return S.prop("indeterminate")!==i&&S.prop("indeterminate")},checked:function(){return S.prop("checked")!==i&&S.prop("checked")},disabled:function(){return S.prop("disabled")!==i&&S.prop("disabled")},enabled:function(){return!m.is.disabled()},determinate:function(){return!m.is.indeterminate()},unchecked:function(){return!m.is.checked()}},should:{allowCheck:function(){return m.is.determinate()&&m.is.checked()&&!m.should.forceCallbacks()?(m.debug("Should not allow check, checkbox is already checked"),!1):!1!==g.beforeChecked.apply(k)||(m.debug("Should not allow check, beforeChecked cancelled"),!1)},allowUncheck:function(){return m.is.determinate()&&m.is.unchecked()&&!m.should.forceCallbacks()?(m.debug("Should not allow uncheck, checkbox is already unchecked"),!1):!1!==g.beforeUnchecked.apply(k)||(m.debug("Should not allow uncheck, beforeUnchecked cancelled"),!1)},allowIndeterminate:function(){return m.is.indeterminate()&&!m.should.forceCallbacks()?(m.debug("Should not allow indeterminate, checkbox is already indeterminate"),!1):!1!==g.beforeIndeterminate.apply(k)||(m.debug("Should not allow indeterminate, beforeIndeterminate cancelled"),!1)},allowDeterminate:function(){return m.is.determinate()&&!m.should.forceCallbacks()?(m.debug("Should not allow determinate, checkbox is already determinate"),!1):!1!==g.beforeDeterminate.apply(k)||(m.debug("Should not allow determinate, beforeDeterminate cancelled"),!1)},forceCallbacks:function(){return m.is.initialLoad()&&g.fireOnInit},ignoreCallbacks:function(){return T&&!g.fireOnInit}},can:{change:function(){return!(C.hasClass(p.disabled)||C.hasClass(p.readOnly)||S.prop("disabled")||S.prop("readonly"))},uncheck:function(){return"boolean"==typeof g.uncheckable?g.uncheckable:!m.is.radio()}},set:{initialLoad:function(){T=!0},checked:function(){m.verbose("Setting class to checked"),C.removeClass(p.indeterminate).addClass(p.checked),m.is.radio()&&m.uncheckOthers(),m.is.indeterminate()||!m.is.checked()?(m.verbose("Setting state to checked",k),S.prop("indeterminate",!1).prop("checked",!0),m.trigger.change()):m.debug("Input is already checked, skipping input property change")},unchecked:function(){m.verbose("Removing checked class"),C.removeClass(p.indeterminate).removeClass(p.checked),m.is.indeterminate()||!m.is.unchecked()?(m.debug("Setting state to unchecked"),S.prop("indeterminate",!1).prop("checked",!1),m.trigger.change()):m.debug("Input is already unchecked")},indeterminate:function(){m.verbose("Setting class to indeterminate"),C.addClass(p.indeterminate),m.is.indeterminate()?m.debug("Input is already indeterminate, skipping input property change"):(m.debug("Setting state to indeterminate"),S.prop("indeterminate",!0),m.trigger.change())},determinate:function(){m.verbose("Removing indeterminate class"),C.removeClass(p.indeterminate),m.is.determinate()?m.debug("Input is already determinate, skipping input property change"):(m.debug("Setting state to determinate"),S.prop("indeterminate",!1))},disabled:function(){m.verbose("Setting class to disabled"),C.addClass(p.disabled),m.is.disabled()?m.debug("Input is already disabled, skipping input property change"):(m.debug("Setting state to disabled"),S.prop("disabled","disabled"),m.trigger.change())},enabled:function(){m.verbose("Removing disabled class"),C.removeClass(p.disabled),m.is.enabled()?m.debug("Input is already enabled, skipping input property change"):(m.debug("Setting state to enabled"),S.prop("disabled",!1),m.trigger.change())},tabbable:function(){m.verbose("Adding tabindex to checkbox"),S.attr("tabindex")===i&&S.attr("tabindex",0)}},remove:{initialLoad:function(){T=!1}},trigger:{change:function(){var e=n.createEvent("HTMLEvents"),t=S[0];t&&(m.verbose("Triggering native change event"),e.initEvent("change",!0,!1),t.dispatchEvent(e))}},create:{label:function(){S.prevAll(v.label).length>0?(S.prev(v.label).detach().insertAfter(S),m.debug("Moving existing label",w)):m.has.label()||(w=e("<label>").insertAfter(S),m.debug("Creating label",w))}},has:{label:function(){return w.length>0}},bind:{events:function(){m.verbose("Attaching checkbox events"),C.on("click"+y,m.event.click).on("keydown"+y,v.input,m.event.keydown).on("keyup"+y,v.input,m.event.keyup)}},unbind:{events:function(){m.debug("Removing events"),C.off(y)}},uncheckOthers:function(){var e=m.get.otherRadios();m.debug("Unchecking other radios",e),e.removeClass(p.checked)},toggle:function(){m.can.change()?m.is.indeterminate()||m.is.unchecked()?(m.debug("Currently unchecked"),m.check()):m.is.checked()&&m.can.uncheck()&&(m.debug("Currently checked"),m.uncheck()):m.is.radio()||m.debug("Checkbox is read-only or disabled, ignoring toggle")},setting:function(t,n){if(m.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,g,t);else{if(n===i)return g[t];e.isPlainObject(g[t])?e.extend(!0,g[t],n):g[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,m,t);else{if(n===i)return m[t];m[t]=n}},debug:function(){!g.silent&&g.debug&&(g.performance?m.performance.log(arguments):(m.debug=Function.prototype.bind.call(console.info,console,g.name+":"),m.debug.apply(console,arguments)))},verbose:function(){!g.silent&&g.verbose&&g.debug&&(g.performance?m.performance.log(arguments):(m.verbose=Function.prototype.bind.call(console.info,console,g.name+":"),m.verbose.apply(console,arguments)))},error:function(){g.silent||(m.error=Function.prototype.bind.call(console.error,console,g.name+":"),m.error.apply(console,arguments))},performance:{log:function(e){var t,n;g.performance&&(n=(t=(new Date).getTime())-(l||t),l=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:P,"Execution Time":n})),clearTimeout(m.performance.timer),m.performance.timer=setTimeout(m.performance.display,500)},display:function(){var t=g.name+":",n=0;l=!1,clearTimeout(m.performance.timer),e.each(c,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",s&&(t+=" '"+s+"'"),(console.group!==i||console.table!==i)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,n,o){var r,s,l,c=R;return n=n||f,o=P||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(m.error(b.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},d?(R===i&&m.initialize(),m.invoke(u)):(R!==i&&R.invoke("destroy"),m.initialize())}),a!==i?a:this},e.fn.checkbox.settings={name:"Checkbox",namespace:"checkbox",silent:!1,debug:!1,verbose:!0,performance:!0,uncheckable:"auto",fireOnInit:!1,onChange:function(){},beforeChecked:function(){},beforeUnchecked:function(){},beforeDeterminate:function(){},beforeIndeterminate:function(){},onChecked:function(){},onUnchecked:function(){},onDeterminate:function(){},onIndeterminate:function(){},onEnable:function(){},onDisable:function(){},onEnabled:function(){},onDisabled:function(){},className:{checked:"checked",indeterminate:"indeterminate",disabled:"disabled",hidden:"hidden",radio:"radio",readOnly:"read-only"},error:{method:"The method you called is not defined"},selector:{checkbox:".ui.checkbox",label:"label, .box",input:'input[type="checkbox"], input[type="radio"]',link:"a[href]"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.dimmer=function(t){var o,a=e(this),r=(new Date).getTime(),s=[],l=arguments[0],c="string"==typeof l,u=[].slice.call(arguments,1);return a.each(function(){var d,f,m,g=e.isPlainObject(t)?e.extend(!0,{},e.fn.dimmer.settings,t):e.extend({},e.fn.dimmer.settings),p=g.selector,h=g.namespace,v=g.className,b=g.error,y="."+h,x="module-"+h,C=a.selector||"",w="ontouchstart"in n.documentElement?"touchstart":"click",S=e(this),k=this,T=S.data(x);(m={preinitialize:function(){m.is.dimmer()?(f=S.parent(),d=S):(f=S,d=m.has.dimmer()?g.dimmerName?f.find(p.dimmer).filter("."+g.dimmerName):f.find(p.dimmer):m.create(),m.set.variation())},initialize:function(){m.debug("Initializing dimmer",g),m.bind.events(),m.set.dimmable(),m.instantiate()},instantiate:function(){m.verbose("Storing instance of module",m),T=m,S.data(x,T)},destroy:function(){m.verbose("Destroying previous module",d),m.unbind.events(),m.remove.variation(),f.off(y)},bind:{events:function(){"hover"==g.on?f.on("mouseenter"+y,m.show).on("mouseleave"+y,m.hide):"click"==g.on&&f.on(w+y,m.toggle),m.is.page()&&(m.debug("Setting as a page dimmer",f),m.set.pageDimmer()),m.is.closable()&&(m.verbose("Adding dimmer close event",d),f.on(w+y,p.dimmer,m.event.click))}},unbind:{events:function(){S.removeData(x),f.off(y)}},event:{click:function(t){m.verbose("Determining if event occured on dimmer",t),(0===d.find(t.target).length||e(t.target).is(p.content))&&(m.hide(),t.stopImmediatePropagation())}},addContent:function(t){var n=e(t);m.debug("Add content to dimmer",n),n.parent()[0]!==d[0]&&n.detach().appendTo(d)},create:function(){var t=e(g.template.dimmer());return g.dimmerName&&(m.debug("Creating named dimmer",g.dimmerName),t.addClass(g.dimmerName)),t.appendTo(f),t},show:function(t){t=e.isFunction(t)?t:function(){},m.debug("Showing dimmer",d,g),m.is.dimmed()&&!m.is.animating()||!m.is.enabled()?m.debug("Dimmer is already shown or disabled"):(m.animate.show(t),g.onShow.call(k),g.onChange.call(k))},hide:function(t){t=e.isFunction(t)?t:function(){},m.is.dimmed()||m.is.animating()?(m.debug("Hiding dimmer",d),m.animate.hide(t),g.onHide.call(k),g.onChange.call(k)):m.debug("Dimmer is not visible")},toggle:function(){m.verbose("Toggling dimmer visibility",d),m.is.dimmed()?m.hide():m.show()},animate:{show:function(t){t=e.isFunction(t)?t:function(){},g.useCSS&&e.fn.transition!==i&&d.transition("is supported")?("auto"!==g.opacity&&m.set.opacity(),d.transition({displayType:"flex",animation:g.transition+" in",queue:!1,duration:m.get.duration(),useFailSafe:!0,onStart:function(){m.set.dimmed()},onComplete:function(){m.set.active(),t()}})):(m.verbose("Showing dimmer animation with javascript"),m.set.dimmed(),"auto"==g.opacity&&(g.opacity=.8),d.stop().css({opacity:0,width:"100%",height:"100%"}).fadeTo(m.get.duration(),g.opacity,function(){d.removeAttr("style"),m.set.active(),t()}))},hide:function(t){t=e.isFunction(t)?t:function(){},g.useCSS&&e.fn.transition!==i&&d.transition("is supported")?(m.verbose("Hiding dimmer with css"),d.transition({displayType:"flex",animation:g.transition+" out",queue:!1,duration:m.get.duration(),useFailSafe:!0,onStart:function(){m.remove.dimmed()},onComplete:function(){m.remove.active(),t()}})):(m.verbose("Hiding dimmer with javascript"),m.remove.dimmed(),d.stop().fadeOut(m.get.duration(),function(){m.remove.active(),d.removeAttr("style"),t()}))}},get:{dimmer:function(){return d},duration:function(){return"object"==typeof g.duration?m.is.active()?g.duration.hide:g.duration.show:g.duration}},has:{dimmer:function(){return g.dimmerName?S.find(p.dimmer).filter("."+g.dimmerName).length>0:S.find(p.dimmer).length>0}},is:{active:function(){return d.hasClass(v.active)},animating:function(){return d.is(":animated")||d.hasClass(v.animating)},closable:function(){return"auto"==g.closable?"hover"!=g.on:g.closable},dimmer:function(){return S.hasClass(v.dimmer)},dimmable:function(){return S.hasClass(v.dimmable)},dimmed:function(){return f.hasClass(v.dimmed)},disabled:function(){return f.hasClass(v.disabled)},enabled:function(){return!m.is.disabled()},page:function(){return f.is("body")},pageDimmer:function(){return d.hasClass(v.pageDimmer)}},can:{show:function(){return!d.hasClass(v.disabled)}},set:{opacity:function(e){var t=d.css("background-color"),n=t.split(","),i=n&&3==n.length,o=n&&4==n.length;e=0===g.opacity?0:g.opacity||e,i||o?(n[3]=e+")",t=n.join(",")):t="rgba(0, 0, 0, "+e+")",m.debug("Setting opacity to",e),d.css("background-color",t)},active:function(){d.addClass(v.active)},dimmable:function(){f.addClass(v.dimmable)},dimmed:function(){f.addClass(v.dimmed)},pageDimmer:function(){d.addClass(v.pageDimmer)},disabled:function(){d.addClass(v.disabled)},variation:function(e){(e=e||g.variation)&&d.addClass(e)}},remove:{active:function(){d.removeClass(v.active)},dimmed:function(){f.removeClass(v.dimmed)},disabled:function(){d.removeClass(v.disabled)},variation:function(e){(e=e||g.variation)&&d.removeClass(e)}},setting:function(t,n){if(m.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,g,t);else{if(n===i)return g[t];e.isPlainObject(g[t])?e.extend(!0,g[t],n):g[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,m,t);else{if(n===i)return m[t];m[t]=n}},debug:function(){!g.silent&&g.debug&&(g.performance?m.performance.log(arguments):(m.debug=Function.prototype.bind.call(console.info,console,g.name+":"),m.debug.apply(console,arguments)))},verbose:function(){!g.silent&&g.verbose&&g.debug&&(g.performance?m.performance.log(arguments):(m.verbose=Function.prototype.bind.call(console.info,console,g.name+":"),m.verbose.apply(console,arguments)))},error:function(){g.silent||(m.error=Function.prototype.bind.call(console.error,console,g.name+":"),m.error.apply(console,arguments))},performance:{log:function(e){var t,n;g.performance&&(n=(t=(new Date).getTime())-(r||t),r=t,s.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:k,"Execution Time":n})),clearTimeout(m.performance.timer),m.performance.timer=setTimeout(m.performance.display,500)},display:function(){var t=g.name+":",n=0;r=!1,clearTimeout(m.performance.timer),e.each(s,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",C&&(t+=" '"+C+"'"),a.length>1&&(t+=" ("+a.length+")"),(console.group!==i||console.table!==i)&&s.length>0&&(console.groupCollapsed(t),console.table?console.table(s):e.each(s,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),s=[]}},invoke:function(t,n,a){var r,s,l,c=T;return n=n||u,a=k||a,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(m.error(b.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(a,n):s!==i&&(l=s),e.isArray(o)?o.push(l):o!==i?o=[o,l]:l!==i&&(o=l),s}}).preinitialize(),c?(T===i&&m.initialize(),m.invoke(l)):(T!==i&&T.invoke("destroy"),m.initialize())}),o!==i?o:this},e.fn.dimmer.settings={name:"Dimmer",namespace:"dimmer",silent:!1,debug:!1,verbose:!1,performance:!0,dimmerName:!1,variation:!1,closable:"auto",useCSS:!0,transition:"fade",on:!1,opacity:"auto",duration:{show:500,hide:500},onChange:function(){},onShow:function(){},onHide:function(){},error:{method:"The method you called is not defined."},className:{active:"active",animating:"animating",dimmable:"dimmable",dimmed:"dimmed",dimmer:"dimmer",disabled:"disabled",hide:"hide",pageDimmer:"page",show:"show"},selector:{dimmer:"> .ui.dimmer",content:".ui.dimmer > .content, .ui.dimmer > .content > .center"},template:{dimmer:function(){return e("<div />").attr("class","ui dimmer")}}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.dropdown=function(o){var a,r=e(this),s=e(n),l=r.selector||"",c="ontouchstart"in n.documentElement,u=(new Date).getTime(),d=[],f=arguments[0],m="string"==typeof f,g=[].slice.call(arguments,1);return r.each(function(p){var h,v,b,y,x,C,w,S,k=e.isPlainObject(o)?e.extend(!0,{},e.fn.dropdown.settings,o):e.extend({},e.fn.dropdown.settings),T=k.className,A=k.message,R=k.fields,P=k.keys,E=k.metadata,F=k.namespace,O=k.regExp,D=k.selector,q=k.error,j=k.templates,z="."+F,I="module-"+F,M=e(this),L=e(k.context),V=M.find(D.text),N=M.find(D.search),H=M.find(D.sizer),U=M.find(D.input),W=M.find(D.icon),B=M.prev().find(D.text).length>0?M.prev().find(D.text):M.prev(),Q=M.children(D.menu),X=Q.find(D.item),$=!1,Y=!1,Z=!1,K=this,J=M.data(I);S={initialize:function(){S.debug("Initializing dropdown",k),S.is.alreadySetup()?S.setup.reference():(S.setup.layout(),k.values&&S.change.values(k.values),S.refreshData(),S.save.defaults(),S.restore.selected(),S.create.id(),S.bind.events(),S.observeChanges(),S.instantiate())},instantiate:function(){S.verbose("Storing instance of dropdown",S),J=S,M.data(I,S)},destroy:function(){S.verbose("Destroying previous dropdown",M),S.remove.tabbable(),M.off(z).removeData(I),Q.off(z),s.off(y),S.disconnect.menuObserver(),S.disconnect.selectObserver()},observeChanges:function(){"MutationObserver"in t&&(C=new MutationObserver(S.event.select.mutation),w=new MutationObserver(S.event.menu.mutation),S.debug("Setting up mutation observer",C,w),S.observe.select(),S.observe.menu())},disconnect:{menuObserver:function(){w&&w.disconnect()},selectObserver:function(){C&&C.disconnect()}},observe:{select:function(){S.has.input()&&C.observe(M[0],{childList:!0,subtree:!0})},menu:function(){S.has.menu()&&w.observe(Q[0],{childList:!0,subtree:!0})}},create:{id:function(){x=(Math.random().toString(16)+"000000000").substr(2,8),y="."+x,S.verbose("Creating unique id for element",x)},userChoice:function(t){var n,o,a;return!!(t=t||S.get.userValues())&&(t=e.isArray(t)?t:[t],e.each(t,function(t,r){!1===S.get.item(r)&&(a=k.templates.addition(S.add.variables(A.addResult,r)),o=e("<div />").html(a).attr("data-"+E.value,r).attr("data-"+E.text,r).addClass(T.addition).addClass(T.item),k.hideAdditions&&o.addClass(T.hidden),n=n===i?o:n.add(o),S.verbose("Creating user choices for value",r,o))}),n)},userLabels:function(t){var n=S.get.userValues();n&&(S.debug("Adding user labels",n),e.each(n,function(e,t){S.verbose("Adding custom user value"),S.add.label(t,t)}))},menu:function(){Q=e("<div />").addClass(T.menu).appendTo(M)},sizer:function(){H=e("<span />").addClass(T.sizer).insertAfter(N)}},search:function(e){e=e!==i?e:S.get.query(),S.verbose("Searching for query",e),S.has.minCharacters(e)?S.filter(e):S.hide()},select:{firstUnfiltered:function(){S.verbose("Selecting first non-filtered element"),S.remove.selectedItem(),X.not(D.unselectable).not(D.addition+D.hidden).eq(0).addClass(T.selected)},nextAvailable:function(e){var t=(e=e.eq(0)).nextAll(D.item).not(D.unselectable).eq(0),n=e.prevAll(D.item).not(D.unselectable).eq(0);t.length>0?(S.verbose("Moving selection to",t),t.addClass(T.selected)):(S.verbose("Moving selection to",n),n.addClass(T.selected))}},setup:{api:function(){var e={debug:k.debug,urlData:{value:S.get.value(),query:S.get.query()},on:!1};S.verbose("First request, initializing API"),M.api(e)},layout:function(){M.is("select")&&(S.setup.select(),S.setup.returnedObject()),S.has.menu()||S.create.menu(),S.is.search()&&!S.has.search()&&(S.verbose("Adding search input"),N=e("<input />").addClass(T.search).prop("autocomplete","off").insertBefore(V)),S.is.multiple()&&S.is.searchSelection()&&!S.has.sizer()&&S.create.sizer(),k.allowTab&&S.set.tabbable()},select:function(){var t=S.get.selectValues();S.debug("Dropdown initialized on a select",t),M.is("select")&&(U=M),U.parent(D.dropdown).length>0?(S.debug("UI dropdown already exists. Creating dropdown menu only"),M=U.closest(D.dropdown),S.has.menu()||S.create.menu(),Q=M.children(D.menu),S.setup.menu(t)):(S.debug("Creating entire dropdown from select"),M=e("<div />").attr("class",U.attr("class")).addClass(T.selection).addClass(T.dropdown).html(j.dropdown(t)).insertBefore(U),U.hasClass(T.multiple)&&!1===U.prop("multiple")&&(S.error(q.missingMultiple),U.prop("multiple",!0)),U.is("[multiple]")&&S.set.multiple(),U.prop("disabled")&&(S.debug("Disabling dropdown"),M.addClass(T.disabled)),U.removeAttr("class").detach().prependTo(M)),S.refresh()},menu:function(e){Q.html(j.menu(e,R)),X=Q.find(D.item)},reference:function(){S.debug("Dropdown behavior was called on select, replacing with closest dropdown"),M=M.parent(D.dropdown),J=M.data(I),K=M.get(0),S.refresh(),S.setup.returnedObject()},returnedObject:function(){var e=r.slice(0,p),t=r.slice(p+1);r=e.add(M).add(t)}},refresh:function(){S.refreshSelectors(),S.refreshData()},refreshItems:function(){X=Q.find(D.item)},refreshSelectors:function(){S.verbose("Refreshing selector cache"),V=M.find(D.text),N=M.find(D.search),U=M.find(D.input),W=M.find(D.icon),B=M.prev().find(D.text).length>0?M.prev().find(D.text):M.prev(),Q=M.children(D.menu),X=Q.find(D.item)},refreshData:function(){S.verbose("Refreshing cached metadata"),X.removeData(E.text).removeData(E.value)},clearData:function(){S.verbose("Clearing metadata"),X.removeData(E.text).removeData(E.value),M.removeData(E.defaultText).removeData(E.defaultValue).removeData(E.placeholderText)},toggle:function(){S.verbose("Toggling menu visibility"),S.is.active()?S.hide():S.show()},show:function(t){if(t=e.isFunction(t)?t:function(){},!S.can.show()&&S.is.remote()&&(S.debug("No API results retrieved, searching before show"),S.queryRemote(S.get.query(),S.show)),S.can.show()&&!S.is.active()){if(S.debug("Showing dropdown"),!S.has.message()||S.has.maxSelections()||S.has.allResultsFiltered()||S.remove.message(),S.is.allFiltered())return!0;!1!==k.onShow.call(K)&&S.animate.show(function(){S.can.click()&&S.bind.intent(),S.has.menuSearch()&&S.focusSearch(),S.set.visible(),t.call(K)})}},hide:function(t){t=e.isFunction(t)?t:function(){},S.is.active()&&!S.is.animatingOutward()&&(S.debug("Hiding dropdown"),!1!==k.onHide.call(K)&&S.animate.hide(function(){S.remove.visible(),t.call(K)}))},hideOthers:function(){S.verbose("Finding other dropdowns to hide"),r.not(M).has(D.menu+"."+T.visible).dropdown("hide")},hideMenu:function(){S.verbose("Hiding menu  instantaneously"),S.remove.active(),S.remove.visible(),Q.transition("hide")},hideSubMenus:function(){var e=Q.children(D.item).find(D.menu);S.verbose("Hiding sub menus",e),e.transition("hide")},bind:{events:function(){c&&S.bind.touchEvents(),S.bind.keyboardEvents(),S.bind.inputEvents(),S.bind.mouseEvents()},touchEvents:function(){S.debug("Touch device detected binding additional touch events"),S.is.searchSelection()||S.is.single()&&M.on("touchstart"+z,S.event.test.toggle),Q.on("touchstart"+z,D.item,S.event.item.mouseenter)},keyboardEvents:function(){S.verbose("Binding keyboard events"),M.on("keydown"+z,S.event.keydown),S.has.search()&&M.on(S.get.inputEvent()+z,D.search,S.event.input),S.is.multiple()&&s.on("keydown"+y,S.event.document.keydown)},inputEvents:function(){S.verbose("Binding input change events"),M.on("change"+z,D.input,S.event.change)},mouseEvents:function(){S.verbose("Binding mouse events"),S.is.multiple()&&M.on("click"+z,D.label,S.event.label.click).on("click"+z,D.remove,S.event.remove.click),S.is.searchSelection()?(M.on("mousedown"+z,S.event.mousedown).on("mouseup"+z,S.event.mouseup).on("mousedown"+z,D.menu,S.event.menu.mousedown).on("mouseup"+z,D.menu,S.event.menu.mouseup).on("click"+z,D.icon,S.event.icon.click).on("focus"+z,D.search,S.event.search.focus).on("click"+z,D.search,S.event.search.focus).on("blur"+z,D.search,S.event.search.blur).on("click"+z,D.text,S.event.text.focus),S.is.multiple()&&M.on("click"+z,S.event.click)):("click"==k.on?M.on("click"+z,D.icon,S.event.icon.click).on("click"+z,S.event.test.toggle):"hover"==k.on?M.on("mouseenter"+z,S.delay.show).on("mouseleave"+z,S.delay.hide):M.on(k.on+z,S.toggle),M.on("mousedown"+z,S.event.mousedown).on("mouseup"+z,S.event.mouseup).on("focus"+z,S.event.focus),S.has.menuSearch()?M.on("blur"+z,D.search,S.event.search.blur):M.on("blur"+z,S.event.blur)),Q.on("mouseenter"+z,D.item,S.event.item.mouseenter).on("mouseleave"+z,D.item,S.event.item.mouseleave).on("click"+z,D.item,S.event.item.click)},intent:function(){S.verbose("Binding hide intent event to document"),c&&s.on("touchstart"+y,S.event.test.touch).on("touchmove"+y,S.event.test.touch),s.on("click"+y,S.event.test.hide)}},unbind:{intent:function(){S.verbose("Removing hide intent event from document"),c&&s.off("touchstart"+y).off("touchmove"+y),s.off("click"+y)}},filter:function(e){var t=e!==i?e:S.get.query(),n=function(){S.is.multiple()&&S.filterActive(),(e||!e&&0==S.get.activeItem().length)&&S.select.firstUnfiltered(),S.has.allResultsFiltered()?k.onNoResults.call(K,t)?k.allowAdditions?k.hideAdditions&&(S.verbose("User addition with no menu, setting empty style"),S.set.empty(),S.hideMenu()):(S.verbose("All items filtered, showing message",t),S.add.message(A.noResults)):(S.verbose("All items filtered, hiding dropdown",t),S.hideMenu()):(S.remove.empty(),S.remove.message()),k.allowAdditions&&S.add.userSuggestion(e),S.is.searchSelection()&&S.can.show()&&S.is.focusedOnSearch()&&S.show()};k.useLabels&&S.has.maxSelections()||(k.apiSettings?S.can.useAPI()?S.queryRemote(t,function(){k.filterRemoteData&&S.filterItems(t),n()}):S.error(q.noAPI):(S.filterItems(t),n()))},queryRemote:function(t,n){var i={errorDuration:!1,cache:"local",throttle:k.throttle,urlData:{query:t},onError:function(){S.add.message(A.serverError),n()},onFailure:function(){S.add.message(A.serverError),n()},onSuccess:function(e){S.remove.message(),S.setup.menu({values:e[R.remoteValues]}),n()}};M.api("get request")||S.setup.api(),i=e.extend(!0,{},i,k.apiSettings),M.api("setting",i).api("query")},filterItems:function(t){var n=t!==i?t:S.get.query(),o=null,a=S.escape.string(n),r=new RegExp("^"+a,"igm");S.has.query()&&(o=[],S.verbose("Searching for matching values",n),X.each(function(){var t,i,a=e(this);if("both"==k.match||"text"==k.match){if(-1!==(t=String(S.get.choiceText(a,!1))).search(r))return o.push(this),!0;if("exact"===k.fullTextSearch&&S.exactSearch(n,t))return o.push(this),!0;if(!0===k.fullTextSearch&&S.fuzzySearch(n,t))return o.push(this),!0}if("both"==k.match||"value"==k.match){if(-1!==(i=String(S.get.choiceValue(a,t))).search(r))return o.push(this),!0;if("exact"===k.fullTextSearch&&S.exactSearch(n,i))return o.push(this),!0;if(!0===k.fullTextSearch&&S.fuzzySearch(n,i))return o.push(this),!0}})),S.debug("Showing only matched items",n),S.remove.filteredItem(),o&&X.not(o).addClass(T.filtered)},fuzzySearch:function(e,t){var n=t.length,i=e.length;if(e=e.toLowerCase(),t=t.toLowerCase(),i>n)return!1;if(i===n)return e===t;e:for(var o=0,a=0;o<i;o++){for(var r=e.charCodeAt(o);a<n;)if(t.charCodeAt(a++)===r)continue e;return!1}return!0},exactSearch:function(e,t){return e=e.toLowerCase(),(t=t.toLowerCase()).indexOf(e)>-1},filterActive:function(){k.useLabels&&X.filter("."+T.active).addClass(T.filtered)},focusSearch:function(e){S.has.search()&&!S.is.focusedOnSearch()&&(e?(M.off("focus"+z,D.search),N.focus(),M.on("focus"+z,D.search,S.event.search.focus)):N.focus())},forceSelection:function(){var e=X.not(T.filtered).filter("."+T.selected).eq(0),t=X.not(T.filtered).filter("."+T.active).eq(0),n=e.length>0?e:t;if(n.length>0&&!S.is.multiple())return S.debug("Forcing partial selection to selected item",n),void S.event.item.click.call(n,{},!0);k.allowAdditions?(S.set.selected(S.get.query()),S.remove.searchTerm()):S.remove.searchTerm()},change:{values:function(t){k.allowAdditions||S.clear(),S.debug("Creating dropdown with specified values",t),S.setup.menu({values:t}),e.each(t,function(e,t){if(1==t.selected)return S.debug("Setting initial selection to",t.value),S.set.selected(t.value),!0})}},event:{change:function(){Z||(S.debug("Input changed, updating selection"),S.set.selected())},focus:function(){k.showOnFocus&&!$&&S.is.hidden()&&!v&&S.show()},blur:function(e){v=n.activeElement===this,$||v||(S.remove.activeLabel(),S.hide())},mousedown:function(){S.is.searchSelection()?b=!0:$=!0},mouseup:function(){S.is.searchSelection()?b=!1:$=!1},click:function(t){e(t.target).is(M)&&(S.is.focusedOnSearch()?S.show():S.focusSearch())},search:{focus:function(){$=!0,S.is.multiple()&&S.remove.activeLabel(),k.showOnFocus&&S.search()},blur:function(e){v=n.activeElement===this,S.is.searchSelection()&&!b&&(Y||v||(k.forceSelection&&S.forceSelection(),S.hide())),b=!1}},icon:{click:function(e){S.toggle()}},text:{focus:function(e){$=!0,S.focusSearch()}},input:function(e){(S.is.multiple()||S.is.searchSelection())&&S.set.filtered(),clearTimeout(S.timer),S.timer=setTimeout(S.search,k.delay.search)},label:{click:function(t){var n=e(this),i=M.find(D.label),o=i.filter("."+T.active),a=n.nextAll("."+T.active),r=n.prevAll("."+T.active),s=a.length>0?n.nextUntil(a).add(o).add(n):n.prevUntil(r).add(o).add(n);t.shiftKey?(o.removeClass(T.active),s.addClass(T.active)):t.ctrlKey?n.toggleClass(T.active):(o.removeClass(T.active),n.addClass(T.active)),k.onLabelSelect.apply(this,i.filter("."+T.active))}},remove:{click:function(){var t=e(this).parent();t.hasClass(T.active)?S.remove.activeLabels():S.remove.activeLabels(t)}},test:{toggle:function(e){var t=S.is.multiple()?S.show:S.toggle;S.is.bubbledLabelClick(e)||S.is.bubbledIconClick(e)||S.determine.eventOnElement(e,t)&&e.preventDefault()},touch:function(e){S.determine.eventOnElement(e,function(){"touchstart"==e.type?S.timer=setTimeout(function(){S.hide()},k.delay.touch):"touchmove"==e.type&&clearTimeout(S.timer)}),e.stopPropagation()},hide:function(e){S.determine.eventInModule(e,S.hide)}},select:{mutation:function(t){S.debug("<select> modified, recreating menu");var n=!1;e.each(t,function(t,i){if(e(i.target).is("select")||e(i.addedNodes).is("select"))return n=!0,!0}),n&&(S.disconnect.selectObserver(),S.refresh(),S.setup.select(),S.set.selected(),S.observe.select())}},menu:{mutation:function(t){var n=t[0],i=n.addedNodes?e(n.addedNodes[0]):e(!1),o=n.removedNodes?e(n.removedNodes[0]):e(!1),a=i.add(o),r=a.is(D.addition)||a.closest(D.addition).length>0,s=a.is(D.message)||a.closest(D.message).length>0;r||s?(S.debug("Updating item selector cache"),S.refreshItems()):(S.debug("Menu modified, updating selector cache"),S.refresh())},mousedown:function(){Y=!0},mouseup:function(){Y=!1}},item:{mouseenter:function(t){var n=e(t.target),i=e(this),o=i.children(D.menu),a=i.siblings(D.item).children(D.menu),r=o.length>0;!(o.find(n).length>0)&&r&&(clearTimeout(S.itemTimer),S.itemTimer=setTimeout(function(){S.verbose("Showing sub-menu",o),e.each(a,function(){S.animate.hide(!1,e(this))}),S.animate.show(!1,o)},k.delay.show),t.preventDefault())},mouseleave:function(t){var n=e(this).children(D.menu);n.length>0&&(clearTimeout(S.itemTimer),S.itemTimer=setTimeout(function(){S.verbose("Hiding sub-menu",n),S.animate.hide(!1,n)},k.delay.hide))},click:function(t,i){var o=e(this),a=e(t?t.target:""),r=o.find(D.menu),s=S.get.choiceText(o),l=S.get.choiceValue(o,s),c=r.length>0,u=r.find(a).length>0;S.has.menuSearch()&&e(n.activeElement).blur(),u||c&&!k.allowCategorySelection||(S.is.searchSelection()&&(k.allowAdditions&&S.remove.userAddition(),S.remove.searchTerm(),S.is.focusedOnSearch()||1==i||S.focusSearch(!0)),k.useLabels||(S.remove.filteredItem(),S.set.scrollPosition(o)),S.determine.selectAction.call(this,s,l))}},document:{keydown:function(e){var t=e.which;if(S.is.inObject(t,P)){var n=M.find(D.label),i=n.filter("."+T.active),o=(i.data(E.value),n.index(i)),a=n.length,r=i.length>0,s=i.length>1,l=0===o,c=o+1==a,u=S.is.searchSelection(),d=S.is.focusedOnSearch(),f=S.is.focused(),m=d&&0===S.get.caretPosition();if(u&&!r&&!d)return;t==P.leftArrow?!f&&!m||r?r&&(e.shiftKey?S.verbose("Adding previous label to selection"):(S.verbose("Selecting previous label"),n.removeClass(T.active)),l&&!s?i.addClass(T.active):i.prev(D.siblingLabel).addClass(T.active).end(),e.preventDefault()):(S.verbose("Selecting previous label"),n.last().addClass(T.active)):t==P.rightArrow?(f&&!r&&n.first().addClass(T.active),r&&(e.shiftKey?S.verbose("Adding next label to selection"):(S.verbose("Selecting next label"),n.removeClass(T.active)),c?u?d?n.removeClass(T.active):S.focusSearch():s?i.next(D.siblingLabel).addClass(T.active):i.addClass(T.active):i.next(D.siblingLabel).addClass(T.active),e.preventDefault())):t==P.deleteKey||t==P.backspace?r?(S.verbose("Removing active labels"),c&&u&&!d&&S.focusSearch(),i.last().next(D.siblingLabel).addClass(T.active),S.remove.activeLabels(i),e.preventDefault()):m&&!r&&t==P.backspace&&(S.verbose("Removing last label on input backspace"),i=n.last().addClass(T.active),S.remove.activeLabels(i)):i.removeClass(T.active)}}},keydown:function(e){var t=e.which;if(S.is.inObject(t,P)){var n,i=X.not(D.unselectable).filter("."+T.selected).eq(0),o=Q.children("."+T.active).eq(0),a=i.length>0?i:o,r=a.length>0?a.siblings(":not(."+T.filtered+")").addBack():Q.children(":not(."+T.filtered+")"),s=a.children(D.menu),l=a.closest(D.menu),c=l.hasClass(T.visible)||l.hasClass(T.animating)||l.parent(D.menu).length>0,u=s.length>0,d=a.length>0,f=a.not(D.unselectable).length>0,m=t==P.delimiter&&k.allowAdditions&&S.is.multiple();if(k.allowAdditions&&k.hideAdditions&&(t==P.enter||m)&&f&&(S.verbose("Selecting item from keyboard shortcut",a),S.event.item.click.call(a,e),S.is.searchSelection()&&S.remove.searchTerm()),S.is.visible()){if((t==P.enter||m)&&(t==P.enter&&d&&u&&!k.allowCategorySelection?(S.verbose("Pressed enter on unselectable category, opening sub menu"),t=P.rightArrow):f&&(S.verbose("Selecting item from keyboard shortcut",a),S.event.item.click.call(a,e),S.is.searchSelection()&&S.remove.searchTerm()),e.preventDefault()),d&&(t==P.leftArrow&&l[0]!==Q[0]&&(S.verbose("Left key pressed, closing sub-menu"),S.animate.hide(!1,l),a.removeClass(T.selected),l.closest(D.item).addClass(T.selected),e.preventDefault()),t==P.rightArrow&&u&&(S.verbose("Right key pressed, opening sub-menu"),S.animate.show(!1,s),a.removeClass(T.selected),s.find(D.item).eq(0).addClass(T.selected),e.preventDefault())),t==P.upArrow){if(n=d&&c?a.prevAll(D.item+":not("+D.unselectable+")").eq(0):X.eq(0),r.index(n)<0)return S.verbose("Up key pressed but reached top of current menu"),void e.preventDefault();S.verbose("Up key pressed, changing active item"),a.removeClass(T.selected),n.addClass(T.selected),S.set.scrollPosition(n),k.selectOnKeydown&&S.is.single()&&S.set.selectedItem(n),e.preventDefault()}if(t==P.downArrow){if(0===(n=d&&c?n=a.nextAll(D.item+":not("+D.unselectable+")").eq(0):X.eq(0)).length)return S.verbose("Down key pressed but reached bottom of current menu"),void e.preventDefault();S.verbose("Down key pressed, changing active item"),X.removeClass(T.selected),n.addClass(T.selected),S.set.scrollPosition(n),k.selectOnKeydown&&S.is.single()&&S.set.selectedItem(n),e.preventDefault()}t==P.pageUp&&(S.scrollPage("up"),e.preventDefault()),t==P.pageDown&&(S.scrollPage("down"),e.preventDefault()),t==P.escape&&(S.verbose("Escape key pressed, closing dropdown"),S.hide())}else m&&e.preventDefault(),t!=P.downArrow||S.is.visible()||(S.verbose("Down key pressed, showing dropdown"),S.show(),e.preventDefault())}else S.has.search()||S.set.selectedLetter(String.fromCharCode(t))}},trigger:{change:function(){var e=n.createEvent("HTMLEvents"),t=U[0];t&&(S.verbose("Triggering native change event"),e.initEvent("change",!0,!1),t.dispatchEvent(e))}},determine:{selectAction:function(t,n){S.verbose("Determining action",k.action),e.isFunction(S.action[k.action])?(S.verbose("Triggering preset action",k.action,t,n),S.action[k.action].call(K,t,n,this)):e.isFunction(k.action)?(S.verbose("Triggering user action",k.action,t,n),k.action.call(K,t,n,this)):S.error(q.action,k.action)},eventInModule:function(t,i){var o=e(t.target),a=o.closest(n.documentElement).length>0,r=o.closest(M).length>0;return i=e.isFunction(i)?i:function(){},a&&!r?(S.verbose("Triggering event",i),i(),!0):(S.verbose("Event occurred in dropdown, canceling callback"),!1)},eventOnElement:function(t,i){var o=e(t.target),a=o.closest(D.siblingLabel),r=n.body.contains(t.target),s=0===M.find(a).length,l=0===o.closest(Q).length;return i=e.isFunction(i)?i:function(){},r&&s&&l?(S.verbose("Triggering event",i),i(),!0):(S.verbose("Event occurred in dropdown menu, canceling callback"),!1)}},action:{nothing:function(){},activate:function(t,n,o){if(n=n!==i?n:t,S.can.activate(e(o))){if(S.set.selected(n,e(o)),S.is.multiple()&&!S.is.allFiltered())return;S.hideAndClear()}},select:function(t,n,o){if(n=n!==i?n:t,S.can.activate(e(o))){if(S.set.value(n,t,e(o)),S.is.multiple()&&!S.is.allFiltered())return;S.hideAndClear()}},combo:function(t,n,o){n=n!==i?n:t,S.set.selected(n,e(o)),S.hideAndClear()},hide:function(e,t,n){S.set.value(t,e),S.hideAndClear()}},get:{id:function(){return x},defaultText:function(){return M.data(E.defaultText)},defaultValue:function(){return M.data(E.defaultValue)},placeholderText:function(){return"auto"!=k.placeholder&&"string"==typeof k.placeholder?k.placeholder:M.data(E.placeholderText)||""},text:function(){return V.text()},query:function(){return e.trim(N.val())},searchWidth:function(e){return e=e!==i?e:N.val(),H.text(e),Math.ceil(H.width()+1)},selectionCount:function(){var t=S.get.values();return S.is.multiple()?e.isArray(t)?t.length:0:""!==S.get.value()?1:0},transition:function(e){return"auto"==k.transition?S.is.upward(e)?"slide up":"slide down":k.transition},userValues:function(){var t=S.get.values();return!!t&&(t=e.isArray(t)?t:[t],e.grep(t,function(e){return!1===S.get.item(e)}))},uniqueArray:function(t){return e.grep(t,function(n,i){return e.inArray(n,t)===i})},caretPosition:function(){var e,t,i=N.get(0);return"selectionStart"in i?i.selectionStart:n.selection?(i.focus(),t=(e=n.selection.createRange()).text.length,e.moveStart("character",-i.value.length),e.text.length-t):void 0},value:function(){var t=U.length>0?U.val():M.data(E.value),n=e.isArray(t)&&1===t.length&&""===t[0];return t===i||n?"":t},values:function(){var e=S.get.value();return""===e?"":!S.has.selectInput()&&S.is.multiple()?"string"==typeof e?e.split(k.delimiter):"":e},remoteValues:function(){var t=S.get.values(),n=!1;return t&&("string"==typeof t&&(t=[t]),e.each(t,function(e,t){var i=S.read.remoteData(t);S.verbose("Restoring value from session data",i,t),i&&(n||(n={}),n[t]=i)})),n},choiceText:function(t,n){if(n=n!==i?n:k.preserveHTML,t)return t.find(D.menu).length>0&&(S.verbose("Retrieving text of element with sub-menu"),(t=t.clone()).find(D.menu).remove(),t.find(D.menuIcon).remove()),t.data(E.text)!==i?t.data(E.text):n?e.trim(t.html()):e.trim(t.text())},choiceValue:function(t,n){return n=n||S.get.choiceText(t),!!t&&(t.data(E.value)!==i?String(t.data(E.value)):"string"==typeof n?e.trim(n.toLowerCase()):String(n))},inputEvent:function(){var e=N[0];return!!e&&(e.oninput!==i?"input":e.onpropertychange!==i?"propertychange":"keyup")},selectValues:function(){var t={values:[]};return M.find("option").each(function(){var n=e(this),o=n.html(),a=n.attr("disabled"),r=n.attr("value")!==i?n.attr("value"):o;"auto"===k.placeholder&&""===r?t.placeholder=o:t.values.push({name:o,value:r,disabled:a})}),k.placeholder&&"auto"!==k.placeholder&&(S.debug("Setting placeholder value to",k.placeholder),t.placeholder=k.placeholder),k.sortSelect?(t.values.sort(function(e,t){return e.name>t.name?1:-1}),S.debug("Retrieved and sorted values from select",t)):S.debug("Retrieved values from select",t),t},activeItem:function(){return X.filter("."+T.active)},selectedItem:function(){var e=X.not(D.unselectable).filter("."+T.selected);return e.length>0?e:X.eq(0)},itemWithAdditions:function(e){var t=S.get.item(e),n=S.create.userChoice(e);return n&&n.length>0&&(t=t.length>0?t.add(n):n),t},item:function(t,n){var o,a,r=!1;return t=t!==i?t:S.get.values()!==i?S.get.values():S.get.text(),o=a?t.length>0:t!==i&&null!==t,a=S.is.multiple()&&e.isArray(t),n=""===t||0===t||(n||!1),o&&X.each(function(){var o=e(this),s=S.get.choiceText(o),l=S.get.choiceValue(o,s);if(null!==l&&l!==i)if(a)-1===e.inArray(String(l),t)&&-1===e.inArray(s,t)||(r=r?r.add(o):o);else if(n){if(S.verbose("Ambiguous dropdown value using strict type check",o,t),l===t||s===t)return r=o,!0}else if(String(l)==String(t)||s==t)return S.verbose("Found select item by value",l,t),r=o,!0}),r}},check:{maxSelections:function(e){return!k.maxSelections||((e=e!==i?e:S.get.selectionCount())>=k.maxSelections?(S.debug("Maximum selection count reached"),k.useLabels&&(X.addClass(T.filtered),S.add.message(A.maxSelections)),!0):(S.verbose("No longer at maximum selection count"),S.remove.message(),S.remove.filteredItem(),S.is.searchSelection()&&S.filterItems(),!1))}},restore:{defaults:function(){S.clear(),S.restore.defaultText(),S.restore.defaultValue()},defaultText:function(){var e=S.get.defaultText();e===S.get.placeholderText?(S.debug("Restoring default placeholder text",e),S.set.placeholderText(e)):(S.debug("Restoring default text",e),S.set.text(e))},placeholderText:function(){S.set.placeholderText()},defaultValue:function(){var e=S.get.defaultValue();e!==i&&(S.debug("Restoring default value",e),""!==e?(S.set.value(e),S.set.selected()):(S.remove.activeItem(),S.remove.selectedItem()))},labels:function(){k.allowAdditions&&(k.useLabels||(S.error(q.labels),k.useLabels=!0),S.debug("Restoring selected values"),S.create.userLabels()),S.check.maxSelections()},selected:function(){S.restore.values(),S.is.multiple()?(S.debug("Restoring previously selected values and labels"),S.restore.labels()):S.debug("Restoring previously selected values")},values:function(){S.set.initialLoad(),k.apiSettings&&k.saveRemoteData&&S.get.remoteValues()?S.restore.remoteValues():S.set.selected(),S.remove.initialLoad()},remoteValues:function(){var t=S.get.remoteValues();S.debug("Recreating selected from session data",t),t&&(S.is.single()?e.each(t,function(e,t){S.set.text(t)}):e.each(t,function(e,t){S.add.label(e,t)}))}},read:{remoteData:function(e){var n;if(t.Storage!==i)return(n=sessionStorage.getItem(e))!==i&&n;S.error(q.noStorage)}},save:{defaults:function(){S.save.defaultText(),S.save.placeholderText(),S.save.defaultValue()},defaultValue:function(){var e=S.get.value();S.verbose("Saving default value as",e),M.data(E.defaultValue,e)},defaultText:function(){var e=S.get.text();S.verbose("Saving default text as",e),M.data(E.defaultText,e)},placeholderText:function(){var e;!1!==k.placeholder&&V.hasClass(T.placeholder)&&(e=S.get.text(),S.verbose("Saving placeholder text as",e),M.data(E.placeholderText,e))},remoteData:function(e,n){t.Storage!==i?(S.verbose("Saving remote data to session storage",n,e),sessionStorage.setItem(n,e)):S.error(q.noStorage)}},clear:function(){S.is.multiple()&&k.useLabels?S.remove.labels():(S.remove.activeItem(),S.remove.selectedItem()),S.set.placeholderText(),S.clearValue()},clearValue:function(){S.set.value("")},scrollPage:function(e,t){var n,i,o=t||S.get.selectedItem(),a=o.closest(D.menu),r=a.outerHeight(),s=a.scrollTop(),l=X.eq(0).outerHeight(),c=Math.floor(r/l),u=(a.prop("scrollHeight"),"up"==e?s-l*c:s+l*c),d=X.not(D.unselectable);i="up"==e?d.index(o)-c:d.index(o)+c,(n=("up"==e?i>=0:i<d.length)?d.eq(i):"up"==e?d.first():d.last()).length>0&&(S.debug("Scrolling page",e,n),o.removeClass(T.selected),n.addClass(T.selected),k.selectOnKeydown&&S.is.single()&&S.set.selectedItem(n),a.scrollTop(u))},set:{filtered:function(){var e=S.is.multiple(),t=S.is.searchSelection(),n=e&&t,i=t?S.get.query():"",o="string"==typeof i&&i.length>0,a=S.get.searchWidth(),r=""!==i;e&&o&&(S.verbose("Adjusting input width",a,k.glyphWidth),N.css("width",a)),o||n&&r?(S.verbose("Hiding placeholder text"),V.addClass(T.filtered)):(!e||n&&!r)&&(S.verbose("Showing placeholder text"),V.removeClass(T.filtered))},empty:function(){M.addClass(T.empty)},loading:function(){M.addClass(T.loading)},placeholderText:function(e){e=e||S.get.placeholderText(),S.debug("Setting placeholder text",e),S.set.text(e),V.addClass(T.placeholder)},tabbable:function(){S.is.searchSelection()?(S.debug("Added tabindex to searchable dropdown"),N.val("").attr("tabindex",0),Q.attr("tabindex",-1)):(S.debug("Added tabindex to dropdown"),M.attr("tabindex")===i&&(M.attr("tabindex",0),Q.attr("tabindex",-1)))},initialLoad:function(){S.verbose("Setting initial load"),h=!0},activeItem:function(e){k.allowAdditions&&e.filter(D.addition).length>0?e.addClass(T.filtered):e.addClass(T.active)},partialSearch:function(e){var t=S.get.query().length;N.val(e.substr(0,t))},scrollPosition:function(e,t){var n,o,a,r,s,l;n=(e=e||S.get.selectedItem()).closest(D.menu),o=e&&e.length>0,t=t!==i&&t,e&&n.length>0&&o&&(e.position().top,n.addClass(T.loading),a=(r=n.scrollTop())-n.offset().top+e.offset().top,t||(l=r+n.height()<a+5,s=a-5<r),S.debug("Scrolling to active item",a),(t||s||l)&&n.scrollTop(a),n.removeClass(T.loading))},text:function(e){"select"!==k.action&&("combo"==k.action?(S.debug("Changing combo button text",e,B),k.preserveHTML?B.html(e):B.text(e)):(e!==S.get.placeholderText()&&V.removeClass(T.placeholder),S.debug("Changing text",e,V),V.removeClass(T.filtered),k.preserveHTML?V.html(e):V.text(e)))},selectedItem:function(e){var t=S.get.choiceValue(e),n=S.get.choiceText(e,!1),i=S.get.choiceText(e,!0);S.debug("Setting user selection to item",e),S.remove.activeItem(),S.set.partialSearch(n),S.set.activeItem(e),S.set.selected(t,e),S.set.text(i)},selectedLetter:function(t){var n,i=X.filter("."+T.selected),o=!1;i.length>0&&S.has.firstLetter(i,t)&&(n=i.nextAll(X).eq(0),S.has.firstLetter(n,t)&&(o=n)),o||X.each(function(){if(S.has.firstLetter(e(this),t))return o=e(this),!1}),o&&(S.verbose("Scrolling to next value with letter",t),S.set.scrollPosition(o),i.removeClass(T.selected),o.addClass(T.selected),k.selectOnKeydown&&S.is.single()&&S.set.selectedItem(o))},direction:function(e){"auto"==k.direction?(S.remove.upward(),S.can.openDownward(e)?S.remove.upward(e):S.set.upward(e),S.is.leftward(e)||S.can.openRightward(e)||S.set.leftward(e)):"upward"==k.direction&&S.set.upward(e)},upward:function(e){(e||M).addClass(T.upward)},leftward:function(e){(e||Q).addClass(T.leftward)},value:function(e,t,n){var o=S.escape.value(e),a=U.length>0,r=S.get.values(),s=e!==i?String(e):e;if(a){if(!k.allowReselection&&s==r&&(S.verbose("Skipping value update already same value",e,r),!S.is.initialLoad()))return;S.is.single()&&S.has.selectInput()&&S.can.extendSelect()&&(S.debug("Adding user option",e),S.add.optionValue(e)),S.debug("Updating input value",o,r),Z=!0,U.val(o),!1===k.fireOnInit&&S.is.initialLoad()?S.debug("Input native change event ignored on initial load"):S.trigger.change(),Z=!1}else S.verbose("Storing value in metadata",o,U),o!==r&&M.data(E.value,s);!1===k.fireOnInit&&S.is.initialLoad()?S.verbose("No callback on initial load",k.onChange):k.onChange.call(K,e,t,n)},active:function(){M.addClass(T.active)},multiple:function(){M.addClass(T.multiple)},visible:function(){M.addClass(T.visible)},exactly:function(e,t){S.debug("Setting selected to exact values"),S.clear(),S.set.selected(e,t)},selected:function(t,n){var i=S.is.multiple();(n=k.allowAdditions?n||S.get.itemWithAdditions(t):n||S.get.item(t))&&(S.debug("Setting selected menu item to",n),S.is.multiple()&&S.remove.searchWidth(),S.is.single()?(S.remove.activeItem(),S.remove.selectedItem()):k.useLabels&&S.remove.selectedItem(),n.each(function(){var t=e(this),o=S.get.choiceText(t),a=S.get.choiceValue(t,o),r=t.hasClass(T.filtered),s=t.hasClass(T.active),l=t.hasClass(T.addition),c=i&&1==n.length;i?!s||l?(k.apiSettings&&k.saveRemoteData&&S.save.remoteData(o,a),k.useLabels?(S.add.label(a,o,c),S.add.value(a,o,t),S.set.activeItem(t),S.filterActive(),S.select.nextAvailable(n)):(S.add.value(a,o,t),S.set.text(S.add.variables(A.count)),S.set.activeItem(t))):r||(S.debug("Selected active value, removing label"),S.remove.selected(a)):(k.apiSettings&&k.saveRemoteData&&S.save.remoteData(o,a),S.set.text(o),S.set.value(a,o,t),t.addClass(T.active).addClass(T.selected))}))}},add:{label:function(t,n,i){var o,a=S.is.searchSelection()?N:V,r=S.escape.value(t);k.ignoreCase&&(r=r.toLowerCase()),o=e("<a />").addClass(T.label).attr("data-"+E.value,r).html(j.label(r,n)),o=k.onLabelCreate.call(o,r,n),S.has.label(t)?S.debug("User selection already exists, skipping",r):(k.label.variation&&o.addClass(k.label.variation),!0===i?(S.debug("Animating in label",o),o.addClass(T.hidden).insertBefore(a).transition(k.label.transition,k.label.duration)):(S.debug("Adding selection label",o),o.insertBefore(a)))},message:function(t){var n=Q.children(D.message),i=k.templates.message(S.add.variables(t));n.length>0?n.html(i):n=e("<div/>").html(i).addClass(T.message).appendTo(Q)},optionValue:function(t){var n=S.escape.value(t);U.find('option[value="'+S.escape.string(n)+'"]').length>0||(S.disconnect.selectObserver(),S.is.single()&&(S.verbose("Removing previous user addition"),U.find("option."+T.addition).remove()),e("<option/>").prop("value",n).addClass(T.addition).html(t).appendTo(U),S.verbose("Adding user addition as an <option>",t),S.observe.select())},userSuggestion:function(e){var t,n=Q.children(D.addition),i=S.get.item(e),o=i&&i.not(D.addition).length,a=n.length>0;k.useLabels&&S.has.maxSelections()||(""===e||o?n.remove():(a?(n.data(E.value,e).data(E.text,e).attr("data-"+E.value,e).attr("data-"+E.text,e).removeClass(T.filtered),k.hideAdditions||(t=k.templates.addition(S.add.variables(A.addResult,e)),n.html(t)),S.verbose("Replacing user suggestion with new value",n)):((n=S.create.userChoice(e)).prependTo(Q),S.verbose("Adding item choice to menu corresponding with user choice addition",n)),k.hideAdditions&&!S.is.allFiltered()||n.addClass(T.selected).siblings().removeClass(T.selected),S.refreshItems()))},variables:function(e,t){var n,i,o=-1!==e.search("{count}"),a=-1!==e.search("{maxCount}"),r=-1!==e.search("{term}");return S.verbose("Adding templated variables to message",e),o&&(n=S.get.selectionCount(),e=e.replace("{count}",n)),a&&(n=S.get.selectionCount(),e=e.replace("{maxCount}",k.maxSelections)),r&&(i=t||S.get.query(),e=e.replace("{term}",i)),e},value:function(t,n,i){var o,a=S.get.values();S.has.value(t)?S.debug("Value already selected"):""!==t?(e.isArray(a)?(o=a.concat([t]),o=S.get.uniqueArray(o)):o=[t],S.has.selectInput()?S.can.extendSelect()&&(S.debug("Adding value to select",t,o,U),S.add.optionValue(t)):(o=o.join(k.delimiter),S.debug("Setting hidden input to delimited value",o,U)),!1===k.fireOnInit&&S.is.initialLoad()?S.verbose("Skipping onadd callback on initial load",k.onAdd):k.onAdd.call(K,t,n,i),S.set.value(o,t,n,i),S.check.maxSelections()):S.debug("Cannot select blank values from multiselect")}},remove:{active:function(){M.removeClass(T.active)},activeLabel:function(){M.find(D.label).removeClass(T.active)},empty:function(){M.removeClass(T.empty)},loading:function(){M.removeClass(T.loading)},initialLoad:function(){h=!1},upward:function(e){(e||M).removeClass(T.upward)},leftward:function(e){(e||Q).removeClass(T.leftward)},visible:function(){M.removeClass(T.visible)},activeItem:function(){X.removeClass(T.active)},filteredItem:function(){k.useLabels&&S.has.maxSelections()||(k.useLabels&&S.is.multiple()?X.not("."+T.active).removeClass(T.filtered):X.removeClass(T.filtered),S.remove.empty())},optionValue:function(e){var t=S.escape.value(e),n=U.find('option[value="'+S.escape.string(t)+'"]');n.length>0&&n.hasClass(T.addition)&&(C&&(C.disconnect(),S.verbose("Temporarily disconnecting mutation observer")),n.remove(),S.verbose("Removing user addition as an <option>",t),C&&C.observe(U[0],{childList:!0,subtree:!0}))},message:function(){Q.children(D.message).remove()},searchWidth:function(){N.css("width","")},searchTerm:function(){S.verbose("Cleared search term"),N.val(""),S.set.filtered()},userAddition:function(){X.filter(D.addition).remove()},selected:function(t,n){if(!(n=k.allowAdditions?n||S.get.itemWithAdditions(t):n||S.get.item(t)))return!1;n.each(function(){var t=e(this),n=S.get.choiceText(t),i=S.get.choiceValue(t,n);S.is.multiple()?k.useLabels?(S.remove.value(i,n,t),S.remove.label(i)):(S.remove.value(i,n,t),0===S.get.selectionCount()?S.set.placeholderText():S.set.text(S.add.variables(A.count))):S.remove.value(i,n,t),t.removeClass(T.filtered).removeClass(T.active),k.useLabels&&t.removeClass(T.selected)})},selectedItem:function(){X.removeClass(T.selected)},value:function(e,t,n){var i,o=S.get.values();S.has.selectInput()?(S.verbose("Input is <select> removing selected option",e),i=S.remove.arrayValue(e,o),S.remove.optionValue(e)):(S.verbose("Removing from delimited values",e),i=(i=S.remove.arrayValue(e,o)).join(k.delimiter)),!1===k.fireOnInit&&S.is.initialLoad()?S.verbose("No callback on initial load",k.onRemove):k.onRemove.call(K,e,t,n),S.set.value(i,t,n),S.check.maxSelections()},arrayValue:function(t,n){return e.isArray(n)||(n=[n]),n=e.grep(n,function(e){return t!=e}),S.verbose("Removed value from delimited string",t,n),n},label:function(e,t){var n=M.find(D.label).filter("[data-"+E.value+'="'+S.escape.string(e)+'"]');S.verbose("Removing label",n),n.remove()},activeLabels:function(e){e=e||M.find(D.label).filter("."+T.active),S.verbose("Removing active label selections",e),S.remove.labels(e)},labels:function(t){t=t||M.find(D.label),S.verbose("Removing labels",t),t.each(function(){var t=e(this),n=t.data(E.value),o=n!==i?String(n):n,a=S.is.userValue(o);!1!==k.onLabelRemove.call(t,n)?(S.remove.message(),a?(S.remove.value(o),S.remove.label(o)):S.remove.selected(o)):S.debug("Label remove callback cancelled removal")})},tabbable:function(){S.is.searchSelection()?(S.debug("Searchable dropdown initialized"),N.removeAttr("tabindex"),Q.removeAttr("tabindex")):(S.debug("Simple selection dropdown initialized"),M.removeAttr("tabindex"),Q.removeAttr("tabindex"))}},has:{menuSearch:function(){return S.has.search()&&N.closest(Q).length>0},search:function(){return N.length>0},sizer:function(){return H.length>0},selectInput:function(){return U.is("select")},minCharacters:function(e){return!k.minCharacters||(e=e!==i?String(e):String(S.get.query())).length>=k.minCharacters},firstLetter:function(e,t){var n;return!(!e||0===e.length||"string"!=typeof t)&&(n=S.get.choiceText(e,!1),(t=t.toLowerCase())==String(n).charAt(0).toLowerCase())},input:function(){return U.length>0},items:function(){return X.length>0},menu:function(){return Q.length>0},message:function(){return 0!==Q.children(D.message).length},label:function(e){var t=S.escape.value(e),n=M.find(D.label);return k.ignoreCase&&(t=t.toLowerCase()),n.filter("[data-"+E.value+'="'+S.escape.string(t)+'"]').length>0},maxSelections:function(){return k.maxSelections&&S.get.selectionCount()>=k.maxSelections},allResultsFiltered:function(){var e=X.not(D.addition);return e.filter(D.unselectable).length===e.length},userSuggestion:function(){return Q.children(D.addition).length>0},query:function(){return""!==S.get.query()},value:function(e){return k.ignoreCase?S.has.valueIgnoringCase(e):S.has.valueMatchingCase(e)},valueMatchingCase:function(t){var n=S.get.values();return!!(e.isArray(n)?n&&-1!==e.inArray(t,n):n==t)},valueIgnoringCase:function(t){var n=S.get.values(),i=!1;return e.isArray(n)||(n=[n]),e.each(n,function(e,n){if(String(t).toLowerCase()==String(n).toLowerCase())return i=!0,!1}),i}},is:{active:function(){return M.hasClass(T.active)},animatingInward:function(){return Q.transition("is inward")},animatingOutward:function(){return Q.transition("is outward")},bubbledLabelClick:function(t){return e(t.target).is("select, input")&&M.closest("label").length>0},bubbledIconClick:function(t){return e(t.target).closest(W).length>0},alreadySetup:function(){return M.is("select")&&M.parent(D.dropdown).data(I)!==i&&0===M.prev().length},animating:function(e){return e?e.transition&&e.transition("is animating"):Q.transition&&Q.transition("is animating")},leftward:function(e){return(e||Q).hasClass(T.leftward)},disabled:function(){return M.hasClass(T.disabled)},focused:function(){return n.activeElement===M[0]},focusedOnSearch:function(){return n.activeElement===N[0]},allFiltered:function(){return(S.is.multiple()||S.has.search())&&!(0==k.hideAdditions&&S.has.userSuggestion())&&!S.has.message()&&S.has.allResultsFiltered()},hidden:function(e){return!S.is.visible(e)},initialLoad:function(){return h},inObject:function(t,n){var i=!1;return e.each(n,function(e,n){if(n==t)return i=!0,!0}),i},multiple:function(){return M.hasClass(T.multiple)},remote:function(){return k.apiSettings&&S.can.useAPI()},single:function(){return!S.is.multiple()},selectMutation:function(t){var n=!1;return e.each(t,function(t,i){if(i.target&&e(i.target).is("select"))return n=!0,!0}),n},search:function(){return M.hasClass(T.search)},searchSelection:function(){return S.has.search()&&1===N.parent(D.dropdown).length},selection:function(){return M.hasClass(T.selection)},userValue:function(t){return-1!==e.inArray(t,S.get.userValues())},upward:function(e){return(e||M).hasClass(T.upward)},visible:function(e){return e?e.hasClass(T.visible):Q.hasClass(T.visible)},verticallyScrollableContext:function(){var e=L.get(0)!==t&&L.css("overflow-y");return"auto"==e||"scroll"==e},horizontallyScrollableContext:function(){var e=L.get(0)!==t&&L.css("overflow-X");return"auto"==e||"scroll"==e}},can:{activate:function(e){return!!k.useLabels||(!S.has.maxSelections()||!(!S.has.maxSelections()||!e.hasClass(T.active)))},openDownward:function(e){var n,i,o=e||Q,a=!0;return o.addClass(T.loading),i={context:{offset:L.get(0)===t?{top:0,left:0}:L.offset(),scrollTop:L.scrollTop(),height:L.outerHeight()},menu:{offset:o.offset(),height:o.outerHeight()}},S.is.verticallyScrollableContext()&&(i.menu.offset.top+=i.context.scrollTop),(n={above:i.context.scrollTop<=i.menu.offset.top-i.context.offset.top-i.menu.height,below:i.context.scrollTop+i.context.height>=i.menu.offset.top-i.context.offset.top+i.menu.height}).below?(S.verbose("Dropdown can fit in context downward",n),a=!0):n.below||n.above?(S.verbose("Dropdown cannot fit below, opening upward",n),a=!1):(S.verbose("Dropdown cannot fit in either direction, favoring downward",n),a=!0),o.removeClass(T.loading),a},openRightward:function(e){var n,i,o=e||Q,a=!0;return o.addClass(T.loading),i={context:{offset:L.get(0)===t?{top:0,left:0}:L.offset(),scrollLeft:L.scrollLeft(),width:L.outerWidth()},menu:{offset:o.offset(),width:o.outerWidth()}},S.is.horizontallyScrollableContext()&&(i.menu.offset.left+=i.context.scrollLeft),(n=i.menu.offset.left-i.context.offset.left+i.menu.width>=i.context.scrollLeft+i.context.width)&&(S.verbose("Dropdown cannot fit in context rightward",n),a=!1),o.removeClass(T.loading),a},click:function(){return c||"click"==k.on},extendSelect:function(){return k.allowAdditions||k.apiSettings},show:function(){return!S.is.disabled()&&(S.has.items()||S.has.message())},useAPI:function(){return e.fn.api!==i}},animate:{show:function(t,n){var o,a=n||Q,r=n?function(){}:function(){S.hideSubMenus(),S.hideOthers(),S.set.active()};t=e.isFunction(t)?t:function(){},S.verbose("Doing menu show animation",a),S.set.direction(n),o=S.get.transition(n),S.is.selection()&&S.set.scrollPosition(S.get.selectedItem(),!0),(S.is.hidden(a)||S.is.animating(a))&&("none"==o?(r(),a.transition("show"),t.call(K)):e.fn.transition!==i&&M.transition("is supported")?a.transition({animation:o+" in",debug:k.debug,verbose:k.verbose,duration:k.duration,queue:!0,onStart:r,onComplete:function(){t.call(K)}}):S.error(q.noTransition,o))},hide:function(t,n){var o=n||Q,a=(n?k.duration:k.duration,n?function(){}:function(){S.can.click()&&S.unbind.intent(),S.remove.active()}),r=S.get.transition(n);t=e.isFunction(t)?t:function(){},(S.is.visible(o)||S.is.animating(o))&&(S.verbose("Doing menu hide animation",o),"none"==r?(a(),o.transition("hide"),t.call(K)):e.fn.transition!==i&&M.transition("is supported")?o.transition({animation:r+" out",duration:k.duration,debug:k.debug,verbose:k.verbose,queue:!1,onStart:a,onComplete:function(){t.call(K)}}):S.error(q.transition))}},hideAndClear:function(){S.remove.searchTerm(),S.has.maxSelections()||(S.has.search()?S.hide(function(){S.remove.filteredItem()}):S.hide())},delay:{show:function(){S.verbose("Delaying show event to ensure user intent"),clearTimeout(S.timer),S.timer=setTimeout(S.show,k.delay.show)},hide:function(){S.verbose("Delaying hide event to ensure user intent"),clearTimeout(S.timer),S.timer=setTimeout(S.hide,k.delay.hide)}},escape:{value:function(t){var n=e.isArray(t),i="string"==typeof t,o=!i&&!n,a=i&&-1!==t.search(O.quote),r=[];return o||!a?t:(S.debug("Encoding quote values for use in select",t),n?(e.each(t,function(e,t){r.push(t.replace(O.quote,"&quot;"))}),r):t.replace(O.quote,"&quot;"))},string:function(e){return(e=String(e)).replace(O.escape,"\\$&")}},setting:function(t,n){if(S.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,k,t);else{if(n===i)return k[t];e.isPlainObject(k[t])?e.extend(!0,k[t],n):k[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,S,t);else{if(n===i)return S[t];S[t]=n}},debug:function(){!k.silent&&k.debug&&(k.performance?S.performance.log(arguments):(S.debug=Function.prototype.bind.call(console.info,console,k.name+":"),S.debug.apply(console,arguments)))},verbose:function(){!k.silent&&k.verbose&&k.debug&&(k.performance?S.performance.log(arguments):(S.verbose=Function.prototype.bind.call(console.info,console,k.name+":"),S.verbose.apply(console,arguments)))},error:function(){k.silent||(S.error=Function.prototype.bind.call(console.error,console,k.name+":"),S.error.apply(console,arguments))},performance:{log:function(e){var t,n;k.performance&&(n=(t=(new Date).getTime())-(u||t),u=t,d.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:K,"Execution Time":n})),clearTimeout(S.performance.timer),S.performance.timer=setTimeout(S.performance.display,500)},display:function(){var t=k.name+":",n=0;u=!1,clearTimeout(S.performance.timer),e.each(d,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",l&&(t+=" '"+l+"'"),(console.group!==i||console.table!==i)&&d.length>0&&(console.groupCollapsed(t),console.table?console.table(d):e.each(d,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),d=[]}},invoke:function(t,n,o){var r,s,l,c=J;return n=n||g,o=K||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(S.error(q.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},m?(J===i&&S.initialize(),S.invoke(f)):(J!==i&&J.invoke("destroy"),S.initialize())}),a!==i?a:r},e.fn.dropdown.settings={silent:!1,debug:!1,verbose:!1,performance:!0,on:"click",action:"activate",values:!1,apiSettings:!1,selectOnKeydown:!0,minCharacters:0,filterRemoteData:!1,saveRemoteData:!0,throttle:200,context:t,direction:"auto",keepOnScreen:!0,match:"both",fullTextSearch:!1,placeholder:"auto",preserveHTML:!0,sortSelect:!1,forceSelection:!0,allowAdditions:!1,ignoreCase:!1,hideAdditions:!0,maxSelections:!1,useLabels:!0,delimiter:",",showOnFocus:!0,allowReselection:!1,allowTab:!0,allowCategorySelection:!1,fireOnInit:!1,transition:"auto",duration:200,glyphWidth:1.037,label:{transition:"scale",duration:200,variation:!1},delay:{hide:300,show:200,search:20,touch:50},onChange:function(e,t,n){},onAdd:function(e,t,n){},onRemove:function(e,t,n){},onLabelSelect:function(e){},onLabelCreate:function(t,n){return e(this)},onLabelRemove:function(e){return!0},onNoResults:function(e){return!0},onShow:function(){},onHide:function(){},name:"Dropdown",namespace:"dropdown",message:{addResult:"Add <b>{term}</b>",count:"{count} selected",maxSelections:"Max {maxCount} selections",noResults:"No results found.",serverError:"There was an error contacting the server"},error:{action:"You called a dropdown action that was not defined",alreadySetup:"Once a select has been initialized behaviors must be called on the created ui dropdown",labels:"Allowing user additions currently requires the use of labels.",missingMultiple:"<select> requires multiple property to be set to correctly preserve multiple values",method:"The method you called is not defined.",noAPI:"The API module is required to load resources remotely",noStorage:"Saving remote data requires session storage",noTransition:"This module requires ui transitions <https://github.com/Semantic-Org/UI-Transition>"},regExp:{escape:/[-[\]{}()*+?.,\\^$|#\s]/g,quote:/"/g},metadata:{defaultText:"defaultText",defaultValue:"defaultValue",placeholderText:"placeholder",text:"text",value:"value"},fields:{remoteValues:"results",values:"values",disabled:"disabled",name:"name",value:"value",text:"text"},keys:{backspace:8,delimiter:188,deleteKey:46,enter:13,escape:27,pageUp:33,pageDown:34,leftArrow:37,upArrow:38,rightArrow:39,downArrow:40},selector:{addition:".addition",dropdown:".ui.dropdown",hidden:".hidden",icon:"> .dropdown.icon",input:'> input[type="hidden"], > select',item:".item",label:"> .label",remove:"> .label > .delete.icon",siblingLabel:".label",menu:".menu",message:".message",menuIcon:".dropdown.icon",search:"input.search, .menu > .search > input, .menu input.search",sizer:"> input.sizer",text:"> .text:not(.icon)",unselectable:".disabled, .filtered"},className:{active:"active",addition:"addition",animating:"animating",disabled:"disabled",empty:"empty",dropdown:"ui dropdown",filtered:"filtered",hidden:"hidden transition",item:"item",label:"ui label",loading:"loading",menu:"menu",message:"message",multiple:"multiple",placeholder:"default",sizer:"sizer",search:"search",selected:"selected",selection:"selection",upward:"upward",leftward:"left",visible:"visible"}},e.fn.dropdown.settings.templates={dropdown:function(t){var n=t.placeholder||!1,i=(t.values,"");return i+='<i class="dropdown icon"></i>',t.placeholder?i+='<div class="default text">'+n+"</div>":i+='<div class="text"></div>',i+='<div class="menu">',e.each(t.values,function(e,t){i+=t.disabled?'<div class="disabled item" data-value="'+t.value+'">'+t.name+"</div>":'<div class="item" data-value="'+t.value+'">'+t.name+"</div>"}),i+="</div>"},menu:function(t,n){var i=t[n.values]||{},o="";return e.each(i,function(e,t){var i=t[n.text]?'data-text="'+t[n.text]+'"':"",a=t[n.disabled]?"disabled ":"";o+='<div class="'+a+'item" data-value="'+t[n.value]+'"'+i+">",o+=t[n.name],o+="</div>"}),o},label:function(e,t){return t+'<i class="delete icon"></i>'},message:function(e){return e},addition:function(e){return e}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.embed=function(n){var o,a=e(this),r=a.selector||"",s=(new Date).getTime(),l=[],c=arguments[0],u="string"==typeof c,d=[].slice.call(arguments,1);return a.each(function(){var f,m=e.isPlainObject(n)?e.extend(!0,{},e.fn.embed.settings,n):e.extend({},e.fn.embed.settings),g=m.selector,p=m.className,h=m.sources,v=m.error,b=m.metadata,y=m.namespace,x=m.templates,C="."+y,w="module-"+y,S=(e(t),e(this)),k=(S.find(g.placeholder),S.find(g.icon),S.find(g.embed)),T=this,A=S.data(w);f={initialize:function(){f.debug("Initializing embed"),f.determine.autoplay(),f.create(),f.bind.events(),f.instantiate()},instantiate:function(){f.verbose("Storing instance of module",f),A=f,S.data(w,f)},destroy:function(){f.verbose("Destroying previous instance of embed"),f.reset(),S.removeData(w).off(C)},refresh:function(){f.verbose("Refreshing selector cache"),S.find(g.placeholder),S.find(g.icon),k=S.find(g.embed)},bind:{events:function(){f.has.placeholder()&&(f.debug("Adding placeholder events"),S.on("click"+C,g.placeholder,f.createAndShow).on("click"+C,g.icon,f.createAndShow))}},create:function(){f.get.placeholder()?f.createPlaceholder():f.createAndShow()},createPlaceholder:function(e){var t=f.get.icon(),n=f.get.url();f.generate.embed(n);e=e||f.get.placeholder(),S.html(x.placeholder(e,t)),f.debug("Creating placeholder for embed",e,t)},createEmbed:function(t){f.refresh(),t=t||f.get.url(),k=e("<div/>").addClass(p.embed).html(f.generate.embed(t)).appendTo(S),m.onCreate.call(T,t),f.debug("Creating embed object",k)},changeEmbed:function(e){k.html(f.generate.embed(e))},createAndShow:function(){f.createEmbed(),f.show()},change:function(e,t,n){f.debug("Changing video to ",e,t,n),S.data(b.source,e).data(b.id,t),n?S.data(b.url,n):S.removeData(b.url),f.has.embed()?f.changeEmbed():f.create()},reset:function(){f.debug("Clearing embed and showing placeholder"),f.remove.active(),f.remove.embed(),f.showPlaceholder(),m.onReset.call(T)},show:function(){f.debug("Showing embed"),f.set.active(),m.onDisplay.call(T)},hide:function(){f.debug("Hiding embed"),f.showPlaceholder()},showPlaceholder:function(){f.debug("Showing placeholder image"),f.remove.active(),m.onPlaceholderDisplay.call(T)},get:{id:function(){return m.id||S.data(b.id)},placeholder:function(){return m.placeholder||S.data(b.placeholder)},icon:function(){return m.icon?m.icon:S.data(b.icon)!==i?S.data(b.icon):f.determine.icon()},source:function(e){return m.source?m.source:S.data(b.source)!==i?S.data(b.source):f.determine.source()},type:function(){var e=f.get.source();return h[e]!==i&&h[e].type},url:function(){return m.url?m.url:S.data(b.url)!==i?S.data(b.url):f.determine.url()}},determine:{autoplay:function(){f.should.autoplay()&&(m.autoplay=!0)},source:function(t){var n=!1;return(t=t||f.get.url())&&e.each(h,function(e,i){if(-1!==t.search(i.domain))return n=e,!1}),n},icon:function(){var e=f.get.source();return h[e]!==i&&h[e].icon},url:function(){var e,t=m.id||S.data(b.id),n=m.source||S.data(b.source);return(e=h[n]!==i&&h[n].url.replace("{id}",t))&&S.data(b.url,e),e}},set:{active:function(){S.addClass(p.active)}},remove:{active:function(){S.removeClass(p.active)},embed:function(){k.empty()}},encode:{parameters:function(e){var t,n=[];for(t in e)n.push(encodeURIComponent(t)+"="+encodeURIComponent(e[t]));return n.join("&amp;")}},generate:{embed:function(e){f.debug("Generating embed html");var t,n,i=f.get.source();return(e=f.get.url(e))?(n=f.generate.parameters(i),t=x.iframe(e,n)):f.error(v.noURL,S),t},parameters:function(t,n){var o=h[t]&&h[t].parameters!==i?h[t].parameters(m):{};return(n=n||m.parameters)&&(o=e.extend({},o,n)),o=m.onEmbed(o),f.encode.parameters(o)}},has:{embed:function(){return k.length>0},placeholder:function(){return m.placeholder||S.data(b.placeholder)}},should:{autoplay:function(){return"auto"===m.autoplay?m.placeholder||S.data(b.placeholder)!==i:m.autoplay}},is:{video:function(){return"video"==f.get.type()}},setting:function(t,n){if(f.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,m,t);else{if(n===i)return m[t];e.isPlainObject(m[t])?e.extend(!0,m[t],n):m[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,f,t);else{if(n===i)return f[t];f[t]=n}},debug:function(){!m.silent&&m.debug&&(m.performance?f.performance.log(arguments):(f.debug=Function.prototype.bind.call(console.info,console,m.name+":"),f.debug.apply(console,arguments)))},verbose:function(){!m.silent&&m.verbose&&m.debug&&(m.performance?f.performance.log(arguments):(f.verbose=Function.prototype.bind.call(console.info,console,m.name+":"),f.verbose.apply(console,arguments)))},error:function(){m.silent||(f.error=Function.prototype.bind.call(console.error,console,m.name+":"),f.error.apply(console,arguments))},performance:{log:function(e){var t,n;m.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:T,"Execution Time":n})),clearTimeout(f.performance.timer),f.performance.timer=setTimeout(f.performance.display,500)},display:function(){var t=m.name+":",n=0;s=!1,clearTimeout(f.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",r&&(t+=" '"+r+"'"),a.length>1&&(t+=" ("+a.length+")"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,a){var r,s,l,c=A;return n=n||d,a=T||a,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(f.error(v.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(a,n):s!==i&&(l=s),e.isArray(o)?o.push(l):o!==i?o=[o,l]:l!==i&&(o=l),s}},u?(A===i&&f.initialize(),f.invoke(c)):(A!==i&&A.invoke("destroy"),f.initialize())}),o!==i?o:this},e.fn.embed.settings={name:"Embed",namespace:"embed",silent:!1,debug:!1,verbose:!1,performance:!0,icon:!1,source:!1,url:!1,id:!1,autoplay:"auto",color:"#444444",hd:!0,brandedUI:!1,parameters:!1,onDisplay:function(){},onPlaceholderDisplay:function(){},onReset:function(){},onCreate:function(e){},onEmbed:function(e){return e},metadata:{id:"id",icon:"icon",placeholder:"placeholder",source:"source",url:"url"},error:{noURL:"No URL specified",method:"The method you called is not defined"},className:{active:"active",embed:"embed"},selector:{embed:".embed",placeholder:".placeholder",icon:".icon"},sources:{youtube:{name:"youtube",type:"video",icon:"video play",domain:"youtube.com",url:"//www.youtube.com/embed/{id}",parameters:function(e){return{autohide:!e.brandedUI,autoplay:e.autoplay,color:e.color||i,hq:e.hd,jsapi:e.api,modestbranding:!e.brandedUI}}},vimeo:{name:"vimeo",type:"video",icon:"video play",domain:"vimeo.com",url:"//player.vimeo.com/video/{id}",parameters:function(e){return{api:e.api,autoplay:e.autoplay,byline:e.brandedUI,color:e.color||i,portrait:e.brandedUI,title:e.brandedUI}}}},templates:{iframe:function(e,t){var n=e;return t&&(n+="?"+t),'<iframe src="'+n+'" width="100%" height="100%" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'},placeholder:function(e,t){var n="";return t&&(n+='<i class="'+t+' icon"></i>'),e&&(n+='<img class="placeholder" src="'+e+'">'),n}},api:!1,onPause:function(){},onPlay:function(){},onStop:function(){}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.modal=function(o){var a,r=e(this),s=e(t),l=e(n),c=e("body"),u=r.selector||"",d=(new Date).getTime(),f=[],m=arguments[0],g="string"==typeof m,p=[].slice.call(arguments,1),h=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)};return r.each(function(){var r,v,b,y,x,C,w,S,k,T=e.isPlainObject(o)?e.extend(!0,{},e.fn.modal.settings,o):e.extend({},e.fn.modal.settings),A=T.selector,R=T.className,P=T.namespace,E=T.error,F="."+P,O="module-"+P,D=e(this),q=e(T.context),j=D.find(A.close),z=this,I=D.data(O),M=!1;k={initialize:function(){k.verbose("Initializing dimmer",q),k.create.id(),k.create.dimmer(),k.refreshModals(),k.bind.events(),T.observeChanges&&k.observeChanges(),k.instantiate()},instantiate:function(){k.verbose("Storing instance of modal"),I=k,D.data(O,I)},create:{dimmer:function(){var t={debug:T.debug,variation:!T.centered&&"top aligned",dimmerName:"modals"},n=e.extend(!0,t,T.dimmerSettings);e.fn.dimmer!==i?(k.debug("Creating dimmer"),y=q.dimmer(n),T.detachable?(k.verbose("Modal is detachable, moving content into dimmer"),y.dimmer("add content",D)):k.set.undetached(),x=y.dimmer("get dimmer")):k.error(E.dimmer)},id:function(){w=(Math.random().toString(16)+"000000000").substr(2,8),C="."+w,k.verbose("Creating unique id for element",w)}},destroy:function(){k.verbose("Destroying previous modal"),D.removeData(O).off(F),s.off(C),x.off(C),j.off(F),q.dimmer("destroy")},observeChanges:function(){"MutationObserver"in t&&((S=new MutationObserver(function(e){k.debug("DOM tree modified, refreshing"),k.refresh()})).observe(z,{childList:!0,subtree:!0}),k.debug("Setting up mutation observer",S))},refresh:function(){k.remove.scrolling(),k.cacheSizes(),k.set.screenHeight(),k.set.type()},refreshModals:function(){v=D.siblings(A.modal),r=v.add(D)},attachEvents:function(t,n){var i=e(t);n=e.isFunction(k[n])?k[n]:k.toggle,i.length>0?(k.debug("Attaching modal events to element",t,n),i.off(F).on("click"+F,n)):k.error(E.notFound,t)},bind:{events:function(){k.verbose("Attaching events"),D.on("click"+F,A.close,k.event.close).on("click"+F,A.approve,k.event.approve).on("click"+F,A.deny,k.event.deny),s.on("resize"+C,k.event.resize)}},get:{id:function(){return(Math.random().toString(16)+"000000000").substr(2,8)}},event:{approve:function(){M||!1===T.onApprove.call(z,e(this))?k.verbose("Approve callback returned false cancelling hide"):(M=!0,k.hide(function(){M=!1}))},deny:function(){M||!1===T.onDeny.call(z,e(this))?k.verbose("Deny callback returned false cancelling hide"):(M=!0,k.hide(function(){M=!1}))},close:function(){k.hide()},click:function(t){if(T.closable){var i=e(t.target).closest(A.modal).length>0,o=e.contains(n.documentElement,t.target);!i&&o&&k.is.active()&&(k.debug("Dimmer clicked, hiding all modals"),k.remove.clickaway(),T.allowMultiple?k.hide():k.hideAll())}else k.verbose("Dimmer clicked but closable setting is disabled")},debounce:function(e,t){clearTimeout(k.timer),k.timer=setTimeout(e,t)},keyboard:function(e){27==e.which&&(T.closable?(k.debug("Escape key pressed hiding modal"),k.hide()):k.debug("Escape key pressed, but closable is set to false"),e.preventDefault())},resize:function(){y.dimmer("is active")&&(k.is.animating()||k.is.active())&&h(k.refresh)}},toggle:function(){k.is.active()||k.is.animating()?k.hide():k.show()},show:function(t){t=e.isFunction(t)?t:function(){},k.refreshModals(),k.set.dimmerSettings(),k.showModal(t)},hide:function(t){t=e.isFunction(t)?t:function(){},k.refreshModals(),k.hideModal(t)},showModal:function(t){t=e.isFunction(t)?t:function(){},k.is.animating()||!k.is.active()?(k.showDimmer(),k.cacheSizes(),k.set.screenHeight(),k.set.type(),k.set.clickaway(),!T.allowMultiple&&k.others.active()?k.hideOthers(k.showModal):(T.allowMultiple&&T.detachable&&D.detach().appendTo(x),T.onShow.call(z),T.transition&&e.fn.transition!==i&&D.transition("is supported")?(k.debug("Showing modal with css animations"),D.transition({debug:T.debug,animation:T.transition+" in",queue:T.queue,duration:T.duration,useFailSafe:!0,onComplete:function(){T.onVisible.apply(z),T.keyboardShortcuts&&k.add.keyboardShortcuts(),k.save.focus(),k.set.active(),T.autofocus&&k.set.autofocus(),t()}})):k.error(E.noTransition))):k.debug("Modal is already visible")},hideModal:function(t,n){t=e.isFunction(t)?t:function(){},k.debug("Hiding modal"),!1!==T.onHide.call(z,e(this))?(k.is.animating()||k.is.active())&&(T.transition&&e.fn.transition!==i&&D.transition("is supported")?(k.remove.active(),D.transition({debug:T.debug,animation:T.transition+" out",queue:T.queue,duration:T.duration,useFailSafe:!0,onStart:function(){k.others.active()||n||k.hideDimmer(),T.keyboardShortcuts&&k.remove.keyboardShortcuts()},onComplete:function(){T.onHidden.call(z),k.restore.focus(),t()}})):k.error(E.noTransition)):k.verbose("Hide callback returned false cancelling hide")},showDimmer:function(){y.dimmer("is animating")||!y.dimmer("is active")?(k.debug("Showing dimmer"),y.dimmer("show")):k.debug("Dimmer already visible")},hideDimmer:function(){y.dimmer("is animating")||y.dimmer("is active")?y.dimmer("hide",function(){k.remove.clickaway(),k.remove.screenHeight()}):k.debug("Dimmer is not visible cannot hide")},hideAll:function(t){var n=r.filter("."+R.active+", ."+R.animating);t=e.isFunction(t)?t:function(){},n.length>0&&(k.debug("Hiding all visible modals"),k.hideDimmer(),n.modal("hide modal",t))},hideOthers:function(t){var n=v.filter("."+R.active+", ."+R.animating);t=e.isFunction(t)?t:function(){},n.length>0&&(k.debug("Hiding other modals",v),n.modal("hide modal",t,!0))},others:{active:function(){return v.filter("."+R.active).length>0},animating:function(){return v.filter("."+R.animating).length>0}},add:{keyboardShortcuts:function(){k.verbose("Adding keyboard shortcuts"),l.on("keyup"+F,k.event.keyboard)}},save:{focus:function(){e(n.activeElement).closest(D).length>0||(b=e(n.activeElement).blur())}},restore:{focus:function(){b&&b.length>0&&b.focus()}},remove:{active:function(){D.removeClass(R.active)},clickaway:function(){x.off("click"+C)},bodyStyle:function(){""===c.attr("style")&&(k.verbose("Removing style attribute"),c.removeAttr("style"))},screenHeight:function(){k.debug("Removing page height"),c.css("height","")},keyboardShortcuts:function(){k.verbose("Removing keyboard shortcuts"),l.off("keyup"+F)},scrolling:function(){y.removeClass(R.scrolling),D.removeClass(R.scrolling)}},cacheSizes:function(){D.addClass(R.loading);var o=D.prop("scrollHeight"),a=D.outerHeight();k.cache!==i&&0===a||(k.cache={pageHeight:e(n).outerHeight(),height:a+T.offset,scrollHeight:o+T.offset,contextHeight:"body"==T.context?e(t).height():y.height()},k.cache.topOffset=-k.cache.height/2),D.removeClass(R.loading),k.debug("Caching modal and container sizes",k.cache)},can:{fit:function(){var e=k.cache.contextHeight,t=k.cache.contextHeight/2,n=k.cache.topOffset,i=k.cache.scrollHeight,o=k.cache.height,a=T.padding;return i>o?t+n+i+a<e:o+2*a<e}},is:{active:function(){return D.hasClass(R.active)},animating:function(){return D.transition("is supported")?D.transition("is animating"):D.is(":visible")},scrolling:function(){return y.hasClass(R.scrolling)},modernBrowser:function(){return!(t.ActiveXObject||"ActiveXObject"in t)}},set:{autofocus:function(){var e=D.find("[tabindex], :input").filter(":visible"),t=e.filter("[autofocus]"),n=t.length>0?t.first():e.first();n.length>0&&n.focus()},clickaway:function(){x.on("click"+C,k.event.click)},dimmerSettings:function(){if(e.fn.dimmer!==i){var t={debug:T.debug,dimmerName:"modals",closable:"auto",variation:!T.centered&&"top aligned",duration:{show:T.duration,hide:T.duration}},n=e.extend(!0,t,T.dimmerSettings);T.inverted?(n.variation=n.variation!==i?n.variation+" inverted":"inverted",x.addClass(R.inverted)):x.removeClass(R.inverted),T.blurring?y.addClass(R.blurring):y.removeClass(R.blurring),q.dimmer("setting",n)}else k.error(E.dimmer)},screenHeight:function(){k.can.fit()?c.css("height",""):(k.debug("Modal is taller than page content, resizing page height"),c.css("height",k.cache.height+2*T.padding))},active:function(){D.addClass(R.active)},scrolling:function(){y.addClass(R.scrolling),D.addClass(R.scrolling)},type:function(){k.can.fit()?(k.verbose("Modal fits on screen"),k.others.active()||k.others.animating()||k.remove.scrolling()):(k.verbose("Modal cannot fit on screen setting to scrolling"),k.set.scrolling())},undetached:function(){y.addClass(R.undetached)}},setting:function(t,n){if(k.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,T,t);else{if(n===i)return T[t];e.isPlainObject(T[t])?e.extend(!0,T[t],n):T[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,k,t);else{if(n===i)return k[t];k[t]=n}},debug:function(){!T.silent&&T.debug&&(T.performance?k.performance.log(arguments):(k.debug=Function.prototype.bind.call(console.info,console,T.name+":"),k.debug.apply(console,arguments)))},verbose:function(){!T.silent&&T.verbose&&T.debug&&(T.performance?k.performance.log(arguments):(k.verbose=Function.prototype.bind.call(console.info,console,T.name+":"),k.verbose.apply(console,arguments)))},error:function(){T.silent||(k.error=Function.prototype.bind.call(console.error,console,T.name+":"),k.error.apply(console,arguments))},performance:{log:function(e){var t,n;T.performance&&(n=(t=(new Date).getTime())-(d||t),d=t,f.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:z,"Execution Time":n})),clearTimeout(k.performance.timer),k.performance.timer=setTimeout(k.performance.display,500)},display:function(){var t=T.name+":",n=0;d=!1,clearTimeout(k.performance.timer),e.each(f,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",u&&(t+=" '"+u+"'"),(console.group!==i||console.table!==i)&&f.length>0&&(console.groupCollapsed(t),console.table?console.table(f):e.each(f,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),f=[]}},invoke:function(t,n,o){var r,s,l,c=I;return n=n||p,o=z||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},g?(I===i&&k.initialize(),k.invoke(m)):(I!==i&&I.invoke("destroy"),k.initialize())}),a!==i?a:this},e.fn.modal.settings={name:"Modal",namespace:"modal",silent:!1,debug:!1,verbose:!1,performance:!0,observeChanges:!1,allowMultiple:!1,detachable:!0,closable:!0,autofocus:!0,inverted:!1,blurring:!1,centered:!0,dimmerSettings:{closable:!1,useCSS:!0},keyboardShortcuts:!0,context:"body",queue:!1,duration:500,offset:0,transition:"scale",padding:50,onShow:function(){},onVisible:function(){},onHide:function(){return!0},onHidden:function(){},onApprove:function(){return!0},onDeny:function(){return!0},selector:{close:"> .close",approve:".actions .positive, .actions .approve, .actions .ok",deny:".actions .negative, .actions .deny, .actions .cancel",modal:".ui.modal"},error:{dimmer:"UI Dimmer, a required component is not included in this page",method:"The method you called is not defined.",notFound:"The element you specified could not be found"},className:{active:"active",animating:"animating",blurring:"blurring",inverted:"inverted",loading:"loading",scrolling:"scrolling",undetached:"undetached"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.nag=function(n){var o,a=e(this),r=a.selector||"",s=(new Date).getTime(),l=[],c=arguments[0],u="string"==typeof c,d=[].slice.call(arguments,1);return a.each(function(){var a,f=e.isPlainObject(n)?e.extend(!0,{},e.fn.nag.settings,n):e.extend({},e.fn.nag.settings),m=(f.className,f.selector),g=f.error,p=f.namespace,h="."+p,v=p+"-module",b=e(this),y=(b.find(m.close),f.context?e(f.context):e("body")),x=this,C=b.data(v);t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame;a={initialize:function(){a.verbose("Initializing element"),b.on("click"+h,m.close,a.dismiss).data(v,a),f.detachable&&b.parent()[0]!==y[0]&&b.detach().prependTo(y),f.displayTime>0&&setTimeout(a.hide,f.displayTime),a.show()},destroy:function(){a.verbose("Destroying instance"),b.removeData(v).off(h)},show:function(){a.should.show()&&!b.is(":visible")&&(a.debug("Showing nag",f.animation.show),"fade"==f.animation.show?b.fadeIn(f.duration,f.easing):b.slideDown(f.duration,f.easing))},hide:function(){a.debug("Showing nag",f.animation.hide),"fade"==f.animation.show?b.fadeIn(f.duration,f.easing):b.slideUp(f.duration,f.easing)},onHide:function(){a.debug("Removing nag",f.animation.hide),b.remove(),f.onHide&&f.onHide()},dismiss:function(e){f.storageMethod&&a.storage.set(f.key,f.value),a.hide(),e.stopImmediatePropagation(),e.preventDefault()},should:{show:function(){return f.persist?(a.debug("Persistent nag is set, can show nag"),!0):a.storage.get(f.key)!=f.value.toString()?(a.debug("Stored value is not set, can show nag",a.storage.get(f.key)),!0):(a.debug("Stored value is set, cannot show nag",a.storage.get(f.key)),!1)}},get:{storageOptions:function(){var e={};return f.expires&&(e.expires=f.expires),f.domain&&(e.domain=f.domain),f.path&&(e.path=f.path),e}},clear:function(){a.storage.remove(f.key)},storage:{set:function(n,o){var r=a.get.storageOptions();if("localstorage"==f.storageMethod&&t.localStorage!==i)t.localStorage.setItem(n,o),a.debug("Value stored using local storage",n,o);else if("sessionstorage"==f.storageMethod&&t.sessionStorage!==i)t.sessionStorage.setItem(n,o),a.debug("Value stored using session storage",n,o);else{if(e.cookie===i)return void a.error(g.noCookieStorage);e.cookie(n,o,r),a.debug("Value stored using cookie",n,o,r)}},get:function(n,o){var r;return"localstorage"==f.storageMethod&&t.localStorage!==i?r=t.localStorage.getItem(n):"sessionstorage"==f.storageMethod&&t.sessionStorage!==i?r=t.sessionStorage.getItem(n):e.cookie!==i?r=e.cookie(n):a.error(g.noCookieStorage),"undefined"!=r&&"null"!=r&&r!==i&&null!==r||(r=i),r},remove:function(n){var o=a.get.storageOptions();"localstorage"==f.storageMethod&&t.localStorage!==i?t.localStorage.removeItem(n):"sessionstorage"==f.storageMethod&&t.sessionStorage!==i?t.sessionStorage.removeItem(n):e.cookie!==i?e.removeCookie(n,o):a.error(g.noStorage)}},setting:function(t,n){if(a.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,f,t);else{if(n===i)return f[t];e.isPlainObject(f[t])?e.extend(!0,f[t],n):f[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,a,t);else{if(n===i)return a[t];a[t]=n}},debug:function(){!f.silent&&f.debug&&(f.performance?a.performance.log(arguments):(a.debug=Function.prototype.bind.call(console.info,console,f.name+":"),a.debug.apply(console,arguments)))},verbose:function(){!f.silent&&f.verbose&&f.debug&&(f.performance?a.performance.log(arguments):(a.verbose=Function.prototype.bind.call(console.info,console,f.name+":"),a.verbose.apply(console,arguments)))},error:function(){f.silent||(a.error=Function.prototype.bind.call(console.error,console,f.name+":"),a.error.apply(console,arguments))},performance:{log:function(e){var t,n;f.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:x,"Execution Time":n})),clearTimeout(a.performance.timer),a.performance.timer=setTimeout(a.performance.display,500)},display:function(){var t=f.name+":",n=0;s=!1,clearTimeout(a.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",r&&(t+=" '"+r+"'"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,r){var s,l,c,u=C;return n=n||d,r=x||r,"string"==typeof t&&u!==i&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(n,o){var r=n!=s?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(u[r])&&n!=s)u=u[r];else{if(u[r]!==i)return l=u[r],!1;if(!e.isPlainObject(u[o])||n==s)return u[o]!==i?(l=u[o],!1):(a.error(g.method,t),!1);u=u[o]}})),e.isFunction(l)?c=l.apply(r,n):l!==i&&(c=l),e.isArray(o)?o.push(c):o!==i?o=[o,c]:c!==i&&(o=c),l}},u?(C===i&&a.initialize(),a.invoke(c)):(C!==i&&C.invoke("destroy"),a.initialize())}),o!==i?o:this},e.fn.nag.settings={name:"Nag",silent:!1,debug:!1,verbose:!1,performance:!0,namespace:"Nag",persist:!1,displayTime:0,animation:{show:"slide",hide:"slide"},context:!1,detachable:!1,expires:30,domain:!1,path:"/",storageMethod:"cookie",key:"nag",value:"dismiss",error:{noCookieStorage:"$.cookie is not included. A storage solution is required.",noStorage:"Neither $.cookie or store is defined. A storage solution is required for storing state",method:"The method you called is not defined."},className:{bottom:"bottom",fixed:"fixed"},selector:{close:".close.icon"},speed:500,easing:"easeOutQuad",onHide:function(){}},e.extend(e.easing,{easeOutQuad:function(e,t,n,i,o){return-i*(t/=o)*(t-2)+n}})}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.popup=function(o){var a,r=e(this),s=e(n),l=e(t),c=e("body"),u=r.selector||"",d=(new Date).getTime(),f=[],m=arguments[0],g="string"==typeof m,p=[].slice.call(arguments,1);return r.each(function(){var r,h,v,b,y,x,C=e.isPlainObject(o)?e.extend(!0,{},e.fn.popup.settings,o):e.extend({},e.fn.popup.settings),w=C.selector,S=C.className,k=C.error,T=C.metadata,A=C.namespace,R="."+C.namespace,P="module-"+A,E=e(this),F=e(C.context),O=e(C.scrollContext),D=e(C.boundary),q=C.target?e(C.target):E,j=0,z=!1,I=!1,M=this,L=E.data(P);x={initialize:function(){x.debug("Initializing",E),x.createID(),x.bind.events(),!x.exists()&&C.preserve&&x.create(),C.observeChanges&&x.observeChanges(),x.instantiate()},instantiate:function(){x.verbose("Storing instance",x),L=x,E.data(P,L)},observeChanges:function(){"MutationObserver"in t&&((v=new MutationObserver(x.event.documentChanged)).observe(n,{childList:!0,subtree:!0}),x.debug("Setting up mutation observer",v))},refresh:function(){C.popup?r=e(C.popup).eq(0):C.inline&&(r=q.nextAll(w.popup).eq(0),C.popup=r),C.popup?(r.addClass(S.loading),h=x.get.offsetParent(),r.removeClass(S.loading),C.movePopup&&x.has.popup()&&x.get.offsetParent(r)[0]!==h[0]&&(x.debug("Moving popup to the same offset parent as target"),r.detach().appendTo(h))):h=C.inline?x.get.offsetParent(q):x.has.popup()?x.get.offsetParent(r):c,h.is("html")&&h[0]!==c[0]&&(x.debug("Setting page as offset parent"),h=c),x.get.variation()&&x.set.variation()},reposition:function(){x.refresh(),x.set.position()},destroy:function(){x.debug("Destroying previous module"),v&&v.disconnect(),r&&!C.preserve&&x.removePopup(),clearTimeout(x.hideTimer),clearTimeout(x.showTimer),x.unbind.close(),x.unbind.events(),E.removeData(P)},event:{start:function(t){var n=e.isPlainObject(C.delay)?C.delay.show:C.delay;clearTimeout(x.hideTimer),I||(x.showTimer=setTimeout(x.show,n))},end:function(){var t=e.isPlainObject(C.delay)?C.delay.hide:C.delay;clearTimeout(x.showTimer),x.hideTimer=setTimeout(x.hide,t)},touchstart:function(e){I=!0,x.show()},resize:function(){x.is.visible()&&x.set.position()},documentChanged:function(t){[].forEach.call(t,function(t){t.removedNodes&&[].forEach.call(t.removedNodes,function(t){(t==M||e(t).find(M).length>0)&&(x.debug("Element removed from DOM, tearing down events"),x.destroy())})})},hideGracefully:function(t){var i=e(t.target),o=e.contains(n.documentElement,t.target),a=i.closest(w.popup).length>0;t&&!a&&o?(x.debug("Click occurred outside popup hiding popup"),x.hide()):x.debug("Click was inside popup, keeping popup open")}},create:function(){var t=x.get.html(),n=x.get.title(),i=x.get.content();t||i||n?(x.debug("Creating pop-up html"),t||(t=C.templates.popup({title:n,content:i})),r=e("<div/>").addClass(S.popup).data(T.activator,E).html(t),C.inline?(x.verbose("Inserting popup element inline",r),r.insertAfter(E)):(x.verbose("Appending popup element to body",r),r.appendTo(F)),x.refresh(),x.set.variation(),C.hoverable&&x.bind.popup(),C.onCreate.call(r,M)):0!==q.next(w.popup).length?(x.verbose("Pre-existing popup found"),C.inline=!0,C.popup=q.next(w.popup).data(T.activator,E),x.refresh(),C.hoverable&&x.bind.popup()):C.popup?(e(C.popup).data(T.activator,E),x.verbose("Used popup specified in settings"),x.refresh(),C.hoverable&&x.bind.popup()):x.debug("No content specified skipping display",M)},createID:function(){y=(Math.random().toString(16)+"000000000").substr(2,8),b="."+y,x.verbose("Creating unique id for element",y)},toggle:function(){x.debug("Toggling pop-up"),x.is.hidden()?(x.debug("Popup is hidden, showing pop-up"),x.unbind.close(),x.show()):(x.debug("Popup is visible, hiding pop-up"),x.hide())},show:function(e){if(e=e||function(){},x.debug("Showing pop-up",C.transition),x.is.hidden()&&(!x.is.active()||!x.is.dropdown())){if(x.exists()||x.create(),!1===C.onShow.call(r,M))return void x.debug("onShow callback returned false, cancelling popup animation");C.preserve||C.popup||x.refresh(),r&&x.set.position()&&(x.save.conditions(),C.exclusive&&x.hideAll(),x.animate.show(e))}},hide:function(e){if(e=e||function(){},x.is.visible()||x.is.animating()){if(!1===C.onHide.call(r,M))return void x.debug("onHide callback returned false, cancelling popup animation");x.remove.visible(),x.unbind.close(),x.restore.conditions(),x.animate.hide(e)}},hideAll:function(){e(w.popup).filter("."+S.popupVisible).each(function(){e(this).data(T.activator).popup("hide")})},exists:function(){return!!r&&(C.inline||C.popup?x.has.popup():r.closest(F).length>=1)},removePopup:function(){x.has.popup()&&!C.popup&&(x.debug("Removing popup",r),r.remove(),r=i,C.onRemove.call(r,M))},save:{conditions:function(){x.cache={title:E.attr("title")},x.cache.title&&E.removeAttr("title"),x.verbose("Saving original attributes",x.cache.title)}},restore:{conditions:function(){return x.cache&&x.cache.title&&(E.attr("title",x.cache.title),x.verbose("Restoring original attributes",x.cache.title)),!0}},supports:{svg:function(){return"undefined"==typeof SVGGraphicsElement}},animate:{show:function(t){t=e.isFunction(t)?t:function(){},C.transition&&e.fn.transition!==i&&E.transition("is supported")?(x.set.visible(),r.transition({animation:C.transition+" in",queue:!1,debug:C.debug,verbose:C.verbose,duration:C.duration,onComplete:function(){x.bind.close(),t.call(r,M),C.onVisible.call(r,M)}})):x.error(k.noTransition)},hide:function(t){t=e.isFunction(t)?t:function(){},x.debug("Hiding pop-up"),!1!==C.onHide.call(r,M)?C.transition&&e.fn.transition!==i&&E.transition("is supported")?r.transition({animation:C.transition+" out",queue:!1,duration:C.duration,debug:C.debug,verbose:C.verbose,onComplete:function(){x.reset(),t.call(r,M),C.onHidden.call(r,M)}}):x.error(k.noTransition):x.debug("onHide callback returned false, cancelling popup animation")}},change:{content:function(e){r.html(e)}},get:{html:function(){return E.removeData(T.html),E.data(T.html)||C.html},title:function(){return E.removeData(T.title),E.data(T.title)||C.title},content:function(){return E.removeData(T.content),E.data(T.content)||C.content||E.attr("title")},variation:function(){return E.removeData(T.variation),E.data(T.variation)||C.variation},popup:function(){return r},popupOffset:function(){return r.offset()},calculations:function(){var e,n=x.get.offsetParent(r),i=q[0],o=D[0]==t,a=C.inline||C.popup&&C.movePopup?q.position():q.offset(),s=o?{top:0,left:0}:D.offset(),c={},u=o?{top:l.scrollTop(),left:l.scrollLeft()}:{top:0,left:0};if(c={target:{element:q[0],width:q.outerWidth(),height:q.outerHeight(),top:a.top,left:a.left,margin:{}},popup:{width:r.outerWidth(),height:r.outerHeight()},parent:{width:h.outerWidth(),height:h.outerHeight()},screen:{top:s.top,left:s.left,scroll:{top:u.top,left:u.left},width:D.width(),height:D.height()}},n.get(0)!==h.get(0)){var d=n.offset();c.target.top-=d.top,c.target.left-=d.left,c.parent.width=n.outerWidth(),c.parent.height=n.outerHeight()}return C.setFluidWidth&&x.is.fluid()&&(c.container={width:r.parent().outerWidth()},c.popup.width=c.container.width),c.target.margin.top=C.inline?parseInt(t.getComputedStyle(i).getPropertyValue("margin-top"),10):0,c.target.margin.left=C.inline?x.is.rtl()?parseInt(t.getComputedStyle(i).getPropertyValue("margin-right"),10):parseInt(t.getComputedStyle(i).getPropertyValue("margin-left"),10):0,e=c.screen,c.boundary={top:e.top+e.scroll.top,bottom:e.top+e.scroll.top+e.height,left:e.left+e.scroll.left,right:e.left+e.scroll.left+e.width},c},id:function(){return y},startEvent:function(){return"hover"==C.on?"mouseenter":"focus"==C.on&&"focus"},scrollEvent:function(){return"scroll"},endEvent:function(){return"hover"==C.on?"mouseleave":"focus"==C.on&&"blur"},distanceFromBoundary:function(e,t){var n,i,o={};return n=(t=t||x.get.calculations()).popup,i=t.boundary,e&&(o={top:e.top-i.top,left:e.left-i.left,right:i.right-(e.left+n.width),bottom:i.bottom-(e.top+n.height)},x.verbose("Distance from boundaries determined",e,o)),o},offsetParent:function(t){var n=(t!==i?t[0]:q[0]).parentNode,o=e(n);if(n)for(var a="none"===o.css("transform"),r="static"===o.css("position"),s=o.is("body");n&&!s&&r&&a;)n=n.parentNode,a="none"===(o=e(n)).css("transform"),r="static"===o.css("position"),s=o.is("body");return o&&o.length>0?o:e()},positions:function(){return{"top left":!1,"top center":!1,"top right":!1,"bottom left":!1,"bottom center":!1,"bottom right":!1,"left center":!1,"right center":!1}},nextPosition:function(e){var t=e.split(" "),n=t[0],i=t[1],o="top"==n||"bottom"==n,a=!1,r=!1,s=!1;return z||(x.verbose("All available positions available"),z=x.get.positions()),x.debug("Recording last position tried",e),z[e]=!0,"opposite"===C.prefer&&(s=(s=[{top:"bottom",bottom:"top",left:"right",right:"left"}[n],i]).join(" "),a=!0===z[s],x.debug("Trying opposite strategy",s)),"adjacent"===C.prefer&&o&&(s=(s=[n,{left:"center",center:"right",right:"left"}[i]]).join(" "),r=!0===z[s],x.debug("Trying adjacent strategy",s)),(r||a)&&(x.debug("Using backup position",s),s={"top left":"top center","top center":"top right","top right":"right center","right center":"bottom right","bottom right":"bottom center","bottom center":"bottom left","bottom left":"left center","left center":"top left"}[e]),s}},set:{position:function(e,t){if(0!==q.length&&0!==r.length){var n,o,a,s,l,c,u,d;if(t=t||x.get.calculations(),e=e||E.data(T.position)||C.position,n=E.data(T.offset)||C.offset,o=C.distanceAway,a=t.target,s=t.popup,l=t.parent,x.should.centerArrow(t)&&(x.verbose("Adjusting offset to center arrow on small target element"),"top left"!=e&&"bottom left"!=e||(n+=a.width/2,n-=C.arrowPixelsFromEdge),"top right"!=e&&"bottom right"!=e||(n-=a.width/2,n+=C.arrowPixelsFromEdge)),0===a.width&&0===a.height&&!x.is.svg(a.element))return x.debug("Popup target is hidden, no action taken"),!1;switch(C.inline&&(x.debug("Adding margin to calculation",a.margin),"left center"==e||"right center"==e?(n+=a.margin.top,o+=-a.margin.left):"top left"==e||"top center"==e||"top right"==e?(n+=a.margin.left,o-=a.margin.top):(n+=a.margin.left,o+=a.margin.top)),x.debug("Determining popup position from calculations",e,t),x.is.rtl()&&(e=e.replace(/left|right/g,function(e){return"left"==e?"right":"left"}),x.debug("RTL: Popup position updated",e)),j==C.maxSearchDepth&&"string"==typeof C.lastResort&&(e=C.lastResort),e){case"top left":c={top:"auto",bottom:l.height-a.top+o,left:a.left+n,right:"auto"};break;case"top center":c={bottom:l.height-a.top+o,left:a.left+a.width/2-s.width/2+n,top:"auto",right:"auto"};break;case"top right":c={bottom:l.height-a.top+o,right:l.width-a.left-a.width-n,top:"auto",left:"auto"};break;case"left center":c={top:a.top+a.height/2-s.height/2+n,right:l.width-a.left+o,left:"auto",bottom:"auto"};break;case"right center":c={top:a.top+a.height/2-s.height/2+n,left:a.left+a.width+o,bottom:"auto",right:"auto"};break;case"bottom left":c={top:a.top+a.height+o,left:a.left+n,bottom:"auto",right:"auto"};break;case"bottom center":c={top:a.top+a.height+o,left:a.left+a.width/2-s.width/2+n,bottom:"auto",right:"auto"};break;case"bottom right":c={top:a.top+a.height+o,right:l.width-a.left-a.width-n,left:"auto",bottom:"auto"}}if(c===i&&x.error(k.invalidPosition,e),x.debug("Calculated popup positioning values",c),r.css(c).removeClass(S.position).addClass(e).addClass(S.loading),u=x.get.popupOffset(),d=x.get.distanceFromBoundary(u,t),x.is.offstage(d,e)){if(x.debug("Position is outside viewport",e),j<C.maxSearchDepth)return j++,e=x.get.nextPosition(e),x.debug("Trying new position",e),!!r&&x.set.position(e,t);if(!C.lastResort)return x.debug("Popup could not find a position to display",r),x.error(k.cannotPlace,M),x.remove.attempts(),x.remove.loading(),x.reset(),C.onUnplaceable.call(r,M),!1;x.debug("No position found, showing with last position")}return x.debug("Position is on stage",e),x.remove.attempts(),x.remove.loading(),C.setFluidWidth&&x.is.fluid()&&x.set.fluidWidth(t),!0}x.error(k.notFound)},fluidWidth:function(e){e=e||x.get.calculations(),x.debug("Automatically setting element width to parent width",e.parent.width),r.css("width",e.container.width)},variation:function(e){(e=e||x.get.variation())&&x.has.popup()&&(x.verbose("Adding variation to popup",e),r.addClass(e))},visible:function(){E.addClass(S.visible)}},remove:{loading:function(){r.removeClass(S.loading)},variation:function(e){(e=e||x.get.variation())&&(x.verbose("Removing variation",e),r.removeClass(e))},visible:function(){E.removeClass(S.visible)},attempts:function(){x.verbose("Resetting all searched positions"),j=0,z=!1}},bind:{events:function(){x.debug("Binding popup events to module"),"click"==C.on&&E.on("click"+R,x.toggle),"hover"==C.on&&E.on("touchstart"+R,x.event.touchstart),x.get.startEvent()&&E.on(x.get.startEvent()+R,x.event.start).on(x.get.endEvent()+R,x.event.end),C.target&&x.debug("Target set to element",q),l.on("resize"+b,x.event.resize)},popup:function(){x.verbose("Allowing hover events on popup to prevent closing"),r&&x.has.popup()&&r.on("mouseenter"+R,x.event.start).on("mouseleave"+R,x.event.end)},close:function(){(!0===C.hideOnScroll||"auto"==C.hideOnScroll&&"click"!=C.on)&&x.bind.closeOnScroll(),"hover"==C.on&&I&&x.bind.touchClose(),"click"==C.on&&C.closable&&x.bind.clickaway()},closeOnScroll:function(){x.verbose("Binding scroll close event to document"),O.one(x.get.scrollEvent()+b,x.event.hideGracefully)},touchClose:function(){x.verbose("Binding popup touchclose event to document"),s.on("touchstart"+b,function(e){x.verbose("Touched away from popup"),x.event.hideGracefully.call(M,e)})},clickaway:function(){x.verbose("Binding popup close event to document"),s.on("click"+b,function(e){x.verbose("Clicked away from popup"),x.event.hideGracefully.call(M,e)})}},unbind:{events:function(){l.off(b),E.off(R)},close:function(){s.off(b),O.off(b)}},has:{popup:function(){return r&&r.length>0}},should:{centerArrow:function(e){return!x.is.basic()&&e.target.width<=2*C.arrowPixelsFromEdge}},is:{offstage:function(t,n){var i=[];return e.each(t,function(e,t){t<-C.jitter&&(x.debug("Position exceeds allowable distance from edge",e,t,n),i.push(e))}),i.length>0},svg:function(e){return x.supports.svg()&&e instanceof SVGGraphicsElement},basic:function(){return E.hasClass(S.basic)},active:function(){return E.hasClass(S.active)},animating:function(){return r!==i&&r.hasClass(S.animating)},fluid:function(){return r!==i&&r.hasClass(S.fluid)},visible:function(){return r!==i&&r.hasClass(S.popupVisible)},dropdown:function(){return E.hasClass(S.dropdown)},hidden:function(){return!x.is.visible()},rtl:function(){return"rtl"==E.css("direction")}},reset:function(){x.remove.visible(),C.preserve?e.fn.transition!==i&&r.transition("remove transition"):x.removePopup()},setting:function(t,n){if(e.isPlainObject(t))e.extend(!0,C,t);else{if(n===i)return C[t];C[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,x,t);else{if(n===i)return x[t];x[t]=n}},debug:function(){!C.silent&&C.debug&&(C.performance?x.performance.log(arguments):(x.debug=Function.prototype.bind.call(console.info,console,C.name+":"),x.debug.apply(console,arguments)))},verbose:function(){!C.silent&&C.verbose&&C.debug&&(C.performance?x.performance.log(arguments):(x.verbose=Function.prototype.bind.call(console.info,console,C.name+":"),x.verbose.apply(console,arguments)))},error:function(){C.silent||(x.error=Function.prototype.bind.call(console.error,console,C.name+":"),x.error.apply(console,arguments))},performance:{log:function(e){var t,n;C.performance&&(n=(t=(new Date).getTime())-(d||t),d=t,f.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:M,"Execution Time":n})),clearTimeout(x.performance.timer),x.performance.timer=setTimeout(x.performance.display,500)},display:function(){var t=C.name+":",n=0;d=!1,clearTimeout(x.performance.timer),e.each(f,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",u&&(t+=" '"+u+"'"),(console.group!==i||console.table!==i)&&f.length>0&&(console.groupCollapsed(t),console.table?console.table(f):e.each(f,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),f=[]}},invoke:function(t,n,o){var r,s,l,c=L;return n=n||p,o=M||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},g?(L===i&&x.initialize(),x.invoke(m)):(L!==i&&L.invoke("destroy"),x.initialize())}),a!==i?a:this},e.fn.popup.settings={name:"Popup",silent:!1,debug:!1,verbose:!1,performance:!0,namespace:"popup",observeChanges:!0,onCreate:function(){},onRemove:function(){},onShow:function(){},onVisible:function(){},onHide:function(){},onUnplaceable:function(){},onHidden:function(){},on:"hover",boundary:t,addTouchEvents:!0,position:"top left",variation:"",movePopup:!0,target:!1,popup:!1,inline:!1,preserve:!1,hoverable:!1,content:!1,html:!1,title:!1,closable:!0,hideOnScroll:"auto",exclusive:!1,context:"body",scrollContext:t,prefer:"opposite",lastResort:!1,arrowPixelsFromEdge:20,delay:{show:50,hide:70},setFluidWidth:!0,duration:200,transition:"scale",distanceAway:0,jitter:2,offset:0,maxSearchDepth:15,error:{invalidPosition:"The position you specified is not a valid position",cannotPlace:"Popup does not fit within the boundaries of the viewport",method:"The method you called is not defined.",noTransition:"This module requires ui transitions <https://github.com/Semantic-Org/UI-Transition>",notFound:"The target or popup you specified does not exist on the page"},metadata:{activator:"activator",content:"content",html:"html",offset:"offset",position:"position",title:"title",variation:"variation"},className:{active:"active",basic:"basic",animating:"animating",dropdown:"dropdown",fluid:"fluid",loading:"loading",popup:"ui popup",position:"top left center bottom right",visible:"visible",popupVisible:"visible"},selector:{popup:".ui.popup"},templates:{escape:function(e){var t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};return/[&<>"'`]/.test(e)?e.replace(/[&<>"'`]/g,function(e){return t[e]}):e},popup:function(t){var n="",o=e.fn.popup.settings.templates.escape;return typeof t!==i&&(typeof t.title!==i&&t.title&&(t.title=o(t.title),n+='<div class="header">'+t.title+"</div>"),typeof t.content!==i&&t.content&&(t.content=o(t.content),n+='<div class="content">'+t.content+"</div>")),n}}}}(jQuery,window,document),function(e,t,n,i){"use strict";void 0!==(t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")())&&t.Math==Math||("undefined"!=typeof self&&self.Math==Math?self:Function("return this")());e.fn.progress=function(t){var o,a=e(this),r=a.selector||"",s=(new Date).getTime(),l=[],c=arguments[0],u="string"==typeof c,d=[].slice.call(arguments,1);return a.each(function(){var a,f=e.isPlainObject(t)?e.extend(!0,{},e.fn.progress.settings,t):e.extend({},e.fn.progress.settings),m=f.className,g=f.metadata,p=f.namespace,h=f.selector,v=f.error,b="."+p,y="module-"+p,x=e(this),C=e(this).find(h.bar),w=e(this).find(h.progress),S=e(this).find(h.label),k=this,T=x.data(y),A=!1;a={initialize:function(){a.debug("Initializing progress bar",f),a.set.duration(),a.set.transitionEvent(),a.read.metadata(),a.read.settings(),a.instantiate()},instantiate:function(){a.verbose("Storing instance of progress",a),T=a,x.data(y,a)},destroy:function(){a.verbose("Destroying previous progress for",x),clearInterval(T.interval),a.remove.state(),x.removeData(y),T=i},reset:function(){a.remove.nextValue(),a.update.progress(0)},complete:function(){(a.percent===i||a.percent<100)&&(a.remove.progressPoll(),a.set.percent(100))},read:{metadata:function(){var e={percent:x.data(g.percent),total:x.data(g.total),value:x.data(g.value)};e.percent&&(a.debug("Current percent value set from metadata",e.percent),a.set.percent(e.percent)),e.total&&(a.debug("Total value set from metadata",e.total),a.set.total(e.total)),e.value&&(a.debug("Current value set from metadata",e.value),a.set.value(e.value),a.set.progress(e.value))},settings:function(){!1!==f.total&&(a.debug("Current total set in settings",f.total),a.set.total(f.total)),!1!==f.value&&(a.debug("Current value set in settings",f.value),a.set.value(f.value),a.set.progress(a.value)),!1!==f.percent&&(a.debug("Current percent set in settings",f.percent),a.set.percent(f.percent))}},bind:{transitionEnd:function(e){var t=a.get.transitionEnd();C.one(t+b,function(t){clearTimeout(a.failSafeTimer),e.call(this,t)}),a.failSafeTimer=setTimeout(function(){C.triggerHandler(t)},f.duration+f.failSafeDelay),a.verbose("Adding fail safe timer",a.timer)}},increment:function(e){var t,n;a.has.total()?n=(t=a.get.value())+(e=e||1):(n=(t=a.get.percent())+(e=e||a.get.randomValue()),100,a.debug("Incrementing percentage by",t,n)),n=a.get.normalizedValue(n),a.set.progress(n)},decrement:function(e){var t,n;a.get.total()?(n=(t=a.get.value())-(e=e||1),a.debug("Decrementing value by",e,t)):(n=(t=a.get.percent())-(e=e||a.get.randomValue()),a.debug("Decrementing percentage by",e,t)),n=a.get.normalizedValue(n),a.set.progress(n)},has:{progressPoll:function(){return a.progressPoll},total:function(){return!1!==a.get.total()}},get:{text:function(e){var t=a.value||0,n=a.total||0,i=A?a.get.displayPercent():a.percent||0,o=a.total>0?n-t:100-i;return e=(e=e||"").replace("{value}",t).replace("{total}",n).replace("{left}",o).replace("{percent}",i),a.verbose("Adding variables to progress bar text",e),e},normalizedValue:function(e){if(e<0)return a.debug("Value cannot decrement below 0"),0;if(a.has.total()){if(e>a.total)return a.debug("Value cannot increment above total",a.total),a.total}else if(e>100)return a.debug("Value cannot increment above 100 percent"),100;return e},updateInterval:function(){return"auto"==f.updateInterval?f.duration:f.updateInterval},randomValue:function(){return a.debug("Generating random increment percentage"),Math.floor(Math.random()*f.random.max+f.random.min)},numericValue:function(e){return"string"==typeof e?""!==e.replace(/[^\d.]/g,"")&&+e.replace(/[^\d.]/g,""):e},transitionEnd:function(){var e,t=n.createElement("element"),o={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(e in o)if(t.style[e]!==i)return o[e]},displayPercent:function(){var e=C.width(),t=x.width(),n=e>parseInt(C.css("min-width"),10)?e/t*100:a.percent;return f.precision>0?Math.round(n*(10*f.precision))/(10*f.precision):Math.round(n)},percent:function(){return a.percent||0},value:function(){return a.nextValue||a.value||0},total:function(){return a.total||!1}},create:{progressPoll:function(){a.progressPoll=setTimeout(function(){a.update.toNextValue(),a.remove.progressPoll()},a.get.updateInterval())}},is:{complete:function(){return a.is.success()||a.is.warning()||a.is.error()},success:function(){return x.hasClass(m.success)},warning:function(){return x.hasClass(m.warning)},error:function(){return x.hasClass(m.error)},active:function(){return x.hasClass(m.active)},visible:function(){return x.is(":visible")}},remove:{progressPoll:function(){a.verbose("Removing progress poll timer"),a.progressPoll&&(clearTimeout(a.progressPoll),delete a.progressPoll)},nextValue:function(){a.verbose("Removing progress value stored for next update"),delete a.nextValue},state:function(){a.verbose("Removing stored state"),delete a.total,delete a.percent,delete a.value},active:function(){a.verbose("Removing active state"),x.removeClass(m.active)},success:function(){a.verbose("Removing success state"),x.removeClass(m.success)},warning:function(){a.verbose("Removing warning state"),x.removeClass(m.warning)},error:function(){a.verbose("Removing error state"),x.removeClass(m.error)}},set:{barWidth:function(e){e>100?a.error(v.tooHigh,e):e<0?a.error(v.tooLow,e):(C.css("width",e+"%"),x.attr("data-percent",parseInt(e,10)))},duration:function(e){e="number"==typeof(e=e||f.duration)?e+"ms":e,a.verbose("Setting progress bar transition duration",e),C.css({"transition-duration":e})},percent:function(e){e="string"==typeof e?+e.replace("%",""):e,e=f.precision>0?Math.round(e*(10*f.precision))/(10*f.precision):Math.round(e),a.percent=e,a.has.total()||(a.value=f.precision>0?Math.round(e/100*a.total*(10*f.precision))/(10*f.precision):Math.round(e/100*a.total*10)/10,f.limitValues&&(a.value=a.value>100?100:a.value<0?0:a.value)),a.set.barWidth(e),a.set.labelInterval(),a.set.labels(),f.onChange.call(k,e,a.value,a.total)},labelInterval:function(){clearInterval(a.interval),a.bind.transitionEnd(function(){a.verbose("Bar finished animating, removing continuous label updates"),clearInterval(a.interval),A=!1,a.set.labels()}),A=!0,a.interval=setInterval(function(){e.contains(n.documentElement,k)||(clearInterval(a.interval),A=!1),a.set.labels()},f.framerate)},labels:function(){a.verbose("Setting both bar progress and outer label text"),a.set.barLabel(),a.set.state()},label:function(e){(e=e||"")&&(e=a.get.text(e),a.verbose("Setting label to text",e),S.text(e))},state:function(e){100===(e=e!==i?e:a.percent)?f.autoSuccess&&!(a.is.warning()||a.is.error()||a.is.success())?(a.set.success(),a.debug("Automatically triggering success at 100%")):(a.verbose("Reached 100% removing active state"),a.remove.active(),a.remove.progressPoll()):e>0?(a.verbose("Adjusting active progress bar label",e),a.set.active()):(a.remove.active(),a.set.label(f.text.active))},barLabel:function(e){e!==i?w.text(a.get.text(e)):"ratio"==f.label&&a.total?(a.verbose("Adding ratio to bar label"),w.text(a.get.text(f.text.ratio))):"percent"==f.label&&(a.verbose("Adding percentage to bar label"),w.text(a.get.text(f.text.percent)))},active:function(e){e=e||f.text.active,a.debug("Setting active state"),f.showActivity&&!a.is.active()&&x.addClass(m.active),a.remove.warning(),a.remove.error(),a.remove.success(),(e=f.onLabelUpdate("active",e,a.value,a.total))&&a.set.label(e),a.bind.transitionEnd(function(){f.onActive.call(k,a.value,a.total)})},success:function(e){e=e||f.text.success||f.text.active,a.debug("Setting success state"),x.addClass(m.success),a.remove.active(),a.remove.warning(),a.remove.error(),a.complete(),f.text.success?(e=f.onLabelUpdate("success",e,a.value,a.total),a.set.label(e)):(e=f.onLabelUpdate("active",e,a.value,a.total),a.set.label(e)),a.bind.transitionEnd(function(){f.onSuccess.call(k,a.total)})},warning:function(e){e=e||f.text.warning,a.debug("Setting warning state"),x.addClass(m.warning),a.remove.active(),a.remove.success(),a.remove.error(),a.complete(),(e=f.onLabelUpdate("warning",e,a.value,a.total))&&a.set.label(e),a.bind.transitionEnd(function(){f.onWarning.call(k,a.value,a.total)})},error:function(e){e=e||f.text.error,a.debug("Setting error state"),x.addClass(m.error),a.remove.active(),a.remove.success(),a.remove.warning(),a.complete(),(e=f.onLabelUpdate("error",e,a.value,a.total))&&a.set.label(e),a.bind.transitionEnd(function(){f.onError.call(k,a.value,a.total)})},transitionEvent:function(){a.get.transitionEnd()},total:function(e){a.total=e},value:function(e){a.value=e},progress:function(e){a.has.progressPoll()?(a.debug("Updated within interval, setting next update to use new value",e),a.set.nextValue(e)):(a.debug("First update in progress update interval, immediately updating",e),a.update.progress(e),a.create.progressPoll())},nextValue:function(e){a.nextValue=e}},update:{toNextValue:function(){var e=a.nextValue;e&&(a.debug("Update interval complete using last updated value",e),a.update.progress(e),a.remove.nextValue())},progress:function(e){var t;!1===(e=a.get.numericValue(e))&&a.error(v.nonNumeric,e),e=a.get.normalizedValue(e),a.has.total()?(a.set.value(e),t=e/a.total*100,a.debug("Calculating percent complete from total",t),a.set.percent(t)):(t=e,a.debug("Setting value to exact percentage value",t),a.set.percent(t))}},setting:function(t,n){if(a.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,f,t);else{if(n===i)return f[t];e.isPlainObject(f[t])?e.extend(!0,f[t],n):f[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,a,t);else{if(n===i)return a[t];a[t]=n}},debug:function(){!f.silent&&f.debug&&(f.performance?a.performance.log(arguments):(a.debug=Function.prototype.bind.call(console.info,console,f.name+":"),a.debug.apply(console,arguments)))},verbose:function(){!f.silent&&f.verbose&&f.debug&&(f.performance?a.performance.log(arguments):(a.verbose=Function.prototype.bind.call(console.info,console,f.name+":"),a.verbose.apply(console,arguments)))},error:function(){f.silent||(a.error=Function.prototype.bind.call(console.error,console,f.name+":"),a.error.apply(console,arguments))},performance:{log:function(e){var t,n;f.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:k,"Execution Time":n})),clearTimeout(a.performance.timer),a.performance.timer=setTimeout(a.performance.display,500)},display:function(){var t=f.name+":",n=0;s=!1,clearTimeout(a.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",r&&(t+=" '"+r+"'"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,r){var s,l,c,u=T;return n=n||d,r=k||r,"string"==typeof t&&u!==i&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(n,o){var r=n!=s?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(u[r])&&n!=s)u=u[r];else{if(u[r]!==i)return l=u[r],!1;if(!e.isPlainObject(u[o])||n==s)return u[o]!==i?(l=u[o],!1):(a.error(v.method,t),!1);u=u[o]}})),e.isFunction(l)?c=l.apply(r,n):l!==i&&(c=l),e.isArray(o)?o.push(c):o!==i?o=[o,c]:c!==i&&(o=c),l}},u?(T===i&&a.initialize(),a.invoke(c)):(T!==i&&T.invoke("destroy"),a.initialize())}),o!==i?o:this},e.fn.progress.settings={name:"Progress",namespace:"progress",silent:!1,debug:!1,verbose:!1,performance:!0,random:{min:2,max:5},duration:300,updateInterval:"auto",autoSuccess:!0,showActivity:!0,limitValues:!0,label:"percent",precision:0,framerate:1e3/30,percent:!1,total:!1,value:!1,failSafeDelay:100,onLabelUpdate:function(e,t,n,i){return t},onChange:function(e,t,n){},onSuccess:function(e){},onActive:function(e,t){},onError:function(e,t){},onWarning:function(e,t){},error:{method:"The method you called is not defined.",nonNumeric:"Progress value is non numeric",tooHigh:"Value specified is above 100%",tooLow:"Value specified is below 0%"},regExp:{variable:/\{\$*[A-z0-9]+\}/g},metadata:{percent:"percent",total:"total",value:"value"},selector:{bar:"> .bar",label:"> .label",progress:".bar > .progress"},text:{active:!1,error:!1,success:!1,warning:!1,percent:"{percent}%",ratio:"{value} of {total}"},className:{active:"active",error:"error",success:"success",warning:"warning"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.rating=function(t){var n,o=e(this),a=o.selector||"",r=(new Date).getTime(),s=[],l=arguments[0],c="string"==typeof l,u=[].slice.call(arguments,1);return o.each(function(){var d,f,m=e.isPlainObject(t)?e.extend(!0,{},e.fn.rating.settings,t):e.extend({},e.fn.rating.settings),g=m.namespace,p=m.className,h=m.metadata,v=m.selector,b=(m.error,"."+g),y="module-"+g,x=this,C=e(this).data(y),w=e(this),S=w.find(v.icon);f={initialize:function(){f.verbose("Initializing rating module",m),0===S.length&&f.setup.layout(),m.interactive?f.enable():f.disable(),f.set.initialLoad(),f.set.rating(f.get.initialRating()),f.remove.initialLoad(),f.instantiate()},instantiate:function(){f.verbose("Instantiating module",m),C=f,w.data(y,f)},destroy:function(){f.verbose("Destroying previous instance",C),f.remove.events(),w.removeData(y)},refresh:function(){S=w.find(v.icon)},setup:{layout:function(){var t=f.get.maxRating(),n=e.fn.rating.settings.templates.icon(t);f.debug("Generating icon html dynamically"),w.html(n),f.refresh()}},event:{mouseenter:function(){var t=e(this);t.nextAll().removeClass(p.selected),w.addClass(p.selected),t.addClass(p.selected).prevAll().addClass(p.selected)},mouseleave:function(){w.removeClass(p.selected),S.removeClass(p.selected)},click:function(){var t=e(this),n=f.get.rating(),i=S.index(t)+1;("auto"==m.clearable?1===S.length:m.clearable)&&n==i?f.clearRating():f.set.rating(i)}},clearRating:function(){f.debug("Clearing current rating"),f.set.rating(0)},bind:{events:function(){f.verbose("Binding events"),w.on("mouseenter"+b,v.icon,f.event.mouseenter).on("mouseleave"+b,v.icon,f.event.mouseleave).on("click"+b,v.icon,f.event.click)}},remove:{events:function(){f.verbose("Removing events"),w.off(b)},initialLoad:function(){d=!1}},enable:function(){f.debug("Setting rating to interactive mode"),f.bind.events(),w.removeClass(p.disabled)},disable:function(){f.debug("Setting rating to read-only mode"),f.remove.events(),w.addClass(p.disabled)},is:{initialLoad:function(){return d}},get:{initialRating:function(){return w.data(h.rating)!==i?(w.removeData(h.rating),w.data(h.rating)):m.initialRating},maxRating:function(){return w.data(h.maxRating)!==i?(w.removeData(h.maxRating),w.data(h.maxRating)):m.maxRating},rating:function(){var e=S.filter("."+p.active).length;return f.verbose("Current rating retrieved",e),e}},set:{rating:function(e){var t=e-1>=0?e-1:0,n=S.eq(t);w.removeClass(p.selected),S.removeClass(p.selected).removeClass(p.active),e>0&&(f.verbose("Setting current rating to",e),n.prevAll().addBack().addClass(p.active)),f.is.initialLoad()||m.onRate.call(x,e)},initialLoad:function(){d=!0}},setting:function(t,n){if(f.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,m,t);else{if(n===i)return m[t];e.isPlainObject(m[t])?e.extend(!0,m[t],n):m[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,f,t);else{if(n===i)return f[t];f[t]=n}},debug:function(){!m.silent&&m.debug&&(m.performance?f.performance.log(arguments):(f.debug=Function.prototype.bind.call(console.info,console,m.name+":"),f.debug.apply(console,arguments)))},verbose:function(){!m.silent&&m.verbose&&m.debug&&(m.performance?f.performance.log(arguments):(f.verbose=Function.prototype.bind.call(console.info,console,m.name+":"),f.verbose.apply(console,arguments)))},error:function(){m.silent||(f.error=Function.prototype.bind.call(console.error,console,m.name+":"),f.error.apply(console,arguments))},performance:{log:function(e){var t,n;m.performance&&(n=(t=(new Date).getTime())-(r||t),r=t,s.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:x,"Execution Time":n})),clearTimeout(f.performance.timer),f.performance.timer=setTimeout(f.performance.display,500)},display:function(){var t=m.name+":",n=0;r=!1,clearTimeout(f.performance.timer),e.each(s,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",a&&(t+=" '"+a+"'"),o.length>1&&(t+=" ("+o.length+")"),(console.group!==i||console.table!==i)&&s.length>0&&(console.groupCollapsed(t),console.table?console.table(s):e.each(s,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),s=[]}},invoke:function(t,o,a){var r,s,l,c=C;return o=o||u,a=x||a,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(a,o):s!==i&&(l=s),e.isArray(n)?n.push(l):n!==i?n=[n,l]:l!==i&&(n=l),s}},c?(C===i&&f.initialize(),f.invoke(l)):(C!==i&&C.invoke("destroy"),f.initialize())}),n!==i?n:this},e.fn.rating.settings={name:"Rating",namespace:"rating",slent:!1,debug:!1,verbose:!1,performance:!0,initialRating:0,interactive:!0,maxRating:4,clearable:"auto",fireOnInit:!1,onRate:function(e){},error:{method:"The method you called is not defined",noMaximum:"No maximum rating specified. Cannot generate HTML automatically"},metadata:{rating:"rating",maxRating:"maxRating"},className:{active:"active",disabled:"disabled",selected:"selected",loading:"loading"},selector:{icon:".icon"},templates:{icon:function(e){for(var t=1,n="";t<=e;)n+='<i class="icon"></i>',t++;return n}}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.search=function(o){var a,r=e(this),s=r.selector||"",l=(new Date).getTime(),c=[],u=arguments[0],d="string"==typeof u,f=[].slice.call(arguments,1);return e(this).each(function(){var m,g=e.isPlainObject(o)?e.extend(!0,{},e.fn.search.settings,o):e.extend({},e.fn.search.settings),p=g.className,h=g.metadata,v=g.regExp,b=g.fields,y=g.selector,x=g.error,C=g.namespace,w="."+C,S=C+"-module",k=e(this),T=k.find(y.prompt),A=k.find(y.searchButton),R=k.find(y.results),P=k.find(y.result),E=(k.find(y.category),this),F=k.data(S),O=!1,D=!1;m={initialize:function(){m.verbose("Initializing module"),m.get.settings(),m.determine.searchFields(),m.bind.events(),m.set.type(),m.create.results(),m.instantiate()},instantiate:function(){m.verbose("Storing instance of module",m),F=m,k.data(S,m)},destroy:function(){m.verbose("Destroying instance"),k.off(w).removeData(S)},refresh:function(){m.debug("Refreshing selector cache"),T=k.find(y.prompt),A=k.find(y.searchButton),k.find(y.category),R=k.find(y.results),P=k.find(y.result)},refreshResults:function(){R=k.find(y.results),P=k.find(y.result)},bind:{events:function(){m.verbose("Binding events to search"),g.automatic&&(k.on(m.get.inputEvent()+w,y.prompt,m.event.input),T.attr("autocomplete","off")),k.on("focus"+w,y.prompt,m.event.focus).on("blur"+w,y.prompt,m.event.blur).on("keydown"+w,y.prompt,m.handleKeyboard).on("click"+w,y.searchButton,m.query).on("mousedown"+w,y.results,m.event.result.mousedown).on("mouseup"+w,y.results,m.event.result.mouseup).on("click"+w,y.result,m.event.result.click)}},determine:{searchFields:function(){o&&o.searchFields!==i&&(g.searchFields=o.searchFields)}},event:{input:function(){g.searchDelay?(clearTimeout(m.timer),m.timer=setTimeout(function(){m.is.focused()&&m.query()},g.searchDelay)):m.query()},focus:function(){m.set.focus(),g.searchOnFocus&&m.has.minimumCharacters()&&m.query(function(){m.can.show()&&m.showResults()})},blur:function(e){var t=function(){m.cancel.query(),m.remove.focus(),m.timer=setTimeout(m.hideResults,g.hideDelay)};n.activeElement===this||(D=!1,m.resultsClicked?(m.debug("Determining if user action caused search to close"),k.one("click.close"+w,y.results,function(e){m.is.inMessage(e)||O?T.focus():(O=!1,m.is.animating()||m.is.hidden()||t())})):(m.debug("Input blurred without user action, closing results"),t()))},result:{mousedown:function(){m.resultsClicked=!0},mouseup:function(){m.resultsClicked=!1},click:function(n){m.debug("Search result selected");var i=e(this),o=i.find(y.title).eq(0),a=i.is("a[href]")?i:i.find("a[href]").eq(0),r=a.attr("href")||!1,s=a.attr("target")||!1,l=(o.html(),o.length>0&&o.text()),c=m.get.results(),u=i.data(h.result)||m.get.result(l,c);if(e.isFunction(g.onSelect)&&!1===g.onSelect.call(E,u,c))return m.debug("Custom onSelect callback cancelled default select action"),void(O=!0);m.hideResults(),l&&m.set.value(l),r&&(m.verbose("Opening search link found in result",a),"_blank"==s||n.ctrlKey?t.open(r):t.location.href=r)}}},handleKeyboard:function(e){var t,n=k.find(y.result),i=k.find(y.category),o=n.filter("."+p.active),a=n.index(o),r=n.length,s=o.length>0,l=e.which,c=13,u=38,d=40;if(l==27&&(m.verbose("Escape key pressed, blurring search field"),m.hideResults(),D=!0),m.is.visible())if(l==c){if(m.verbose("Enter key pressed, selecting active result"),n.filter("."+p.active).length>0)return m.event.result.click.call(n.filter("."+p.active),e),e.preventDefault(),!1}else l==u&&s?(m.verbose("Up key pressed, changing active result"),t=a-1<0?a:a-1,i.removeClass(p.active),n.removeClass(p.active).eq(t).addClass(p.active).closest(i).addClass(p.active),e.preventDefault()):l==d&&(m.verbose("Down key pressed, changing active result"),t=a+1>=r?a:a+1,i.removeClass(p.active),n.removeClass(p.active).eq(t).addClass(p.active).closest(i).addClass(p.active),e.preventDefault());else l==c&&(m.verbose("Enter key pressed, executing query"),m.query(),m.set.buttonPressed(),T.one("keyup",m.remove.buttonFocus))},setup:{api:function(t,n){var i={debug:g.debug,on:!1,cache:!0,action:"search",urlData:{query:t},onSuccess:function(e){m.parse.response.call(E,e,t),n()},onFailure:function(){m.displayMessage(x.serverError),n()},onAbort:function(e){},onError:m.error};e.extend(!0,i,g.apiSettings),m.verbose("Setting up API request",i),k.api(i)}},can:{useAPI:function(){return e.fn.api!==i},show:function(){return m.is.focused()&&!m.is.visible()&&!m.is.empty()},transition:function(){return g.transition&&e.fn.transition!==i&&k.transition("is supported")}},is:{animating:function(){return R.hasClass(p.animating)},hidden:function(){return R.hasClass(p.hidden)},inMessage:function(t){if(t.target){var i=e(t.target);return e.contains(n.documentElement,t.target)&&i.closest(y.message).length>0}},empty:function(){return""===R.html()},visible:function(){return R.filter(":visible").length>0},focused:function(){return T.filter(":focus").length>0}},get:{settings:function(){e.isPlainObject(o)&&o.searchFullText&&(g.fullTextSearch=o.searchFullText,m.error(g.error.oldSearchSyntax,E))},inputEvent:function(){var e=T[0];return e!==i&&e.oninput!==i?"input":e!==i&&e.onpropertychange!==i?"propertychange":"keyup"},value:function(){return T.val()},results:function(){return k.data(h.results)},result:function(t,n){var o=["title","id"],a=!1;return t=t!==i?t:m.get.value(),n=n!==i?n:m.get.results(),"category"===g.type?(m.debug("Finding result that matches",t),e.each(n,function(n,i){if(e.isArray(i.results)&&(a=m.search.object(t,i.results,o)[0]))return!1})):(m.debug("Finding result in results object",t),a=m.search.object(t,n,o)[0]),a||!1}},select:{firstResult:function(){m.verbose("Selecting first result"),P.first().addClass(p.active)}},set:{focus:function(){k.addClass(p.focus)},loading:function(){k.addClass(p.loading)},value:function(e){m.verbose("Setting search input value",e),T.val(e)},type:function(e){e=e||g.type,"category"==g.type&&k.addClass(g.type)},buttonPressed:function(){A.addClass(p.pressed)}},remove:{loading:function(){k.removeClass(p.loading)},focus:function(){k.removeClass(p.focus)},buttonPressed:function(){A.removeClass(p.pressed)}},query:function(t){t=e.isFunction(t)?t:function(){};var n=m.get.value(),i=m.read.cache(n);t=t||function(){},m.has.minimumCharacters()?(i?(m.debug("Reading result from cache",n),m.save.results(i.results),m.addResults(i.html),m.inject.id(i.results),t()):(m.debug("Querying for",n),e.isPlainObject(g.source)||e.isArray(g.source)?(m.search.local(n),t()):m.can.useAPI()?m.search.remote(n,t):(m.error(x.source),t())),g.onSearchQuery.call(E,n)):m.hideResults()},search:{local:function(e){var t,n=m.search.object(e,g.content);m.set.loading(),m.save.results(n),m.debug("Returned full local search results",n),g.maxResults>0&&(m.debug("Using specified max results",n),n=n.slice(0,g.maxResults)),"category"==g.type&&(n=m.create.categoryResults(n)),t=m.generateResults({results:n}),m.remove.loading(),m.addResults(t),m.inject.id(n),m.write.cache(e,{html:t,results:n})},remote:function(t,n){n=e.isFunction(n)?n:function(){},k.api("is loading")&&k.api("abort"),m.setup.api(t,n),k.api("query")},object:function(t,n,o){var a=[],r=[],s=[],l=t.toString().replace(v.escape,"\\$&"),c=new RegExp(v.beginsWith+l,"i"),u=function(t,n){var i=-1==e.inArray(n,a),o=-1==e.inArray(n,s),l=-1==e.inArray(n,r);i&&o&&l&&t.push(n)};return n=n||g.source,o=o!==i?o:g.searchFields,e.isArray(o)||(o=[o]),n===i||!1===n?(m.error(x.source),[]):(e.each(o,function(i,o){e.each(n,function(e,n){"string"==typeof n[o]&&(-1!==n[o].search(c)?u(a,n):"exact"===g.fullTextSearch&&m.exactSearch(t,n[o])?u(r,n):1==g.fullTextSearch&&m.fuzzySearch(t,n[o])&&u(s,n))})}),e.merge(r,s),e.merge(a,r),a)}},exactSearch:function(e,t){return e=e.toLowerCase(),(t=t.toLowerCase()).indexOf(e)>-1},fuzzySearch:function(e,t){var n=t.length,i=e.length;if("string"!=typeof e)return!1;if(e=e.toLowerCase(),t=t.toLowerCase(),i>n)return!1;if(i===n)return e===t;e:for(var o=0,a=0;o<i;o++){for(var r=e.charCodeAt(o);a<n;)if(t.charCodeAt(a++)===r)continue e;return!1}return!0},parse:{response:function(e,t){var n=m.generateResults(e);m.verbose("Parsing server response",e),e!==i&&t!==i&&e[b.results]!==i&&(m.addResults(n),m.inject.id(e[b.results]),m.write.cache(t,{html:n,results:e[b.results]}),m.save.results(e[b.results]))}},cancel:{query:function(){m.can.useAPI()&&k.api("abort")}},has:{minimumCharacters:function(){return m.get.value().length>=g.minCharacters},results:function(){return 0!==R.length&&""!=R.html()}},clear:{cache:function(e){var t=k.data(h.cache);e?e&&t&&t[e]&&(m.debug("Removing value from cache",e),delete t[e],k.data(h.cache,t)):(m.debug("Clearing cache",e),k.removeData(h.cache))}},read:{cache:function(e){var t=k.data(h.cache);return!!g.cache&&(m.verbose("Checking cache for generated html for query",e),"object"==typeof t&&t[e]!==i&&t[e])}},create:{categoryResults:function(t){var n={};return e.each(t,function(e,t){t.category&&(n[t.category]===i?(m.verbose("Creating new category of results",t.category),n[t.category]={name:t.category,results:[t]}):n[t.category].results.push(t))}),n},id:function(e,t){var n,o=e+1;return t!==i?(n=String.fromCharCode(97+t)+o,m.verbose("Creating category result id",n)):(n=o,m.verbose("Creating result id",n)),n},results:function(){0===R.length&&(R=e("<div />").addClass(p.results).appendTo(k))}},inject:{result:function(e,t,n){m.verbose("Injecting result into results");var o=n!==i?R.children().eq(n).children(y.results).first().children(y.result).eq(t):R.children(y.result).eq(t);m.verbose("Injecting results metadata",o),o.data(h.result,e)},id:function(t){m.debug("Injecting unique ids into results");var n=0,o=0;return"category"===g.type?e.each(t,function(t,a){o=0,e.each(a.results,function(e,t){var r=a.results[e];r.id===i&&(r.id=m.create.id(o,n)),m.inject.result(r,o,n),o++}),n++}):e.each(t,function(e,n){var a=t[e];a.id===i&&(a.id=m.create.id(o)),m.inject.result(a,o),o++}),t}},save:{results:function(e){m.verbose("Saving current search results to metadata",e),k.data(h.results,e)}},write:{cache:function(e,t){var n=k.data(h.cache)!==i?k.data(h.cache):{};g.cache&&(m.verbose("Writing generated html to cache",e,t),n[e]=t,k.data(h.cache,n))}},addResults:function(t){if(e.isFunction(g.onResultsAdd)&&!1===g.onResultsAdd.call(R,t))return m.debug("onResultsAdd callback cancelled default action"),!1;t?(R.html(t),m.refreshResults(),g.selectFirstResult&&m.select.firstResult(),m.showResults()):m.hideResults(function(){R.empty()})},showResults:function(t){t=e.isFunction(t)?t:function(){},D||!m.is.visible()&&m.has.results()&&(m.can.transition()?(m.debug("Showing results with css animations"),R.transition({animation:g.transition+" in",debug:g.debug,verbose:g.verbose,duration:g.duration,onComplete:function(){t()},queue:!0})):(m.debug("Showing results with javascript"),R.stop().fadeIn(g.duration,g.easing)),g.onResultsOpen.call(R))},hideResults:function(t){t=e.isFunction(t)?t:function(){},m.is.visible()&&(m.can.transition()?(m.debug("Hiding results with css animations"),R.transition({animation:g.transition+" out",debug:g.debug,verbose:g.verbose,duration:g.duration,onComplete:function(){t()},queue:!0})):(m.debug("Hiding results with javascript"),R.stop().fadeOut(g.duration,g.easing)),g.onResultsClose.call(R))},generateResults:function(t){m.debug("Generating html from response",t);var n=g.templates[g.type],i=e.isPlainObject(t[b.results])&&!e.isEmptyObject(t[b.results]),o=e.isArray(t[b.results])&&t[b.results].length>0,a="";return i||o?(g.maxResults>0&&(i?"standard"==g.type&&m.error(x.maxResults):t[b.results]=t[b.results].slice(0,g.maxResults)),e.isFunction(n)?a=n(t,b):m.error(x.noTemplate,!1)):g.showNoResults&&(a=m.displayMessage(x.noResults,"empty")),g.onResults.call(E,t),a},displayMessage:function(e,t){return t=t||"standard",m.debug("Displaying message",e,t),m.addResults(g.templates.message(e,t)),g.templates.message(e,t)},setting:function(t,n){if(e.isPlainObject(t))e.extend(!0,g,t);else{if(n===i)return g[t];g[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,m,t);else{if(n===i)return m[t];m[t]=n}},debug:function(){!g.silent&&g.debug&&(g.performance?m.performance.log(arguments):(m.debug=Function.prototype.bind.call(console.info,console,g.name+":"),m.debug.apply(console,arguments)))},verbose:function(){!g.silent&&g.verbose&&g.debug&&(g.performance?m.performance.log(arguments):(m.verbose=Function.prototype.bind.call(console.info,console,g.name+":"),m.verbose.apply(console,arguments)))},error:function(){g.silent||(m.error=Function.prototype.bind.call(console.error,console,g.name+":"),m.error.apply(console,arguments))},performance:{log:function(e){var t,n;g.performance&&(n=(t=(new Date).getTime())-(l||t),l=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:E,"Execution Time":n})),clearTimeout(m.performance.timer),m.performance.timer=setTimeout(m.performance.display,500)},display:function(){var t=g.name+":",n=0;l=!1,clearTimeout(m.performance.timer),e.each(c,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",s&&(t+=" '"+s+"'"),r.length>1&&(t+=" ("+r.length+")"),(console.group!==i||console.table!==i)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,n,o){var r,s,l,c=F;return n=n||f,o=E||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},d?(F===i&&m.initialize(),m.invoke(u)):(F!==i&&F.invoke("destroy"),m.initialize())}),a!==i?a:this},e.fn.search.settings={name:"Search",namespace:"search",silent:!1,debug:!1,verbose:!1,performance:!0,type:"standard",minCharacters:1,selectFirstResult:!1,apiSettings:!1,source:!1,searchOnFocus:!0,searchFields:["title","description"],displayField:"",fullTextSearch:"exact",automatic:!0,hideDelay:0,searchDelay:200,maxResults:7,cache:!0,showNoResults:!0,transition:"scale",duration:200,easing:"easeOutExpo",onSelect:!1,onResultsAdd:!1,onSearchQuery:function(e){},onResults:function(e){},onResultsOpen:function(){},onResultsClose:function(){},className:{animating:"animating",active:"active",empty:"empty",focus:"focus",hidden:"hidden",loading:"loading",results:"results",pressed:"down"},error:{source:"Cannot search. No source used, and Semantic API module was not included",noResults:"Your search returned no results",logging:"Error in debug logging, exiting.",noEndpoint:"No search endpoint was specified",noTemplate:"A valid template name was not specified.",oldSearchSyntax:"searchFullText setting has been renamed fullTextSearch for consistency, please adjust your settings.",serverError:"There was an issue querying the server.",maxResults:"Results must be an array to use maxResults setting",method:"The method you called is not defined."},metadata:{cache:"cache",results:"results",result:"result"},regExp:{escape:/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,beginsWith:"(?:s|^)"},fields:{categories:"results",categoryName:"name",categoryResults:"results",description:"description",image:"image",price:"price",results:"results",title:"title",url:"url",action:"action",actionText:"text",actionURL:"url"},selector:{prompt:".prompt",searchButton:".search.button",results:".results",message:".results > .message",category:".category",result:".result",title:".title, .name"},templates:{escape:function(e){var t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};return/[&<>"'`]/.test(e)?e.replace(/[&<>"'`]/g,function(e){return t[e]}):e},message:function(e,t){var n="";return e!==i&&t!==i&&(n+='<div class="message '+t+'">',n+="empty"==t?'<div class="header">No Results</div class="header"><div class="description">'+e+'</div class="description">':' <div class="description">'+e+"</div>",n+="</div>"),n},category:function(t,n){var o="";e.fn.search.settings.templates.escape;return t[n.categoryResults]!==i&&(e.each(t[n.categoryResults],function(t,a){a[n.results]!==i&&a.results.length>0&&(o+='<div class="category">',a[n.categoryName]!==i&&(o+='<div class="name">'+a[n.categoryName]+"</div>"),o+='<div class="results">',e.each(a.results,function(e,t){t[n.url]?o+='<a class="result" href="'+t[n.url]+'">':o+='<a class="result">',t[n.image]!==i&&(o+='<div class="image"> <img src="'+t[n.image]+'"></div>'),o+='<div class="content">',t[n.price]!==i&&(o+='<div class="price">'+t[n.price]+"</div>"),t[n.title]!==i&&(o+='<div class="title">'+t[n.title]+"</div>"),t[n.description]!==i&&(o+='<div class="description">'+t[n.description]+"</div>"),o+="</div>",o+="</a>"}),o+="</div>",o+="</div>")}),t[n.action]&&(o+='<a href="'+t[n.action][n.actionURL]+'" class="action">'+t[n.action][n.actionText]+"</a>"),o)},standard:function(t,n){var o="";return t[n.results]!==i&&(e.each(t[n.results],function(e,t){t[n.url]?o+='<a class="result" href="'+t[n.url]+'">':o+='<a class="result">',t[n.image]!==i&&(o+='<div class="image"> <img src="'+t[n.image]+'"></div>'),o+='<div class="content">',t[n.price]!==i&&(o+='<div class="price">'+t[n.price]+"</div>"),t[n.title]!==i&&(o+='<div class="title">'+t[n.title]+"</div>"),t[n.description]!==i&&(o+='<div class="description">'+t[n.description]+"</div>"),o+="</div>",o+="</a>"}),t[n.action]&&(o+='<a href="'+t[n.action][n.actionURL]+'" class="action">'+t[n.action][n.actionText]+"</a>"),o)}}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.shape=function(o){var a,r=e(this),s=(e("body"),(new Date).getTime()),l=[],c=arguments[0],u="string"==typeof c,d=[].slice.call(arguments,1),f=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)};return r.each(function(){var t,m,g,p=r.selector||"",h=e.isPlainObject(o)?e.extend(!0,{},e.fn.shape.settings,o):e.extend({},e.fn.shape.settings),v=h.namespace,b=h.selector,y=h.error,x=h.className,C="."+v,w="module-"+v,S=e(this),k=S.find(b.sides),T=S.find(b.side),A=!1,R=this,P=S.data(w);g={initialize:function(){g.verbose("Initializing module for",R),g.set.defaultSide(),g.instantiate()},instantiate:function(){g.verbose("Storing instance of module",g),P=g,S.data(w,P)},destroy:function(){g.verbose("Destroying previous module for",R),S.removeData(w).off(C)},refresh:function(){g.verbose("Refreshing selector cache for",R),S=e(R),k=e(this).find(b.shape),T=e(this).find(b.side)},repaint:function(){g.verbose("Forcing repaint event");(k[0]||n.createElement("div")).offsetWidth},animate:function(e,n){g.verbose("Animating box with properties",e),n=n||function(e){g.verbose("Executing animation callback"),e!==i&&e.stopPropagation(),g.reset(),g.set.active()},h.beforeChange.call(m[0]),g.get.transitionEvent()?(g.verbose("Starting CSS animation"),S.addClass(x.animating),k.css(e).one(g.get.transitionEvent(),n),g.set.duration(h.duration),f(function(){S.addClass(x.animating),t.addClass(x.hidden)})):n()},queue:function(e){g.debug("Queueing animation of",e),k.one(g.get.transitionEvent(),function(){g.debug("Executing queued animation"),setTimeout(function(){S.shape(e)},0)})},reset:function(){g.verbose("Animating states reset"),S.removeClass(x.animating).attr("style","").removeAttr("style"),k.attr("style","").removeAttr("style"),T.attr("style","").removeAttr("style").removeClass(x.hidden),m.removeClass(x.animating).attr("style","").removeAttr("style")},is:{complete:function(){return T.filter("."+x.active)[0]==m[0]},animating:function(){return S.hasClass(x.animating)}},set:{defaultSide:function(){t=S.find("."+h.className.active),m=t.next(b.side).length>0?t.next(b.side):S.find(b.side).first(),A=!1,g.verbose("Active side set to",t),g.verbose("Next side set to",m)},duration:function(e){e="number"==typeof(e=e||h.duration)?e+"ms":e,g.verbose("Setting animation duration",e),(h.duration||0===h.duration)&&k.add(T).css({"-webkit-transition-duration":e,"-moz-transition-duration":e,"-ms-transition-duration":e,"-o-transition-duration":e,"transition-duration":e})},currentStageSize:function(){var e=S.find("."+h.className.active),t=e.outerWidth(!0),n=e.outerHeight(!0);S.css({width:t,height:n})},stageSize:function(){var e=S.clone().addClass(x.loading),t=e.find("."+h.className.active),n=A?e.find(b.side).eq(A):t.next(b.side).length>0?t.next(b.side):e.find(b.side).first(),i="next"==h.width?n.outerWidth(!0):"initial"==h.width?S.width():h.width,o="next"==h.height?n.outerHeight(!0):"initial"==h.height?S.height():h.height;t.removeClass(x.active),n.addClass(x.active),e.insertAfter(S),e.remove(),"auto"!=h.width&&(S.css("width",i+h.jitter),g.verbose("Specifying width during animation",i)),"auto"!=h.height&&(S.css("height",o+h.jitter),g.verbose("Specifying height during animation",o))},nextSide:function(e){A=e,m=T.filter(e),A=T.index(m),0===m.length&&(g.set.defaultSide(),g.error(y.side)),g.verbose("Next side manually set to",m)},active:function(){g.verbose("Setting new side to active",m),T.removeClass(x.active),m.addClass(x.active),h.onChange.call(m[0]),g.set.defaultSide()}},flip:{up:function(){if(!g.is.complete()||g.is.animating()||h.allowRepeats)if(g.is.animating())g.queue("flip up");else{g.debug("Flipping up",m);var e=g.get.transform.up();g.set.stageSize(),g.stage.above(),g.animate(e)}else g.debug("Side already visible",m)},down:function(){if(!g.is.complete()||g.is.animating()||h.allowRepeats)if(g.is.animating())g.queue("flip down");else{g.debug("Flipping down",m);var e=g.get.transform.down();g.set.stageSize(),g.stage.below(),g.animate(e)}else g.debug("Side already visible",m)},left:function(){if(!g.is.complete()||g.is.animating()||h.allowRepeats)if(g.is.animating())g.queue("flip left");else{g.debug("Flipping left",m);var e=g.get.transform.left();g.set.stageSize(),g.stage.left(),g.animate(e)}else g.debug("Side already visible",m)},right:function(){if(!g.is.complete()||g.is.animating()||h.allowRepeats)if(g.is.animating())g.queue("flip right");else{g.debug("Flipping right",m);var e=g.get.transform.right();g.set.stageSize(),g.stage.right(),g.animate(e)}else g.debug("Side already visible",m)},over:function(){!g.is.complete()||g.is.animating()||h.allowRepeats?g.is.animating()?g.queue("flip over"):(g.debug("Flipping over",m),g.set.stageSize(),g.stage.behind(),g.animate(g.get.transform.over())):g.debug("Side already visible",m)},back:function(){!g.is.complete()||g.is.animating()||h.allowRepeats?g.is.animating()?g.queue("flip back"):(g.debug("Flipping back",m),g.set.stageSize(),g.stage.behind(),g.animate(g.get.transform.back())):g.debug("Side already visible",m)}},get:{transform:{up:function(){return{transform:"translateY("+-(t.outerHeight(!0)-m.outerHeight(!0))/2+"px) translateZ("+-t.outerHeight(!0)/2+"px) rotateX(-90deg)"}},down:function(){return{transform:"translateY("+-(t.outerHeight(!0)-m.outerHeight(!0))/2+"px) translateZ("+-t.outerHeight(!0)/2+"px) rotateX(90deg)"}},left:function(){return{transform:"translateX("+-(t.outerWidth(!0)-m.outerWidth(!0))/2+"px) translateZ("+-t.outerWidth(!0)/2+"px) rotateY(90deg)"}},right:function(){return{transform:"translateX("+-(t.outerWidth(!0)-m.outerWidth(!0))/2+"px) translateZ("+-t.outerWidth(!0)/2+"px) rotateY(-90deg)"}},over:function(){return{transform:"translateX("+-(t.outerWidth(!0)-m.outerWidth(!0))/2+"px) rotateY(180deg)"}},back:function(){return{transform:"translateX("+-(t.outerWidth(!0)-m.outerWidth(!0))/2+"px) rotateY(-180deg)"}}},transitionEvent:function(){var e,t=n.createElement("element"),o={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(e in o)if(t.style[e]!==i)return o[e]},nextSide:function(){return t.next(b.side).length>0?t.next(b.side):S.find(b.side).first()}},stage:{above:function(){var e={origin:(t.outerHeight(!0)-m.outerHeight(!0))/2,depth:{active:m.outerHeight(!0)/2,next:t.outerHeight(!0)/2}};g.verbose("Setting the initial animation position as above",m,e),k.css({transform:"translateZ(-"+e.depth.active+"px)"}),t.css({transform:"rotateY(0deg) translateZ("+e.depth.active+"px)"}),m.addClass(x.animating).css({top:e.origin+"px",transform:"rotateX(90deg) translateZ("+e.depth.next+"px)"})},below:function(){var e={origin:(t.outerHeight(!0)-m.outerHeight(!0))/2,depth:{active:m.outerHeight(!0)/2,next:t.outerHeight(!0)/2}};g.verbose("Setting the initial animation position as below",m,e),k.css({transform:"translateZ(-"+e.depth.active+"px)"}),t.css({transform:"rotateY(0deg) translateZ("+e.depth.active+"px)"}),m.addClass(x.animating).css({top:e.origin+"px",transform:"rotateX(-90deg) translateZ("+e.depth.next+"px)"})},left:function(){var e=t.outerWidth(!0),n=m.outerWidth(!0),i={origin:(e-n)/2,depth:{active:n/2,next:e/2}};g.verbose("Setting the initial animation position as left",m,i),k.css({transform:"translateZ(-"+i.depth.active+"px)"}),t.css({transform:"rotateY(0deg) translateZ("+i.depth.active+"px)"}),m.addClass(x.animating).css({left:i.origin+"px",transform:"rotateY(-90deg) translateZ("+i.depth.next+"px)"})},right:function(){var e=t.outerWidth(!0),n=m.outerWidth(!0),i={origin:(e-n)/2,depth:{active:n/2,next:e/2}};g.verbose("Setting the initial animation position as left",m,i),k.css({transform:"translateZ(-"+i.depth.active+"px)"}),t.css({transform:"rotateY(0deg) translateZ("+i.depth.active+"px)"}),m.addClass(x.animating).css({left:i.origin+"px",transform:"rotateY(90deg) translateZ("+i.depth.next+"px)"})},behind:function(){var e=t.outerWidth(!0),n=m.outerWidth(!0),i={origin:(e-n)/2,depth:{active:n/2,next:e/2}};g.verbose("Setting the initial animation position as behind",m,i),t.css({transform:"rotateY(0deg)"}),m.addClass(x.animating).css({left:i.origin+"px",transform:"rotateY(-180deg)"})}},setting:function(t,n){if(g.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,h,t);else{if(n===i)return h[t];e.isPlainObject(h[t])?e.extend(!0,h[t],n):h[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,g,t);else{if(n===i)return g[t];g[t]=n}},debug:function(){!h.silent&&h.debug&&(h.performance?g.performance.log(arguments):(g.debug=Function.prototype.bind.call(console.info,console,h.name+":"),g.debug.apply(console,arguments)))},verbose:function(){!h.silent&&h.verbose&&h.debug&&(h.performance?g.performance.log(arguments):(g.verbose=Function.prototype.bind.call(console.info,console,h.name+":"),g.verbose.apply(console,arguments)))},error:function(){h.silent||(g.error=Function.prototype.bind.call(console.error,console,h.name+":"),g.error.apply(console,arguments))},performance:{log:function(e){var t,n;h.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:R,"Execution Time":n})),clearTimeout(g.performance.timer),g.performance.timer=setTimeout(g.performance.display,500)},display:function(){var t=h.name+":",n=0;s=!1,clearTimeout(g.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",p&&(t+=" '"+p+"'"),r.length>1&&(t+=" ("+r.length+")"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,o){var r,s,l,c=P;return n=n||d,o=R||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},u?(P===i&&g.initialize(),g.invoke(c)):(P!==i&&P.invoke("destroy"),g.initialize())}),a!==i?a:this},e.fn.shape.settings={name:"Shape",silent:!1,debug:!1,verbose:!1,jitter:0,performance:!0,namespace:"shape",width:"initial",height:"initial",beforeChange:function(){},onChange:function(){},allowRepeats:!1,duration:!1,error:{side:"You tried to switch to a side that does not exist.",method:"The method you called is not defined"},className:{animating:"animating",hidden:"hidden",loading:"loading",active:"active"},selector:{sides:".sides",side:".side"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.sidebar=function(o){var a,r=e(this),s=e(t),l=e(n),c=e("html"),u=e("head"),d=r.selector||"",f=(new Date).getTime(),m=[],g=arguments[0],p="string"==typeof g,h=[].slice.call(arguments,1),v=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)};return r.each(function(){var r,b,y,x,C,w,S=e.isPlainObject(o)?e.extend(!0,{},e.fn.sidebar.settings,o):e.extend({},e.fn.sidebar.settings),k=S.selector,T=S.className,A=S.namespace,R=S.regExp,P=S.error,E="."+A,F="module-"+A,O=e(this),D=e(S.context),q=O.children(k.sidebar),j=(D.children(k.fixed),D.children(k.pusher)),z=this,I=O.data(F);w={initialize:function(){w.debug("Initializing sidebar",o),w.create.id(),C=w.get.transitionEvent(),S.delaySetup?v(w.setup.layout):w.setup.layout(),v(function(){w.setup.cache()}),w.instantiate()},instantiate:function(){w.verbose("Storing instance of module",w),I=w,O.data(F,w)},create:{id:function(){y=(Math.random().toString(16)+"000000000").substr(2,8),b="."+y,w.verbose("Creating unique id for element",y)}},destroy:function(){w.verbose("Destroying previous module for",O),O.off(E).removeData(F),w.is.ios()&&w.remove.ios(),D.off(b),s.off(b),l.off(b)},event:{clickaway:function(e){var t=j.find(e.target).length>0||j.is(e.target),n=D.is(e.target);t&&(w.verbose("User clicked on dimmed page"),w.hide()),n&&(w.verbose("User clicked on dimmable context (scaled out page)"),w.hide())},touch:function(e){},containScroll:function(e){z.scrollTop<=0&&(z.scrollTop=1),z.scrollTop+z.offsetHeight>=z.scrollHeight&&(z.scrollTop=z.scrollHeight-z.offsetHeight-1)},scroll:function(t){0===e(t.target).closest(k.sidebar).length&&t.preventDefault()}},bind:{clickaway:function(){w.verbose("Adding clickaway events to context",D),S.closable&&D.on("click"+b,w.event.clickaway).on("touchend"+b,w.event.clickaway)},scrollLock:function(){S.scrollLock&&(w.debug("Disabling page scroll"),s.on("DOMMouseScroll"+b,w.event.scroll)),w.verbose("Adding events to contain sidebar scroll"),l.on("touchmove"+b,w.event.touch),O.on("scroll"+E,w.event.containScroll)}},unbind:{clickaway:function(){w.verbose("Removing clickaway events from context",D),D.off(b)},scrollLock:function(){w.verbose("Removing scroll lock from page"),l.off(b),s.off(b),O.off("scroll"+E)}},add:{inlineCSS:function(){var t,n=w.cache.width||O.outerWidth(),i=w.cache.height||O.outerHeight(),o=w.is.rtl(),a=w.get.direction(),s={left:n,right:-n,top:i,bottom:-i};o&&(w.verbose("RTL detected, flipping widths"),s.left=-n,s.right=n),t="<style>","left"===a||"right"===a?(w.debug("Adding CSS rules for animation distance",n),t+=" .ui.visible."+a+".sidebar ~ .fixed, .ui.visible."+a+".sidebar ~ .pusher {   -webkit-transform: translate3d("+s[a]+"px, 0, 0);           transform: translate3d("+s[a]+"px, 0, 0); }"):"top"!==a&&"bottom"!=a||(t+=" .ui.visible."+a+".sidebar ~ .fixed, .ui.visible."+a+".sidebar ~ .pusher {   -webkit-transform: translate3d(0, "+s[a]+"px, 0);           transform: translate3d(0, "+s[a]+"px, 0); }"),w.is.ie()&&("left"===a||"right"===a?(w.debug("Adding CSS rules for animation distance",n),t+=" body.pushable > .ui.visible."+a+".sidebar ~ .pusher:after {   -webkit-transform: translate3d("+s[a]+"px, 0, 0);           transform: translate3d("+s[a]+"px, 0, 0); }"):"top"!==a&&"bottom"!=a||(t+=" body.pushable > .ui.visible."+a+".sidebar ~ .pusher:after {   -webkit-transform: translate3d(0, "+s[a]+"px, 0);           transform: translate3d(0, "+s[a]+"px, 0); }"),t+=" body.pushable > .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher:after, body.pushable > .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher:after {   -webkit-transform: translate3d(0px, 0, 0);           transform: translate3d(0px, 0, 0); }"),r=e(t+="</style>").appendTo(u),w.debug("Adding sizing css to head",r)}},refresh:function(){w.verbose("Refreshing selector cache"),D=e(S.context),q=D.children(k.sidebar),j=D.children(k.pusher),D.children(k.fixed),w.clear.cache()},refreshSidebars:function(){w.verbose("Refreshing other sidebars"),q=D.children(k.sidebar)},repaint:function(){w.verbose("Forcing repaint event"),z.style.display="none";z.offsetHeight;z.scrollTop=z.scrollTop,z.style.display=""},setup:{cache:function(){w.cache={width:O.outerWidth(),height:O.outerHeight(),rtl:"rtl"==O.css("direction")}},layout:function(){0===D.children(k.pusher).length&&(w.debug("Adding wrapper element for sidebar"),w.error(P.pusher),j=e('<div class="pusher" />'),D.children().not(k.omitted).not(q).wrapAll(j),w.refresh()),0!==O.nextAll(k.pusher).length&&O.nextAll(k.pusher)[0]===j[0]||(w.debug("Moved sidebar to correct parent element"),w.error(P.movedSidebar,z),O.detach().prependTo(D),w.refresh()),w.clear.cache(),w.set.pushable(),w.set.direction()}},attachEvents:function(t,n){var i=e(t);n=e.isFunction(w[n])?w[n]:w.toggle,i.length>0?(w.debug("Attaching sidebar events to element",t,n),i.on("click"+E,n)):w.error(P.notFound,t)},show:function(t){if(t=e.isFunction(t)?t:function(){},w.is.hidden()){if(w.refreshSidebars(),S.overlay&&(w.error(P.overlay),S.transition="overlay"),w.refresh(),w.othersActive())if(w.debug("Other sidebars currently visible"),S.exclusive){if("overlay"!=S.transition)return void w.hideOthers(w.show);w.hideOthers()}else S.transition="overlay";w.pushPage(function(){t.call(z),S.onShow.call(z)}),S.onChange.call(z),S.onVisible.call(z)}else w.debug("Sidebar is already visible")},hide:function(t){t=e.isFunction(t)?t:function(){},(w.is.visible()||w.is.animating())&&(w.debug("Hiding sidebar",t),w.refreshSidebars(),w.pullPage(function(){t.call(z),S.onHidden.call(z)}),S.onChange.call(z),S.onHide.call(z))},othersAnimating:function(){return q.not(O).filter("."+T.animating).length>0},othersVisible:function(){return q.not(O).filter("."+T.visible).length>0},othersActive:function(){return w.othersVisible()||w.othersAnimating()},hideOthers:function(e){var t=q.not(O).filter("."+T.visible),n=t.length,i=0;e=e||function(){},t.sidebar("hide",function(){++i==n&&e()})},toggle:function(){w.verbose("Determining toggled direction"),w.is.hidden()?w.show():w.hide()},pushPage:function(t){var n,i,o,a=w.get.transition(),r="overlay"===a||w.othersActive()?O:j;t=e.isFunction(t)?t:function(){},"scale down"==S.transition&&w.scrollToTop(),w.set.transition(a),w.repaint(),n=function(){w.bind.clickaway(),w.add.inlineCSS(),w.set.animating(),w.set.visible()},i=function(){w.set.dimmed()},o=function(e){e.target==r[0]&&(r.off(C+b,o),w.remove.animating(),w.bind.scrollLock(),t.call(z))},r.off(C+b),r.on(C+b,o),v(n),S.dimPage&&!w.othersVisible()&&v(i)},pullPage:function(t){var n,i,o=w.get.transition(),a="overlay"==o||w.othersActive()?O:j;t=e.isFunction(t)?t:function(){},w.verbose("Removing context push state",w.get.direction()),w.unbind.clickaway(),w.unbind.scrollLock(),n=function(){w.set.transition(o),w.set.animating(),w.remove.visible(),S.dimPage&&!w.othersVisible()&&j.removeClass(T.dimmed)},i=function(e){e.target==a[0]&&(a.off(C+b,i),w.remove.animating(),w.remove.transition(),w.remove.inlineCSS(),("scale down"==o||S.returnScroll&&w.is.mobile())&&w.scrollBack(),t.call(z))},a.off(C+b),a.on(C+b,i),v(n)},scrollToTop:function(){w.verbose("Scrolling to top of page to avoid animation issues"),x=e(t).scrollTop(),O.scrollTop(0),t.scrollTo(0,0)},scrollBack:function(){w.verbose("Scrolling back to original page position"),t.scrollTo(0,x)},clear:{cache:function(){w.verbose("Clearing cached dimensions"),w.cache={}}},set:{ios:function(){c.addClass(T.ios)},pushed:function(){D.addClass(T.pushed)},pushable:function(){D.addClass(T.pushable)},dimmed:function(){j.addClass(T.dimmed)},active:function(){O.addClass(T.active)},animating:function(){O.addClass(T.animating)},transition:function(e){e=e||w.get.transition(),O.addClass(e)},direction:function(e){e=e||w.get.direction(),O.addClass(T[e])},visible:function(){O.addClass(T.visible)},overlay:function(){O.addClass(T.overlay)}},remove:{inlineCSS:function(){w.debug("Removing inline css styles",r),r&&r.length>0&&r.remove()},ios:function(){c.removeClass(T.ios)},pushed:function(){D.removeClass(T.pushed)},pushable:function(){D.removeClass(T.pushable)},active:function(){O.removeClass(T.active)},animating:function(){O.removeClass(T.animating)},transition:function(e){e=e||w.get.transition(),O.removeClass(e)},direction:function(e){e=e||w.get.direction(),O.removeClass(T[e])},visible:function(){O.removeClass(T.visible)},overlay:function(){O.removeClass(T.overlay)}},get:{direction:function(){return O.hasClass(T.top)?T.top:O.hasClass(T.right)?T.right:O.hasClass(T.bottom)?T.bottom:T.left},transition:function(){var e,t=w.get.direction();return e=w.is.mobile()?"auto"==S.mobileTransition?S.defaultTransition.mobile[t]:S.mobileTransition:"auto"==S.transition?S.defaultTransition.computer[t]:S.transition,w.verbose("Determined transition",e),e},transitionEvent:function(){var e,t=n.createElement("element"),o={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(e in o)if(t.style[e]!==i)return o[e]}},is:{ie:function(){return!t.ActiveXObject&&"ActiveXObject"in t||"ActiveXObject"in t},ios:function(){var e=navigator.userAgent,t=e.match(R.ios),n=e.match(R.mobileChrome);return!(!t||n)&&(w.verbose("Browser was found to be iOS",e),!0)},mobile:function(){var e=navigator.userAgent;return e.match(R.mobile)?(w.verbose("Browser was found to be mobile",e),!0):(w.verbose("Browser is not mobile, using regular transition",e),!1)},hidden:function(){return!w.is.visible()},visible:function(){return O.hasClass(T.visible)},open:function(){return w.is.visible()},closed:function(){return w.is.hidden()},vertical:function(){return O.hasClass(T.top)},animating:function(){return D.hasClass(T.animating)},rtl:function(){return w.cache.rtl===i&&(w.cache.rtl="rtl"==O.css("direction")),w.cache.rtl}},setting:function(t,n){if(w.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,S,t);else{if(n===i)return S[t];e.isPlainObject(S[t])?e.extend(!0,S[t],n):S[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,w,t);else{if(n===i)return w[t];w[t]=n}},debug:function(){!S.silent&&S.debug&&(S.performance?w.performance.log(arguments):(w.debug=Function.prototype.bind.call(console.info,console,S.name+":"),w.debug.apply(console,arguments)))},verbose:function(){!S.silent&&S.verbose&&S.debug&&(S.performance?w.performance.log(arguments):(w.verbose=Function.prototype.bind.call(console.info,console,S.name+":"),w.verbose.apply(console,arguments)))},error:function(){S.silent||(w.error=Function.prototype.bind.call(console.error,console,S.name+":"),w.error.apply(console,arguments))},performance:{log:function(e){var t,n;S.performance&&(n=(t=(new Date).getTime())-(f||t),f=t,m.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:z,"Execution Time":n})),clearTimeout(w.performance.timer),w.performance.timer=setTimeout(w.performance.display,500)},display:function(){var t=S.name+":",n=0;f=!1,clearTimeout(w.performance.timer),e.each(m,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",d&&(t+=" '"+d+"'"),(console.group!==i||console.table!==i)&&m.length>0&&(console.groupCollapsed(t),console.table?console.table(m):e.each(m,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),m=[]}},invoke:function(t,n,o){var r,s,l,c=I;return n=n||h,o=z||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(w.error(P.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},p?(I===i&&w.initialize(),w.invoke(g)):(I!==i&&w.invoke("destroy"),w.initialize())}),a!==i?a:this},e.fn.sidebar.settings={name:"Sidebar",namespace:"sidebar",silent:!1,debug:!1,verbose:!1,performance:!0,transition:"auto",mobileTransition:"auto",defaultTransition:{computer:{left:"uncover",right:"uncover",top:"overlay",bottom:"overlay"},mobile:{left:"uncover",right:"uncover",top:"overlay",bottom:"overlay"}},context:"body",exclusive:!1,closable:!0,dimPage:!0,scrollLock:!1,returnScroll:!1,delaySetup:!1,duration:500,onChange:function(){},onShow:function(){},onHide:function(){},onHidden:function(){},onVisible:function(){},className:{active:"active",animating:"animating",dimmed:"dimmed",ios:"ios",pushable:"pushable",pushed:"pushed",right:"right",top:"top",left:"left",bottom:"bottom",visible:"visible"},selector:{fixed:".fixed",omitted:"script, link, style, .ui.modal, .ui.dimmer, .ui.nag, .ui.fixed",pusher:".pusher",sidebar:".ui.sidebar"},regExp:{ios:/(iPad|iPhone|iPod)/g,mobileChrome:/(CriOS)/g,mobile:/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/g},error:{method:"The method you called is not defined.",pusher:"Had to add pusher element. For optimal performance make sure body content is inside a pusher element",movedSidebar:"Had to move sidebar. For optimal performance make sure sidebar and pusher are direct children of your body tag",overlay:"The overlay setting is no longer supported, use animation: overlay",notFound:"There were no elements that matched the specified selector"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.sticky=function(o){var a,r=e(this),s=r.selector||"",l=(new Date).getTime(),c=[],u=arguments[0],d="string"==typeof u,f=[].slice.call(arguments,1);return r.each(function(){var r,m,g,p,h,v=e.isPlainObject(o)?e.extend(!0,{},e.fn.sticky.settings,o):e.extend({},e.fn.sticky.settings),b=v.className,y=v.namespace,x=v.error,C="."+y,w="module-"+y,S=e(this),k=e(t),T=e(v.scrollContext),A=(S.selector,S.data(w)),R=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)},P=this;h={initialize:function(){h.determineContainer(),h.determineContext(),h.verbose("Initializing sticky",v,r),h.save.positions(),h.checkErrors(),h.bind.events(),v.observeChanges&&h.observeChanges(),h.instantiate()},instantiate:function(){h.verbose("Storing instance of module",h),A=h,S.data(w,h)},destroy:function(){h.verbose("Destroying previous instance"),h.reset(),g&&g.disconnect(),p&&p.disconnect(),k.off("load"+C,h.event.load).off("resize"+C,h.event.resize),T.off("scrollchange"+C,h.event.scrollchange),S.removeData(w)},observeChanges:function(){"MutationObserver"in t&&(g=new MutationObserver(h.event.documentChanged),p=new MutationObserver(h.event.changed),g.observe(n,{childList:!0,subtree:!0}),p.observe(P,{childList:!0,subtree:!0}),p.observe(m[0],{childList:!0,subtree:!0}),h.debug("Setting up mutation observer",p))},determineContainer:function(){r=v.container?e(v.container):S.offsetParent()},determineContext:function(){0!==(m=v.context?e(v.context):r).length||h.error(x.invalidContext,v.context,S)},checkErrors:function(){if(h.is.hidden()&&h.error(x.visible,S),h.cache.element.height>h.cache.context.height)return h.reset(),void h.error(x.elementSize,S)},bind:{events:function(){k.on("load"+C,h.event.load).on("resize"+C,h.event.resize),T.off("scroll"+C).on("scroll"+C,h.event.scroll).on("scrollchange"+C,h.event.scrollchange)}},event:{changed:function(e){clearTimeout(h.timer),h.timer=setTimeout(function(){h.verbose("DOM tree modified, updating sticky menu",e),h.refresh()},100)},documentChanged:function(t){[].forEach.call(t,function(t){t.removedNodes&&[].forEach.call(t.removedNodes,function(t){(t==P||e(t).find(P).length>0)&&(h.debug("Element removed from DOM, tearing down events"),h.destroy())})})},load:function(){h.verbose("Page contents finished loading"),R(h.refresh)},resize:function(){h.verbose("Window resized"),R(h.refresh)},scroll:function(){R(function(){T.triggerHandler("scrollchange"+C,T.scrollTop())})},scrollchange:function(e,t){h.stick(t),v.onScroll.call(P)}},refresh:function(e){h.reset(),v.context||h.determineContext(),e&&h.determineContainer(),h.save.positions(),h.stick(),v.onReposition.call(P)},supports:{sticky:function(){var t=e("<div/>");t[0];return t.addClass(b.supported),t.css("position").match("sticky")}},save:{lastScroll:function(e){h.lastScroll=e},elementScroll:function(e){h.elementScroll=e},positions:function(){var e={height:T.height()},t={margin:{top:parseInt(S.css("margin-top"),10),bottom:parseInt(S.css("margin-bottom"),10)},offset:S.offset(),width:S.outerWidth(),height:S.outerHeight()},n={offset:m.offset(),height:m.outerHeight()};r.outerHeight();h.is.standardScroll()||(h.debug("Non-standard scroll. Removing scroll offset from element offset"),e.top=T.scrollTop(),e.left=T.scrollLeft(),t.offset.top+=e.top,n.offset.top+=e.top,t.offset.left+=e.left,n.offset.left+=e.left),h.cache={fits:t.height+v.offset<=e.height,sameHeight:t.height==n.height,scrollContext:{height:e.height},element:{margin:t.margin,top:t.offset.top-t.margin.top,left:t.offset.left,width:t.width,height:t.height,bottom:t.offset.top+t.height},context:{top:n.offset.top,height:n.height,bottom:n.offset.top+n.height}},h.set.containerSize(),h.stick(),h.debug("Caching element positions",h.cache)}},get:{direction:function(e){var t="down";return e=e||T.scrollTop(),h.lastScroll!==i&&(h.lastScroll<e?t="down":h.lastScroll>e&&(t="up")),t},scrollChange:function(e){return e=e||T.scrollTop(),h.lastScroll?e-h.lastScroll:0},currentElementScroll:function(){return h.elementScroll?h.elementScroll:h.is.top()?Math.abs(parseInt(S.css("top"),10))||0:Math.abs(parseInt(S.css("bottom"),10))||0},elementScroll:function(e){e=e||T.scrollTop();var t=h.cache.element,n=h.cache.scrollContext,i=h.get.scrollChange(e),o=t.height-n.height+v.offset,a=h.get.currentElementScroll(),r=a+i;return a=h.cache.fits||r<0?0:r>o?o:r}},remove:{lastScroll:function(){delete h.lastScroll},elementScroll:function(e){delete h.elementScroll},minimumSize:function(){r.css("min-height","")},offset:function(){S.css("margin-top","")}},set:{offset:function(){h.verbose("Setting offset on element",v.offset),S.css("margin-top",v.offset)},containerSize:function(){var e=r.get(0).tagName;"HTML"===e||"body"==e?h.determineContainer():Math.abs(r.outerHeight()-h.cache.context.height)>v.jitter&&(h.debug("Context has padding, specifying exact height for container",h.cache.context.height),r.css({height:h.cache.context.height}))},minimumSize:function(){var e=h.cache.element;r.css("min-height",e.height)},scroll:function(e){h.debug("Setting scroll on element",e),h.elementScroll!=e&&(h.is.top()&&S.css("bottom","").css("top",-e),h.is.bottom()&&S.css("top","").css("bottom",e))},size:function(){0!==h.cache.element.height&&0!==h.cache.element.width&&(P.style.setProperty("width",h.cache.element.width+"px","important"),P.style.setProperty("height",h.cache.element.height+"px","important"))}},is:{standardScroll:function(){return T[0]==t},top:function(){return S.hasClass(b.top)},bottom:function(){return S.hasClass(b.bottom)},initialPosition:function(){return!h.is.fixed()&&!h.is.bound()},hidden:function(){return!S.is(":visible")},bound:function(){return S.hasClass(b.bound)},fixed:function(){return S.hasClass(b.fixed)}},stick:function(e){var t=e||T.scrollTop(),n=h.cache,i=n.fits,o=n.sameHeight,a=n.element,r=n.scrollContext,s=n.context,l=h.is.bottom()&&v.pushing?v.bottomOffset:v.offset,c=(e={top:t+l,bottom:t+l+r.height},h.get.direction(e.top),i?0:h.get.elementScroll(e.top)),u=!i;0!==a.height&&!o&&(h.is.initialPosition()?e.top>=s.bottom?(h.debug("Initial element position is bottom of container"),h.bindBottom()):e.top>a.top&&(a.height+e.top-c>=s.bottom?(h.debug("Initial element position is bottom of container"),h.bindBottom()):(h.debug("Initial element position is fixed"),h.fixTop())):h.is.fixed()?h.is.top()?e.top<=a.top?(h.debug("Fixed element reached top of container"),h.setInitialPosition()):a.height+e.top-c>=s.bottom?(h.debug("Fixed element reached bottom of container"),h.bindBottom()):u&&(h.set.scroll(c),h.save.lastScroll(e.top),h.save.elementScroll(c)):h.is.bottom()&&(e.bottom-a.height<=a.top?(h.debug("Bottom fixed rail has reached top of container"),h.setInitialPosition()):e.bottom>=s.bottom?(h.debug("Bottom fixed rail has reached bottom of container"),h.bindBottom()):u&&(h.set.scroll(c),h.save.lastScroll(e.top),h.save.elementScroll(c))):h.is.bottom()&&(e.top<=a.top?(h.debug("Jumped from bottom fixed to top fixed, most likely used home/end button"),h.setInitialPosition()):v.pushing?h.is.bound()&&e.bottom<=s.bottom&&(h.debug("Fixing bottom attached element to bottom of browser."),h.fixBottom()):h.is.bound()&&e.top<=s.bottom-a.height&&(h.debug("Fixing bottom attached element to top of browser."),h.fixTop())))},bindTop:function(){h.debug("Binding element to top of parent container"),h.remove.offset(),S.css({left:"",top:"",marginBottom:""}).removeClass(b.fixed).removeClass(b.bottom).addClass(b.bound).addClass(b.top),v.onTop.call(P),v.onUnstick.call(P)},bindBottom:function(){h.debug("Binding element to bottom of parent container"),h.remove.offset(),S.css({left:"",top:""}).removeClass(b.fixed).removeClass(b.top).addClass(b.bound).addClass(b.bottom),v.onBottom.call(P),v.onUnstick.call(P)},setInitialPosition:function(){h.debug("Returning to initial position"),h.unfix(),h.unbind()},fixTop:function(){h.debug("Fixing element to top of page"),v.setSize&&h.set.size(),h.set.minimumSize(),h.set.offset(),S.css({left:h.cache.element.left,bottom:"",marginBottom:""}).removeClass(b.bound).removeClass(b.bottom).addClass(b.fixed).addClass(b.top),v.onStick.call(P)},fixBottom:function(){h.debug("Sticking element to bottom of page"),v.setSize&&h.set.size(),h.set.minimumSize(),h.set.offset(),S.css({left:h.cache.element.left,bottom:"",marginBottom:""}).removeClass(b.bound).removeClass(b.top).addClass(b.fixed).addClass(b.bottom),v.onStick.call(P)},unbind:function(){h.is.bound()&&(h.debug("Removing container bound position on element"),h.remove.offset(),S.removeClass(b.bound).removeClass(b.top).removeClass(b.bottom))},unfix:function(){h.is.fixed()&&(h.debug("Removing fixed position on element"),h.remove.minimumSize(),h.remove.offset(),S.removeClass(b.fixed).removeClass(b.top).removeClass(b.bottom),v.onUnstick.call(P))},reset:function(){h.debug("Resetting elements position"),h.unbind(),h.unfix(),h.resetCSS(),h.remove.offset(),h.remove.lastScroll()},resetCSS:function(){S.css({width:"",height:""}),r.css({height:""})},setting:function(t,n){if(e.isPlainObject(t))e.extend(!0,v,t);else{if(n===i)return v[t];v[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,h,t);else{if(n===i)return h[t];h[t]=n}},debug:function(){!v.silent&&v.debug&&(v.performance?h.performance.log(arguments):(h.debug=Function.prototype.bind.call(console.info,console,v.name+":"),h.debug.apply(console,arguments)))},verbose:function(){!v.silent&&v.verbose&&v.debug&&(v.performance?h.performance.log(arguments):(h.verbose=Function.prototype.bind.call(console.info,console,v.name+":"),h.verbose.apply(console,arguments)))},error:function(){v.silent||(h.error=Function.prototype.bind.call(console.error,console,v.name+":"),h.error.apply(console,arguments))},performance:{log:function(e){var t,n;v.performance&&(n=(t=(new Date).getTime())-(l||t),l=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:P,"Execution Time":n})),clearTimeout(h.performance.timer),h.performance.timer=setTimeout(h.performance.display,0)},display:function(){var t=v.name+":",n=0;l=!1,clearTimeout(h.performance.timer),e.each(c,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",s&&(t+=" '"+s+"'"),(console.group!==i||console.table!==i)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,n,o){var r,s,l,c=A;return n=n||f,o=P||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},d?(A===i&&h.initialize(),h.invoke(u)):(A!==i&&A.invoke("destroy"),h.initialize())}),a!==i?a:this},e.fn.sticky.settings={name:"Sticky",namespace:"sticky",silent:!1,debug:!1,verbose:!0,performance:!0,pushing:!1,context:!1,container:!1,scrollContext:t,offset:0,bottomOffset:0,jitter:5,setSize:!0,observeChanges:!1,onReposition:function(){},onScroll:function(){},onStick:function(){},onUnstick:function(){},onTop:function(){},onBottom:function(){},error:{container:"Sticky element must be inside a relative container",visible:"Element is hidden, you must call refresh after element becomes visible. Use silent setting to surpress this warning in production.",method:"The method you called is not defined.",invalidContext:"Context specified does not exist",elementSize:"Sticky element is larger than its container, cannot create sticky."},className:{bound:"bound",fixed:"fixed",supported:"native",top:"top",bottom:"bottom"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.tab=function(o){var a,r=e.isFunction(this)?e(t):e(this),s=r.selector||"",l=(new Date).getTime(),c=[],u=arguments[0],d="string"==typeof u,f=[].slice.call(arguments,1),m=!1;return r.each(function(){var g,p,h,v,b,y,x=e.isPlainObject(o)?e.extend(!0,{},e.fn.tab.settings,o):e.extend({},e.fn.tab.settings),C=x.className,w=x.metadata,S=x.selector,k=x.error,T="."+x.namespace,A="module-"+x.namespace,R=e(this),P={},E=!0,F=0,O=this,D=R.data(A);b={initialize:function(){b.debug("Initializing tab menu item",R),b.fix.callbacks(),b.determineTabs(),b.debug("Determining tabs",x.context,p),x.auto&&b.set.auto(),b.bind.events(),x.history&&!m&&(b.initializeHistory(),m=!0),b.instantiate()},instantiate:function(){b.verbose("Storing instance of module",b),D=b,R.data(A,b)},destroy:function(){b.debug("Destroying tabs",R),R.removeData(A).off(T)},bind:{events:function(){e.isWindow(O)||(b.debug("Attaching tab activation events to element",R),R.on("click"+T,b.event.click))}},determineTabs:function(){var t;"parent"===x.context?(R.closest(S.ui).length>0?(t=R.closest(S.ui),b.verbose("Using closest UI element as parent",t)):t=R,g=t.parent(),b.verbose("Determined parent element for creating context",g)):x.context?(g=e(x.context),b.verbose("Using selector for tab context",x.context,g)):g=e("body"),x.childrenOnly?(p=g.children(S.tabs),b.debug("Searching tab context children for tabs",g,p)):(p=g.find(S.tabs),b.debug("Searching tab context for tabs",g,p))},fix:{callbacks:function(){e.isPlainObject(o)&&(o.onTabLoad||o.onTabInit)&&(o.onTabLoad&&(o.onLoad=o.onTabLoad,delete o.onTabLoad,b.error(k.legacyLoad,o.onLoad)),o.onTabInit&&(o.onFirstLoad=o.onTabInit,delete o.onTabInit,b.error(k.legacyInit,o.onFirstLoad)),x=e.extend(!0,{},e.fn.tab.settings,o))}},initializeHistory:function(){if(b.debug("Initializing page state"),e.address===i)return b.error(k.state),!1;if("state"==x.historyType){if(b.debug("Using HTML5 to manage state"),!1===x.path)return b.error(k.path),!1;e.address.history(!0).state(x.path)}e.address.bind("change",b.event.history.change)},event:{click:function(t){var n=e(this).data(w.tab);n!==i?(x.history?(b.verbose("Updating page state",t),e.address.value(n)):(b.verbose("Changing tab",t),b.changeTab(n)),t.preventDefault()):b.debug("No tab specified")},history:{change:function(t){var n=t.pathNames.join("/")||b.get.initialPath(),o=x.templates.determineTitle(n)||!1;b.performance.display(),b.debug("History change event",n,t),y=t,n!==i&&b.changeTab(n),o&&e.address.title(o)}}},refresh:function(){h&&(b.debug("Refreshing tab",h),b.changeTab(h))},cache:{read:function(e){return e!==i&&P[e]},add:function(e,t){e=e||h,b.debug("Adding cached content for",e),P[e]=t},remove:function(e){e=e||h,b.debug("Removing cached content for",e),delete P[e]}},set:{auto:function(){var t="string"==typeof x.path?x.path.replace(/\/$/,"")+"/{$tab}":"/{$tab}";b.verbose("Setting up automatic tab retrieval from server",t),e.isPlainObject(x.apiSettings)?x.apiSettings.url=t:x.apiSettings={url:t}},loading:function(e){var t=b.get.tabElement(e);t.hasClass(C.loading)||(b.verbose("Setting loading state for",t),t.addClass(C.loading).siblings(p).removeClass(C.active+" "+C.loading),t.length>0&&x.onRequest.call(t[0],e))},state:function(t){e.address.value(t)}},changeTab:function(n){var i=t.history&&t.history.pushState&&x.ignoreFirstLoad&&E,o=x.auto||e.isPlainObject(x.apiSettings),a=o&&!i?b.utilities.pathToArray(n):b.get.defaultPathArray(n);n=b.utilities.arrayToPath(a),e.each(a,function(t,r){var s,l,c,u,d=a.slice(0,t+1),f=b.utilities.arrayToPath(d),m=b.is.tab(f),p=t+1==a.length,S=b.get.tabElement(f);if(b.verbose("Looking for tab",r),m){if(b.verbose("Tab was found",r),h=f,v=b.utilities.filterArray(a,d),p?u=!0:(l=a.slice(0,t+2),c=b.utilities.arrayToPath(l),(u=!b.is.tab(c))&&b.verbose("Tab parameters found",l)),u&&o)return i?(b.debug("Ignoring remote content on first tab load",f),E=!1,b.cache.add(n,S.html()),b.activate.all(f),x.onFirstLoad.call(S[0],f,v,y),x.onLoad.call(S[0],f,v,y)):(b.activate.navigation(f),b.fetch.content(f,n)),!1;b.debug("Opened local tab",f),b.activate.all(f),b.cache.read(f)||(b.cache.add(f,!0),b.debug("First time tab loaded calling tab init"),x.onFirstLoad.call(S[0],f,v,y)),x.onLoad.call(S[0],f,v,y)}else{if(-1!=n.search("/")||""===n)return b.error(k.missingTab,R,g,f),!1;if(f=(s=e("#"+n+', a[name="'+n+'"]')).closest("[data-tab]").data(w.tab),S=b.get.tabElement(f),s&&s.length>0&&f)return b.debug("Anchor link used, opening parent tab",S,s),S.hasClass(C.active)||setTimeout(function(){b.scrollTo(s)},0),b.activate.all(f),b.cache.read(f)||(b.cache.add(f,!0),b.debug("First time tab loaded calling tab init"),x.onFirstLoad.call(S[0],f,v,y)),x.onLoad.call(S[0],f,v,y),!1}})},scrollTo:function(t){var i=!!(t&&t.length>0)&&t.offset().top;!1!==i&&(b.debug("Forcing scroll to an in-page link in a hidden tab",i,t),e(n).scrollTop(i))},update:{content:function(t,n,o){var a=b.get.tabElement(t),r=a[0];o=o!==i?o:x.evaluateScripts,"string"==typeof x.cacheType&&"dom"==x.cacheType.toLowerCase()&&"string"!=typeof n?a.empty().append(e(n).clone(!0)):o?(b.debug("Updating HTML and evaluating inline scripts",t,n),a.html(n)):(b.debug("Updating HTML",t,n),r.innerHTML=n)}},fetch:{content:function(t,n){var o,a,r=b.get.tabElement(t),s={dataType:"html",encodeParameters:!1,on:"now",cache:x.alwaysRefresh,headers:{"X-Remote":!0},onSuccess:function(e){"response"==x.cacheType&&b.cache.add(n,e),b.update.content(t,e),t==h?(b.debug("Content loaded",t),b.activate.tab(t)):b.debug("Content loaded in background",t),x.onFirstLoad.call(r[0],t,v,y),x.onLoad.call(r[0],t,v,y),x.loadOnce?b.cache.add(n,!0):"string"==typeof x.cacheType&&"dom"==x.cacheType.toLowerCase()&&r.children().length>0?setTimeout(function(){var e=r.children().clone(!0);e=e.not("script"),b.cache.add(n,e)},0):b.cache.add(n,r.html())},urlData:{tab:n}},l=r.api("get request")||!1,c=l&&"pending"===l.state();n=n||t,a=b.cache.read(n),x.cache&&a?(b.activate.tab(t),b.debug("Adding cached content",n),x.loadOnce||("once"==x.evaluateScripts?b.update.content(t,a,!1):b.update.content(t,a)),x.onLoad.call(r[0],t,v,y)):c?(b.set.loading(t),b.debug("Content is already loading",n)):e.api!==i?(o=e.extend(!0,{},x.apiSettings,s),b.debug("Retrieving remote content",n,o),b.set.loading(t),r.api(o)):b.error(k.api)}},activate:{all:function(e){b.activate.tab(e),b.activate.navigation(e)},tab:function(e){var t=b.get.tabElement(e),n="siblings"==x.deactivate?t.siblings(p):p.not(t),i=t.hasClass(C.active);b.verbose("Showing tab content for",t),i||(t.addClass(C.active),n.removeClass(C.active+" "+C.loading),t.length>0&&x.onVisible.call(t[0],e))},navigation:function(e){var t=b.get.navElement(e),n="siblings"==x.deactivate?t.siblings(r):r.not(t),i=t.hasClass(C.active);b.verbose("Activating tab navigation for",t,e),i||(t.addClass(C.active),n.removeClass(C.active+" "+C.loading))}},deactivate:{all:function(){b.deactivate.navigation(),b.deactivate.tabs()},navigation:function(){r.removeClass(C.active)},tabs:function(){p.removeClass(C.active+" "+C.loading)}},is:{tab:function(e){return e!==i&&b.get.tabElement(e).length>0}},get:{initialPath:function(){return r.eq(0).data(w.tab)||p.eq(0).data(w.tab)},path:function(){return e.address.value()},defaultPathArray:function(e){return b.utilities.pathToArray(b.get.defaultPath(e))},defaultPath:function(e){var t=r.filter("[data-"+w.tab+'^="'+e+'/"]').eq(0).data(w.tab)||!1;if(t){if(b.debug("Found default tab",t),F<x.maxDepth)return F++,b.get.defaultPath(t);b.error(k.recursion)}else b.debug("No default tabs found for",e,p);return F=0,e},navElement:function(e){return e=e||h,r.filter("[data-"+w.tab+'="'+e+'"]')},tabElement:function(e){var t,n,i,o;return e=e||h,i=b.utilities.pathToArray(e),o=b.utilities.last(i),t=p.filter("[data-"+w.tab+'="'+e+'"]'),n=p.filter("[data-"+w.tab+'="'+o+'"]'),t.length>0?t:n},tab:function(){return h}},utilities:{filterArray:function(t,n){return e.grep(t,function(t){return-1==e.inArray(t,n)})},last:function(t){return!!e.isArray(t)&&t[t.length-1]},pathToArray:function(e){return e===i&&(e=h),"string"==typeof e?e.split("/"):[e]},arrayToPath:function(t){return!!e.isArray(t)&&t.join("/")}},setting:function(t,n){if(b.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,x,t);else{if(n===i)return x[t];e.isPlainObject(x[t])?e.extend(!0,x[t],n):x[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,b,t);else{if(n===i)return b[t];b[t]=n}},debug:function(){!x.silent&&x.debug&&(x.performance?b.performance.log(arguments):(b.debug=Function.prototype.bind.call(console.info,console,x.name+":"),b.debug.apply(console,arguments)))},verbose:function(){!x.silent&&x.verbose&&x.debug&&(x.performance?b.performance.log(arguments):(b.verbose=Function.prototype.bind.call(console.info,console,x.name+":"),b.verbose.apply(console,arguments)))},error:function(){x.silent||(b.error=Function.prototype.bind.call(console.error,console,x.name+":"),b.error.apply(console,arguments))},performance:{log:function(e){var t,n;x.performance&&(n=(t=(new Date).getTime())-(l||t),l=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:O,"Execution Time":n})),clearTimeout(b.performance.timer),b.performance.timer=setTimeout(b.performance.display,500)},display:function(){var t=x.name+":",n=0;l=!1,clearTimeout(b.performance.timer),e.each(c,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",s&&(t+=" '"+s+"'"),(console.group!==i||console.table!==i)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,n,o){var r,s,l,c=D;return n=n||f,o=O||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(b.error(k.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},d?(D===i&&b.initialize(),b.invoke(u)):(D!==i&&D.invoke("destroy"),b.initialize())}),a!==i?a:this},e.tab=function(){e(t).tab.apply(this,arguments)},e.fn.tab.settings={name:"Tab",namespace:"tab",silent:!1,debug:!1,verbose:!1,performance:!0,auto:!1,history:!1,historyType:"hash",path:!1,context:!1,childrenOnly:!1,maxDepth:25,deactivate:"siblings",alwaysRefresh:!1,cache:!0,loadOnce:!1,cacheType:"response",ignoreFirstLoad:!1,apiSettings:!1,evaluateScripts:"once",onFirstLoad:function(e,t,n){},onLoad:function(e,t,n){},onVisible:function(e,t,n){},onRequest:function(e,t,n){},templates:{determineTitle:function(e){}},error:{api:"You attempted to load content without API module",method:"The method you called is not defined",missingTab:"Activated tab cannot be found. Tabs are case-sensitive.",noContent:"The tab you specified is missing a content url.",path:"History enabled, but no path was specified",recursion:"Max recursive depth reached",legacyInit:"onTabInit has been renamed to onFirstLoad in 2.0, please adjust your code.",legacyLoad:"onTabLoad has been renamed to onLoad in 2.0. Please adjust your code",state:"History requires Asual's Address library <https://github.com/asual/jquery-address>"},metadata:{tab:"tab",loaded:"loaded",promise:"promise"},className:{loading:"loading",active:"active"},selector:{tabs:".ui.tab",ui:".ui"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.transition=function(){var o,a=e(this),r=a.selector||"",s=(new Date).getTime(),l=[],c=arguments,u=c[0],d=[].slice.call(arguments,1),f="string"==typeof u;t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame;return a.each(function(t){var m,g,p,h,v,b,y,x,C,w=e(this),S=this;(C={initialize:function(){m=C.get.settings.apply(S,c),h=m.className,p=m.error,v=m.metadata,x="."+m.namespace,y="module-"+m.namespace,g=w.data(y)||C,b=C.get.animationEndEvent(),f&&(f=C.invoke(u)),!1===f&&(C.verbose("Converted arguments into settings object",m),m.interval?C.delay(m.animate):C.animate(),C.instantiate())},instantiate:function(){C.verbose("Storing instance of module",C),g=C,w.data(y,g)},destroy:function(){C.verbose("Destroying previous module for",S),w.removeData(y)},refresh:function(){C.verbose("Refreshing display type on next animation"),delete C.displayType},forceRepaint:function(){C.verbose("Forcing element repaint");var e=w.parent(),t=w.next();0===t.length?w.detach().appendTo(e):w.detach().insertBefore(t)},repaint:function(){C.verbose("Repainting element");S.offsetWidth},delay:function(e){var n,o=C.get.animationDirection();o||(o=C.can.transition()?C.get.direction():"static"),e=e!==i?e:m.interval,n="auto"==m.reverse&&o==h.outward||1==m.reverse?(a.length-t)*m.interval:t*m.interval,C.debug("Delaying animation by",n),setTimeout(C.animate,n)},animate:function(e){if(m=e||m,!C.is.supported())return C.error(p.support),!1;if(C.debug("Preparing animation",m.animation),C.is.animating()){if(m.queue)return!m.allowRepeats&&C.has.direction()&&C.is.occurring()&&!0!==C.queuing?C.debug("Animation is currently occurring, preventing queueing same animation",m.animation):C.queue(m.animation),!1;if(!m.allowRepeats&&C.is.occurring())return C.debug("Animation is already occurring, will not execute repeated animation",m.animation),!1;C.debug("New animation started, completing previous early",m.animation),g.complete()}C.can.animate()?C.set.animating(m.animation):C.error(p.noAnimation,m.animation,S)},reset:function(){C.debug("Resetting animation to beginning conditions"),C.remove.animationCallbacks(),C.restore.conditions(),C.remove.animating()},queue:function(e){C.debug("Queueing animation of",e),C.queuing=!0,w.one(b+".queue"+x,function(){C.queuing=!1,C.repaint(),C.animate.apply(this,m)})},complete:function(e){C.debug("Animation complete",m.animation),C.remove.completeCallback(),C.remove.failSafe(),C.is.looping()||(C.is.outward()?(C.verbose("Animation is outward, hiding element"),C.restore.conditions(),C.hide()):C.is.inward()?(C.verbose("Animation is outward, showing element"),C.restore.conditions(),C.show()):(C.verbose("Static animation completed"),C.restore.conditions(),m.onComplete.call(S)))},force:{visible:function(){var e=w.attr("style"),t=C.get.userStyle(),n=C.get.displayType(),o=t+"display: "+n+" !important;",a=w.css("display"),r=e===i||""===e;a!==n?(C.verbose("Overriding default display to show element",n),w.attr("style",o)):r&&w.removeAttr("style")},hidden:function(){var e=w.attr("style"),t=w.css("display"),n=e===i||""===e;"none"===t||C.is.hidden()?n&&w.removeAttr("style"):(C.verbose("Overriding default display to hide element"),w.css("display","none"))}},has:{direction:function(t){var n=!1;return"string"==typeof(t=t||m.animation)&&(t=t.split(" "),e.each(t,function(e,t){t!==h.inward&&t!==h.outward||(n=!0)})),n},inlineDisplay:function(){var t=w.attr("style")||"";return e.isArray(t.match(/display.*?;/,""))}},set:{animating:function(e){var t;C.remove.completeCallback(),e=e||m.animation,t=C.get.animationClass(e),C.save.animation(t),C.force.visible(),C.remove.hidden(),C.remove.direction(),C.start.animation(t)},duration:function(e,t){((t="number"==typeof(t=t||m.duration)?t+"ms":t)||0===t)&&(C.verbose("Setting animation duration",t),w.css({"animation-duration":t}))},direction:function(e){(e=e||C.get.direction())==h.inward?C.set.inward():C.set.outward()},looping:function(){C.debug("Transition set to loop"),w.addClass(h.looping)},hidden:function(){w.addClass(h.transition).addClass(h.hidden)},inward:function(){C.debug("Setting direction to inward"),w.removeClass(h.outward).addClass(h.inward)},outward:function(){C.debug("Setting direction to outward"),w.removeClass(h.inward).addClass(h.outward)},visible:function(){w.addClass(h.transition).addClass(h.visible)}},start:{animation:function(e){e=e||C.get.animationClass(),C.debug("Starting tween",e),w.addClass(e).one(b+".complete"+x,C.complete),m.useFailSafe&&C.add.failSafe(),C.set.duration(m.duration),m.onStart.call(S)}},save:{animation:function(e){C.cache||(C.cache={}),C.cache.animation=e},displayType:function(e){"none"!==e&&w.data(v.displayType,e)},transitionExists:function(t,n){e.fn.transition.exists[t]=n,C.verbose("Saving existence of transition",t,n)}},restore:{conditions:function(){var e=C.get.currentAnimation();e&&(w.removeClass(e),C.verbose("Removing animation class",C.cache)),C.remove.duration()}},add:{failSafe:function(){var e=C.get.duration();C.timer=setTimeout(function(){w.triggerHandler(b)},e+m.failSafeDelay),C.verbose("Adding fail safe timer",C.timer)}},remove:{animating:function(){w.removeClass(h.animating)},animationCallbacks:function(){C.remove.queueCallback(),C.remove.completeCallback()},queueCallback:function(){w.off(".queue"+x)},completeCallback:function(){w.off(".complete"+x)},display:function(){w.css("display","")},direction:function(){w.removeClass(h.inward).removeClass(h.outward)},duration:function(){w.css("animation-duration","")},failSafe:function(){C.verbose("Removing fail safe timer",C.timer),C.timer&&clearTimeout(C.timer)},hidden:function(){w.removeClass(h.hidden)},visible:function(){w.removeClass(h.visible)},looping:function(){C.debug("Transitions are no longer looping"),C.is.looping()&&(C.reset(),w.removeClass(h.looping))},transition:function(){w.removeClass(h.visible).removeClass(h.hidden)}},get:{settings:function(t,n,i){return"object"==typeof t?e.extend(!0,{},e.fn.transition.settings,t):"function"==typeof i?e.extend({},e.fn.transition.settings,{animation:t,onComplete:i,duration:n}):"string"==typeof n||"number"==typeof n?e.extend({},e.fn.transition.settings,{animation:t,duration:n}):"object"==typeof n?e.extend({},e.fn.transition.settings,n,{animation:t}):"function"==typeof n?e.extend({},e.fn.transition.settings,{animation:t,onComplete:n}):e.extend({},e.fn.transition.settings,{animation:t})},animationClass:function(e){var t=e||m.animation,n=C.can.transition()&&!C.has.direction()?C.get.direction()+" ":"";return h.animating+" "+h.transition+" "+n+t},currentAnimation:function(){return!(!C.cache||C.cache.animation===i)&&C.cache.animation},currentDirection:function(){return C.is.inward()?h.inward:h.outward},direction:function(){return C.is.hidden()||!C.is.visible()?h.inward:h.outward},animationDirection:function(t){var n;return"string"==typeof(t=t||m.animation)&&(t=t.split(" "),e.each(t,function(e,t){t===h.inward?n=h.inward:t===h.outward&&(n=h.outward)})),n||!1},duration:function(e){return!1===(e=e||m.duration)&&(e=w.css("animation-duration")||0),"string"==typeof e?e.indexOf("ms")>-1?parseFloat(e):1e3*parseFloat(e):e},displayType:function(e){return e=e===i||e,m.displayType?m.displayType:(e&&w.data(v.displayType)===i&&C.can.transition(!0),w.data(v.displayType))},userStyle:function(e){return(e=e||w.attr("style")||"").replace(/display.*?;/,"")},transitionExists:function(t){return e.fn.transition.exists[t]},animationStartEvent:function(){var e,t=n.createElement("div"),o={animation:"animationstart",OAnimation:"oAnimationStart",MozAnimation:"mozAnimationStart",WebkitAnimation:"webkitAnimationStart"};for(e in o)if(t.style[e]!==i)return o[e];return!1},animationEndEvent:function(){var e,t=n.createElement("div"),o={animation:"animationend",OAnimation:"oAnimationEnd",MozAnimation:"mozAnimationEnd",WebkitAnimation:"webkitAnimationEnd"};for(e in o)if(t.style[e]!==i)return o[e];return!1}},can:{transition:function(t){var n,o,a,r,s,l,c=m.animation,u=C.get.transitionExists(c),d=C.get.displayType(!1);if(u===i||t){if(C.verbose("Determining whether animation exists"),n=w.attr("class"),o=w.prop("tagName"),r=(a=e("<"+o+" />").addClass(n).insertAfter(w)).addClass(c).removeClass(h.inward).removeClass(h.outward).addClass(h.animating).addClass(h.transition).css("animationName"),s=a.addClass(h.inward).css("animationName"),d||(d=a.attr("class",n).removeAttr("style").removeClass(h.hidden).removeClass(h.visible).show().css("display"),C.verbose("Determining final display state",d),C.save.displayType(d)),a.remove(),r!=s)C.debug("Direction exists for animation",c),l=!0;else{if("none"==r||!r)return void C.debug("No animation defined in css",c);C.debug("Static animation found",c,d),l=!1}C.save.transitionExists(c,l)}return u!==i?u:l},animate:function(){return C.can.transition()!==i}},is:{animating:function(){return w.hasClass(h.animating)},inward:function(){return w.hasClass(h.inward)},outward:function(){return w.hasClass(h.outward)},looping:function(){return w.hasClass(h.looping)},occurring:function(e){return e="."+(e=e||m.animation).replace(" ","."),w.filter(e).length>0},visible:function(){return w.is(":visible")},hidden:function(){return"hidden"===w.css("visibility")},supported:function(){return!1!==b}},hide:function(){C.verbose("Hiding element"),C.is.animating()&&C.reset(),S.blur(),C.remove.display(),C.remove.visible(),C.set.hidden(),C.force.hidden(),m.onHide.call(S),m.onComplete.call(S)},show:function(e){C.verbose("Showing element",e),C.remove.hidden(),C.set.visible(),C.force.visible(),m.onShow.call(S),m.onComplete.call(S)},toggle:function(){C.is.visible()?C.hide():C.show()},stop:function(){C.debug("Stopping current animation"),w.triggerHandler(b)},stopAll:function(){C.debug("Stopping all animation"),C.remove.queueCallback(),w.triggerHandler(b)},clear:{queue:function(){C.debug("Clearing animation queue"),C.remove.queueCallback()}},enable:function(){C.verbose("Starting animation"),w.removeClass(h.disabled)},disable:function(){C.debug("Stopping animation"),w.addClass(h.disabled)},setting:function(t,n){if(C.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,m,t);else{if(n===i)return m[t];e.isPlainObject(m[t])?e.extend(!0,m[t],n):m[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,C,t);else{if(n===i)return C[t];C[t]=n}},debug:function(){!m.silent&&m.debug&&(m.performance?C.performance.log(arguments):(C.debug=Function.prototype.bind.call(console.info,console,m.name+":"),C.debug.apply(console,arguments)))},verbose:function(){!m.silent&&m.verbose&&m.debug&&(m.performance?C.performance.log(arguments):(C.verbose=Function.prototype.bind.call(console.info,console,m.name+":"),C.verbose.apply(console,arguments)))},error:function(){m.silent||(C.error=Function.prototype.bind.call(console.error,console,m.name+":"),C.error.apply(console,arguments))},performance:{log:function(e){var t,n;m.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:S,"Execution Time":n})),clearTimeout(C.performance.timer),C.performance.timer=setTimeout(C.performance.display,500)},display:function(){var t=m.name+":",n=0;s=!1,clearTimeout(C.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",r&&(t+=" '"+r+"'"),a.length>1&&(t+=" ("+a.length+")"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,a){var r,s,l,c=g;return n=n||d,a=S||a,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i&&(s=c[o],!1);c=c[o]}})),e.isFunction(s)?l=s.apply(a,n):s!==i&&(l=s),e.isArray(o)?o.push(l):o!==i?o=[o,l]:l!==i&&(o=l),s!==i&&s}}).initialize()}),o!==i?o:this},e.fn.transition.exists={},e.fn.transition.settings={name:"Transition",silent:!1,debug:!1,verbose:!1,performance:!0,namespace:"transition",interval:0,reverse:"auto",onStart:function(){},onComplete:function(){},onShow:function(){},onHide:function(){},useFailSafe:!0,failSafeDelay:100,allowRepeats:!1,displayType:!1,animation:"fade",duration:!1,queue:!0,metadata:{displayType:"display"},className:{animating:"animating",disabled:"disabled",hidden:"hidden",inward:"in",loading:"loading",looping:"looping",outward:"out",transition:"transition",visible:"visible"},error:{noAnimation:"Element is no longer attached to DOM. Unable to animate.  Use silent setting to surpress this warning in production.",repeated:"That animation is already occurring, cancelling repeated animation",method:"The method you called is not defined",support:"This browser does not support CSS animations"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();e.api=e.fn.api=function(n){var o,a=e.isFunction(this)?e(t):e(this),r=a.selector||"",s=(new Date).getTime(),l=[],c=arguments[0],u="string"==typeof c,d=[].slice.call(arguments,1);return a.each(function(){var a,f,m,g,p,h,v=e.isPlainObject(n)?e.extend(!0,{},e.fn.api.settings,n):e.extend({},e.fn.api.settings),b=v.namespace,y=v.metadata,x=v.selector,C=v.error,w=v.className,S="."+b,k="module-"+b,T=e(this),A=T.closest(x.form),R=v.stateContext?e(v.stateContext):T,P=this,E=R[0],F=T.data(k);h={initialize:function(){u||h.bind.events(),h.instantiate()},instantiate:function(){h.verbose("Storing instance of module",h),F=h,T.data(k,F)},destroy:function(){h.verbose("Destroying previous module for",P),T.removeData(k).off(S)},bind:{events:function(){var e=h.get.event();e?(h.verbose("Attaching API events to element",e),T.on(e+S,h.event.trigger)):"now"==v.on&&(h.debug("Querying API endpoint immediately"),h.query())}},decode:{json:function(e){if(e!==i&&"string"==typeof e)try{e=JSON.parse(e)}catch(e){}return e}},read:{cachedResponse:function(e){var n;if(t.Storage!==i)return n=sessionStorage.getItem(e),h.debug("Using cached response",e,n),n=h.decode.json(n);h.error(C.noStorage)}},write:{cachedResponse:function(n,o){o&&""===o?h.debug("Response empty, not caching",o):t.Storage!==i?(e.isPlainObject(o)&&(o=JSON.stringify(o)),sessionStorage.setItem(n,o),h.verbose("Storing cached response for url",n,o)):h.error(C.noStorage)}},query:function(){if(h.is.disabled())h.debug("Element is disabled API request aborted");else{if(h.is.loading()){if(!v.interruptRequests)return void h.debug("Cancelling request, previous request is still pending");h.debug("Interrupting previous request"),h.abort()}if(v.defaultData&&e.extend(!0,v.urlData,h.get.defaultData()),v.serializeForm&&(v.data=h.add.formData(v.data)),!1===(f=h.get.settings()))return h.cancelled=!0,void h.error(C.beforeSend);if(h.cancelled=!1,(m=h.get.templatedURL())||h.is.mocked()){if((m=h.add.urlData(m))||h.is.mocked()){if(f.url=v.base+m,a=e.extend(!0,{},v,{type:v.method||v.type,data:g,url:v.base+m,beforeSend:v.beforeXHR,success:function(){},failure:function(){},complete:function(){}}),h.debug("Querying URL",a.url),h.verbose("Using AJAX settings",a),"local"===v.cache&&h.read.cachedResponse(m))return h.debug("Response returned from local cache"),h.request=h.create.request(),void h.request.resolveWith(E,[h.read.cachedResponse(m)]);v.throttle?v.throttleFirstRequest||h.timer?(h.debug("Throttling request",v.throttle),clearTimeout(h.timer),h.timer=setTimeout(function(){h.timer&&delete h.timer,h.debug("Sending throttled request",g,a.method),h.send.request()},v.throttle)):(h.debug("Sending request",g,a.method),h.send.request(),h.timer=setTimeout(function(){},v.throttle)):(h.debug("Sending request",g,a.method),h.send.request())}}else h.error(C.missingURL)}},should:{removeError:function(){return!0===v.hideError||"auto"===v.hideError&&!h.is.form()}},is:{disabled:function(){return T.filter(x.disabled).length>0},expectingJSON:function(){return"json"===v.dataType||"jsonp"===v.dataType},form:function(){return T.is("form")||R.is("form")},mocked:function(){return v.mockResponse||v.mockResponseAsync||v.response||v.responseAsync},input:function(){return T.is("input")},loading:function(){return!!h.request&&"pending"==h.request.state()},abortedRequest:function(e){return e&&e.readyState!==i&&0===e.readyState?(h.verbose("XHR request determined to be aborted"),!0):(h.verbose("XHR request was not aborted"),!1)},validResponse:function(t){return h.is.expectingJSON()&&e.isFunction(v.successTest)?(h.debug("Checking JSON returned success",v.successTest,t),v.successTest(t)?(h.debug("Response passed success test",t),!0):(h.debug("Response failed success test",t),!1)):(h.verbose("Response is not JSON, skipping validation",v.successTest,t),!0)}},was:{cancelled:function(){return h.cancelled||!1},succesful:function(){return h.request&&"resolved"==h.request.state()},failure:function(){return h.request&&"rejected"==h.request.state()},complete:function(){return h.request&&("resolved"==h.request.state()||"rejected"==h.request.state())}},add:{urlData:function(t,n){var o,a;return t&&(o=t.match(v.regExp.required),a=t.match(v.regExp.optional),n=n||v.urlData,o&&(h.debug("Looking for required URL variables",o),e.each(o,function(o,a){var r=-1!==a.indexOf("$")?a.substr(2,a.length-3):a.substr(1,a.length-2),s=e.isPlainObject(n)&&n[r]!==i?n[r]:T.data(r)!==i?T.data(r):R.data(r)!==i?R.data(r):n[r];if(s===i)return h.error(C.requiredParameter,r,t),t=!1,!1;h.verbose("Found required variable",r,s),s=v.encodeParameters?h.get.urlEncodedValue(s):s,t=t.replace(a,s)})),a&&(h.debug("Looking for optional URL variables",o),e.each(a,function(o,a){var r=-1!==a.indexOf("$")?a.substr(3,a.length-4):a.substr(2,a.length-3),s=e.isPlainObject(n)&&n[r]!==i?n[r]:T.data(r)!==i?T.data(r):R.data(r)!==i?R.data(r):n[r];s!==i?(h.verbose("Optional variable Found",r,s),t=t.replace(a,s)):(h.verbose("Optional variable not found",r),t=-1!==t.indexOf("/"+a)?t.replace("/"+a,""):t.replace(a,""))}))),t},formData:function(t){var n=e.fn.serializeObject!==i,o=n?A.serializeObject():A.serialize();return t=t||v.data,e.isPlainObject(t)?n?(h.debug("Extending existing data with form data",t,o),t=e.extend(!0,{},t,o)):(h.error(C.missingSerialize),h.debug("Cant extend data. Replacing data with form data",t,o),t=o):(h.debug("Adding form data",o),t=o),t}},send:{request:function(){h.set.loading(),h.request=h.create.request(),h.is.mocked()?h.mockedXHR=h.create.mockedXHR():h.xhr=h.create.xhr(),v.onRequest.call(E,h.request,h.xhr)}},event:{trigger:function(e){h.query(),"submit"!=e.type&&"click"!=e.type||e.preventDefault()},xhr:{always:function(){},done:function(t,n,i){var o=this,a=(new Date).getTime()-p,r=v.loadingDuration-a,s=!!e.isFunction(v.onResponse)&&(h.is.expectingJSON()?v.onResponse.call(o,e.extend(!0,{},t)):v.onResponse.call(o,t));r=r>0?r:0,s&&(h.debug("Modified API response in onResponse callback",v.onResponse,s,t),t=s),r>0&&h.debug("Response completed early delaying state change by",r),setTimeout(function(){h.is.validResponse(t)?h.request.resolveWith(o,[t,i]):h.request.rejectWith(o,[i,"invalid"])},r)},fail:function(e,t,n){var i=this,o=(new Date).getTime()-p,a=v.loadingDuration-o;(a=a>0?a:0)>0&&h.debug("Response completed early delaying state change by",a),setTimeout(function(){h.is.abortedRequest(e)?h.request.rejectWith(i,[e,"aborted",n]):h.request.rejectWith(i,[e,"error",t,n])},a)}},request:{done:function(e,t){h.debug("Successful API Response",e),"local"===v.cache&&m&&(h.write.cachedResponse(m,e),h.debug("Saving server response locally",h.cache)),v.onSuccess.call(E,e,T,t)},complete:function(e,t){var n,i;h.was.succesful()?(i=e,n=t):(n=e,i=h.get.responseFromXHR(n)),h.remove.loading(),v.onComplete.call(E,i,T,n)},fail:function(e,t,n){var o=h.get.responseFromXHR(e),r=h.get.errorFromRequest(o,t,n);if("aborted"==t)return h.debug("XHR Aborted (Most likely caused by page navigation or CORS Policy)",t,n),v.onAbort.call(E,t,T,e),!0;"invalid"==t?h.debug("JSON did not pass success test. A server-side error has most likely occurred",o):"error"==t&&e!==i&&(h.debug("XHR produced a server error",t,n),200!=e.status&&n!==i&&""!==n&&h.error(C.statusMessage+n,a.url),v.onError.call(E,r,T,e)),v.errorDuration&&"aborted"!==t&&(h.debug("Adding error state"),h.set.error(),h.should.removeError()&&setTimeout(h.remove.error,v.errorDuration)),h.debug("API Request failed",r,e),v.onFailure.call(E,o,T,e)}}},create:{request:function(){return e.Deferred().always(h.event.request.complete).done(h.event.request.done).fail(h.event.request.fail)},mockedXHR:function(){var t,n,i,o=v.mockResponse||v.response,a=v.mockResponseAsync||v.responseAsync;return i=e.Deferred().always(h.event.xhr.complete).done(h.event.xhr.done).fail(h.event.xhr.fail),o?(e.isFunction(o)?(h.debug("Using specified synchronous callback",o),n=o.call(E,f)):(h.debug("Using settings specified response",o),n=o),i.resolveWith(E,[n,!1,{responseText:n}])):e.isFunction(a)&&(t=function(e){h.debug("Async callback returned response",e),e?i.resolveWith(E,[e,!1,{responseText:e}]):i.rejectWith(E,[{responseText:e},!1,!1])},h.debug("Using specified async response callback",a),a.call(E,f,t)),i},xhr:function(){var t;return t=e.ajax(a).always(h.event.xhr.always).done(h.event.xhr.done).fail(h.event.xhr.fail),h.verbose("Created server request",t,a),t}},set:{error:function(){h.verbose("Adding error state to element",R),R.addClass(w.error)},loading:function(){h.verbose("Adding loading state to element",R),R.addClass(w.loading),p=(new Date).getTime()}},remove:{error:function(){h.verbose("Removing error state from element",R),R.removeClass(w.error)},loading:function(){h.verbose("Removing loading state from element",R),R.removeClass(w.loading)}},get:{responseFromXHR:function(t){return!!e.isPlainObject(t)&&(h.is.expectingJSON()?h.decode.json(t.responseText):t.responseText)},errorFromRequest:function(t,n,o){return e.isPlainObject(t)&&t.error!==i?t.error:v.error[n]!==i?v.error[n]:o},request:function(){return h.request||!1},xhr:function(){return h.xhr||!1},settings:function(){var t;return(t=v.beforeSend.call(E,v))&&(t.success!==i&&(h.debug("Legacy success callback detected",t),h.error(C.legacyParameters,t.success),t.onSuccess=t.success),t.failure!==i&&(h.debug("Legacy failure callback detected",t),h.error(C.legacyParameters,t.failure),t.onFailure=t.failure),t.complete!==i&&(h.debug("Legacy complete callback detected",t),h.error(C.legacyParameters,t.complete),t.onComplete=t.complete)),t===i&&h.error(C.noReturnedValue),!1===t?t:t!==i?e.extend(!0,{},t):e.extend(!0,{},v)},urlEncodedValue:function(e){var n=t.decodeURIComponent(e),i=t.encodeURIComponent(e);return n!==e?(h.debug("URL value is already encoded, avoiding double encoding",e),e):(h.verbose("Encoding value using encodeURIComponent",e,i),i)},defaultData:function(){var t={};return e.isWindow(P)||(h.is.input()?t.value=T.val():h.is.form()||(t.text=T.text())),t},event:function(){return e.isWindow(P)||"now"==v.on?(h.debug("API called without element, no events attached"),!1):"auto"==v.on?T.is("input")?P.oninput!==i?"input":P.onpropertychange!==i?"propertychange":"keyup":T.is("form")?"submit":"click":v.on},templatedURL:function(e){if(e=e||T.data(y.action)||v.action||!1,m=T.data(y.url)||v.url||!1)return h.debug("Using specified url",m),m;if(e){if(h.debug("Looking up url for action",e,v.api),v.api[e]===i&&!h.is.mocked())return void h.error(C.missingAction,v.action,v.api);m=v.api[e]}else h.is.form()&&(m=T.attr("action")||R.attr("action")||!1,h.debug("No url or action specified, defaulting to form action",m));return m}},abort:function(){var e=h.get.xhr();e&&"resolved"!==e.state()&&(h.debug("Cancelling API request"),e.abort())},reset:function(){h.remove.error(),h.remove.loading()},setting:function(t,n){if(h.debug("Changing setting",t,n),e.isPlainObject(t))e.extend(!0,v,t);else{if(n===i)return v[t];e.isPlainObject(v[t])?e.extend(!0,v[t],n):v[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,h,t);else{if(n===i)return h[t];h[t]=n}},debug:function(){!v.silent&&v.debug&&(v.performance?h.performance.log(arguments):(h.debug=Function.prototype.bind.call(console.info,console,v.name+":"),h.debug.apply(console,arguments)))},verbose:function(){!v.silent&&v.verbose&&v.debug&&(v.performance?h.performance.log(arguments):(h.verbose=Function.prototype.bind.call(console.info,console,v.name+":"),h.verbose.apply(console,arguments)))},error:function(){v.silent||(h.error=Function.prototype.bind.call(console.error,console,v.name+":"),h.error.apply(console,arguments))},performance:{log:function(e){var t,n;v.performance&&(n=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"","Execution Time":n})),clearTimeout(h.performance.timer),h.performance.timer=setTimeout(h.performance.display,500)},display:function(){var t=v.name+":",n=0;s=!1,clearTimeout(h.performance.timer),e.each(l,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",r&&(t+=" '"+r+"'"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,n,a){var r,s,l,c=F;return n=n||d,a=P||a,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(h.error(C.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(a,n):s!==i&&(l=s),e.isArray(o)?o.push(l):o!==i?o=[o,l]:l!==i&&(o=l),s}},u?(F===i&&h.initialize(),h.invoke(c)):(F!==i&&F.invoke("destroy"),h.initialize())}),o!==i?o:this},e.api.settings={name:"API",namespace:"api",debug:!1,verbose:!1,performance:!0,api:{},cache:!0,interruptRequests:!0,on:"auto",stateContext:!1,loadingDuration:0,hideError:"auto",errorDuration:2e3,encodeParameters:!0,action:!1,url:!1,base:"",urlData:{},defaultData:!0,serializeForm:!1,throttle:0,throttleFirstRequest:!0,method:"get",data:{},dataType:"json",mockResponse:!1,mockResponseAsync:!1,response:!1,responseAsync:!1,beforeSend:function(e){return e},beforeXHR:function(e){},onRequest:function(e,t){},onResponse:!1,onSuccess:function(e,t){},onComplete:function(e,t){},onFailure:function(e,t){},onError:function(e,t){},onAbort:function(e,t){},successTest:!1,error:{beforeSend:"The before send function has aborted the request",error:"There was an error with your request",exitConditions:"API Request Aborted. Exit conditions met",JSONParse:"JSON could not be parsed during error handling",legacyParameters:"You are using legacy API success callback names",method:"The method you called is not defined",missingAction:"API action used but no url was defined",missingSerialize:"jquery-serialize-object is required to add form data to an existing data object",missingURL:"No URL specified for api event",noReturnedValue:"The beforeSend callback must return a settings object, beforeSend ignored.",noStorage:"Caching responses locally requires session storage",parseError:"There was an error parsing your request",requiredParameter:"Missing a required URL parameter: ",statusMessage:"Server gave an error: ",timeout:"Your request timed out"},regExp:{required:/\{\$*[A-z0-9]+\}/g,optional:/\{\/\$*[A-z0-9]+\}/g},className:{loading:"loading",error:"error"},selector:{disabled:".disabled",form:"form"},metadata:{action:"action",url:"url"}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.state=function(t){var o,a=e(this),r=a.selector||"",s=(n.documentElement,(new Date).getTime()),l=[],c=arguments[0],u="string"==typeof c,d=[].slice.call(arguments,1);return a.each(function(){var n,f=e.isPlainObject(t)?e.extend(!0,{},e.fn.state.settings,t):e.extend({},e.fn.state.settings),m=f.error,g=f.metadata,p=f.className,h=f.namespace,v=f.states,b=f.text,y="."+h,x=h+"-module",C=e(this),w=this,S=C.data(x);n={initialize:function(){n.verbose("Initializing module"),f.automatic&&n.add.defaults(),f.context&&""!==r?e(f.context).on(r,"mouseenter"+y,n.change.text).on(r,"mouseleave"+y,n.reset.text).on(r,"click"+y,n.toggle.state):C.on("mouseenter"+y,n.change.text).on("mouseleave"+y,n.reset.text).on("click"+y,n.toggle.state),n.instantiate()},instantiate:function(){n.verbose("Storing instance of module",n),S=n,C.data(x,n)},destroy:function(){n.verbose("Destroying previous module",S),C.off(y).removeData(x)},refresh:function(){n.verbose("Refreshing selector cache"),C=e(w)},add:{defaults:function(){var o=t&&e.isPlainObject(t.states)?t.states:{};e.each(f.defaults,function(t,a){n.is[t]!==i&&n.is[t]()&&(n.verbose("Adding default states",t,w),e.extend(f.states,a,o))})}},is:{active:function(){return C.hasClass(p.active)},loading:function(){return C.hasClass(p.loading)},inactive:function(){return!C.hasClass(p.active)},state:function(e){return p[e]!==i&&C.hasClass(p[e])},enabled:function(){return!C.is(f.filter.active)},disabled:function(){return C.is(f.filter.active)},textEnabled:function(){return!C.is(f.filter.text)},button:function(){return C.is(".button:not(a, .submit)")},input:function(){return C.is("input")},progress:function(){return C.is(".ui.progress")}},allow:function(e){n.debug("Now allowing state",e),v[e]=!0},disallow:function(e){n.debug("No longer allowing",e),v[e]=!1},allows:function(e){return v[e]||!1},enable:function(){C.removeClass(p.disabled)},disable:function(){C.addClass(p.disabled)},setState:function(e){n.allows(e)&&C.addClass(p[e])},removeState:function(e){n.allows(e)&&C.removeClass(p[e])},toggle:{state:function(){var t;if(n.allows("active")&&n.is.enabled()){if(n.refresh(),e.fn.api!==i)if(t=C.api("get request"),C.api("was cancelled"))n.debug("API Request cancelled by beforesend"),f.activateTest=function(){return!1},f.deactivateTest=function(){return!1};else if(t)return void n.listenTo(t);n.change.state()}}},listenTo:function(t){n.debug("API request detected, waiting for state signal",t),t&&(b.loading&&n.update.text(b.loading),e.when(t).then(function(){"resolved"==t.state()?(n.debug("API request succeeded"),f.activateTest=function(){return!0},f.deactivateTest=function(){return!0}):(n.debug("API request failed"),f.activateTest=function(){return!1},f.deactivateTest=function(){return!1}),n.change.state()}))},change:{state:function(){n.debug("Determining state change direction"),n.is.inactive()?n.activate():n.deactivate(),f.sync&&n.sync(),f.onChange.call(w)},text:function(){n.is.textEnabled()&&(n.is.disabled()?(n.verbose("Changing text to disabled text",b.hover),n.update.text(b.disabled)):n.is.active()?b.hover?(n.verbose("Changing text to hover text",b.hover),n.update.text(b.hover)):b.deactivate&&(n.verbose("Changing text to deactivating text",b.deactivate),n.update.text(b.deactivate)):b.hover?(n.verbose("Changing text to hover text",b.hover),n.update.text(b.hover)):b.activate&&(n.verbose("Changing text to activating text",b.activate),n.update.text(b.activate)))}},activate:function(){f.activateTest.call(w)&&(n.debug("Setting state to active"),C.addClass(p.active),n.update.text(b.active),f.onActivate.call(w))},deactivate:function(){f.deactivateTest.call(w)&&(n.debug("Setting state to inactive"),C.removeClass(p.active),n.update.text(b.inactive),f.onDeactivate.call(w))},sync:function(){n.verbose("Syncing other buttons to current state"),n.is.active()?a.not(C).state("activate"):a.not(C).state("deactivate")},get:{text:function(){return f.selector.text?C.find(f.selector.text).text():C.html()},textFor:function(e){return b[e]||!1}},flash:{text:function(e,t,i){var o=n.get.text();n.debug("Flashing text message",e,t),e=e||f.text.flash,t=t||f.flashDuration,i=i||function(){},n.update.text(e),setTimeout(function(){n.update.text(o),i.call(w)},t)}},reset:{text:function(){var e=b.active||C.data(g.storedText),t=b.inactive||C.data(g.storedText);n.is.textEnabled()&&(n.is.active()&&e?(n.verbose("Resetting active text",e),n.update.text(e)):t&&(n.verbose("Resetting inactive text",e),n.update.text(t)))}},update:{text:function(e){var t=n.get.text();e&&e!==t?(n.debug("Updating text",e),f.selector.text?C.data(g.storedText,e).find(f.selector.text).text(e):C.data(g.storedText,e).html(e)):n.debug("Text is already set, ignoring update",e)}},setting:function(t,o){if(n.debug("Changing setting",t,o),e.isPlainObject(t))e.extend(!0,f,t);else{if(o===i)return f[t];e.isPlainObject(f[t])?e.extend(!0,f[t],o):f[t]=o}},internal:function(t,o){if(e.isPlainObject(t))e.extend(!0,n,t);else{if(o===i)return n[t];n[t]=o}},debug:function(){!f.silent&&f.debug&&(f.performance?n.performance.log(arguments):(n.debug=Function.prototype.bind.call(console.info,console,f.name+":"),n.debug.apply(console,arguments)))},verbose:function(){!f.silent&&f.verbose&&f.debug&&(f.performance?n.performance.log(arguments):(n.verbose=Function.prototype.bind.call(console.info,console,f.name+":"),n.verbose.apply(console,arguments)))},error:function(){f.silent||(n.error=Function.prototype.bind.call(console.error,console,f.name+":"),n.error.apply(console,arguments))},performance:{log:function(e){var t,i;f.performance&&(i=(t=(new Date).getTime())-(s||t),s=t,l.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:w,"Execution Time":i})),clearTimeout(n.performance.timer),n.performance.timer=setTimeout(n.performance.display,500)},display:function(){var t=f.name+":",o=0;s=!1,clearTimeout(n.performance.timer),e.each(l,function(e,t){o+=t["Execution Time"]}),t+=" "+o+"ms",r&&(t+=" '"+r+"'"),(console.group!==i||console.table!==i)&&l.length>0&&(console.groupCollapsed(t),console.table?console.table(l):e.each(l,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),l=[]}},invoke:function(t,a,r){var s,l,c,u=S;return a=a||d,r=w||r,"string"==typeof t&&u!==i&&(t=t.split(/[\. ]/),s=t.length-1,e.each(t,function(o,a){var r=o!=s?a+t[o+1].charAt(0).toUpperCase()+t[o+1].slice(1):t;if(e.isPlainObject(u[r])&&o!=s)u=u[r];else{if(u[r]!==i)return l=u[r],!1;if(!e.isPlainObject(u[a])||o==s)return u[a]!==i?(l=u[a],!1):(n.error(m.method,t),!1);u=u[a]}})),e.isFunction(l)?c=l.apply(r,a):l!==i&&(c=l),e.isArray(o)?o.push(c):o!==i?o=[o,c]:c!==i&&(o=c),l}},u?(S===i&&n.initialize(),n.invoke(c)):(S!==i&&S.invoke("destroy"),n.initialize())}),o!==i?o:this},e.fn.state.settings={name:"State",debug:!1,verbose:!1,namespace:"state",performance:!0,onActivate:function(){},onDeactivate:function(){},onChange:function(){},activateTest:function(){return!0},deactivateTest:function(){return!0},automatic:!0,sync:!1,flashDuration:1e3,filter:{text:".loading, .disabled",active:".disabled"},context:!1,error:{beforeSend:"The before send function has cancelled state change",method:"The method you called is not defined."},metadata:{promise:"promise",storedText:"stored-text"},className:{active:"active",disabled:"disabled",error:"error",loading:"loading",success:"success",warning:"warning"},selector:{text:!1},defaults:{input:{disabled:!0,loading:!0,active:!0},button:{disabled:!0,loading:!0,active:!0},progress:{active:!0,success:!0,warning:!0,error:!0}},states:{active:!0,disabled:!0,error:!0,loading:!0,success:!0,warning:!0},text:{disabled:!1,flash:!1,hover:!1,active:!1,inactive:!1,activate:!1,deactivate:!1}}}(jQuery,window,document),function(e,t,n,i){"use strict";t=void 0!==t&&t.Math==Math?t:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")(),e.fn.visibility=function(o){var a,r=e(this),s=r.selector||"",l=(new Date).getTime(),c=[],u=arguments[0],d="string"==typeof u,f=[].slice.call(arguments,1),m=r.length,g=0;return r.each(function(){var r,p,h,v,b=e.isPlainObject(o)?e.extend(!0,{},e.fn.visibility.settings,o):e.extend({},e.fn.visibility.settings),y=b.className,x=b.namespace,C=b.error,w=b.metadata,S="."+x,k="module-"+x,T=e(t),A=e(this),R=e(b.context),P=(A.selector,A.data(k)),E=t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame||function(e){setTimeout(e,0)},F=this,O=!1;v={initialize:function(){v.debug("Initializing",b),v.setup.cache(),v.should.trackChanges()&&("image"==b.type&&v.setup.image(),"fixed"==b.type&&v.setup.fixed(),b.observeChanges&&v.observeChanges(),v.bind.events()),v.save.position(),v.is.visible()||v.error(C.visible,A),b.initialCheck&&v.checkVisibility(),v.instantiate()},instantiate:function(){v.debug("Storing instance",v),A.data(k,v),P=v},destroy:function(){v.verbose("Destroying previous module"),h&&h.disconnect(),p&&p.disconnect(),T.off("load"+S,v.event.load).off("resize"+S,v.event.resize),R.off("scroll"+S,v.event.scroll).off("scrollchange"+S,v.event.scrollchange),"fixed"==b.type&&(v.resetFixed(),v.remove.placeholder()),A.off(S).removeData(k)},observeChanges:function(){"MutationObserver"in t&&(p=new MutationObserver(v.event.contextChanged),h=new MutationObserver(v.event.changed),p.observe(n,{childList:!0,subtree:!0}),h.observe(F,{childList:!0,subtree:!0}),v.debug("Setting up mutation observer",h))},bind:{events:function(){v.verbose("Binding visibility events to scroll and resize"),b.refreshOnLoad&&T.on("load"+S,v.event.load),T.on("resize"+S,v.event.resize),R.off("scroll"+S).on("scroll"+S,v.event.scroll).on("scrollchange"+S,v.event.scrollchange)}},event:{changed:function(e){v.verbose("DOM tree modified, updating visibility calculations"),v.timer=setTimeout(function(){v.verbose("DOM tree modified, updating sticky menu"),v.refresh()},100)},contextChanged:function(t){[].forEach.call(t,function(t){t.removedNodes&&[].forEach.call(t.removedNodes,function(t){(t==F||e(t).find(F).length>0)&&(v.debug("Element removed from DOM, tearing down events"),v.destroy())})})},resize:function(){v.debug("Window resized"),b.refreshOnResize&&E(v.refresh)},load:function(){v.debug("Page finished loading"),E(v.refresh)},scroll:function(){b.throttle?(clearTimeout(v.timer),v.timer=setTimeout(function(){R.triggerHandler("scrollchange"+S,[R.scrollTop()])},b.throttle)):E(function(){R.triggerHandler("scrollchange"+S,[R.scrollTop()])})},scrollchange:function(e,t){v.checkVisibility(t)}},precache:function(t,i){t instanceof Array||(t=[t]);for(var o=t.length,a=0,r=[],s=n.createElement("img"),l=function(){++a>=t.length&&e.isFunction(i)&&i()};o--;)(s=n.createElement("img")).onload=l,s.onerror=l,s.src=t[o],r.push(s)},enableCallbacks:function(){v.debug("Allowing callbacks to occur"),O=!1},disableCallbacks:function(){v.debug("Disabling all callbacks temporarily"),O=!0},should:{trackChanges:function(){return d?(v.debug("One time query, no need to bind events"),!1):(v.debug("Callbacks being attached"),!0)}},setup:{cache:function(){v.cache={occurred:{},screen:{},element:{}}},image:function(){var e=A.data(w.src);e&&(v.verbose("Lazy loading image",e),b.once=!0,b.observeChanges=!1,b.onOnScreen=function(){v.debug("Image on screen",F),v.precache(e,function(){v.set.image(e,function(){++g==m&&b.onAllLoaded.call(this),b.onLoad.call(this)})})})},fixed:function(){v.debug("Setting up fixed"),b.once=!1,b.observeChanges=!1,b.initialCheck=!0,b.refreshOnLoad=!0,o.transition||(b.transition=!1),v.create.placeholder(),v.debug("Added placeholder",r),b.onTopPassed=function(){v.debug("Element passed, adding fixed position",A),v.show.placeholder(),v.set.fixed(),b.transition&&e.fn.transition!==i&&A.transition(b.transition,b.duration)},b.onTopPassedReverse=function(){v.debug("Element returned to position, removing fixed",A),v.hide.placeholder(),v.remove.fixed()}}},create:{placeholder:function(){v.verbose("Creating fixed position placeholder"),r=A.clone(!1).css("display","none").addClass(y.placeholder).insertAfter(A)}},show:{placeholder:function(){v.verbose("Showing placeholder"),r.css("display","block").css("visibility","hidden")}},hide:{placeholder:function(){v.verbose("Hiding placeholder"),r.css("display","none").css("visibility","")}},set:{fixed:function(){v.verbose("Setting element to fixed position"),A.addClass(y.fixed).css({position:"fixed",top:b.offset+"px",left:"auto",zIndex:b.zIndex}),b.onFixed.call(F)},image:function(t,n){if(A.attr("src",t),b.transition)if(e.fn.transition!==i){if(A.hasClass(y.visible))return void v.debug("Transition already occurred on this image, skipping animation");A.transition(b.transition,b.duration,n)}else A.fadeIn(b.duration,n);else A.show()}},is:{onScreen:function(){return v.get.elementCalculations().onScreen},offScreen:function(){return v.get.elementCalculations().offScreen},visible:function(){return!(!v.cache||!v.cache.element)&&!(0===v.cache.element.width&&0===v.cache.element.offset.top)},verticallyScrollableContext:function(){var e=R.get(0)!==t&&R.css("overflow-y");return"auto"==e||"scroll"==e},horizontallyScrollableContext:function(){var e=R.get(0)!==t&&R.css("overflow-x");return"auto"==e||"scroll"==e}},refresh:function(){v.debug("Refreshing constants (width/height)"),"fixed"==b.type&&v.resetFixed(),v.reset(),v.save.position(),b.checkOnRefresh&&v.checkVisibility(),b.onRefresh.call(F)},resetFixed:function(){v.remove.fixed(),v.remove.occurred()},reset:function(){v.verbose("Resetting all cached values"),e.isPlainObject(v.cache)&&(v.cache.screen={},v.cache.element={})},checkVisibility:function(e){v.verbose("Checking visibility of element",v.cache.element),!O&&v.is.visible()&&(v.save.scroll(e),v.save.calculations(),v.passed(),v.passingReverse(),v.topVisibleReverse(),v.bottomVisibleReverse(),v.topPassedReverse(),v.bottomPassedReverse(),v.onScreen(),v.offScreen(),v.passing(),v.topVisible(),v.bottomVisible(),v.topPassed(),v.bottomPassed(),b.onUpdate&&b.onUpdate.call(F,v.get.elementCalculations()))},passed:function(t,n){var o=v.get.elementCalculations();if(t&&n)b.onPassed[t]=n;else{if(t!==i)return v.get.pixelsPassed(t)>o.pixelsPassed;o.passing&&e.each(b.onPassed,function(e,t){o.bottomVisible||o.pixelsPassed>v.get.pixelsPassed(e)?v.execute(t,e):b.once||v.remove.occurred(t)})}},onScreen:function(e){var t=v.get.elementCalculations(),n=e||b.onOnScreen,o="onScreen";if(e&&(v.debug("Adding callback for onScreen",e),b.onOnScreen=e),t.onScreen?v.execute(n,o):b.once||v.remove.occurred(o),e!==i)return t.onOnScreen},offScreen:function(e){var t=v.get.elementCalculations(),n=e||b.onOffScreen,o="offScreen";if(e&&(v.debug("Adding callback for offScreen",e),b.onOffScreen=e),t.offScreen?v.execute(n,o):b.once||v.remove.occurred(o),e!==i)return t.onOffScreen},passing:function(e){var t=v.get.elementCalculations(),n=e||b.onPassing,o="passing";if(e&&(v.debug("Adding callback for passing",e),b.onPassing=e),t.passing?v.execute(n,o):b.once||v.remove.occurred(o),e!==i)return t.passing},topVisible:function(e){var t=v.get.elementCalculations(),n=e||b.onTopVisible,o="topVisible";if(e&&(v.debug("Adding callback for top visible",e),b.onTopVisible=e),t.topVisible?v.execute(n,o):b.once||v.remove.occurred(o),e===i)return t.topVisible},bottomVisible:function(e){var t=v.get.elementCalculations(),n=e||b.onBottomVisible,o="bottomVisible";if(e&&(v.debug("Adding callback for bottom visible",e),b.onBottomVisible=e),t.bottomVisible?v.execute(n,o):b.once||v.remove.occurred(o),e===i)return t.bottomVisible},topPassed:function(e){var t=v.get.elementCalculations(),n=e||b.onTopPassed,o="topPassed";if(e&&(v.debug("Adding callback for top passed",e),b.onTopPassed=e),t.topPassed?v.execute(n,o):b.once||v.remove.occurred(o),e===i)return t.topPassed},bottomPassed:function(e){var t=v.get.elementCalculations(),n=e||b.onBottomPassed,o="bottomPassed";if(e&&(v.debug("Adding callback for bottom passed",e),b.onBottomPassed=e),t.bottomPassed?v.execute(n,o):b.once||v.remove.occurred(o),e===i)return t.bottomPassed},passingReverse:function(e){var t=v.get.elementCalculations(),n=e||b.onPassingReverse,o="passingReverse";if(e&&(v.debug("Adding callback for passing reverse",e),b.onPassingReverse=e),t.passing?b.once||v.remove.occurred(o):v.get.occurred("passing")&&v.execute(n,o),e!==i)return!t.passing},topVisibleReverse:function(e){var t=v.get.elementCalculations(),n=e||b.onTopVisibleReverse,o="topVisibleReverse";if(e&&(v.debug("Adding callback for top visible reverse",e),b.onTopVisibleReverse=e),t.topVisible?b.once||v.remove.occurred(o):v.get.occurred("topVisible")&&v.execute(n,o),e===i)return!t.topVisible},bottomVisibleReverse:function(e){var t=v.get.elementCalculations(),n=e||b.onBottomVisibleReverse,o="bottomVisibleReverse";if(e&&(v.debug("Adding callback for bottom visible reverse",e),b.onBottomVisibleReverse=e),t.bottomVisible?b.once||v.remove.occurred(o):v.get.occurred("bottomVisible")&&v.execute(n,o),e===i)return!t.bottomVisible},topPassedReverse:function(e){var t=v.get.elementCalculations(),n=e||b.onTopPassedReverse,o="topPassedReverse";if(e&&(v.debug("Adding callback for top passed reverse",e),b.onTopPassedReverse=e),t.topPassed?b.once||v.remove.occurred(o):v.get.occurred("topPassed")&&v.execute(n,o),e===i)return!t.onTopPassed},bottomPassedReverse:function(e){var t=v.get.elementCalculations(),n=e||b.onBottomPassedReverse,o="bottomPassedReverse";if(e&&(v.debug("Adding callback for bottom passed reverse",e),b.onBottomPassedReverse=e),t.bottomPassed?b.once||v.remove.occurred(o):v.get.occurred("bottomPassed")&&v.execute(n,o),e===i)return!t.bottomPassed},execute:function(e,t){var n=v.get.elementCalculations(),i=v.get.screenCalculations();(e=e||!1)&&(b.continuous?(v.debug("Callback being called continuously",t,n),e.call(F,n,i)):v.get.occurred(t)||(v.debug("Conditions met",t,n),e.call(F,n,i))),v.save.occurred(t)},remove:{fixed:function(){v.debug("Removing fixed position"),A.removeClass(y.fixed).css({position:"",top:"",left:"",zIndex:""}),b.onUnfixed.call(F)},placeholder:function(){v.debug("Removing placeholder content"),r&&r.remove()},occurred:function(e){if(e){var t=v.cache.occurred;t[e]!==i&&!0===t[e]&&(v.debug("Callback can now be called again",e),v.cache.occurred[e]=!1)}else v.cache.occurred={}}},save:{calculations:function(){v.verbose("Saving all calculations necessary to determine positioning"),v.save.direction(),v.save.screenCalculations(),v.save.elementCalculations()},occurred:function(e){e&&(v.cache.occurred[e]!==i&&!0===v.cache.occurred[e]||(v.verbose("Saving callback occurred",e),v.cache.occurred[e]=!0))},scroll:function(e){e=e+b.offset||R.scrollTop()+b.offset,v.cache.scroll=e},direction:function(){var e,t=v.get.scroll(),n=v.get.lastScroll();return e=t>n&&n?"down":t<n&&n?"up":"static",v.cache.direction=e,v.cache.direction},elementPosition:function(){var e=v.cache.element,t=v.get.screenSize();return v.verbose("Saving element position"),e.fits=e.height<t.height,e.offset=A.offset(),e.width=A.outerWidth(),e.height=A.outerHeight(),v.is.verticallyScrollableContext()&&(e.offset.top+=R.scrollTop()-R.offset().top),v.is.horizontallyScrollableContext()&&(e.offset.left+=R.scrollLeft-R.offset().left),v.cache.element=e,e},elementCalculations:function(){var e=v.get.screenCalculations(),t=v.get.elementPosition();return b.includeMargin?(t.margin={},t.margin.top=parseInt(A.css("margin-top"),10),t.margin.bottom=parseInt(A.css("margin-bottom"),10),t.top=t.offset.top-t.margin.top,t.bottom=t.offset.top+t.height+t.margin.bottom):(t.top=t.offset.top,t.bottom=t.offset.top+t.height),t.topPassed=e.top>=t.top,t.bottomPassed=e.top>=t.bottom,t.topVisible=e.bottom>=t.top&&!t.topPassed,t.bottomVisible=e.bottom>=t.bottom&&!t.bottomPassed,t.pixelsPassed=0,t.percentagePassed=0,t.onScreen=(t.topVisible||t.passing)&&!t.bottomPassed,t.passing=t.topPassed&&!t.bottomPassed,t.offScreen=!t.onScreen,t.passing&&(t.pixelsPassed=e.top-t.top,t.percentagePassed=(e.top-t.top)/t.height),v.cache.element=t,v.verbose("Updated element calculations",t),t},screenCalculations:function(){var e=v.get.scroll();return v.save.direction(),v.cache.screen.top=e,v.cache.screen.bottom=e+v.cache.screen.height,v.cache.screen},screenSize:function(){v.verbose("Saving window position"),v.cache.screen={height:R.height()}},position:function(){v.save.screenSize(),v.save.elementPosition()}},get:{pixelsPassed:function(e){var t=v.get.elementCalculations();return e.search("%")>-1?t.height*(parseInt(e,10)/100):parseInt(e,10)},occurred:function(e){return v.cache.occurred!==i&&v.cache.occurred[e]||!1},direction:function(){return v.cache.direction===i&&v.save.direction(),v.cache.direction},elementPosition:function(){return v.cache.element===i&&v.save.elementPosition(),v.cache.element},elementCalculations:function(){return v.cache.element===i&&v.save.elementCalculations(),v.cache.element},screenCalculations:function(){return v.cache.screen===i&&v.save.screenCalculations(),v.cache.screen},screenSize:function(){return v.cache.screen===i&&v.save.screenSize(),v.cache.screen},scroll:function(){return v.cache.scroll===i&&v.save.scroll(),v.cache.scroll},lastScroll:function(){return v.cache.screen===i?(v.debug("First scroll event, no last scroll could be found"),!1):v.cache.screen.top}},setting:function(t,n){if(e.isPlainObject(t))e.extend(!0,b,t);else{if(n===i)return b[t];b[t]=n}},internal:function(t,n){if(e.isPlainObject(t))e.extend(!0,v,t);else{if(n===i)return v[t];v[t]=n}},debug:function(){!b.silent&&b.debug&&(b.performance?v.performance.log(arguments):(v.debug=Function.prototype.bind.call(console.info,console,b.name+":"),v.debug.apply(console,arguments)))},verbose:function(){!b.silent&&b.verbose&&b.debug&&(b.performance?v.performance.log(arguments):(v.verbose=Function.prototype.bind.call(console.info,console,b.name+":"),v.verbose.apply(console,arguments)))},error:function(){b.silent||(v.error=Function.prototype.bind.call(console.error,console,b.name+":"),v.error.apply(console,arguments))},performance:{log:function(e){var t,n;b.performance&&(n=(t=(new Date).getTime())-(l||t),l=t,c.push({Name:e[0],Arguments:[].slice.call(e,1)||"",Element:F,"Execution Time":n})),clearTimeout(v.performance.timer),v.performance.timer=setTimeout(v.performance.display,500)},display:function(){var t=b.name+":",n=0;l=!1,clearTimeout(v.performance.timer),e.each(c,function(e,t){n+=t["Execution Time"]}),t+=" "+n+"ms",s&&(t+=" '"+s+"'"),(console.group!==i||console.table!==i)&&c.length>0&&(console.groupCollapsed(t),console.table?console.table(c):e.each(c,function(e,t){console.log(t.Name+": "+t["Execution Time"]+"ms")}),console.groupEnd()),c=[]}},invoke:function(t,n,o){var r,s,l,c=P;return n=n||f,o=F||o,"string"==typeof t&&c!==i&&(t=t.split(/[\. ]/),r=t.length-1,e.each(t,function(n,o){var a=n!=r?o+t[n+1].charAt(0).toUpperCase()+t[n+1].slice(1):t;if(e.isPlainObject(c[a])&&n!=r)c=c[a];else{if(c[a]!==i)return s=c[a],!1;if(!e.isPlainObject(c[o])||n==r)return c[o]!==i?(s=c[o],!1):(v.error(C.method,t),!1);c=c[o]}})),e.isFunction(s)?l=s.apply(o,n):s!==i&&(l=s),e.isArray(a)?a.push(l):a!==i?a=[a,l]:l!==i&&(a=l),s}},d?(P===i&&v.initialize(),P.save.scroll(),P.save.calculations(),v.invoke(u)):(P!==i&&P.invoke("destroy"),v.initialize())}),a!==i?a:this},e.fn.visibility.settings={name:"Visibility",namespace:"visibility",debug:!1,verbose:!1,performance:!0,observeChanges:!0,initialCheck:!0,refreshOnLoad:!0,refreshOnResize:!0,checkOnRefresh:!0,once:!0,continuous:!1,offset:0,includeMargin:!1,context:t,throttle:!1,type:!1,zIndex:"10",transition:"fade in",duration:1e3,onPassed:{},onOnScreen:!1,onOffScreen:!1,onPassing:!1,onTopVisible:!1,onBottomVisible:!1,onTopPassed:!1,onBottomPassed:!1,onPassingReverse:!1,onTopVisibleReverse:!1,onBottomVisibleReverse:!1,onTopPassedReverse:!1,onBottomPassedReverse:!1,onLoad:function(){},onAllLoaded:function(){},onFixed:function(){},onUnfixed:function(){},onUpdate:!1,onRefresh:function(){},metadata:{src:"src"},className:{fixed:"fixed",placeholder:"placeholder",visible:"visible"},error:{method:"The method you called is not defined.",visible:"Element is hidden, you must call refresh after element becomes visible"}}}(jQuery,window,document);
/**
 * Sinon.JS 1.10.3, 2014/07/11
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Contributors: https://github.com/cjohansen/Sinon.JS/blob/master/AUTHORS
 *
 * (The BSD License)
 *
 * Copyright (c) 2010-2014, Christian Johansen, christian@cjohansen.no
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *     * Neither the name of Christian Johansen nor the names of his contributors
 *       may be used to endorse or promote products derived from this software
 *       without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


this.sinon = (function () {
var samsam, formatio;
function define(mod, deps, fn) { if (mod == "samsam") { samsam = deps(); } else if (typeof fn === "function") { formatio = fn(samsam); } }
define.amd = {};
((typeof define === "function" && define.amd && function (m) { define("samsam", m); }) ||
 (typeof module === "object" &&
      function (m) { module.exports = m(); }) || // Node
 function (m) { this.samsam = m(); } // Browser globals
)(function () {
    var o = Object.prototype;
    var div = typeof document !== "undefined" && document.createElement("div");

    function isNaN(value) {
        // Unlike global isNaN, this avoids type coercion
        // typeof check avoids IE host object issues, hat tip to
        // lodash
        var val = value; // JsLint thinks value !== value is "weird"
        return typeof value === "number" && value !== val;
    }

    function getClass(value) {
        // Returns the internal [[Class]] by calling Object.prototype.toString
        // with the provided value as this. Return value is a string, naming the
        // internal class, e.g. "Array"
        return o.toString.call(value).split(/[ \]]/)[1];
    }

    /**
     * @name samsam.isArguments
     * @param Object object
     *
     * Returns ``true`` if ``object`` is an ``arguments`` object,
     * ``false`` otherwise.
     */
    function isArguments(object) {
        if (typeof object !== "object" || typeof object.length !== "number" ||
                getClass(object) === "Array") {
            return false;
        }
        if (typeof object.callee == "function") { return true; }
        try {
            object[object.length] = 6;
            delete object[object.length];
        } catch (e) {
            return true;
        }
        return false;
    }

    /**
     * @name samsam.isElement
     * @param Object object
     *
     * Returns ``true`` if ``object`` is a DOM element node. Unlike
     * Underscore.js/lodash, this function will return ``false`` if ``object``
     * is an *element-like* object, i.e. a regular object with a ``nodeType``
     * property that holds the value ``1``.
     */
    function isElement(object) {
        if (!object || object.nodeType !== 1 || !div) { return false; }
        try {
            object.appendChild(div);
            object.removeChild(div);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * @name samsam.keys
     * @param Object object
     *
     * Return an array of own property names.
     */
    function keys(object) {
        var ks = [], prop;
        for (prop in object) {
            if (o.hasOwnProperty.call(object, prop)) { ks.push(prop); }
        }
        return ks;
    }

    /**
     * @name samsam.isDate
     * @param Object value
     *
     * Returns true if the object is a ``Date``, or *date-like*. Duck typing
     * of date objects work by checking that the object has a ``getTime``
     * function whose return value equals the return value from the object's
     * ``valueOf``.
     */
    function isDate(value) {
        return typeof value.getTime == "function" &&
            value.getTime() == value.valueOf();
    }

    /**
     * @name samsam.isNegZero
     * @param Object value
     *
     * Returns ``true`` if ``value`` is ``-0``.
     */
    function isNegZero(value) {
        return value === 0 && 1 / value === -Infinity;
    }

    /**
     * @name samsam.equal
     * @param Object obj1
     * @param Object obj2
     *
     * Returns ``true`` if two objects are strictly equal. Compared to
     * ``===`` there are two exceptions:
     *
     *   - NaN is considered equal to NaN
     *   - -0 and +0 are not considered equal
     */
    function identical(obj1, obj2) {
        if (obj1 === obj2 || (isNaN(obj1) && isNaN(obj2))) {
            return obj1 !== 0 || isNegZero(obj1) === isNegZero(obj2);
        }
    }


    /**
     * @name samsam.deepEqual
     * @param Object obj1
     * @param Object obj2
     *
     * Deep equal comparison. Two values are "deep equal" if:
     *
     *   - They are equal, according to samsam.identical
     *   - They are both date objects representing the same time
     *   - They are both arrays containing elements that are all deepEqual
     *   - They are objects with the same set of properties, and each property
     *     in ``obj1`` is deepEqual to the corresponding property in ``obj2``
     *
     * Supports cyclic objects.
     */
    function deepEqualCyclic(obj1, obj2) {

        // used for cyclic comparison
        // contain already visited objects
        var objects1 = [],
            objects2 = [],
        // contain pathes (position in the object structure)
        // of the already visited objects
        // indexes same as in objects arrays
            paths1 = [],
            paths2 = [],
        // contains combinations of already compared objects
        // in the manner: { "$1['ref']$2['ref']": true }
            compared = {};

        /**
         * used to check, if the value of a property is an object
         * (cyclic logic is only needed for objects)
         * only needed for cyclic logic
         */
        function isObject(value) {

            if (typeof value === 'object' && value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date)    &&
                    !(value instanceof Number)  &&
                    !(value instanceof RegExp)  &&
                    !(value instanceof String)) {

                return true;
            }

            return false;
        }

        /**
         * returns the index of the given object in the
         * given objects array, -1 if not contained
         * only needed for cyclic logic
         */
        function getIndex(objects, obj) {

            var i;
            for (i = 0; i < objects.length; i++) {
                if (objects[i] === obj) {
                    return i;
                }
            }

            return -1;
        }

        // does the recursion for the deep equal check
        return (function deepEqual(obj1, obj2, path1, path2) {
            var type1 = typeof obj1;
            var type2 = typeof obj2;

            // == null also matches undefined
            if (obj1 === obj2 ||
                    isNaN(obj1) || isNaN(obj2) ||
                    obj1 == null || obj2 == null ||
                    type1 !== "object" || type2 !== "object") {

                return identical(obj1, obj2);
            }

            // Elements are only equal if identical(expected, actual)
            if (isElement(obj1) || isElement(obj2)) { return false; }

            var isDate1 = isDate(obj1), isDate2 = isDate(obj2);
            if (isDate1 || isDate2) {
                if (!isDate1 || !isDate2 || obj1.getTime() !== obj2.getTime()) {
                    return false;
                }
            }

            if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
                if (obj1.toString() !== obj2.toString()) { return false; }
            }

            var class1 = getClass(obj1);
            var class2 = getClass(obj2);
            var keys1 = keys(obj1);
            var keys2 = keys(obj2);

            if (isArguments(obj1) || isArguments(obj2)) {
                if (obj1.length !== obj2.length) { return false; }
            } else {
                if (type1 !== type2 || class1 !== class2 ||
                        keys1.length !== keys2.length) {
                    return false;
                }
            }

            var key, i, l,
                // following vars are used for the cyclic logic
                value1, value2,
                isObject1, isObject2,
                index1, index2,
                newPath1, newPath2;

            for (i = 0, l = keys1.length; i < l; i++) {
                key = keys1[i];
                if (!o.hasOwnProperty.call(obj2, key)) {
                    return false;
                }

                // Start of the cyclic logic

                value1 = obj1[key];
                value2 = obj2[key];

                isObject1 = isObject(value1);
                isObject2 = isObject(value2);

                // determine, if the objects were already visited
                // (it's faster to check for isObject first, than to
                // get -1 from getIndex for non objects)
                index1 = isObject1 ? getIndex(objects1, value1) : -1;
                index2 = isObject2 ? getIndex(objects2, value2) : -1;

                // determine the new pathes of the objects
                // - for non cyclic objects the current path will be extended
                //   by current property name
                // - for cyclic objects the stored path is taken
                newPath1 = index1 !== -1
                    ? paths1[index1]
                    : path1 + '[' + JSON.stringify(key) + ']';
                newPath2 = index2 !== -1
                    ? paths2[index2]
                    : path2 + '[' + JSON.stringify(key) + ']';

                // stop recursion if current objects are already compared
                if (compared[newPath1 + newPath2]) {
                    return true;
                }

                // remember the current objects and their pathes
                if (index1 === -1 && isObject1) {
                    objects1.push(value1);
                    paths1.push(newPath1);
                }
                if (index2 === -1 && isObject2) {
                    objects2.push(value2);
                    paths2.push(newPath2);
                }

                // remember that the current objects are already compared
                if (isObject1 && isObject2) {
                    compared[newPath1 + newPath2] = true;
                }

                // End of cyclic logic

                // neither value1 nor value2 is a cycle
                // continue with next level
                if (!deepEqual(value1, value2, newPath1, newPath2)) {
                    return false;
                }
            }

            return true;

        }(obj1, obj2, '$1', '$2'));
    }

    var match;

    function arrayContains(array, subset) {
        if (subset.length === 0) { return true; }
        var i, l, j, k;
        for (i = 0, l = array.length; i < l; ++i) {
            if (match(array[i], subset[0])) {
                for (j = 0, k = subset.length; j < k; ++j) {
                    if (!match(array[i + j], subset[j])) { return false; }
                }
                return true;
            }
        }
        return false;
    }

    /**
     * @name samsam.match
     * @param Object object
     * @param Object matcher
     *
     * Compare arbitrary value ``object`` with matcher.
     */
    match = function match(object, matcher) {
        if (matcher && typeof matcher.test === "function") {
            return matcher.test(object);
        }

        if (typeof matcher === "function") {
            return matcher(object) === true;
        }

        if (typeof matcher === "string") {
            matcher = matcher.toLowerCase();
            var notNull = typeof object === "string" || !!object;
            return notNull &&
                (String(object)).toLowerCase().indexOf(matcher) >= 0;
        }

        if (typeof matcher === "number") {
            return matcher === object;
        }

        if (typeof matcher === "boolean") {
            return matcher === object;
        }

        if (getClass(object) === "Array" && getClass(matcher) === "Array") {
            return arrayContains(object, matcher);
        }

        if (matcher && typeof matcher === "object") {
            var prop;
            for (prop in matcher) {
                if (!match(object[prop], matcher[prop])) {
                    return false;
                }
            }
            return true;
        }

        throw new Error("Matcher was not a string, a number, a " +
                        "function, a boolean or an object");
    };

    return {
        isArguments: isArguments,
        isElement: isElement,
        isDate: isDate,
        isNegZero: isNegZero,
        identical: identical,
        deepEqual: deepEqualCyclic,
        match: match,
        keys: keys
    };
});
((typeof define === "function" && define.amd && function (m) {
    define("formatio", ["samsam"], m);
}) || (typeof module === "object" && function (m) {
    module.exports = m(require("samsam"));
}) || function (m) { this.formatio = m(this.samsam); }
)(function (samsam) {

    var formatio = {
        excludeConstructors: ["Object", /^.$/],
        quoteStrings: true
    };

    var hasOwn = Object.prototype.hasOwnProperty;

    var specialObjects = [];
    if (typeof global !== "undefined") {
        specialObjects.push({ object: global, value: "[object global]" });
    }
    if (typeof document !== "undefined") {
        specialObjects.push({
            object: document,
            value: "[object HTMLDocument]"
        });
    }
    if (typeof window !== "undefined") {
        specialObjects.push({ object: window, value: "[object Window]" });
    }

    function functionName(func) {
        if (!func) { return ""; }
        if (func.displayName) { return func.displayName; }
        if (func.name) { return func.name; }
        var matches = func.toString().match(/function\s+([^\(]+)/m);
        return (matches && matches[1]) || "";
    }

    function constructorName(f, object) {
        var name = functionName(object && object.constructor);
        var excludes = f.excludeConstructors ||
                formatio.excludeConstructors || [];

        var i, l;
        for (i = 0, l = excludes.length; i < l; ++i) {
            if (typeof excludes[i] === "string" && excludes[i] === name) {
                return "";
            } else if (excludes[i].test && excludes[i].test(name)) {
                return "";
            }
        }

        return name;
    }

    function isCircular(object, objects) {
        if (typeof object !== "object") { return false; }
        var i, l;
        for (i = 0, l = objects.length; i < l; ++i) {
            if (objects[i] === object) { return true; }
        }
        return false;
    }

    function ascii(f, object, processed, indent) {
        if (typeof object === "string") {
            var qs = f.quoteStrings;
            var quote = typeof qs !== "boolean" || qs;
            return processed || quote ? '"' + object + '"' : object;
        }

        if (typeof object === "function" && !(object instanceof RegExp)) {
            return ascii.func(object);
        }

        processed = processed || [];

        if (isCircular(object, processed)) { return "[Circular]"; }

        if (Object.prototype.toString.call(object) === "[object Array]") {
            return ascii.array.call(f, object, processed);
        }

        if (!object) { return String((1/object) === -Infinity ? "-0" : object); }
        if (samsam.isElement(object)) { return ascii.element(object); }

        if (typeof object.toString === "function" &&
                object.toString !== Object.prototype.toString) {
            return object.toString();
        }

        var i, l;
        for (i = 0, l = specialObjects.length; i < l; i++) {
            if (object === specialObjects[i].object) {
                return specialObjects[i].value;
            }
        }

        return ascii.object.call(f, object, processed, indent);
    }

    ascii.func = function (func) {
        return "function " + functionName(func) + "() {}";
    };

    ascii.array = function (array, processed) {
        processed = processed || [];
        processed.push(array);
        var i, l, pieces = [];
        for (i = 0, l = array.length; i < l; ++i) {
            pieces.push(ascii(this, array[i], processed));
        }
        return "[" + pieces.join(", ") + "]";
    };

    ascii.object = function (object, processed, indent) {
        processed = processed || [];
        processed.push(object);
        indent = indent || 0;
        var pieces = [], properties = samsam.keys(object).sort();
        var length = 3;
        var prop, str, obj, i, l;

        for (i = 0, l = properties.length; i < l; ++i) {
            prop = properties[i];
            obj = object[prop];

            if (isCircular(obj, processed)) {
                str = "[Circular]";
            } else {
                str = ascii(this, obj, processed, indent + 2);
            }

            str = (/\s/.test(prop) ? '"' + prop + '"' : prop) + ": " + str;
            length += str.length;
            pieces.push(str);
        }

        var cons = constructorName(this, object);
        var prefix = cons ? "[" + cons + "] " : "";
        var is = "";
        for (i = 0, l = indent; i < l; ++i) { is += " "; }

        if (length + indent > 80) {
            return prefix + "{\n  " + is + pieces.join(",\n  " + is) + "\n" +
                is + "}";
        }
        return prefix + "{ " + pieces.join(", ") + " }";
    };

    ascii.element = function (element) {
        var tagName = element.tagName.toLowerCase();
        var attrs = element.attributes, attr, pairs = [], attrName, i, l, val;

        for (i = 0, l = attrs.length; i < l; ++i) {
            attr = attrs.item(i);
            attrName = attr.nodeName.toLowerCase().replace("html:", "");
            val = attr.nodeValue;
            if (attrName !== "contenteditable" || val !== "inherit") {
                if (!!val) { pairs.push(attrName + "=\"" + val + "\""); }
            }
        }

        var formatted = "<" + tagName + (pairs.length > 0 ? " " : "");
        var content = element.innerHTML;

        if (content.length > 20) {
            content = content.substr(0, 20) + "[...]";
        }

        var res = formatted + pairs.join(" ") + ">" + content +
                "</" + tagName + ">";

        return res.replace(/ contentEditable="inherit"/, "");
    };

    function Formatio(options) {
        for (var opt in options) {
            this[opt] = options[opt];
        }
    }

    Formatio.prototype = {
        functionName: functionName,

        configure: function (options) {
            return new Formatio(options);
        },

        constructorName: function (object) {
            return constructorName(this, object);
        },

        ascii: function (object, processed, indent) {
            return ascii(this, object, processed, indent);
        }
    };

    return Formatio.prototype;
});
/*jslint eqeqeq: false, onevar: false, forin: true, nomen: false, regexp: false, plusplus: false*/
/*global module, require, __dirname, document*/
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

var sinon = (function (formatio) {
    var div = typeof document != "undefined" && document.createElement("div");
    var hasOwn = Object.prototype.hasOwnProperty;

    function isDOMNode(obj) {
        var success = false;

        try {
            obj.appendChild(div);
            success = div.parentNode == obj;
        } catch (e) {
            return false;
        } finally {
            try {
                obj.removeChild(div);
            } catch (e) {
                // Remove failed, not much we can do about that
            }
        }

        return success;
    }

    function isElement(obj) {
        return div && obj && obj.nodeType === 1 && isDOMNode(obj);
    }

    function isFunction(obj) {
        return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function isReallyNaN(val) {
        return typeof val === 'number' && isNaN(val);
    }

    function mirrorProperties(target, source) {
        for (var prop in source) {
            if (!hasOwn.call(target, prop)) {
                target[prop] = source[prop];
            }
        }
    }

    function isRestorable (obj) {
        return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
    }

    var sinon = {
        wrapMethod: function wrapMethod(object, property, method) {
            if (!object) {
                throw new TypeError("Should wrap property of object");
            }

            if (typeof method != "function") {
                throw new TypeError("Method wrapper should be function");
            }

            var wrappedMethod = object[property],
                error;

            if (!isFunction(wrappedMethod)) {
                error = new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                    property + " as function");
            } else if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
                error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
            } else if (wrappedMethod.calledBefore) {
                var verb = !!wrappedMethod.returns ? "stubbed" : "spied on";
                error = new TypeError("Attempted to wrap " + property + " which is already " + verb);
            }

            if (error) {
                if (wrappedMethod && wrappedMethod._stack) {
                    error.stack += '\n--------------\n' + wrappedMethod._stack;
                }
                throw error;
            }

            // IE 8 does not support hasOwnProperty on the window object and Firefox has a problem
            // when using hasOwn.call on objects from other frames.
            var owned = object.hasOwnProperty ? object.hasOwnProperty(property) : hasOwn.call(object, property);
            object[property] = method;
            method.displayName = property;
            // Set up a stack trace which can be used later to find what line of
            // code the original method was created on.
            method._stack = (new Error('Stack Trace for original')).stack;

            method.restore = function () {
                // For prototype properties try to reset by delete first.
                // If this fails (ex: localStorage on mobile safari) then force a reset
                // via direct assignment.
                if (!owned) {
                    delete object[property];
                }
                if (object[property] === method) {
                    object[property] = wrappedMethod;
                }
            };

            method.restore.sinon = true;
            mirrorProperties(method, wrappedMethod);

            return method;
        },

        extend: function extend(target) {
            for (var i = 1, l = arguments.length; i < l; i += 1) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        target[prop] = arguments[i][prop];
                    }

                    // DONT ENUM bug, only care about toString
                    if (arguments[i].hasOwnProperty("toString") &&
                        arguments[i].toString != target.toString) {
                        target.toString = arguments[i].toString;
                    }
                }
            }

            return target;
        },

        create: function create(proto) {
            var F = function () {};
            F.prototype = proto;
            return new F();
        },

        deepEqual: function deepEqual(a, b) {
            if (sinon.match && sinon.match.isMatcher(a)) {
                return a.test(b);
            }

            if (typeof a != 'object' || typeof b != 'object') {
                if (isReallyNaN(a) && isReallyNaN(b)) {
                    return true;
                } else {
                    return a === b;
                }
            }

            if (isElement(a) || isElement(b)) {
                return a === b;
            }

            if (a === b) {
                return true;
            }

            if ((a === null && b !== null) || (a !== null && b === null)) {
                return false;
            }

            if (a instanceof RegExp && b instanceof RegExp) {
              return (a.source === b.source) && (a.global === b.global) &&
                (a.ignoreCase === b.ignoreCase) && (a.multiline === b.multiline);
            }

            var aString = Object.prototype.toString.call(a);
            if (aString != Object.prototype.toString.call(b)) {
                return false;
            }

            if (aString == "[object Date]") {
                return a.valueOf() === b.valueOf();
            }

            var prop, aLength = 0, bLength = 0;

            if (aString == "[object Array]" && a.length !== b.length) {
                return false;
            }

            for (prop in a) {
                aLength += 1;

                if (!(prop in b)) {
                    return false;
                }

                if (!deepEqual(a[prop], b[prop])) {
                    return false;
                }
            }

            for (prop in b) {
                bLength += 1;
            }

            return aLength == bLength;
        },

        functionName: function functionName(func) {
            var name = func.displayName || func.name;

            // Use function decomposition as a last resort to get function
            // name. Does not rely on function decomposition to work - if it
            // doesn't debugging will be slightly less informative
            // (i.e. toString will say 'spy' rather than 'myFunc').
            if (!name) {
                var matches = func.toString().match(/function ([^\s\(]+)/);
                name = matches && matches[1];
            }

            return name;
        },

        functionToString: function toString() {
            if (this.getCall && this.callCount) {
                var thisValue, prop, i = this.callCount;

                while (i--) {
                    thisValue = this.getCall(i).thisValue;

                    for (prop in thisValue) {
                        if (thisValue[prop] === this) {
                            return prop;
                        }
                    }
                }
            }

            return this.displayName || "sinon fake";
        },

        getConfig: function (custom) {
            var config = {};
            custom = custom || {};
            var defaults = sinon.defaultConfig;

            for (var prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
                }
            }

            return config;
        },

        format: function (val) {
            return "" + val;
        },

        defaultConfig: {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        },

        timesInWords: function timesInWords(count) {
            return count == 1 && "once" ||
                count == 2 && "twice" ||
                count == 3 && "thrice" ||
                (count || 0) + " times";
        },

        calledInOrder: function (spies) {
            for (var i = 1, l = spies.length; i < l; i++) {
                if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
                    return false;
                }
            }

            return true;
        },

        orderByFirstCall: function (spies) {
            return spies.sort(function (a, b) {
                // uuid, won't ever be equal
                var aCall = a.getCall(0);
                var bCall = b.getCall(0);
                var aId = aCall && aCall.callId || -1;
                var bId = bCall && bCall.callId || -1;

                return aId < bId ? -1 : 1;
            });
        },

        log: function () {},

        logError: function (label, err) {
            var msg = label + " threw exception: ";
            sinon.log(msg + "[" + err.name + "] " + err.message);
            if (err.stack) { sinon.log(err.stack); }

            setTimeout(function () {
                err.message = msg + err.message;
                throw err;
            }, 0);
        },

        typeOf: function (value) {
            if (value === null) {
                return "null";
            }
            else if (value === undefined) {
                return "undefined";
            }
            var string = Object.prototype.toString.call(value);
            return string.substring(8, string.length - 1).toLowerCase();
        },

        createStubInstance: function (constructor) {
            if (typeof constructor !== "function") {
                throw new TypeError("The constructor should be a function.");
            }
            return sinon.stub(sinon.create(constructor.prototype));
        },

        restore: function (object) {
            if (object !== null && typeof object === "object") {
                for (var prop in object) {
                    if (isRestorable(object[prop])) {
                        object[prop].restore();
                    }
                }
            }
            else if (isRestorable(object)) {
                object.restore();
            }
        }
    };

    var isNode = typeof module !== "undefined" && module.exports && typeof require == "function";
    var isAMD = typeof define === 'function' && typeof define.amd === 'object' && define.amd;

    function makePublicAPI(require, exports, module) {
        module.exports = sinon;
        sinon.spy = require("./sinon/spy");
        sinon.spyCall = require("./sinon/call");
        sinon.behavior = require("./sinon/behavior");
        sinon.stub = require("./sinon/stub");
        sinon.mock = require("./sinon/mock");
        sinon.collection = require("./sinon/collection");
        sinon.assert = require("./sinon/assert");
        sinon.sandbox = require("./sinon/sandbox");
        sinon.test = require("./sinon/test");
        sinon.testCase = require("./sinon/test_case");
        sinon.match = require("./sinon/match");
    }

    if (isAMD) {
        define(makePublicAPI);
    } else if (isNode) {
        try {
            formatio = require("formatio");
        } catch (e) {}
        makePublicAPI(require, exports, module);
    }

    if (formatio) {
        var formatter = formatio.configure({ quoteStrings: false });
        sinon.format = function () {
            return formatter.ascii.apply(formatter, arguments);
        };
    } else if (isNode) {
        try {
            var util = require("util");
            sinon.format = function (value) {
                return typeof value == "object" && value.toString === Object.prototype.toString ? util.inspect(value) : value;
            };
        } catch (e) {
            /* Node, but no util module - would be very old, but better safe than
             sorry */
        }
    }

    return sinon;
}(typeof formatio == "object" && formatio));

/* @depend ../sinon.js */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Match functions
 *
 * @author Maximilian Antoni (mail@maxantoni.de)
 * @license BSD
 *
 * Copyright (c) 2012 Maximilian Antoni
 */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function assertType(value, type, name) {
        var actual = sinon.typeOf(value);
        if (actual !== type) {
            throw new TypeError("Expected type of " + name + " to be " +
                type + ", but was " + actual);
        }
    }

    var matcher = {
        toString: function () {
            return this.message;
        }
    };

    function isMatcher(object) {
        return matcher.isPrototypeOf(object);
    }

    function matchObject(expectation, actual) {
        if (actual === null || actual === undefined) {
            return false;
        }
        for (var key in expectation) {
            if (expectation.hasOwnProperty(key)) {
                var exp = expectation[key];
                var act = actual[key];
                if (match.isMatcher(exp)) {
                    if (!exp.test(act)) {
                        return false;
                    }
                } else if (sinon.typeOf(exp) === "object") {
                    if (!matchObject(exp, act)) {
                        return false;
                    }
                } else if (!sinon.deepEqual(exp, act)) {
                    return false;
                }
            }
        }
        return true;
    }

    matcher.or = function (m2) {
        if (!arguments.length) {
            throw new TypeError("Matcher expected");
        } else if (!isMatcher(m2)) {
            m2 = match(m2);
        }
        var m1 = this;
        var or = sinon.create(matcher);
        or.test = function (actual) {
            return m1.test(actual) || m2.test(actual);
        };
        or.message = m1.message + ".or(" + m2.message + ")";
        return or;
    };

    matcher.and = function (m2) {
        if (!arguments.length) {
            throw new TypeError("Matcher expected");
        } else if (!isMatcher(m2)) {
            m2 = match(m2);
        }
        var m1 = this;
        var and = sinon.create(matcher);
        and.test = function (actual) {
            return m1.test(actual) && m2.test(actual);
        };
        and.message = m1.message + ".and(" + m2.message + ")";
        return and;
    };

    var match = function (expectation, message) {
        var m = sinon.create(matcher);
        var type = sinon.typeOf(expectation);
        switch (type) {
        case "object":
            if (typeof expectation.test === "function") {
                m.test = function (actual) {
                    return expectation.test(actual) === true;
                };
                m.message = "match(" + sinon.functionName(expectation.test) + ")";
                return m;
            }
            var str = [];
            for (var key in expectation) {
                if (expectation.hasOwnProperty(key)) {
                    str.push(key + ": " + expectation[key]);
                }
            }
            m.test = function (actual) {
                return matchObject(expectation, actual);
            };
            m.message = "match(" + str.join(", ") + ")";
            break;
        case "number":
            m.test = function (actual) {
                return expectation == actual;
            };
            break;
        case "string":
            m.test = function (actual) {
                if (typeof actual !== "string") {
                    return false;
                }
                return actual.indexOf(expectation) !== -1;
            };
            m.message = "match(\"" + expectation + "\")";
            break;
        case "regexp":
            m.test = function (actual) {
                if (typeof actual !== "string") {
                    return false;
                }
                return expectation.test(actual);
            };
            break;
        case "function":
            m.test = expectation;
            if (message) {
                m.message = message;
            } else {
                m.message = "match(" + sinon.functionName(expectation) + ")";
            }
            break;
        default:
            m.test = function (actual) {
              return sinon.deepEqual(expectation, actual);
            };
        }
        if (!m.message) {
            m.message = "match(" + expectation + ")";
        }
        return m;
    };

    match.isMatcher = isMatcher;

    match.any = match(function () {
        return true;
    }, "any");

    match.defined = match(function (actual) {
        return actual !== null && actual !== undefined;
    }, "defined");

    match.truthy = match(function (actual) {
        return !!actual;
    }, "truthy");

    match.falsy = match(function (actual) {
        return !actual;
    }, "falsy");

    match.same = function (expectation) {
        return match(function (actual) {
            return expectation === actual;
        }, "same(" + expectation + ")");
    };

    match.typeOf = function (type) {
        assertType(type, "string", "type");
        return match(function (actual) {
            return sinon.typeOf(actual) === type;
        }, "typeOf(\"" + type + "\")");
    };

    match.instanceOf = function (type) {
        assertType(type, "function", "type");
        return match(function (actual) {
            return actual instanceof type;
        }, "instanceOf(" + sinon.functionName(type) + ")");
    };

    function createPropertyMatcher(propertyTest, messagePrefix) {
        return function (property, value) {
            assertType(property, "string", "property");
            var onlyProperty = arguments.length === 1;
            var message = messagePrefix + "(\"" + property + "\"";
            if (!onlyProperty) {
                message += ", " + value;
            }
            message += ")";
            return match(function (actual) {
                if (actual === undefined || actual === null ||
                        !propertyTest(actual, property)) {
                    return false;
                }
                return onlyProperty || sinon.deepEqual(value, actual[property]);
            }, message);
        };
    }

    match.has = createPropertyMatcher(function (actual, property) {
        if (typeof actual === "object") {
            return property in actual;
        }
        return actual[property] !== undefined;
    }, "has");

    match.hasOwn = createPropertyMatcher(function (actual, property) {
        return actual.hasOwnProperty(property);
    }, "hasOwn");

    match.bool = match.typeOf("boolean");
    match.number = match.typeOf("number");
    match.string = match.typeOf("string");
    match.object = match.typeOf("object");
    match.func = match.typeOf("function");
    match.array = match.typeOf("array");
    match.regexp = match.typeOf("regexp");
    match.date = match.typeOf("date");

    sinon.match = match;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = match; });
    } else if (commonJSModule) {
        module.exports = match;
    }
}(typeof sinon == "object" && sinon || null));

/**
  * @depend ../sinon.js
  * @depend match.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy calls
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @author Maximilian Antoni (mail@maxantoni.de)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  * Copyright (c) 2013 Maximilian Antoni
  */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";
    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function throwYieldError(proxy, text, args) {
        var msg = sinon.functionName(proxy) + text;
        if (args.length) {
            msg += " Received [" + slice.call(args).join(", ") + "]";
        }
        throw new Error(msg);
    }

    var slice = Array.prototype.slice;

    var callProto = {
        calledOn: function calledOn(thisValue) {
            if (sinon.match && sinon.match.isMatcher(thisValue)) {
                return thisValue.test(this.thisValue);
            }
            return this.thisValue === thisValue;
        },

        calledWith: function calledWith() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                if (!sinon.deepEqual(arguments[i], this.args[i])) {
                    return false;
                }
            }

            return true;
        },

        calledWithMatch: function calledWithMatch() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                var actual = this.args[i];
                var expectation = arguments[i];
                if (!sinon.match || !sinon.match(expectation).test(actual)) {
                    return false;
                }
            }
            return true;
        },

        calledWithExactly: function calledWithExactly() {
            return arguments.length == this.args.length &&
                this.calledWith.apply(this, arguments);
        },

        notCalledWith: function notCalledWith() {
            return !this.calledWith.apply(this, arguments);
        },

        notCalledWithMatch: function notCalledWithMatch() {
            return !this.calledWithMatch.apply(this, arguments);
        },

        returned: function returned(value) {
            return sinon.deepEqual(value, this.returnValue);
        },

        threw: function threw(error) {
            if (typeof error === "undefined" || !this.exception) {
                return !!this.exception;
            }

            return this.exception === error || this.exception.name === error;
        },

        calledWithNew: function calledWithNew() {
            return this.proxy.prototype && this.thisValue instanceof this.proxy;
        },

        calledBefore: function (other) {
            return this.callId < other.callId;
        },

        calledAfter: function (other) {
            return this.callId > other.callId;
        },

        callArg: function (pos) {
            this.args[pos]();
        },

        callArgOn: function (pos, thisValue) {
            this.args[pos].apply(thisValue);
        },

        callArgWith: function (pos) {
            this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));
        },

        callArgOnWith: function (pos, thisValue) {
            var args = slice.call(arguments, 2);
            this.args[pos].apply(thisValue, args);
        },

        "yield": function () {
            this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));
        },

        yieldOn: function (thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (typeof args[i] === "function") {
                    args[i].apply(thisValue, slice.call(arguments, 1));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield since no callback was passed.", args);
        },

        yieldTo: function (prop) {
            this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));
        },

        yieldToOn: function (prop, thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (args[i] && typeof args[i][prop] === "function") {
                    args[i][prop].apply(thisValue, slice.call(arguments, 2));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield to '" + prop +
                "' since no callback was passed.", args);
        },

        toString: function () {
            var callStr = this.proxy.toString() + "(";
            var args = [];

            for (var i = 0, l = this.args.length; i < l; ++i) {
                args.push(sinon.format(this.args[i]));
            }

            callStr = callStr + args.join(", ") + ")";

            if (typeof this.returnValue != "undefined") {
                callStr += " => " + sinon.format(this.returnValue);
            }

            if (this.exception) {
                callStr += " !" + this.exception.name;

                if (this.exception.message) {
                    callStr += "(" + this.exception.message + ")";
                }
            }

            return callStr;
        }
    };

    callProto.invokeCallback = callProto.yield;

    function createSpyCall(spy, thisValue, args, returnValue, exception, id) {
        if (typeof id !== "number") {
            throw new TypeError("Call id is not a number");
        }
        var proxyCall = sinon.create(callProto);
        proxyCall.proxy = spy;
        proxyCall.thisValue = thisValue;
        proxyCall.args = args;
        proxyCall.returnValue = returnValue;
        proxyCall.exception = exception;
        proxyCall.callId = id;

        return proxyCall;
    }
    createSpyCall.toString = callProto.toString; // used by mocks

    sinon.spyCall = createSpyCall;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = createSpyCall; });
    } else if (commonJSModule) {
        module.exports = createSpyCall;
    }
}(typeof sinon == "object" && sinon || null));


/**
  * @depend ../sinon.js
  * @depend call.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy functions
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";
    var push = Array.prototype.push;
    var slice = Array.prototype.slice;
    var callId = 0;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function spy(object, property) {
        if (!property && typeof object == "function") {
            return spy.create(object);
        }

        if (!object && !property) {
            return spy.create(function () { });
        }

        var method = object[property];
        return sinon.wrapMethod(object, property, spy.create(method));
    }

    function matchingFake(fakes, args, strict) {
        if (!fakes) {
            return;
        }

        for (var i = 0, l = fakes.length; i < l; i++) {
            if (fakes[i].matches(args, strict)) {
                return fakes[i];
            }
        }
    }

    function incrementCallCount() {
        this.called = true;
        this.callCount += 1;
        this.notCalled = false;
        this.calledOnce = this.callCount == 1;
        this.calledTwice = this.callCount == 2;
        this.calledThrice = this.callCount == 3;
    }

    function createCallProperties() {
        this.firstCall = this.getCall(0);
        this.secondCall = this.getCall(1);
        this.thirdCall = this.getCall(2);
        this.lastCall = this.getCall(this.callCount - 1);
    }

    var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
    function createProxy(func) {
        // Retain the function length:
        var p;
        if (func.length) {
            eval("p = (function proxy(" + vars.substring(0, func.length * 2 - 1) +
                ") { return p.invoke(func, this, slice.call(arguments)); });");
        }
        else {
            p = function proxy() {
                return p.invoke(func, this, slice.call(arguments));
            };
        }
        return p;
    }

    var uuid = 0;

    // Public API
    var spyApi = {
        reset: function () {
            this.called = false;
            this.notCalled = true;
            this.calledOnce = false;
            this.calledTwice = false;
            this.calledThrice = false;
            this.callCount = 0;
            this.firstCall = null;
            this.secondCall = null;
            this.thirdCall = null;
            this.lastCall = null;
            this.args = [];
            this.returnValues = [];
            this.thisValues = [];
            this.exceptions = [];
            this.callIds = [];
            if (this.fakes) {
                for (var i = 0; i < this.fakes.length; i++) {
                    this.fakes[i].reset();
                }
            }
        },

        create: function create(func) {
            var name;

            if (typeof func != "function") {
                func = function () { };
            } else {
                name = sinon.functionName(func);
            }

            var proxy = createProxy(func);

            sinon.extend(proxy, spy);
            delete proxy.create;
            sinon.extend(proxy, func);

            proxy.reset();
            proxy.prototype = func.prototype;
            proxy.displayName = name || "spy";
            proxy.toString = sinon.functionToString;
            proxy._create = sinon.spy.create;
            proxy.id = "spy#" + uuid++;

            return proxy;
        },

        invoke: function invoke(func, thisValue, args) {
            var matching = matchingFake(this.fakes, args);
            var exception, returnValue;

            incrementCallCount.call(this);
            push.call(this.thisValues, thisValue);
            push.call(this.args, args);
            push.call(this.callIds, callId++);

            // Make call properties available from within the spied function:
            createCallProperties.call(this);

            try {
                if (matching) {
                    returnValue = matching.invoke(func, thisValue, args);
                } else {
                    returnValue = (this.func || func).apply(thisValue, args);
                }

                var thisCall = this.getCall(this.callCount - 1);
                if (thisCall.calledWithNew() && typeof returnValue !== 'object') {
                    returnValue = thisValue;
                }
            } catch (e) {
                exception = e;
            }

            push.call(this.exceptions, exception);
            push.call(this.returnValues, returnValue);

            // Make return value and exception available in the calls:
            createCallProperties.call(this);

            if (exception !== undefined) {
                throw exception;
            }

            return returnValue;
        },

        named: function named(name) {
            this.displayName = name;
            return this;
        },

        getCall: function getCall(i) {
            if (i < 0 || i >= this.callCount) {
                return null;
            }

            return sinon.spyCall(this, this.thisValues[i], this.args[i],
                                    this.returnValues[i], this.exceptions[i],
                                    this.callIds[i]);
        },

        getCalls: function () {
            var calls = [];
            var i;

            for (i = 0; i < this.callCount; i++) {
                calls.push(this.getCall(i));
            }

            return calls;
        },

        calledBefore: function calledBefore(spyFn) {
            if (!this.called) {
                return false;
            }

            if (!spyFn.called) {
                return true;
            }

            return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];
        },

        calledAfter: function calledAfter(spyFn) {
            if (!this.called || !spyFn.called) {
                return false;
            }

            return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];
        },

        withArgs: function () {
            var args = slice.call(arguments);

            if (this.fakes) {
                var match = matchingFake(this.fakes, args, true);

                if (match) {
                    return match;
                }
            } else {
                this.fakes = [];
            }

            var original = this;
            var fake = this._create();
            fake.matchingAguments = args;
            fake.parent = this;
            push.call(this.fakes, fake);

            fake.withArgs = function () {
                return original.withArgs.apply(original, arguments);
            };

            for (var i = 0; i < this.args.length; i++) {
                if (fake.matches(this.args[i])) {
                    incrementCallCount.call(fake);
                    push.call(fake.thisValues, this.thisValues[i]);
                    push.call(fake.args, this.args[i]);
                    push.call(fake.returnValues, this.returnValues[i]);
                    push.call(fake.exceptions, this.exceptions[i]);
                    push.call(fake.callIds, this.callIds[i]);
                }
            }
            createCallProperties.call(fake);

            return fake;
        },

        matches: function (args, strict) {
            var margs = this.matchingAguments;

            if (margs.length <= args.length &&
                sinon.deepEqual(margs, args.slice(0, margs.length))) {
                return !strict || margs.length == args.length;
            }
        },

        printf: function (format) {
            var spy = this;
            var args = slice.call(arguments, 1);
            var formatter;

            return (format || "").replace(/%(.)/g, function (match, specifyer) {
                formatter = spyApi.formatters[specifyer];

                if (typeof formatter == "function") {
                    return formatter.call(null, spy, args);
                } else if (!isNaN(parseInt(specifyer, 10))) {
                    return sinon.format(args[specifyer - 1]);
                }

                return "%" + specifyer;
            });
        }
    };

    function delegateToCalls(method, matchAny, actual, notCalled) {
        spyApi[method] = function () {
            if (!this.called) {
                if (notCalled) {
                    return notCalled.apply(this, arguments);
                }
                return false;
            }

            var currentCall;
            var matches = 0;

            for (var i = 0, l = this.callCount; i < l; i += 1) {
                currentCall = this.getCall(i);

                if (currentCall[actual || method].apply(currentCall, arguments)) {
                    matches += 1;

                    if (matchAny) {
                        return true;
                    }
                }
            }

            return matches === this.callCount;
        };
    }

    delegateToCalls("calledOn", true);
    delegateToCalls("alwaysCalledOn", false, "calledOn");
    delegateToCalls("calledWith", true);
    delegateToCalls("calledWithMatch", true);
    delegateToCalls("alwaysCalledWith", false, "calledWith");
    delegateToCalls("alwaysCalledWithMatch", false, "calledWithMatch");
    delegateToCalls("calledWithExactly", true);
    delegateToCalls("alwaysCalledWithExactly", false, "calledWithExactly");
    delegateToCalls("neverCalledWith", false, "notCalledWith",
        function () { return true; });
    delegateToCalls("neverCalledWithMatch", false, "notCalledWithMatch",
        function () { return true; });
    delegateToCalls("threw", true);
    delegateToCalls("alwaysThrew", false, "threw");
    delegateToCalls("returned", true);
    delegateToCalls("alwaysReturned", false, "returned");
    delegateToCalls("calledWithNew", true);
    delegateToCalls("alwaysCalledWithNew", false, "calledWithNew");
    delegateToCalls("callArg", false, "callArgWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgWith = spyApi.callArg;
    delegateToCalls("callArgOn", false, "callArgOnWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgOnWith = spyApi.callArgOn;
    delegateToCalls("yield", false, "yield", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    // "invokeCallback" is an alias for "yield" since "yield" is invalid in strict mode.
    spyApi.invokeCallback = spyApi.yield;
    delegateToCalls("yieldOn", false, "yieldOn", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    delegateToCalls("yieldTo", false, "yieldTo", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });
    delegateToCalls("yieldToOn", false, "yieldToOn", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });

    spyApi.formatters = {
        "c": function (spy) {
            return sinon.timesInWords(spy.callCount);
        },

        "n": function (spy) {
            return spy.toString();
        },

        "C": function (spy) {
            var calls = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                var stringifiedCall = "    " + spy.getCall(i).toString();
                if (/\n/.test(calls[i - 1])) {
                    stringifiedCall = "\n" + stringifiedCall;
                }
                push.call(calls, stringifiedCall);
            }

            return calls.length > 0 ? "\n" + calls.join("\n") : "";
        },

        "t": function (spy) {
            var objects = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                push.call(objects, sinon.format(spy.thisValues[i]));
            }

            return objects.join(", ");
        },

        "*": function (spy, args) {
            var formatted = [];

            for (var i = 0, l = args.length; i < l; ++i) {
                push.call(formatted, sinon.format(args[i]));
            }

            return formatted.join(", ");
        }
    };

    sinon.extend(spy, spyApi);

    spy.spyCall = sinon.spyCall;
    sinon.spy = spy;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = spy; });
    } else if (commonJSModule) {
        module.exports = spy;
    }
}(typeof sinon == "object" && sinon || null));

/**
 * @depend ../sinon.js
 */
/*jslint eqeqeq: false, onevar: false*/
/*global module, require, sinon, process, setImmediate, setTimeout*/
/**
 * Stub behavior
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Tim Fischbach (mail@timfischbach.de)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    var slice = Array.prototype.slice;
    var join = Array.prototype.join;
    var proto;

    var nextTick = (function () {
        if (typeof process === "object" && typeof process.nextTick === "function") {
            return process.nextTick;
        } else if (typeof setImmediate === "function") {
            return setImmediate;
        } else {
            return function (callback) {
                setTimeout(callback, 0);
            };
        }
    })();

    function throwsException(error, message) {
        if (typeof error == "string") {
            this.exception = new Error(message || "");
            this.exception.name = error;
        } else if (!error) {
            this.exception = new Error("Error");
        } else {
            this.exception = error;
        }

        return this;
    }

    function getCallback(behavior, args) {
        var callArgAt = behavior.callArgAt;

        if (callArgAt < 0) {
            var callArgProp = behavior.callArgProp;

            for (var i = 0, l = args.length; i < l; ++i) {
                if (!callArgProp && typeof args[i] == "function") {
                    return args[i];
                }

                if (callArgProp && args[i] &&
                    typeof args[i][callArgProp] == "function") {
                    return args[i][callArgProp];
                }
            }

            return null;
        }

        return args[callArgAt];
    }

    function getCallbackError(behavior, func, args) {
        if (behavior.callArgAt < 0) {
            var msg;

            if (behavior.callArgProp) {
                msg = sinon.functionName(behavior.stub) +
                    " expected to yield to '" + behavior.callArgProp +
                    "', but no object with such a property was passed.";
            } else {
                msg = sinon.functionName(behavior.stub) +
                    " expected to yield, but no callback was passed.";
            }

            if (args.length > 0) {
                msg += " Received [" + join.call(args, ", ") + "]";
            }

            return msg;
        }

        return "argument at index " + behavior.callArgAt + " is not a function: " + func;
    }

    function callCallback(behavior, args) {
        if (typeof behavior.callArgAt == "number") {
            var func = getCallback(behavior, args);

            if (typeof func != "function") {
                throw new TypeError(getCallbackError(behavior, func, args));
            }

            if (behavior.callbackAsync) {
                nextTick(function() {
                    func.apply(behavior.callbackContext, behavior.callbackArguments);
                });
            } else {
                func.apply(behavior.callbackContext, behavior.callbackArguments);
            }
        }
    }

    proto = {
        create: function(stub) {
            var behavior = sinon.extend({}, sinon.behavior);
            delete behavior.create;
            behavior.stub = stub;

            return behavior;
        },

        isPresent: function() {
            return (typeof this.callArgAt == 'number' ||
                    this.exception ||
                    typeof this.returnArgAt == 'number' ||
                    this.returnThis ||
                    this.returnValueDefined);
        },

        invoke: function(context, args) {
            callCallback(this, args);

            if (this.exception) {
                throw this.exception;
            } else if (typeof this.returnArgAt == 'number') {
                return args[this.returnArgAt];
            } else if (this.returnThis) {
                return context;
            }

            return this.returnValue;
        },

        onCall: function(index) {
            return this.stub.onCall(index);
        },

        onFirstCall: function() {
            return this.stub.onFirstCall();
        },

        onSecondCall: function() {
            return this.stub.onSecondCall();
        },

        onThirdCall: function() {
            return this.stub.onThirdCall();
        },

        withArgs: function(/* arguments */) {
            throw new Error('Defining a stub by invoking "stub.onCall(...).withArgs(...)" is not supported. ' +
                            'Use "stub.withArgs(...).onCall(...)" to define sequential behavior for calls with certain arguments.');
        },

        callsArg: function callsArg(pos) {
            if (typeof pos != "number") {
                throw new TypeError("argument index is not number");
            }

            this.callArgAt = pos;
            this.callbackArguments = [];
            this.callbackContext = undefined;
            this.callArgProp = undefined;
            this.callbackAsync = false;

            return this;
        },

        callsArgOn: function callsArgOn(pos, context) {
            if (typeof pos != "number") {
                throw new TypeError("argument index is not number");
            }
            if (typeof context != "object") {
                throw new TypeError("argument context is not an object");
            }

            this.callArgAt = pos;
            this.callbackArguments = [];
            this.callbackContext = context;
            this.callArgProp = undefined;
            this.callbackAsync = false;

            return this;
        },

        callsArgWith: function callsArgWith(pos) {
            if (typeof pos != "number") {
                throw new TypeError("argument index is not number");
            }

            this.callArgAt = pos;
            this.callbackArguments = slice.call(arguments, 1);
            this.callbackContext = undefined;
            this.callArgProp = undefined;
            this.callbackAsync = false;

            return this;
        },

        callsArgOnWith: function callsArgWith(pos, context) {
            if (typeof pos != "number") {
                throw new TypeError("argument index is not number");
            }
            if (typeof context != "object") {
                throw new TypeError("argument context is not an object");
            }

            this.callArgAt = pos;
            this.callbackArguments = slice.call(arguments, 2);
            this.callbackContext = context;
            this.callArgProp = undefined;
            this.callbackAsync = false;

            return this;
        },

        yields: function () {
            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 0);
            this.callbackContext = undefined;
            this.callArgProp = undefined;
            this.callbackAsync = false;

            return this;
        },

        yieldsOn: function (context) {
            if (typeof context != "object") {
                throw new TypeError("argument context is not an object");
            }

            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 1);
            this.callbackContext = context;
            this.callArgProp = undefined;
            this.callbackAsync = false;

            return this;
        },

        yieldsTo: function (prop) {
            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 1);
            this.callbackContext = undefined;
            this.callArgProp = prop;
            this.callbackAsync = false;

            return this;
        },

        yieldsToOn: function (prop, context) {
            if (typeof context != "object") {
                throw new TypeError("argument context is not an object");
            }

            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 2);
            this.callbackContext = context;
            this.callArgProp = prop;
            this.callbackAsync = false;

            return this;
        },


        "throws": throwsException,
        throwsException: throwsException,

        returns: function returns(value) {
            this.returnValue = value;
            this.returnValueDefined = true;

            return this;
        },

        returnsArg: function returnsArg(pos) {
            if (typeof pos != "number") {
                throw new TypeError("argument index is not number");
            }

            this.returnArgAt = pos;

            return this;
        },

        returnsThis: function returnsThis() {
            this.returnThis = true;

            return this;
        }
    };

    // create asynchronous versions of callsArg* and yields* methods
    for (var method in proto) {
        // need to avoid creating anotherasync versions of the newly added async methods
        if (proto.hasOwnProperty(method) &&
            method.match(/^(callsArg|yields)/) &&
            !method.match(/Async/)) {
            proto[method + 'Async'] = (function (syncFnName) {
                return function () {
                    var result = this[syncFnName].apply(this, arguments);
                    this.callbackAsync = true;
                    return result;
                };
            })(method);
        }
    }

    sinon.behavior = proto;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = proto; });
    } else if (commonJSModule) {
        module.exports = proto;
    }
}(typeof sinon == "object" && sinon || null));

/**
 * @depend ../sinon.js
 * @depend spy.js
 * @depend behavior.js
 */
/*jslint eqeqeq: false, onevar: false*/
/*global module, require, sinon*/
/**
 * Stub functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function stub(object, property, func) {
        if (!!func && typeof func != "function") {
            throw new TypeError("Custom stub should be function");
        }

        var wrapper;

        if (func) {
            wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;
        } else {
            wrapper = stub.create();
        }

        if (!object && typeof property === "undefined") {
            return sinon.stub.create();
        }

        if (typeof property === "undefined" && typeof object == "object") {
            for (var prop in object) {
                if (typeof object[prop] === "function") {
                    stub(object, prop);
                }
            }

            return object;
        }

        return sinon.wrapMethod(object, property, wrapper);
    }

    function getDefaultBehavior(stub) {
        return stub.defaultBehavior || getParentBehaviour(stub) || sinon.behavior.create(stub);
    }

    function getParentBehaviour(stub) {
        return (stub.parent && getCurrentBehavior(stub.parent));
    }

    function getCurrentBehavior(stub) {
        var behavior = stub.behaviors[stub.callCount - 1];
        return behavior && behavior.isPresent() ? behavior : getDefaultBehavior(stub);
    }

    var uuid = 0;

    sinon.extend(stub, (function () {
        var proto = {
            create: function create() {
                var functionStub = function () {
                    return getCurrentBehavior(functionStub).invoke(this, arguments);
                };

                functionStub.id = "stub#" + uuid++;
                var orig = functionStub;
                functionStub = sinon.spy.create(functionStub);
                functionStub.func = orig;

                sinon.extend(functionStub, stub);
                functionStub._create = sinon.stub.create;
                functionStub.displayName = "stub";
                functionStub.toString = sinon.functionToString;

                functionStub.defaultBehavior = null;
                functionStub.behaviors = [];

                return functionStub;
            },

            resetBehavior: function () {
                var i;

                this.defaultBehavior = null;
                this.behaviors = [];

                delete this.returnValue;
                delete this.returnArgAt;
                this.returnThis = false;

                if (this.fakes) {
                    for (i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].resetBehavior();
                    }
                }
            },

            onCall: function(index) {
                if (!this.behaviors[index]) {
                    this.behaviors[index] = sinon.behavior.create(this);
                }

                return this.behaviors[index];
            },

            onFirstCall: function() {
                return this.onCall(0);
            },

            onSecondCall: function() {
                return this.onCall(1);
            },

            onThirdCall: function() {
                return this.onCall(2);
            }
        };

        for (var method in sinon.behavior) {
            if (sinon.behavior.hasOwnProperty(method) &&
                !proto.hasOwnProperty(method) &&
                method != 'create' &&
                method != 'withArgs' &&
                method != 'invoke') {
                proto[method] = (function(behaviorMethod) {
                    return function() {
                        this.defaultBehavior = this.defaultBehavior || sinon.behavior.create(this);
                        this.defaultBehavior[behaviorMethod].apply(this.defaultBehavior, arguments);
                        return this;
                    };
                }(method));
            }
        }

        return proto;
    }()));

    sinon.stub = stub;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = stub; });
    } else if (commonJSModule) {
        module.exports = stub;
    }
}(typeof sinon == "object" && sinon || null));

/**
 * @depend ../sinon.js
 * @depend stub.js
 */
/*jslint eqeqeq: false, onevar: false, nomen: false*/
/*global module, require, sinon*/
/**
 * Mock functions.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";
    var push = [].push;
    var match;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    match = sinon.match;

    if (!match && commonJSModule) {
        match = require("./match");
    }

    function mock(object) {
        if (!object) {
            return sinon.expectation.create("Anonymous mock");
        }

        return mock.create(object);
    }

    sinon.mock = mock;

    sinon.extend(mock, (function () {
        function each(collection, callback) {
            if (!collection) {
                return;
            }

            for (var i = 0, l = collection.length; i < l; i += 1) {
                callback(collection[i]);
            }
        }

        return {
            create: function create(object) {
                if (!object) {
                    throw new TypeError("object is null");
                }

                var mockObject = sinon.extend({}, mock);
                mockObject.object = object;
                delete mockObject.create;

                return mockObject;
            },

            expects: function expects(method) {
                if (!method) {
                    throw new TypeError("method is falsy");
                }

                if (!this.expectations) {
                    this.expectations = {};
                    this.proxies = [];
                }

                if (!this.expectations[method]) {
                    this.expectations[method] = [];
                    var mockObject = this;

                    sinon.wrapMethod(this.object, method, function () {
                        return mockObject.invokeMethod(method, this, arguments);
                    });

                    push.call(this.proxies, method);
                }

                var expectation = sinon.expectation.create(method);
                push.call(this.expectations[method], expectation);

                return expectation;
            },

            restore: function restore() {
                var object = this.object;

                each(this.proxies, function (proxy) {
                    if (typeof object[proxy].restore == "function") {
                        object[proxy].restore();
                    }
                });
            },

            verify: function verify() {
                var expectations = this.expectations || {};
                var messages = [], met = [];

                each(this.proxies, function (proxy) {
                    each(expectations[proxy], function (expectation) {
                        if (!expectation.met()) {
                            push.call(messages, expectation.toString());
                        } else {
                            push.call(met, expectation.toString());
                        }
                    });
                });

                this.restore();

                if (messages.length > 0) {
                    sinon.expectation.fail(messages.concat(met).join("\n"));
                } else {
                    sinon.expectation.pass(messages.concat(met).join("\n"));
                }

                return true;
            },

            invokeMethod: function invokeMethod(method, thisValue, args) {
                var expectations = this.expectations && this.expectations[method];
                var length = expectations && expectations.length || 0, i;

                for (i = 0; i < length; i += 1) {
                    if (!expectations[i].met() &&
                        expectations[i].allowsCall(thisValue, args)) {
                        return expectations[i].apply(thisValue, args);
                    }
                }

                var messages = [], available, exhausted = 0;

                for (i = 0; i < length; i += 1) {
                    if (expectations[i].allowsCall(thisValue, args)) {
                        available = available || expectations[i];
                    } else {
                        exhausted += 1;
                    }
                    push.call(messages, "    " + expectations[i].toString());
                }

                if (exhausted === 0) {
                    return available.apply(thisValue, args);
                }

                messages.unshift("Unexpected call: " + sinon.spyCall.toString.call({
                    proxy: method,
                    args: args
                }));

                sinon.expectation.fail(messages.join("\n"));
            }
        };
    }()));

    var times = sinon.timesInWords;

    sinon.expectation = (function () {
        var slice = Array.prototype.slice;
        var _invoke = sinon.spy.invoke;

        function callCountInWords(callCount) {
            if (callCount == 0) {
                return "never called";
            } else {
                return "called " + times(callCount);
            }
        }

        function expectedCallCountInWords(expectation) {
            var min = expectation.minCalls;
            var max = expectation.maxCalls;

            if (typeof min == "number" && typeof max == "number") {
                var str = times(min);

                if (min != max) {
                    str = "at least " + str + " and at most " + times(max);
                }

                return str;
            }

            if (typeof min == "number") {
                return "at least " + times(min);
            }

            return "at most " + times(max);
        }

        function receivedMinCalls(expectation) {
            var hasMinLimit = typeof expectation.minCalls == "number";
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;
        }

        function receivedMaxCalls(expectation) {
            if (typeof expectation.maxCalls != "number") {
                return false;
            }

            return expectation.callCount == expectation.maxCalls;
        }

        function verifyMatcher(possibleMatcher, arg){
            if (match && match.isMatcher(possibleMatcher)) {
                return possibleMatcher.test(arg);
            } else {
                return true;
            }
        }

        return {
            minCalls: 1,
            maxCalls: 1,

            create: function create(methodName) {
                var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);
                delete expectation.create;
                expectation.method = methodName;

                return expectation;
            },

            invoke: function invoke(func, thisValue, args) {
                this.verifyCallAllowed(thisValue, args);

                return _invoke.apply(this, arguments);
            },

            atLeast: function atLeast(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.maxCalls = null;
                    this.limitsSet = true;
                }

                this.minCalls = num;

                return this;
            },

            atMost: function atMost(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.minCalls = null;
                    this.limitsSet = true;
                }

                this.maxCalls = num;

                return this;
            },

            never: function never() {
                return this.exactly(0);
            },

            once: function once() {
                return this.exactly(1);
            },

            twice: function twice() {
                return this.exactly(2);
            },

            thrice: function thrice() {
                return this.exactly(3);
            },

            exactly: function exactly(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not a number");
                }

                this.atLeast(num);
                return this.atMost(num);
            },

            met: function met() {
                return !this.failed && receivedMinCalls(this);
            },

            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {
                if (receivedMaxCalls(this)) {
                    this.failed = true;
                    sinon.expectation.fail(this.method + " already called " + times(this.maxCalls));
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    sinon.expectation.fail(this.method + " called with " + thisValue + " as thisValue, expected " +
                        this.expectedThis);
                }

                if (!("expectedArguments" in this)) {
                    return;
                }

                if (!args) {
                    sinon.expectation.fail(this.method + " received no arguments, expected " +
                        sinon.format(this.expectedArguments));
                }

                if (args.length < this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too few arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too many arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {

                    if (!verifyMatcher(this.expectedArguments[i],args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", didn't match " + this.expectedArguments.toString());
                    }

                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", expected " + sinon.format(this.expectedArguments));
                    }
                }
            },

            allowsCall: function allowsCall(thisValue, args) {
                if (this.met() && receivedMaxCalls(this)) {
                    return false;
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    return false;
                }

                if (!("expectedArguments" in this)) {
                    return true;
                }

                args = args || [];

                if (args.length < this.expectedArguments.length) {
                    return false;
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    return false;
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!verifyMatcher(this.expectedArguments[i],args[i])) {
                        return false;
                    }

                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        return false;
                    }
                }

                return true;
            },

            withArgs: function withArgs() {
                this.expectedArguments = slice.call(arguments);
                return this;
            },

            withExactArgs: function withExactArgs() {
                this.withArgs.apply(this, arguments);
                this.expectsExactArgCount = true;
                return this;
            },

            on: function on(thisValue) {
                this.expectedThis = thisValue;
                return this;
            },

            toString: function () {
                var args = (this.expectedArguments || []).slice();

                if (!this.expectsExactArgCount) {
                    push.call(args, "[...]");
                }

                var callStr = sinon.spyCall.toString.call({
                    proxy: this.method || "anonymous mock expectation",
                    args: args
                });

                var message = callStr.replace(", [...", "[, ...") + " " +
                    expectedCallCountInWords(this);

                if (this.met()) {
                    return "Expectation met: " + message;
                }

                return "Expected " + message + " (" +
                    callCountInWords(this.callCount) + ")";
            },

            verify: function verify() {
                if (!this.met()) {
                    sinon.expectation.fail(this.toString());
                } else {
                    sinon.expectation.pass(this.toString());
                }

                return true;
            },

            pass: function(message) {
              sinon.assert.pass(message);
            },
            fail: function (message) {
                var exception = new Error(message);
                exception.name = "ExpectationError";

                throw exception;
            }
        };
    }());

    sinon.mock = mock;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = mock; });
    } else if (commonJSModule) {
        module.exports = mock;
    }
}(typeof sinon == "object" && sinon || null));

/**
 * @depend ../sinon.js
 * @depend stub.js
 * @depend mock.js
 */
/*jslint eqeqeq: false, onevar: false, forin: true*/
/*global module, require, sinon*/
/**
 * Collections of stubs, spies and mocks.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";
    var push = [].push;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function getFakes(fakeCollection) {
        if (!fakeCollection.fakes) {
            fakeCollection.fakes = [];
        }

        return fakeCollection.fakes;
    }

    function each(fakeCollection, method) {
        var fakes = getFakes(fakeCollection);

        for (var i = 0, l = fakes.length; i < l; i += 1) {
            if (typeof fakes[i][method] == "function") {
                fakes[i][method]();
            }
        }
    }

    function compact(fakeCollection) {
        var fakes = getFakes(fakeCollection);
        var i = 0;
        while (i < fakes.length) {
          fakes.splice(i, 1);
        }
    }

    var collection = {
        verify: function resolve() {
            each(this, "verify");
        },

        restore: function restore() {
            each(this, "restore");
            compact(this);
        },

        verifyAndRestore: function verifyAndRestore() {
            var exception;

            try {
                this.verify();
            } catch (e) {
                exception = e;
            }

            this.restore();

            if (exception) {
                throw exception;
            }
        },

        add: function add(fake) {
            push.call(getFakes(this), fake);
            return fake;
        },

        spy: function spy() {
            return this.add(sinon.spy.apply(sinon, arguments));
        },

        stub: function stub(object, property, value) {
            if (property) {
                var original = object[property];

                if (typeof original != "function") {
                    if (!hasOwnProperty.call(object, property)) {
                        throw new TypeError("Cannot stub non-existent own property " + property);
                    }

                    object[property] = value;

                    return this.add({
                        restore: function () {
                            object[property] = original;
                        }
                    });
                }
            }
            if (!property && !!object && typeof object == "object") {
                var stubbedObj = sinon.stub.apply(sinon, arguments);

                for (var prop in stubbedObj) {
                    if (typeof stubbedObj[prop] === "function") {
                        this.add(stubbedObj[prop]);
                    }
                }

                return stubbedObj;
            }

            return this.add(sinon.stub.apply(sinon, arguments));
        },

        mock: function mock() {
            return this.add(sinon.mock.apply(sinon, arguments));
        },

        inject: function inject(obj) {
            var col = this;

            obj.spy = function () {
                return col.spy.apply(col, arguments);
            };

            obj.stub = function () {
                return col.stub.apply(col, arguments);
            };

            obj.mock = function () {
                return col.mock.apply(col, arguments);
            };

            return obj;
        }
    };

    sinon.collection = collection;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = collection; });
    } else if (commonJSModule) {
        module.exports = collection;
    }
}(typeof sinon == "object" && sinon || null));

/*jslint eqeqeq: false, plusplus: false, evil: true, onevar: false, browser: true, forin: false*/
/*global module, require, window*/
/**
 * Fake timer API
 * setTimeout
 * setInterval
 * clearTimeout
 * clearInterval
 * tick
 * reset
 * Date
 *
 * Inspired by jsUnitMockTimeOut from JsUnit
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

if (typeof sinon == "undefined") {
    var sinon = {};
}

(function (global) {
    // node expects setTimeout/setInterval to return a fn object w/ .ref()/.unref()
    // browsers, a number.
    // see https://github.com/cjohansen/Sinon.JS/pull/436
    var timeoutResult = setTimeout(function() {}, 0);
    var addTimerReturnsObject = typeof timeoutResult === 'object';
    clearTimeout(timeoutResult);

    var id = 1;

    function addTimer(args, recurring) {
        if (args.length === 0) {
            throw new Error("Function requires at least 1 parameter");
        }

        if (typeof args[0] === "undefined") {
            throw new Error("Callback must be provided to timer calls");
        }

        var toId = id++;
        var delay = args[1] || 0;

        if (!this.timeouts) {
            this.timeouts = {};
        }

        this.timeouts[toId] = {
            id: toId,
            func: args[0],
            callAt: this.now + delay,
            invokeArgs: Array.prototype.slice.call(args, 2)
        };

        if (recurring === true) {
            this.timeouts[toId].interval = delay;
        }

        if (addTimerReturnsObject) {
            return {
                id: toId,
                ref: function() {},
                unref: function() {}
            };
        }
        else {
            return toId;
        }
    }

    function parseTime(str) {
        if (!str) {
            return 0;
        }

        var strings = str.split(":");
        var l = strings.length, i = l;
        var ms = 0, parsed;

        if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
            throw new Error("tick only understands numbers and 'h:m:s'");
        }

        while (i--) {
            parsed = parseInt(strings[i], 10);

            if (parsed >= 60) {
                throw new Error("Invalid time " + str);
            }

            ms += parsed * Math.pow(60, (l - i - 1));
        }

        return ms * 1000;
    }

    function createObject(object) {
        var newObject;

        if (Object.create) {
            newObject = Object.create(object);
        } else {
            var F = function () {};
            F.prototype = object;
            newObject = new F();
        }

        newObject.Date.clock = newObject;
        return newObject;
    }

    sinon.clock = {
        now: 0,

        create: function create(now) {
            var clock = createObject(this);

            if (typeof now == "number") {
                clock.now = now;
            }

            if (!!now && typeof now == "object") {
                throw new TypeError("now should be milliseconds since UNIX epoch");
            }

            return clock;
        },

        setTimeout: function setTimeout(callback, timeout) {
            return addTimer.call(this, arguments, false);
        },

        clearTimeout: function clearTimeout(timerId) {
            if (!timerId) {
                // null appears to be allowed in most browsers, and appears to be relied upon by some libraries, like Bootstrap carousel
                return;
            }
            if (!this.timeouts) {
                this.timeouts = [];
            }
            // in Node, timerId is an object with .ref()/.unref(), and
            // its .id field is the actual timer id.
            if (typeof timerId === 'object') {
              timerId = timerId.id
            }
            if (timerId in this.timeouts) {
                delete this.timeouts[timerId];
            }
        },

        setInterval: function setInterval(callback, timeout) {
            return addTimer.call(this, arguments, true);
        },

        clearInterval: function clearInterval(timerId) {
            this.clearTimeout(timerId);
        },

        setImmediate: function setImmediate(callback) {
            var passThruArgs = Array.prototype.slice.call(arguments, 1);

            return addTimer.call(this, [callback, 0].concat(passThruArgs), false);
        },

        clearImmediate: function clearImmediate(timerId) {
            this.clearTimeout(timerId);
        },

        tick: function tick(ms) {
            ms = typeof ms == "number" ? ms : parseTime(ms);
            var tickFrom = this.now, tickTo = this.now + ms, previous = this.now;
            var timer = this.firstTimerInRange(tickFrom, tickTo);

            var firstException;
            while (timer && tickFrom <= tickTo) {
                if (this.timeouts[timer.id]) {
                    tickFrom = this.now = timer.callAt;
                    try {
                      this.callTimer(timer);
                    } catch (e) {
                      firstException = firstException || e;
                    }
                }

                timer = this.firstTimerInRange(previous, tickTo);
                previous = tickFrom;
            }

            this.now = tickTo;

            if (firstException) {
              throw firstException;
            }

            return this.now;
        },

        firstTimerInRange: function (from, to) {
            var timer, smallest = null, originalTimer;

            for (var id in this.timeouts) {
                if (this.timeouts.hasOwnProperty(id)) {
                    if (this.timeouts[id].callAt < from || this.timeouts[id].callAt > to) {
                        continue;
                    }

                    if (smallest === null || this.timeouts[id].callAt < smallest) {
                        originalTimer = this.timeouts[id];
                        smallest = this.timeouts[id].callAt;

                        timer = {
                            func: this.timeouts[id].func,
                            callAt: this.timeouts[id].callAt,
                            interval: this.timeouts[id].interval,
                            id: this.timeouts[id].id,
                            invokeArgs: this.timeouts[id].invokeArgs
                        };
                    }
                }
            }

            return timer || null;
        },

        callTimer: function (timer) {
            if (typeof timer.interval == "number") {
                this.timeouts[timer.id].callAt += timer.interval;
            } else {
                delete this.timeouts[timer.id];
            }

            try {
                if (typeof timer.func == "function") {
                    timer.func.apply(null, timer.invokeArgs);
                } else {
                    eval(timer.func);
                }
            } catch (e) {
              var exception = e;
            }

            if (!this.timeouts[timer.id]) {
                if (exception) {
                  throw exception;
                }
                return;
            }

            if (exception) {
              throw exception;
            }
        },

        reset: function reset() {
            this.timeouts = {};
        },

        Date: (function () {
            var NativeDate = Date;

            function ClockDate(year, month, date, hour, minute, second, ms) {
                // Defensive and verbose to avoid potential harm in passing
                // explicit undefined when user does not pass argument
                switch (arguments.length) {
                case 0:
                    return new NativeDate(ClockDate.clock.now);
                case 1:
                    return new NativeDate(year);
                case 2:
                    return new NativeDate(year, month);
                case 3:
                    return new NativeDate(year, month, date);
                case 4:
                    return new NativeDate(year, month, date, hour);
                case 5:
                    return new NativeDate(year, month, date, hour, minute);
                case 6:
                    return new NativeDate(year, month, date, hour, minute, second);
                default:
                    return new NativeDate(year, month, date, hour, minute, second, ms);
                }
            }

            return mirrorDateProperties(ClockDate, NativeDate);
        }())
    };

    function mirrorDateProperties(target, source) {
        if (source.now) {
            target.now = function now() {
                return target.clock.now;
            };
        } else {
            delete target.now;
        }

        if (source.toSource) {
            target.toSource = function toSource() {
                return source.toSource();
            };
        } else {
            delete target.toSource;
        }

        target.toString = function toString() {
            return source.toString();
        };

        target.prototype = source.prototype;
        target.parse = source.parse;
        target.UTC = source.UTC;
        target.prototype.toUTCString = source.prototype.toUTCString;

        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }

        return target;
    }

    var methods = ["Date", "setTimeout", "setInterval",
                   "clearTimeout", "clearInterval"];

    if (typeof global.setImmediate !== "undefined") {
        methods.push("setImmediate");
    }

    if (typeof global.clearImmediate !== "undefined") {
        methods.push("clearImmediate");
    }

    function restore() {
        var method;

        for (var i = 0, l = this.methods.length; i < l; i++) {
            method = this.methods[i];

            if (global[method].hadOwnProperty) {
                global[method] = this["_" + method];
            } else {
                try {
                    delete global[method];
                } catch (e) {}
            }
        }

        // Prevent multiple executions which will completely remove these props
        this.methods = [];
    }

    function stubGlobal(method, clock) {
        clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(global, method);
        clock["_" + method] = global[method];

        if (method == "Date") {
            var date = mirrorDateProperties(clock[method], global[method]);
            global[method] = date;
        } else {
            global[method] = function () {
                return clock[method].apply(clock, arguments);
            };

            for (var prop in clock[method]) {
                if (clock[method].hasOwnProperty(prop)) {
                    global[method][prop] = clock[method][prop];
                }
            }
        }

        global[method].clock = clock;
    }

    sinon.useFakeTimers = function useFakeTimers(now) {
        var clock = sinon.clock.create(now);
        clock.restore = restore;
        clock.methods = Array.prototype.slice.call(arguments,
                                                   typeof now == "number" ? 1 : 0);

        if (clock.methods.length === 0) {
            clock.methods = methods;
        }

        for (var i = 0, l = clock.methods.length; i < l; i++) {
            stubGlobal(clock.methods[i], clock);
        }

        return clock;
    };
}(typeof global != "undefined" && typeof global !== "function" ? global : this));

sinon.timers = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setImmediate: (typeof setImmediate !== "undefined" ? setImmediate : undefined),
    clearImmediate: (typeof clearImmediate !== "undefined" ? clearImmediate: undefined),
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = sinon;
}

/*jslint eqeqeq: false, onevar: false*/
/*global sinon, module, require, ActiveXObject, XMLHttpRequest, DOMParser*/
/**
 * Minimal Event interface implementation
 *
 * Original implementation by Sven Fuchs: https://gist.github.com/995028
 * Modifications and tests by Christian Johansen.
 *
 * @author Sven Fuchs (svenfuchs@artweb-design.de)
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2011 Sven Fuchs, Christian Johansen
 */

if (typeof sinon == "undefined") {
    this.sinon = {};
}

(function () {
    var push = [].push;

    sinon.Event = function Event(type, bubbles, cancelable, target) {
        this.initEvent(type, bubbles, cancelable, target);
    };

    sinon.Event.prototype = {
        initEvent: function(type, bubbles, cancelable, target) {
            this.type = type;
            this.bubbles = bubbles;
            this.cancelable = cancelable;
            this.target = target;
        },

        stopPropagation: function () {},

        preventDefault: function () {
            this.defaultPrevented = true;
        }
    };

    sinon.ProgressEvent = function ProgressEvent(type, progressEventRaw, target) {
        this.initEvent(type, false, false, target);
        this.loaded = progressEventRaw.loaded || null;
        this.total = progressEventRaw.total || null;
    };

    sinon.ProgressEvent.prototype = new sinon.Event();

    sinon.ProgressEvent.prototype.constructor =  sinon.ProgressEvent;

    sinon.CustomEvent = function CustomEvent(type, customData, target) {
        this.initEvent(type, false, false, target);
        this.detail = customData.detail || null;
    };

    sinon.CustomEvent.prototype = new sinon.Event();

    sinon.CustomEvent.prototype.constructor =  sinon.CustomEvent;

    sinon.EventTarget = {
        addEventListener: function addEventListener(event, listener) {
            this.eventListeners = this.eventListeners || {};
            this.eventListeners[event] = this.eventListeners[event] || [];
            push.call(this.eventListeners[event], listener);
        },

        removeEventListener: function removeEventListener(event, listener) {
            var listeners = this.eventListeners && this.eventListeners[event] || [];

            for (var i = 0, l = listeners.length; i < l; ++i) {
                if (listeners[i] == listener) {
                    return listeners.splice(i, 1);
                }
            }
        },

        dispatchEvent: function dispatchEvent(event) {
            var type = event.type;
            var listeners = this.eventListeners && this.eventListeners[type] || [];

            for (var i = 0; i < listeners.length; i++) {
                if (typeof listeners[i] == "function") {
                    listeners[i].call(this, event);
                } else {
                    listeners[i].handleEvent(event);
                }
            }

            return !!event.defaultPrevented;
        }
    };
}());

/**
 * @depend ../../sinon.js
 * @depend event.js
 */
/*jslint eqeqeq: false, onevar: false*/
/*global sinon, module, require, ActiveXObject, XMLHttpRequest, DOMParser*/
/**
 * Fake XMLHttpRequest object
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

// wrapper for global
(function(global) {
    if (typeof sinon === "undefined") {
        global.sinon = {};
    }

    var supportsProgress = typeof ProgressEvent !== "undefined";
    var supportsCustomEvent = typeof CustomEvent !== "undefined";
    sinon.xhr = { XMLHttpRequest: global.XMLHttpRequest };
    var xhr = sinon.xhr;
    xhr.GlobalXMLHttpRequest = global.XMLHttpRequest;
    xhr.GlobalActiveXObject = global.ActiveXObject;
    xhr.supportsActiveX = typeof xhr.GlobalActiveXObject != "undefined";
    xhr.supportsXHR = typeof xhr.GlobalXMLHttpRequest != "undefined";
    xhr.workingXHR = xhr.supportsXHR ? xhr.GlobalXMLHttpRequest : xhr.supportsActiveX
                                     ? function() { return new xhr.GlobalActiveXObject("MSXML2.XMLHTTP.3.0") } : false;
    xhr.supportsCORS = xhr.supportsXHR && 'withCredentials' in (new sinon.xhr.GlobalXMLHttpRequest());

    /*jsl:ignore*/
    var unsafeHeaders = {
        "Accept-Charset": true,
        "Accept-Encoding": true,
        "Connection": true,
        "Content-Length": true,
        "Cookie": true,
        "Cookie2": true,
        "Content-Transfer-Encoding": true,
        "Date": true,
        "Expect": true,
        "Host": true,
        "Keep-Alive": true,
        "Referer": true,
        "TE": true,
        "Trailer": true,
        "Transfer-Encoding": true,
        "Upgrade": true,
        "User-Agent": true,
        "Via": true
    };
    /*jsl:end*/

    function FakeXMLHttpRequest() {
        this.readyState = FakeXMLHttpRequest.UNSENT;
        this.requestHeaders = {};
        this.requestBody = null;
        this.status = 0;
        this.statusText = "";
        this.upload = new UploadProgress();
        if (sinon.xhr.supportsCORS) {
            this.withCredentials = false;
        }


        var xhr = this;
        var events = ["loadstart", "load", "abort", "loadend"];

        function addEventListener(eventName) {
            xhr.addEventListener(eventName, function (event) {
                var listener = xhr["on" + eventName];

                if (listener && typeof listener == "function") {
                    listener.call(this, event);
                }
            });
        }

        for (var i = events.length - 1; i >= 0; i--) {
            addEventListener(events[i]);
        }

        if (typeof FakeXMLHttpRequest.onCreate == "function") {
            FakeXMLHttpRequest.onCreate(this);
        }
    }

    // An upload object is created for each
    // FakeXMLHttpRequest and allows upload
    // events to be simulated using uploadProgress
    // and uploadError.
    function UploadProgress() {
        this.eventListeners = {
            "progress": [],
            "load": [],
            "abort": [],
            "error": []
        }
    }

    UploadProgress.prototype.addEventListener = function(event, listener) {
        this.eventListeners[event].push(listener);
    };

    UploadProgress.prototype.removeEventListener = function(event, listener) {
        var listeners = this.eventListeners[event] || [];

        for (var i = 0, l = listeners.length; i < l; ++i) {
            if (listeners[i] == listener) {
                return listeners.splice(i, 1);
            }
        }
    };

    UploadProgress.prototype.dispatchEvent = function(event) {
        var listeners = this.eventListeners[event.type] || [];

        for (var i = 0, listener; (listener = listeners[i]) != null; i++) {
            listener(event);
        }
    };

    function verifyState(xhr) {
        if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR");
        }

        if (xhr.sendFlag) {
            throw new Error("INVALID_STATE_ERR");
        }
    }

    // filtering to enable a white-list version of Sinon FakeXhr,
    // where whitelisted requests are passed through to real XHR
    function each(collection, callback) {
        if (!collection) return;
        for (var i = 0, l = collection.length; i < l; i += 1) {
            callback(collection[i]);
        }
    }
    function some(collection, callback) {
        for (var index = 0; index < collection.length; index++) {
            if(callback(collection[index]) === true) return true;
        }
        return false;
    }
    // largest arity in XHR is 5 - XHR#open
    var apply = function(obj,method,args) {
        switch(args.length) {
        case 0: return obj[method]();
        case 1: return obj[method](args[0]);
        case 2: return obj[method](args[0],args[1]);
        case 3: return obj[method](args[0],args[1],args[2]);
        case 4: return obj[method](args[0],args[1],args[2],args[3]);
        case 5: return obj[method](args[0],args[1],args[2],args[3],args[4]);
        }
    };

    FakeXMLHttpRequest.filters = [];
    FakeXMLHttpRequest.addFilter = function(fn) {
        this.filters.push(fn)
    };
    var IE6Re = /MSIE 6/;
    FakeXMLHttpRequest.defake = function(fakeXhr,xhrArgs) {
        var xhr = new sinon.xhr.workingXHR();
        each(["open","setRequestHeader","send","abort","getResponseHeader",
              "getAllResponseHeaders","addEventListener","overrideMimeType","removeEventListener"],
             function(method) {
                 fakeXhr[method] = function() {
                   return apply(xhr,method,arguments);
                 };
             });

        var copyAttrs = function(args) {
            each(args, function(attr) {
              try {
                fakeXhr[attr] = xhr[attr]
              } catch(e) {
                if(!IE6Re.test(navigator.userAgent)) throw e;
              }
            });
        };

        var stateChange = function() {
            fakeXhr.readyState = xhr.readyState;
            if(xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {
                copyAttrs(["status","statusText"]);
            }
            if(xhr.readyState >= FakeXMLHttpRequest.LOADING) {
                copyAttrs(["responseText"]);
            }
            if(xhr.readyState === FakeXMLHttpRequest.DONE) {
                copyAttrs(["responseXML"]);
            }
            if(fakeXhr.onreadystatechange) fakeXhr.onreadystatechange.call(fakeXhr, { target: fakeXhr });
        };
        if(xhr.addEventListener) {
          for(var event in fakeXhr.eventListeners) {
              if(fakeXhr.eventListeners.hasOwnProperty(event)) {
                  each(fakeXhr.eventListeners[event],function(handler) {
                      xhr.addEventListener(event, handler);
                  });
              }
          }
          xhr.addEventListener("readystatechange",stateChange);
        } else {
          xhr.onreadystatechange = stateChange;
        }
        apply(xhr,"open",xhrArgs);
    };
    FakeXMLHttpRequest.useFilters = false;

    function verifyRequestOpened(xhr) {
        if (xhr.readyState != FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR - " + xhr.readyState);
        }
    }

    function verifyRequestSent(xhr) {
        if (xhr.readyState == FakeXMLHttpRequest.DONE) {
            throw new Error("Request done");
        }
    }

    function verifyHeadersReceived(xhr) {
        if (xhr.async && xhr.readyState != FakeXMLHttpRequest.HEADERS_RECEIVED) {
            throw new Error("No headers received");
        }
    }

    function verifyResponseBodyType(body) {
        if (typeof body != "string") {
            var error = new Error("Attempted to respond to fake XMLHttpRequest with " +
                                 body + ", which is not a string.");
            error.name = "InvalidBodyException";
            throw error;
        }
    }

    sinon.extend(FakeXMLHttpRequest.prototype, sinon.EventTarget, {
        async: true,

        open: function open(method, url, async, username, password) {
            this.method = method;
            this.url = url;
            this.async = typeof async == "boolean" ? async : true;
            this.username = username;
            this.password = password;
            this.responseText = null;
            this.responseXML = null;
            this.requestHeaders = {};
            this.sendFlag = false;
            if(sinon.FakeXMLHttpRequest.useFilters === true) {
                var xhrArgs = arguments;
                var defake = some(FakeXMLHttpRequest.filters,function(filter) {
                    return filter.apply(this,xhrArgs)
                });
                if (defake) {
                  return sinon.FakeXMLHttpRequest.defake(this,arguments);
                }
            }
            this.readyStateChange(FakeXMLHttpRequest.OPENED);
        },

        readyStateChange: function readyStateChange(state) {
            this.readyState = state;

            if (typeof this.onreadystatechange == "function") {
                try {
                    this.onreadystatechange();
                } catch (e) {
                    sinon.logError("Fake XHR onreadystatechange handler", e);
                }
            }

            this.dispatchEvent(new sinon.Event("readystatechange"));

            switch (this.readyState) {
                case FakeXMLHttpRequest.DONE:
                    this.dispatchEvent(new sinon.Event("load", false, false, this));
                    this.dispatchEvent(new sinon.Event("loadend", false, false, this));
                    this.upload.dispatchEvent(new sinon.Event("load", false, false, this));
                    if (supportsProgress) {
                        this.upload.dispatchEvent(new sinon.ProgressEvent('progress', {loaded: 100, total: 100}));
                    }
                    break;
            }
        },

        setRequestHeader: function setRequestHeader(header, value) {
            verifyState(this);

            if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {
                throw new Error("Refused to set unsafe header \"" + header + "\"");
            }

            if (this.requestHeaders[header]) {
                this.requestHeaders[header] += "," + value;
            } else {
                this.requestHeaders[header] = value;
            }
        },

        // Helps testing
        setResponseHeaders: function setResponseHeaders(headers) {
            verifyRequestOpened(this);
            this.responseHeaders = {};

            for (var header in headers) {
                if (headers.hasOwnProperty(header)) {
                    this.responseHeaders[header] = headers[header];
                }
            }

            if (this.async) {
                this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
            } else {
                this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
            }
        },

        // Currently treats ALL data as a DOMString (i.e. no Document)
        send: function send(data) {
            verifyState(this);

            if (!/^(get|head)$/i.test(this.method)) {
                if (this.requestHeaders["Content-Type"]) {
                    var value = this.requestHeaders["Content-Type"].split(";");
                    this.requestHeaders["Content-Type"] = value[0] + ";charset=utf-8";
                } else {
                    this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";
                }

                this.requestBody = data;
            }

            this.errorFlag = false;
            this.sendFlag = this.async;
            this.readyStateChange(FakeXMLHttpRequest.OPENED);

            if (typeof this.onSend == "function") {
                this.onSend(this);
            }

            this.dispatchEvent(new sinon.Event("loadstart", false, false, this));
        },

        abort: function abort() {
            this.aborted = true;
            this.responseText = null;
            this.errorFlag = true;
            this.requestHeaders = {};

            if (this.readyState > sinon.FakeXMLHttpRequest.UNSENT && this.sendFlag) {
                this.readyStateChange(sinon.FakeXMLHttpRequest.DONE);
                this.sendFlag = false;
            }

            this.readyState = sinon.FakeXMLHttpRequest.UNSENT;

            this.dispatchEvent(new sinon.Event("abort", false, false, this));

            this.upload.dispatchEvent(new sinon.Event("abort", false, false, this));

            if (typeof this.onerror === "function") {
                this.onerror();
            }
        },

        getResponseHeader: function getResponseHeader(header) {
            if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
                return null;
            }

            if (/^Set-Cookie2?$/i.test(header)) {
                return null;
            }

            header = header.toLowerCase();

            for (var h in this.responseHeaders) {
                if (h.toLowerCase() == header) {
                    return this.responseHeaders[h];
                }
            }

            return null;
        },

        getAllResponseHeaders: function getAllResponseHeaders() {
            if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
                return "";
            }

            var headers = "";

            for (var header in this.responseHeaders) {
                if (this.responseHeaders.hasOwnProperty(header) &&
                    !/^Set-Cookie2?$/i.test(header)) {
                    headers += header + ": " + this.responseHeaders[header] + "\r\n";
                }
            }

            return headers;
        },

        setResponseBody: function setResponseBody(body) {
            verifyRequestSent(this);
            verifyHeadersReceived(this);
            verifyResponseBodyType(body);

            var chunkSize = this.chunkSize || 10;
            var index = 0;
            this.responseText = "";

            do {
                if (this.async) {
                    this.readyStateChange(FakeXMLHttpRequest.LOADING);
                }

                this.responseText += body.substring(index, index + chunkSize);
                index += chunkSize;
            } while (index < body.length);

            var type = this.getResponseHeader("Content-Type");

            if (this.responseText &&
                (!type || /(text\/xml)|(application\/xml)|(\+xml)/.test(type))) {
                try {
                    this.responseXML = FakeXMLHttpRequest.parseXML(this.responseText);
                } catch (e) {
                    // Unable to parse XML - no biggie
                }
            }

            if (this.async) {
                this.readyStateChange(FakeXMLHttpRequest.DONE);
            } else {
                this.readyState = FakeXMLHttpRequest.DONE;
            }
        },

        respond: function respond(status, headers, body) {
            this.status = typeof status == "number" ? status : 200;
            this.statusText = FakeXMLHttpRequest.statusCodes[this.status];
            this.setResponseHeaders(headers || {});
            this.setResponseBody(body || "");
        },

        uploadProgress: function uploadProgress(progressEventRaw) {
            if (supportsProgress) {
                this.upload.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
            }
        },

        uploadError: function uploadError(error) {
            if (supportsCustomEvent) {
                this.upload.dispatchEvent(new sinon.CustomEvent("error", {"detail": error}));
            }
        }
    });

    sinon.extend(FakeXMLHttpRequest, {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    });

    // Borrowed from JSpec
    FakeXMLHttpRequest.parseXML = function parseXML(text) {
        var xmlDoc;

        if (typeof DOMParser != "undefined") {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(text, "text/xml");
        } else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(text);
        }

        return xmlDoc;
    };

    FakeXMLHttpRequest.statusCodes = {
        100: "Continue",
        101: "Switching Protocols",
        200: "OK",
        201: "Created",
        202: "Accepted",
        203: "Non-Authoritative Information",
        204: "No Content",
        205: "Reset Content",
        206: "Partial Content",
        300: "Multiple Choice",
        301: "Moved Permanently",
        302: "Found",
        303: "See Other",
        304: "Not Modified",
        305: "Use Proxy",
        307: "Temporary Redirect",
        400: "Bad Request",
        401: "Unauthorized",
        402: "Payment Required",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        406: "Not Acceptable",
        407: "Proxy Authentication Required",
        408: "Request Timeout",
        409: "Conflict",
        410: "Gone",
        411: "Length Required",
        412: "Precondition Failed",
        413: "Request Entity Too Large",
        414: "Request-URI Too Long",
        415: "Unsupported Media Type",
        416: "Requested Range Not Satisfiable",
        417: "Expectation Failed",
        422: "Unprocessable Entity",
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        505: "HTTP Version Not Supported"
    };

    sinon.useFakeXMLHttpRequest = function () {
        sinon.FakeXMLHttpRequest.restore = function restore(keepOnCreate) {
            if (xhr.supportsXHR) {
                global.XMLHttpRequest = xhr.GlobalXMLHttpRequest;
            }

            if (xhr.supportsActiveX) {
                global.ActiveXObject = xhr.GlobalActiveXObject;
            }

            delete sinon.FakeXMLHttpRequest.restore;

            if (keepOnCreate !== true) {
                delete sinon.FakeXMLHttpRequest.onCreate;
            }
        };
        if (xhr.supportsXHR) {
            global.XMLHttpRequest = sinon.FakeXMLHttpRequest;
        }

        if (xhr.supportsActiveX) {
            global.ActiveXObject = function ActiveXObject(objId) {
                if (objId == "Microsoft.XMLHTTP" || /^Msxml2\.XMLHTTP/i.test(objId)) {

                    return new sinon.FakeXMLHttpRequest();
                }

                return new xhr.GlobalActiveXObject(objId);
            };
        }

        return sinon.FakeXMLHttpRequest;
    };

    sinon.FakeXMLHttpRequest = FakeXMLHttpRequest;

})((function(){ return typeof global === "object" ? global : this; })());

if (typeof module !== 'undefined' && module.exports) {
    module.exports = sinon;
}

/**
 * @depend fake_xml_http_request.js
 */
/*jslint eqeqeq: false, onevar: false, regexp: false, plusplus: false*/
/*global module, require, window*/
/**
 * The Sinon "server" mimics a web server that receives requests from
 * sinon.FakeXMLHttpRequest and provides an API to respond to those requests,
 * both synchronously and asynchronously. To respond synchronuously, canned
 * answers have to be provided upfront.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

if (typeof sinon == "undefined") {
    var sinon = {};
}

sinon.fakeServer = (function () {
    var push = [].push;
    function F() {}

    function create(proto) {
        F.prototype = proto;
        return new F();
    }

    function responseArray(handler) {
        var response = handler;

        if (Object.prototype.toString.call(handler) != "[object Array]") {
            response = [200, {}, handler];
        }

        if (typeof response[2] != "string") {
            throw new TypeError("Fake server response body should be string, but was " +
                                typeof response[2]);
        }

        return response;
    }

    var wloc = typeof window !== "undefined" ? window.location : {};
    var rCurrLoc = new RegExp("^" + wloc.protocol + "//" + wloc.host);

    function matchOne(response, reqMethod, reqUrl) {
        var rmeth = response.method;
        var matchMethod = !rmeth || rmeth.toLowerCase() == reqMethod.toLowerCase();
        var url = response.url;
        var matchUrl = !url || url == reqUrl || (typeof url.test == "function" && url.test(reqUrl));

        return matchMethod && matchUrl;
    }

    function match(response, request) {
        var requestUrl = request.url;

        if (!/^https?:\/\//.test(requestUrl) || rCurrLoc.test(requestUrl)) {
            requestUrl = requestUrl.replace(rCurrLoc, "");
        }

        if (matchOne(response, this.getHTTPMethod(request), requestUrl)) {
            if (typeof response.response == "function") {
                var ru = response.url;
                var args = [request].concat(ru && typeof ru.exec == "function" ? ru.exec(requestUrl).slice(1) : []);
                return response.response.apply(response, args);
            }

            return true;
        }

        return false;
    }

    return {
        create: function () {
            var server = create(this);
            this.xhr = sinon.useFakeXMLHttpRequest();
            server.requests = [];

            this.xhr.onCreate = function (xhrObj) {
                server.addRequest(xhrObj);
            };

            return server;
        },

        addRequest: function addRequest(xhrObj) {
            var server = this;
            push.call(this.requests, xhrObj);

            xhrObj.onSend = function () {
                server.handleRequest(this);

                if (server.autoRespond && !server.responding) {
                    setTimeout(function () {
                        server.responding = false;
                        server.respond();
                    }, server.autoRespondAfter || 10);

                    server.responding = true;
                }
            };
        },

        getHTTPMethod: function getHTTPMethod(request) {
            if (this.fakeHTTPMethods && /post/i.test(request.method)) {
                var matches = (request.requestBody || "").match(/_method=([^\b;]+)/);
                return !!matches ? matches[1] : request.method;
            }

            return request.method;
        },

        handleRequest: function handleRequest(xhr) {
            if (xhr.async) {
                if (!this.queue) {
                    this.queue = [];
                }

                push.call(this.queue, xhr);
            } else {
                this.processRequest(xhr);
            }
        },

        log: function(response, request) {
            var str;

            str =  "Request:\n"  + sinon.format(request)  + "\n\n";
            str += "Response:\n" + sinon.format(response) + "\n\n";

            sinon.log(str);
        },

        respondWith: function respondWith(method, url, body) {
            if (arguments.length == 1 && typeof method != "function") {
                this.response = responseArray(method);
                return;
            }

            if (!this.responses) { this.responses = []; }

            if (arguments.length == 1) {
                body = method;
                url = method = null;
            }

            if (arguments.length == 2) {
                body = url;
                url = method;
                method = null;
            }

            push.call(this.responses, {
                method: method,
                url: url,
                response: typeof body == "function" ? body : responseArray(body)
            });
        },

        respond: function respond() {
            if (arguments.length > 0) this.respondWith.apply(this, arguments);
            var queue = this.queue || [];
            var requests = queue.splice(0, queue.length);
            var request;

            while(request = requests.shift()) {
                this.processRequest(request);
            }
        },

        processRequest: function processRequest(request) {
            try {
                if (request.aborted) {
                    return;
                }

                var response = this.response || [404, {}, ""];

                if (this.responses) {
                    for (var l = this.responses.length, i = l - 1; i >= 0; i--) {
                        if (match.call(this, this.responses[i], request)) {
                            response = this.responses[i].response;
                            break;
                        }
                    }
                }

                if (request.readyState != 4) {
                    sinon.fakeServer.log(response, request);

                    request.respond(response[0], response[1], response[2]);
                }
            } catch (e) {
                sinon.logError("Fake server request processing", e);
            }
        },

        restore: function restore() {
            return this.xhr.restore && this.xhr.restore.apply(this.xhr, arguments);
        }
    };
}());

if (typeof module !== 'undefined' && module.exports) {
    module.exports = sinon;
}

/**
 * @depend fake_server.js
 * @depend fake_timers.js
 */
/*jslint browser: true, eqeqeq: false, onevar: false*/
/*global sinon*/
/**
 * Add-on for sinon.fakeServer that automatically handles a fake timer along with
 * the FakeXMLHttpRequest. The direct inspiration for this add-on is jQuery
 * 1.3.x, which does not use xhr object's onreadystatehandler at all - instead,
 * it polls the object for completion with setInterval. Dispite the direct
 * motivation, there is nothing jQuery-specific in this file, so it can be used
 * in any environment where the ajax implementation depends on setInterval or
 * setTimeout.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function () {
    function Server() {}
    Server.prototype = sinon.fakeServer;

    sinon.fakeServerWithClock = new Server();

    sinon.fakeServerWithClock.addRequest = function addRequest(xhr) {
        if (xhr.async) {
            if (typeof setTimeout.clock == "object") {
                this.clock = setTimeout.clock;
            } else {
                this.clock = sinon.useFakeTimers();
                this.resetClock = true;
            }

            if (!this.longestTimeout) {
                var clockSetTimeout = this.clock.setTimeout;
                var clockSetInterval = this.clock.setInterval;
                var server = this;

                this.clock.setTimeout = function (fn, timeout) {
                    server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

                    return clockSetTimeout.apply(this, arguments);
                };

                this.clock.setInterval = function (fn, timeout) {
                    server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

                    return clockSetInterval.apply(this, arguments);
                };
            }
        }

        return sinon.fakeServer.addRequest.call(this, xhr);
    };

    sinon.fakeServerWithClock.respond = function respond() {
        var returnVal = sinon.fakeServer.respond.apply(this, arguments);

        if (this.clock) {
            this.clock.tick(this.longestTimeout || 0);
            this.longestTimeout = 0;

            if (this.resetClock) {
                this.clock.restore();
                this.resetClock = false;
            }
        }

        return returnVal;
    };

    sinon.fakeServerWithClock.restore = function restore() {
        if (this.clock) {
            this.clock.restore();
        }

        return sinon.fakeServer.restore.apply(this, arguments);
    };
}());

/**
 * @depend ../sinon.js
 * @depend collection.js
 * @depend util/fake_timers.js
 * @depend util/fake_server_with_clock.js
 */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global require, module*/
/**
 * Manages fake collections as well as fake utilities such as Sinon's
 * timers and fake XHR implementation in one convenient object.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

if (typeof module !== "undefined" && module.exports && typeof require == "function") {
    var sinon = require("../sinon");
    sinon.extend(sinon, require("./util/fake_timers"));
}

(function () {
    var push = [].push;

    function exposeValue(sandbox, config, key, value) {
        if (!value) {
            return;
        }

        if (config.injectInto && !(key in config.injectInto)) {
            config.injectInto[key] = value;
            sandbox.injectedKeys.push(key);
        } else {
            push.call(sandbox.args, value);
        }
    }

    function prepareSandboxFromConfig(config) {
        var sandbox = sinon.create(sinon.sandbox);

        if (config.useFakeServer) {
            if (typeof config.useFakeServer == "object") {
                sandbox.serverPrototype = config.useFakeServer;
            }

            sandbox.useFakeServer();
        }

        if (config.useFakeTimers) {
            if (typeof config.useFakeTimers == "object") {
                sandbox.useFakeTimers.apply(sandbox, config.useFakeTimers);
            } else {
                sandbox.useFakeTimers();
            }
        }

        return sandbox;
    }

    sinon.sandbox = sinon.extend(sinon.create(sinon.collection), {
        useFakeTimers: function useFakeTimers() {
            this.clock = sinon.useFakeTimers.apply(sinon, arguments);

            return this.add(this.clock);
        },

        serverPrototype: sinon.fakeServer,

        useFakeServer: function useFakeServer() {
            var proto = this.serverPrototype || sinon.fakeServer;

            if (!proto || !proto.create) {
                return null;
            }

            this.server = proto.create();
            return this.add(this.server);
        },

        inject: function (obj) {
            sinon.collection.inject.call(this, obj);

            if (this.clock) {
                obj.clock = this.clock;
            }

            if (this.server) {
                obj.server = this.server;
                obj.requests = this.server.requests;
            }

            return obj;
        },

        restore: function () {
            sinon.collection.restore.apply(this, arguments);
            this.restoreContext();
        },

        restoreContext: function () {
            if (this.injectedKeys) {
                for (var i = 0, j = this.injectedKeys.length; i < j; i++) {
                    delete this.injectInto[this.injectedKeys[i]];
                }
                this.injectedKeys = [];
            }
        },

        create: function (config) {
            if (!config) {
                return sinon.create(sinon.sandbox);
            }

            var sandbox = prepareSandboxFromConfig(config);
            sandbox.args = sandbox.args || [];
            sandbox.injectedKeys = [];
            sandbox.injectInto = config.injectInto;
            var prop, value, exposed = sandbox.inject({});

            if (config.properties) {
                for (var i = 0, l = config.properties.length; i < l; i++) {
                    prop = config.properties[i];
                    value = exposed[prop] || prop == "sandbox" && sandbox;
                    exposeValue(sandbox, config, prop, value);
                }
            } else {
                exposeValue(sandbox, config, "sandbox", value);
            }

            return sandbox;
        }
    });

    sinon.sandbox.useFakeXMLHttpRequest = sinon.sandbox.useFakeServer;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = sinon.sandbox; });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = sinon.sandbox;
    }
}());

/**
 * @depend ../sinon.js
 * @depend stub.js
 * @depend mock.js
 * @depend sandbox.js
 */
/*jslint eqeqeq: false, onevar: false, forin: true, plusplus: false*/
/*global module, require, sinon*/
/**
 * Test function, sandboxes fakes
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function test(callback) {
        var type = typeof callback;

        if (type != "function") {
            throw new TypeError("sinon.test needs to wrap a test function, got " + type);
        }

        function sinonSandboxedTest() {
            var config = sinon.getConfig(sinon.config);
            config.injectInto = config.injectIntoThis && this || config.injectInto;
            var sandbox = sinon.sandbox.create(config);
            var exception, result;
            var args = Array.prototype.slice.call(arguments).concat(sandbox.args);

            try {
                result = callback.apply(this, args);
            } catch (e) {
                exception = e;
            }

            if (typeof exception !== "undefined") {
                sandbox.restore();
                throw exception;
            }
            else {
                sandbox.verifyAndRestore();
            }

            return result;
        };

        if (callback.length) {
            return function sinonAsyncSandboxedTest(callback) {
                return sinonSandboxedTest.apply(this, arguments);
            };
        }

        return sinonSandboxedTest;
    }

    test.config = {
        injectIntoThis: true,
        injectInto: null,
        properties: ["spy", "stub", "mock", "clock", "server", "requests"],
        useFakeTimers: true,
        useFakeServer: true
    };

    sinon.test = test;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = test; });
    } else if (commonJSModule) {
        module.exports = test;
    }
}(typeof sinon == "object" && sinon || null));

/**
 * @depend ../sinon.js
 * @depend test.js
 */
/*jslint eqeqeq: false, onevar: false, eqeqeq: false*/
/*global module, require, sinon*/
/**
 * Test case, sandboxes all test functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function (sinon) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon || !Object.prototype.hasOwnProperty) {
        return;
    }

    function createTest(property, setUp, tearDown) {
        return function () {
            if (setUp) {
                setUp.apply(this, arguments);
            }

            var exception, result;

            try {
                result = property.apply(this, arguments);
            } catch (e) {
                exception = e;
            }

            if (tearDown) {
                tearDown.apply(this, arguments);
            }

            if (exception) {
                throw exception;
            }

            return result;
        };
    }

    function testCase(tests, prefix) {
        /*jsl:ignore*/
        if (!tests || typeof tests != "object") {
            throw new TypeError("sinon.testCase needs an object with test functions");
        }
        /*jsl:end*/

        prefix = prefix || "test";
        var rPrefix = new RegExp("^" + prefix);
        var methods = {}, testName, property, method;
        var setUp = tests.setUp;
        var tearDown = tests.tearDown;

        for (testName in tests) {
            if (tests.hasOwnProperty(testName)) {
                property = tests[testName];

                if (/^(setUp|tearDown)$/.test(testName)) {
                    continue;
                }

                if (typeof property == "function" && rPrefix.test(testName)) {
                    method = property;

                    if (setUp || tearDown) {
                        method = createTest(property, setUp, tearDown);
                    }

                    methods[testName] = sinon.test(method);
                } else {
                    methods[testName] = tests[testName];
                }
            }
        }

        return methods;
    }

    sinon.testCase = testCase;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = testCase; });
    } else if (commonJSModule) {
        module.exports = testCase;
    }
}(typeof sinon == "object" && sinon || null));

/**
 * @depend ../sinon.js
 * @depend stub.js
 */
/*jslint eqeqeq: false, onevar: false, nomen: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Assertions matching the test spy retrieval interface.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */

(function (sinon, global) {
    var commonJSModule = typeof module !== "undefined" && module.exports && typeof require == "function";
    var slice = Array.prototype.slice;
    var assert;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function verifyIsStub() {
        var method;

        for (var i = 0, l = arguments.length; i < l; ++i) {
            method = arguments[i];

            if (!method) {
                assert.fail("fake is not a spy");
            }

            if (typeof method != "function") {
                assert.fail(method + " is not a function");
            }

            if (typeof method.getCall != "function") {
                assert.fail(method + " is not stubbed");
            }
        }
    }

    function failAssertion(object, msg) {
        object = object || global;
        var failMethod = object.fail || assert.fail;
        failMethod.call(object, msg);
    }

    function mirrorPropAsAssertion(name, method, message) {
        if (arguments.length == 2) {
            message = method;
            method = name;
        }

        assert[name] = function (fake) {
            verifyIsStub(fake);

            var args = slice.call(arguments, 1);
            var failed = false;

            if (typeof method == "function") {
                failed = !method(fake);
            } else {
                failed = typeof fake[method] == "function" ?
                    !fake[method].apply(fake, args) : !fake[method];
            }

            if (failed) {
                failAssertion(this, fake.printf.apply(fake, [message].concat(args)));
            } else {
                assert.pass(name);
            }
        };
    }

    function exposedName(prefix, prop) {
        return !prefix || /^fail/.test(prop) ? prop :
            prefix + prop.slice(0, 1).toUpperCase() + prop.slice(1);
    }

    assert = {
        failException: "AssertError",

        fail: function fail(message) {
            var error = new Error(message);
            error.name = this.failException || assert.failException;

            throw error;
        },

        pass: function pass(assertion) {},

        callOrder: function assertCallOrder() {
            verifyIsStub.apply(null, arguments);
            var expected = "", actual = "";

            if (!sinon.calledInOrder(arguments)) {
                try {
                    expected = [].join.call(arguments, ", ");
                    var calls = slice.call(arguments);
                    var i = calls.length;
                    while (i) {
                        if (!calls[--i].called) {
                            calls.splice(i, 1);
                        }
                    }
                    actual = sinon.orderByFirstCall(calls).join(", ");
                } catch (e) {
                    // If this fails, we'll just fall back to the blank string
                }

                failAssertion(this, "expected " + expected + " to be " +
                              "called in order but were called as " + actual);
            } else {
                assert.pass("callOrder");
            }
        },

        callCount: function assertCallCount(method, count) {
            verifyIsStub(method);

            if (method.callCount != count) {
                var msg = "expected %n to be called " + sinon.timesInWords(count) +
                    " but was called %c%C";
                failAssertion(this, method.printf(msg));
            } else {
                assert.pass("callCount");
            }
        },

        expose: function expose(target, options) {
            if (!target) {
                throw new TypeError("target is null or undefined");
            }

            var o = options || {};
            var prefix = typeof o.prefix == "undefined" && "assert" || o.prefix;
            var includeFail = typeof o.includeFail == "undefined" || !!o.includeFail;

            for (var method in this) {
                if (method != "export" && (includeFail || !/^(fail)/.test(method))) {
                    target[exposedName(prefix, method)] = this[method];
                }
            }

            return target;
        },

        match: function match(actual, expectation) {
            var matcher = sinon.match(expectation);
            if (matcher.test(actual)) {
                assert.pass("match");
            } else {
                var formatted = [
                    "expected value to match",
                    "    expected = " + sinon.format(expectation),
                    "    actual = " + sinon.format(actual)
                ]
                failAssertion(this, formatted.join("\n"));
            }
        }
    };

    mirrorPropAsAssertion("called", "expected %n to have been called at least once but was never called");
    mirrorPropAsAssertion("notCalled", function (spy) { return !spy.called; },
                          "expected %n to not have been called but was called %c%C");
    mirrorPropAsAssertion("calledOnce", "expected %n to be called once but was called %c%C");
    mirrorPropAsAssertion("calledTwice", "expected %n to be called twice but was called %c%C");
    mirrorPropAsAssertion("calledThrice", "expected %n to be called thrice but was called %c%C");
    mirrorPropAsAssertion("calledOn", "expected %n to be called with %1 as this but was called with %t");
    mirrorPropAsAssertion("alwaysCalledOn", "expected %n to always be called with %1 as this but was called with %t");
    mirrorPropAsAssertion("calledWithNew", "expected %n to be called with new");
    mirrorPropAsAssertion("alwaysCalledWithNew", "expected %n to always be called with new");
    mirrorPropAsAssertion("calledWith", "expected %n to be called with arguments %*%C");
    mirrorPropAsAssertion("calledWithMatch", "expected %n to be called with match %*%C");
    mirrorPropAsAssertion("alwaysCalledWith", "expected %n to always be called with arguments %*%C");
    mirrorPropAsAssertion("alwaysCalledWithMatch", "expected %n to always be called with match %*%C");
    mirrorPropAsAssertion("calledWithExactly", "expected %n to be called with exact arguments %*%C");
    mirrorPropAsAssertion("alwaysCalledWithExactly", "expected %n to always be called with exact arguments %*%C");
    mirrorPropAsAssertion("neverCalledWith", "expected %n to never be called with arguments %*%C");
    mirrorPropAsAssertion("neverCalledWithMatch", "expected %n to never be called with match %*%C");
    mirrorPropAsAssertion("threw", "%n did not throw exception%C");
    mirrorPropAsAssertion("alwaysThrew", "%n did not always throw exception%C");

    sinon.assert = assert;

    if (typeof define === "function" && define.amd) {
        define(["module"], function(module) { module.exports = assert; });
    } else if (commonJSModule) {
        module.exports = assert;
    }
}(typeof sinon == "object" && sinon || null, typeof window != "undefined" ? window : (typeof self != "undefined") ? self : global));

/**
 * @depend ../../sinon.js
 * @depend event.js
 */
/*jslint eqeqeq: false, onevar: false*/
/*global sinon, module, require, XDomainRequest*/
/**
 * Fake XDomainRequest object
 */

if (typeof sinon == "undefined") {
    this.sinon = {};
}
sinon.xdr = { XDomainRequest: this.XDomainRequest };

// wrapper for global
(function (global) {
    var xdr = sinon.xdr;
    xdr.GlobalXDomainRequest = global.XDomainRequest;
    xdr.supportsXDR = typeof xdr.GlobalXDomainRequest != "undefined";
    xdr.workingXDR = xdr.supportsXDR ? xdr.GlobalXDomainRequest :  false;

    function FakeXDomainRequest() {
        this.readyState = FakeXDomainRequest.UNSENT;
        this.requestBody = null;
        this.requestHeaders = {};
        this.status = 0;
        this.timeout = null;

        if (typeof FakeXDomainRequest.onCreate == "function") {
            FakeXDomainRequest.onCreate(this);
        }
    }

    function verifyState(xdr) {
        if (xdr.readyState !== FakeXDomainRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR");
        }

        if (xdr.sendFlag) {
            throw new Error("INVALID_STATE_ERR");
        }
    }

    function verifyRequestSent(xdr) {
        if (xdr.readyState == FakeXDomainRequest.UNSENT) {
            throw new Error("Request not sent");
        }
        if (xdr.readyState == FakeXDomainRequest.DONE) {
            throw new Error("Request done");
        }
    }

    function verifyResponseBodyType(body) {
        if (typeof body != "string") {
            var error = new Error("Attempted to respond to fake XDomainRequest with " +
                                  body + ", which is not a string.");
            error.name = "InvalidBodyException";
            throw error;
        }
    }

    sinon.extend(FakeXDomainRequest.prototype, sinon.EventTarget, {
        open: function open(method, url) {
            this.method = method;
            this.url = url;

            this.responseText = null;
            this.sendFlag = false;

            this.readyStateChange(FakeXDomainRequest.OPENED);
        },

        readyStateChange: function readyStateChange(state) {
            this.readyState = state;
            var eventName = '';
            switch (this.readyState) {
            case FakeXDomainRequest.UNSENT:
                break;
            case FakeXDomainRequest.OPENED:
                break;
            case FakeXDomainRequest.LOADING:
                if (this.sendFlag){
                    //raise the progress event
                    eventName = 'onprogress';
                }
                break;
            case FakeXDomainRequest.DONE:
                if (this.isTimeout){
                    eventName = 'ontimeout'
                }
                else if (this.errorFlag || (this.status < 200 || this.status > 299)) {
                    eventName = 'onerror';
                }
                else {
                    eventName = 'onload'
                }
                break;
            }

            // raising event (if defined)
            if (eventName) {
                if (typeof this[eventName] == "function") {
                    try {
                        this[eventName]();
                    } catch (e) {
                        sinon.logError("Fake XHR " + eventName + " handler", e);
                    }
                }
            }
        },

        send: function send(data) {
            verifyState(this);

            if (!/^(get|head)$/i.test(this.method)) {
                this.requestBody = data;
            }
            this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";

            this.errorFlag = false;
            this.sendFlag = true;
            this.readyStateChange(FakeXDomainRequest.OPENED);

            if (typeof this.onSend == "function") {
                this.onSend(this);
            }
        },

        abort: function abort() {
            this.aborted = true;
            this.responseText = null;
            this.errorFlag = true;

            if (this.readyState > sinon.FakeXDomainRequest.UNSENT && this.sendFlag) {
                this.readyStateChange(sinon.FakeXDomainRequest.DONE);
                this.sendFlag = false;
            }
        },

        setResponseBody: function setResponseBody(body) {
            verifyRequestSent(this);
            verifyResponseBodyType(body);

            var chunkSize = this.chunkSize || 10;
            var index = 0;
            this.responseText = "";

            do {
                this.readyStateChange(FakeXDomainRequest.LOADING);
                this.responseText += body.substring(index, index + chunkSize);
                index += chunkSize;
            } while (index < body.length);

            this.readyStateChange(FakeXDomainRequest.DONE);
        },

        respond: function respond(status, contentType, body) {
            // content-type ignored, since XDomainRequest does not carry this
            // we keep the same syntax for respond(...) as for FakeXMLHttpRequest to ease
            // test integration across browsers
            this.status = typeof status == "number" ? status : 200;
            this.setResponseBody(body || "");
        },

        simulatetimeout: function(){
            this.status = 0;
            this.isTimeout = true;
            // Access to this should actually throw an error
            this.responseText = undefined;
            this.readyStateChange(FakeXDomainRequest.DONE);
        }
    });

    sinon.extend(FakeXDomainRequest, {
        UNSENT: 0,
        OPENED: 1,
        LOADING: 3,
        DONE: 4
    });

    sinon.useFakeXDomainRequest = function () {
        sinon.FakeXDomainRequest.restore = function restore(keepOnCreate) {
            if (xdr.supportsXDR) {
                global.XDomainRequest = xdr.GlobalXDomainRequest;
            }

            delete sinon.FakeXDomainRequest.restore;

            if (keepOnCreate !== true) {
                delete sinon.FakeXDomainRequest.onCreate;
            }
        };
        if (xdr.supportsXDR) {
            global.XDomainRequest = sinon.FakeXDomainRequest;
        }
        return sinon.FakeXDomainRequest;
    };

    sinon.FakeXDomainRequest = FakeXDomainRequest;
})(this);

if (typeof module == "object" && typeof require == "function") {
    module.exports = sinon;
}

return sinon;}.call(typeof window != 'undefined' && window || {}));
/**
 * Modules in this bundle
 * @license
 *
 * smartphoto:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: appleple
 *   homepage: http://developer.a-blogcms.jp
 *   version: 1.3.1
 *
 * a-template:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: steelydylan
 *   version: 0.5.3
 *
 * array.prototype.find:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Paul Miller <http://paulmillr.com>
 *   contributors: Duncan Hall <himself@duncanhall.net>
 *   homepage: https://github.com/paulmillr/Array.prototype.find#readme
 *   version: 2.0.4
 *
 * custom-event-polyfill:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   contributors: Frank Panetta, Mikhail Reenko <reenko@yandex.ru>, Joscha Feth <joscha@feth.com>
 *   homepage: https://github.com/krambuhl/custom-event-polyfill#readme
 *   version: 0.3.0
 *
 * define-properties:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband
 *   homepage: https://github.com/ljharb/define-properties#readme
 *   version: 1.1.2
 *
 * es-abstract:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband <ljharb@gmail.com>
 *   contributors: Jordan Harband <ljharb@gmail.com>
 *   homepage: https://github.com/ljharb/es-abstract#readme
 *   version: 1.11.0
 *
 * es-to-primitive:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband
 *   homepage: https://github.com/ljharb/es-to-primitive#readme
 *   version: 1.1.1
 *
 * es6-promise-polyfill:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Roman Dvornov <rdvornov@gmail.com>
 *   homepage: https://github.com/lahmatiy/es6-promise-polyfill#readme
 *   version: 1.2.0
 *
 * foreach:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Manuel Stofer <manuel@takimata.ch>
 *   contributors: Manuel Stofer, Jordan Harband
 *   homepage: https://github.com/manuelstofer/foreach#readme
 *   version: 2.0.5
 *
 * function-bind:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Raynos <raynos2@gmail.com>
 *   contributors: Raynos, Jordan Harband
 *   homepage: https://github.com/Raynos/function-bind
 *   version: 1.1.1
 *
 * has:
 *   licenses: MIT (http://opensource.org/licenses/MIT)
 *   author: Thiago de Arruda <tpadilha84@gmail.com>
 *   homepage: https://github.com/tarruda/has
 *   version: 1.0.1
 *
 * is-callable:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband <ljharb@gmail.com>
 *   contributors: Jordan Harband <ljharb@gmail.com>
 *   homepage: https://github.com/ljharb/is-callable#readme
 *   version: 1.1.3
 *
 * is-date-object:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband
 *   homepage: https://github.com/ljharb/is-date-object#readme
 *   version: 1.0.1
 *
 * is-regex:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband
 *   homepage: https://github.com/ljharb/is-regex
 *   version: 1.0.4
 *
 * is-symbol:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband
 *   homepage: https://github.com/ljharb/is-symbol#readme
 *   version: 1.0.1
 *
 * morphdom:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Patrick Steele-Idem <pnidem@gmail.com>
 *   homepage: https://github.com/patrick-steele-idem/morphdom#readme
 *   version: 2.3.3
 *
 * object-keys:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Jordan Harband <ljharb@gmail.com>
 *   contributors: Jordan Harband <ljharb@gmail.com>, Raynos <raynos2@gmail.com>, Nathan Rajlich <nathan@tootallnate.net>, Ivan Starkov <istarkov@gmail.com>, Gary Katsevman <git@gkatsev.com>
 *   homepage: https://github.com/ljharb/object-keys#readme
 *   version: 1.0.11
 *
 * process:
 *   license: MIT (http://opensource.org/licenses/MIT)
 *   author: Roman Shtylman <shtylman@gmail.com>
 *   homepage: https://github.com/shtylman/node-process#readme
 *   version: 0.11.10
 *
 * timers-browserify:
 *   licenses: MIT (http://opensource.org/licenses/MIT)
 *   author: J. Ryan Stinnett <jryans@gmail.com>
 *   contributors: Guy Bedford <guybedford@gmail.com>, Ionut-Cristian Florescu <ionut.florescu@gmail.com>, James Halliday <mail@substack.net>, Jan Schär <jscissr@gmail.com>, Johannes Ewald <johannes.ewald@peerigon.com>, Jonathan Prins <jon@blip.tv>, Matt Esch <matt@mattesch.info>
 *   homepage: https://github.com/jryans/timers-browserify
 *   version: 1.4.2
 *
 * This header is generated by licensify (https://github.com/twada/licensify)
 */

!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.SmartPhoto=t()}}(function(){var t;return function(){function t(e,r,o){function n(a,s){if(!r[a]){if(!e[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(i)return i(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var l=r[a]={exports:{}};e[a][0].call(l.exports,function(t){return n(e[a][1][t]||t)},l,l.exports,t,e,r,o)}return r[a].exports}for(var i="function"==typeof require&&require,a=0;a<o.length;a++)n(o[a]);return n}return t}()({1:[function(t,e,r){"use strict";function o(t){if(Array.isArray(t)){for(var e=0,r=Array(t.length);e<t.length;e++)r[e]=t[e];return r}return Array.from(t)}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var o=e[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,r,o){return r&&t(e.prototype,r),o&&t(e,o),e}}(),a=t("./util"),s=t("morphdom"),c=t("array.prototype.find"),u="input paste copy click change keydown keyup keypress contextmenu mouseup mousedown mousemove touchstart touchend touchmove compositionstart compositionend focus",l=u.replace(/([a-z]+)/g,"[data-action-$1],")+"[data-action]",h=function(){function t(e){var r=this;n(this,t),this.atemplate=[],e&&Object.keys(e).forEach(function(t){r[t]=e[t]}),this.data||(this.data={}),this.templates||(this.templates=[]);for(var o=this.templates,i=o.length,s=0,c=i;s<c;s+=1){var u=this.templates[s],l=(0,a.selector)("#"+u).innerHTML;this.atemplate.push({id:u,html:l,binded:!1})}}return i(t,[{key:"addDataBind",value:function(t){var e=this;(0,a.on)(t,"[data-bind]","input change click",function(t){var r=t.delegateTarget,o=r.getAttribute("data-bind"),n=r.getAttribute("href"),i=r.value;n&&(i=i.replace("#","")),"checkbox"===r.getAttribute("type")?function(){var t=[],e=document.querySelectorAll('[data-bind="'+o+'"]');[].forEach.call(e,function(e){e.checked&&t.push(e.value)})}():"radio"!==r.getAttribute("type")&&e.updateDataByString(o,i)})}},{key:"addActionBind",value:function(t){var e=this;(0,a.on)(t,l,u,function(t){var r=t.delegateTarget,n=u.split(" "),i="action";n.forEach(function(e){r.getAttribute("data-action-"+e)&&t.type===e&&(i+="-"+e)});var a=r.getAttribute("data-"+i);if(a){var s=a.replace(/\(.*?\);?/,""),c=a.replace(/(.*?)\((.*?)\);?/,"$2"),l=c.split(",");if(e.e=t,e.method&&e.method[s]){var h;(h=e.method)[s].apply(h,o(l))}else e[s]&&e[s].apply(e,o(l))}})}},{key:"addTemplate",value:function(t,e){this.atemplate.push({id:t,html:e,binded:!1}),this.templates.push(t)}},{key:"getData",value:function(){return JSON.parse(JSON.stringify(this.data))}},{key:"saveData",value:function(t){var e=JSON.stringify(this.data);localStorage.setItem(t,e)}},{key:"setData",value:function(t){var e=this;Object.keys(t).forEach(function(r){"function"!=typeof t[r]&&(e.data[r]=t[r])})}},{key:"loadData",value:function(t){var e=JSON.parse(localStorage.getItem(t));e&&this.setData(e)}},{key:"getRand",value:function(t,e){return~~(Math.random()*(e-t+1))+t}},{key:"getRandText",value:function(t){for(var e="",r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",o=r.length,n=0;n<t;n+=1)e+=r.charAt(Math.floor(this.getRand(0,o)));return e}},{key:"getDataFromObj",value:function(t,e){t=t.replace(/\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\]/g,".$1"),t=t.replace(/^\./,"");for(var r=t.split(".");r.length;){var o=r.shift();if(!(o in e))return null;e=e[o]}return e}},{key:"getDataByString",value:function(t){var e=this.data;return this.getDataFromObj(t,e)}},{key:"updateDataByString",value:function(t,e){for(var r=this.data,o=t.split(".");o.length>1;)r=r[o.shift()];r[o.shift()]=e}},{key:"removeDataByString",value:function(t){for(var e=this.data,r=t.split(".");r.length>1;)e=e[r.shift()];var o=r.shift();o.match(/^\d+$/)?e.splice(Number(o),1):delete e[o]}},{key:"resolveBlock",value:function(t,e,r){var o=this,n=t.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g),i=t.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+) -->/g),a=t.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist -->/g),s=t.match(/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty -->/g);if(n)for(var c=0,u=n.length;c<u;c+=1){var l=n[c];l=l.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touch#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/,"($1):touch#($2)");var h=l.replace(/BEGIN/,"END"),d=new RegExp(l+"(([\\n\\r\\t]|.)*?)"+h,"g");t=t.replace(d,function(t,r,n,i){return""+("function"==typeof e[r]?e[r].apply(o):o.getDataFromObj(r,e))===n?i:""})}if(i)for(var f=0,p=i.length;f<p;f+=1){var m=i[f];m=m.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):touchnot#([\w\-\.ぁ-んァ-ヶ亜-熙]+)/,"($1):touchnot#($2)");var y=m.replace(/BEGIN/,"END"),v=new RegExp(m+"(([\\n\\r\\t]|.)*?)"+y,"g");t=t.replace(v,function(t,r,n,i){return""+("function"==typeof e[r]?e[r].apply(o):o.getDataFromObj(r,e))!==n?i:""})}if(a)for(var g=0,b=a.length;g<b;g+=1){var w=a[g];w=w.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):exist/,"($1):exist");var x=w.replace(/BEGIN/,"END"),E=new RegExp(w+"(([\\n\\r\\t]|.)*?)"+x,"g");t=t.replace(E,function(t,r,n){var i="function"==typeof e[r]?e[r].apply(o):o.getDataFromObj(r,e);return i||0===i?n:""})}if(s)for(var P=0,I=s.length;P<I;P+=1){var S=s[P];S=S.replace(/([\w\-\.ぁ-んァ-ヶ亜-熙]+):empty/,"($1):empty");var T=S.replace(/BEGIN/,"END"),N=new RegExp(S+"(([\\n\\r\\t]|.)*?)"+T,"g");t=t.replace(N,function(t,r,n){var i="function"==typeof e[r]?e[r].apply(o):o.getDataFromObj(r,e);return i||0===i?"":n})}return t=t.replace(/{([\w\-\.ぁ-んァ-ヶ亜-熙]+)}(\[([\w\-\.ぁ-んァ-ヶ亜-熙]+)\])*/g,function(t,n,i,a){var s=void 0;if(""+n=="i")s=r;else{if(!e[n]&&0!==e[n])return a&&o.convert&&o.convert[a]?o.convert[a].call(o,""):"";s="function"==typeof e[n]?e[n].apply(o):e[n]}return a&&o.convert&&o.convert[a]?o.convert[a].call(o,s):s})}},{key:"resolveAbsBlock",value:function(t){var e=this;return t=t.replace(/{(.*?)}/g,function(t,r){var o=e.getDataByString(r);return void 0!==o?"function"==typeof o?o.apply(e):o:t})}},{key:"resolveInclude",value:function(t){var e=/<!-- #include id="(.*?)" -->/g;return t=t.replace(e,function(t,e){return(0,a.selector)("#"+e).innerHTML})}},{key:"resolveWith",value:function(t){var e=/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+):with -->/g;return t=t.replace(e,function(t,e){return t=t.replace(/data\-bind=['"](.*?)['"]/g,"data-bind='"+e+".$1'")})}},{key:"resolveLoop",value:function(t){var e=/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g,r=this;return t=t.replace(e,function(t,e,o){var n=r.getDataByString(e),i=[];i="function"==typeof n?n.apply(r):n;var a="";if(i instanceof Array)for(var s=0,c=i.length;s<c;s+=1)a+=r.resolveBlock(o,i[s],s);return a=a.replace(/\\([^\\])/g,"$1")})}},{key:"removeData",value:function(t){var e=this.data;return Object.keys(e).forEach(function(r){for(var o=0,n=t.length;o<n;o+=1)r===t[o]&&delete e[r]}),this}},{key:"hasLoop",value:function(t){var e=/<!-- BEGIN ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->(([\n\r\t]|.)*?)<!-- END ([\w\-\.ぁ-んァ-ヶ亜-熙]+?):loop -->/g;return!!t.match(e)}},{key:"getHtml",value:function(t,e){var r=c(this.atemplate,function(e){return e.id===t}),o="";if(r&&r.html&&(o=r.html),e&&(o=t),!o)return"";var n=this.data;for(o=this.resolveInclude(o),o=this.resolveWith(o);this.hasLoop(o);)o=this.resolveLoop(o);return o=this.resolveBlock(o,n),o=o.replace(/\\([^\\])/g,"$1"),o=this.resolveAbsBlock(o),o.replace(/^([\t ])*\n/gm,"")}},{key:"update",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"html",r=arguments[1],o=this.templates;this.beforeUpdated&&this.beforeUpdated();for(var n=0,i=o.length;n<i;n+=1)!function(n,i){var u=o[n],l="#"+u,h=t.getHtml(u),d=(0,a.selector)("[data-id='"+u+"']");if(d)if("text"===e)d.innerText=h;else if(r){var f=document.createElement("div");f.innerHTML=h;var p=f.querySelector(r).outerHTML;s(d.querySelector(r),p)}else s(d,"<div data-id='"+u+"'>"+h+"</div>");else(0,a.selector)(l).insertAdjacentHTML("afterend",'<div data-id="'+u+'"></div>'),"text"===e?(0,a.selector)("[data-id='"+u+"']").innerText=h:(0,a.selector)("[data-id='"+u+"']").innerHTML=h;var m=c(t.atemplate,function(t){return t.id===u});m.binded||(m.binded=!0,t.addDataBind((0,a.selector)("[data-id='"+u+"']")),t.addActionBind((0,a.selector)("[data-id='"+u+"']")))}(n);return this.updateBindingData(r),this.onUpdated&&this.onUpdated(r),this}},{key:"updateBindingData",value:function(t){for(var e=this,r=this.templates,o=0,n=r.length;o<n;o+=1){var i=r[o],s=(0,a.selector)("[data-id='"+i+"']");t&&(s=s.querySelector(t));var c=s.querySelectorAll("[data-bind]");[].forEach.call(c,function(t){var r=e.getDataByString(t.getAttribute("data-bind"));"checkbox"===t.getAttribute("type")||"radio"===t.getAttribute("type")?r===t.value&&(t.checked=!0):t.value=r});var u=s.querySelectorAll("[data-bind-oneway]");[].forEach.call(u,function(t){var r=e.getDataByString(t.getAttribute("data-bind-oneway"));"checkbox"===t.getAttribute("type")||"radio"===t.getAttribute("type")?r===t.value&&(t.checked=!0):t.value=r})}return this}},{key:"applyMethod",value:function(t){for(var e,r=arguments.length,o=Array(r>1?r-1:0),n=1;n<r;n++)o[n-1]=arguments[n];return(e=this.method)[t].apply(e,o)}},{key:"getComputedProp",value:function(t){return this.data[t].apply(this)}},{key:"remove",value:function(t){for(var e=this.data,r=t.split(".");r.length>1;)e=e[r.shift()];var o=r.shift();return o.match(/^\d+$/)?e.splice(Number(o),1):delete e[o],this}}]),t}();r.default=h,e.exports=r.default},{"./util":2,"array.prototype.find":4,morphdom:30}],2:[function(t,e,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var o=r.matches=function(t,e){for(var r=(t.document||t.ownerDocument).querySelectorAll(e),o=r.length;--o>=0&&r.item(o)!==t;);return o>-1},n=(r.selector=function(t){return document.querySelector(t)},r.findAncestor=function(t,e){if("function"==typeof t.closest)return t.closest(e)||null;for(;t&&t!==document;){if(o(t,e))return t;t=t.parentElement}return null});r.on=function(t,e,r,o){r.split(" ").forEach(function(r){t.addEventListener(r,function(t){var r=(t.target,n(t.target,e));r&&(t.delegateTarget=r,o(t))})})}},{}],3:[function(t,e,r){"use strict";var o=t("es-abstract/es6");e.exports=function(t){var e=o.ToObject(this),r=o.ToInteger(o.ToLength(e.length));if(!o.IsCallable(t))throw new TypeError("Array#find: predicate must be a function");if(0!==r)for(var n,i=arguments[1],a=0;a<r;a++)if(n=e[a],o.Call(t,i,[n,a,e]))return n}},{"es-abstract/es6":11}],4:[function(t,e,r){"use strict";var o=t("define-properties"),n=t("es-abstract/es6"),i=t("./implementation"),a=t("./polyfill"),s=t("./shim"),c=Array.prototype.slice,u=a(),l=function(t,e){n.RequireObjectCoercible(t);var r=c.call(arguments,1);return u.apply(t,r)};o(l,{getPolyfill:a,implementation:i,shim:s}),e.exports=l},{"./implementation":3,"./polyfill":5,"./shim":6,"define-properties":8,"es-abstract/es6":11}],5:[function(t,e,r){"use strict";e.exports=function(){return Array.prototype.find&&1!==[,1].find(function(){return!0})?Array.prototype.find:t("./implementation")}},{"./implementation":3}],6:[function(t,e,r){"use strict";var o=t("define-properties"),n=t("./polyfill");e.exports=function(){var t=n();return o(Array.prototype,{find:t},{find:function(){return Array.prototype.find!==t}}),t}},{"./polyfill":5,"define-properties":8}],7:[function(t,e,r){try{var o=new window.CustomEvent("test");if(o.preventDefault(),!0!==o.defaultPrevented)throw new Error("Could not prevent default")}catch(t){var n=function(t,e){var r,o;return e=e||{bubbles:!1,cancelable:!1,detail:void 0},r=document.createEvent("CustomEvent"),r.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),o=r.preventDefault,r.preventDefault=function(){o.call(this);try{Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}})}catch(t){this.defaultPrevented=!0}},r};n.prototype=window.Event.prototype,window.CustomEvent=n}},{}],8:[function(t,e,r){"use strict";var o=t("object-keys"),n=t("foreach"),i="function"==typeof Symbol&&"symbol"==typeof Symbol(),a=Object.prototype.toString,s=function(t){return"function"==typeof t&&"[object Function]"===a.call(t)},c=Object.defineProperty&&function(){var t={};try{Object.defineProperty(t,"x",{enumerable:!1,value:t});for(var e in t)return!1;return t.x===t}catch(t){return!1}}(),u=function(t,e,r,o){(!(e in t)||s(o)&&o())&&(c?Object.defineProperty(t,e,{configurable:!0,enumerable:!1,value:r,writable:!0}):t[e]=r)},l=function(t,e){var r=arguments.length>2?arguments[2]:{},a=o(e);i&&(a=a.concat(Object.getOwnPropertySymbols(e))),n(a,function(o){u(t,o,e[o],r[o])})};l.supportsDescriptors=!!c,e.exports=l},{foreach:22,"object-keys":31}],9:[function(t,e,r){"use strict";var o=t("has"),n=t("es-to-primitive/es6"),i=Object.prototype.toString,a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator,s=a?Symbol.iterator:null,c=t("./helpers/isNaN"),u=t("./helpers/isFinite"),l=Number.MAX_SAFE_INTEGER||Math.pow(2,53)-1,h=t("./helpers/assign"),d=t("./helpers/sign"),f=t("./helpers/mod"),p=t("./helpers/isPrimitive"),m=parseInt,y=t("function-bind"),v=y.call(Function.call,Array.prototype.slice),g=y.call(Function.call,String.prototype.slice),b=y.call(Function.call,RegExp.prototype.test,/^0b[01]+$/i),w=y.call(Function.call,RegExp.prototype.test,/^0o[0-7]+$/i),x=y.call(Function.call,RegExp.prototype.exec),E=["","​","￾"].join(""),P=new RegExp("["+E+"]","g"),I=y.call(Function.call,RegExp.prototype.test,P),S=/^[-+]0x[0-9a-f]+$/i,T=y.call(Function.call,RegExp.prototype.test,S),N=["\t\n\v\f\r   ᠎    ","         　\u2028","\u2029\ufeff"].join(""),O=new RegExp("(^["+N+"]+)|(["+N+"]+$)","g"),_=y.call(Function.call,String.prototype.replace),D=function(t){return _(t,O,"")},j=t("./es5"),A=t("is-regex"),k=h(h({},j),{Call:function(t,e){var r=arguments.length>2?arguments[2]:[];if(!this.IsCallable(t))throw new TypeError(t+" is not a function");return t.apply(e,r)},ToPrimitive:n,ToNumber:function(t){var e=p(t)?t:n(t,Number);if("symbol"==typeof e)throw new TypeError("Cannot convert a Symbol value to a number");if("string"==typeof e){if(b(e))return this.ToNumber(m(g(e,2),2));if(w(e))return this.ToNumber(m(g(e,2),8));if(I(e)||T(e))return NaN;var r=D(e);if(r!==e)return this.ToNumber(r)}return Number(e)},ToInt16:function(t){var e=this.ToUint16(t);return e>=32768?e-65536:e},ToInt8:function(t){var e=this.ToUint8(t);return e>=128?e-256:e},ToUint8:function(t){var e=this.ToNumber(t);if(c(e)||0===e||!u(e))return 0;var r=d(e)*Math.floor(Math.abs(e));return f(r,256)},ToUint8Clamp:function(t){var e=this.ToNumber(t);if(c(e)||e<=0)return 0;if(e>=255)return 255;var r=Math.floor(t);return r+.5<e?r+1:e<r+.5?r:r%2!=0?r+1:r},ToString:function(t){if("symbol"==typeof t)throw new TypeError("Cannot convert a Symbol value to a string");return String(t)},ToObject:function(t){return this.RequireObjectCoercible(t),Object(t)},ToPropertyKey:function(t){var e=this.ToPrimitive(t,String);return"symbol"==typeof e?e:this.ToString(e)},ToLength:function(t){var e=this.ToInteger(t);return e<=0?0:e>l?l:e},CanonicalNumericIndexString:function(t){if("[object String]"!==i.call(t))throw new TypeError("must be a string");if("-0"===t)return-0;var e=this.ToNumber(t);return this.SameValue(this.ToString(e),t)?e:void 0},RequireObjectCoercible:j.CheckObjectCoercible,IsArray:Array.isArray||function(t){return"[object Array]"===i.call(t)},IsConstructor:function(t){return"function"==typeof t&&!!t.prototype},IsExtensible:function(t){return!Object.preventExtensions||!p(t)&&Object.isExtensible(t)},IsInteger:function(t){if("number"!=typeof t||c(t)||!u(t))return!1;var e=Math.abs(t);return Math.floor(e)===e},IsPropertyKey:function(t){return"string"==typeof t||"symbol"==typeof t},IsRegExp:function(t){if(!t||"object"!=typeof t)return!1;if(a){var e=t[Symbol.match];if(void 0!==e)return j.ToBoolean(e)}return A(t)},SameValueZero:function(t,e){return t===e||c(t)&&c(e)},GetV:function(t,e){if(!this.IsPropertyKey(e))throw new TypeError("Assertion failed: IsPropertyKey(P) is not true");return this.ToObject(t)[e]},GetMethod:function(t,e){if(!this.IsPropertyKey(e))throw new TypeError("Assertion failed: IsPropertyKey(P) is not true");var r=this.GetV(t,e);if(null!=r){if(!this.IsCallable(r))throw new TypeError(e+"is not a function");return r}},Get:function(t,e){if("Object"!==this.Type(t))throw new TypeError("Assertion failed: Type(O) is not Object");if(!this.IsPropertyKey(e))throw new TypeError("Assertion failed: IsPropertyKey(P) is not true");return t[e]},Type:function(t){return"symbol"==typeof t?"Symbol":j.Type(t)},SpeciesConstructor:function(t,e){if("Object"!==this.Type(t))throw new TypeError("Assertion failed: Type(O) is not Object");var r=t.constructor;if(void 0===r)return e;if("Object"!==this.Type(r))throw new TypeError("O.constructor is not an Object");var o=a&&Symbol.species?r[Symbol.species]:void 0;if(null==o)return e;if(this.IsConstructor(o))return o;throw new TypeError("no constructor found")},CompletePropertyDescriptor:function(t){if(!this.IsPropertyDescriptor(t))throw new TypeError("Desc must be a Property Descriptor");return this.IsGenericDescriptor(t)||this.IsDataDescriptor(t)?(o(t,"[[Value]]")||(t["[[Value]]"]=void 0),o(t,"[[Writable]]")||(t["[[Writable]]"]=!1)):(o(t,"[[Get]]")||(t["[[Get]]"]=void 0),o(t,"[[Set]]")||(t["[[Set]]"]=void 0)),o(t,"[[Enumerable]]")||(t["[[Enumerable]]"]=!1),o(t,"[[Configurable]]")||(t["[[Configurable]]"]=!1),t},Set:function(t,e,r,o){if("Object"!==this.Type(t))throw new TypeError("O must be an Object");if(!this.IsPropertyKey(e))throw new TypeError("P must be a Property Key");if("Boolean"!==this.Type(o))throw new TypeError("Throw must be a Boolean");if(o)return t[e]=r,!0;try{t[e]=r}catch(t){return!1}},HasOwnProperty:function(t,e){if("Object"!==this.Type(t))throw new TypeError("O must be an Object");if(!this.IsPropertyKey(e))throw new TypeError("P must be a Property Key");return o(t,e)},HasProperty:function(t,e){if("Object"!==this.Type(t))throw new TypeError("O must be an Object");if(!this.IsPropertyKey(e))throw new TypeError("P must be a Property Key");return e in t},IsConcatSpreadable:function(t){if("Object"!==this.Type(t))return!1;if(a&&"symbol"==typeof Symbol.isConcatSpreadable){var e=this.Get(t,Symbol.isConcatSpreadable);if(void 0!==e)return this.ToBoolean(e)}return this.IsArray(t)},Invoke:function(t,e){if(!this.IsPropertyKey(e))throw new TypeError("P must be a Property Key");var r=v(arguments,2),o=this.GetV(t,e);return this.Call(o,t,r)},GetIterator:function(t,e){if(!a)throw new SyntaxError("ES.GetIterator depends on native iterator support.");var r=e;arguments.length<2&&(r=this.GetMethod(t,s));var o=this.Call(r,t);if("Object"!==this.Type(o))throw new TypeError("iterator must return an object");return o},IteratorNext:function(t,e){var r=this.Invoke(t,"next",arguments.length<2?[]:[e]);if("Object"!==this.Type(r))throw new TypeError("iterator next must return an object");return r},IteratorComplete:function(t){if("Object"!==this.Type(t))throw new TypeError("Assertion failed: Type(iterResult) is not Object");return this.ToBoolean(this.Get(t,"done"))},IteratorValue:function(t){if("Object"!==this.Type(t))throw new TypeError("Assertion failed: Type(iterResult) is not Object");return this.Get(t,"value")},IteratorStep:function(t){var e=this.IteratorNext(t);return!0!==this.IteratorComplete(e)&&e},IteratorClose:function(t,e){if("Object"!==this.Type(t))throw new TypeError("Assertion failed: Type(iterator) is not Object");if(!this.IsCallable(e))throw new TypeError("Assertion failed: completion is not a thunk for a Completion Record");var r=e,o=this.GetMethod(t,"return");if(void 0===o)return r();var n;try{var i=this.Call(o,t,[])}catch(t){throw n=r(),r=null,t}if(n=r(),r=null,"Object"!==this.Type(i))throw new TypeError("iterator .return must return an object");return n},CreateIterResultObject:function(t,e){if("Boolean"!==this.Type(e))throw new TypeError("Assertion failed: Type(done) is not Boolean");return{value:t,done:e}},RegExpExec:function(t,e){if("Object"!==this.Type(t))throw new TypeError("R must be an Object");if("String"!==this.Type(e))throw new TypeError("S must be a String");var r=this.Get(t,"exec");if(this.IsCallable(r)){var o=this.Call(r,t,[e]);if(null===o||"Object"===this.Type(o))return o;throw new TypeError('"exec" method must return `null` or an Object')}return x(t,e)},ArraySpeciesCreate:function(t,e){if(!this.IsInteger(e)||e<0)throw new TypeError("Assertion failed: length must be an integer >= 0");var r,o=0===e?0:e;if(this.IsArray(t)&&(r=this.Get(t,"constructor"),"Object"===this.Type(r)&&a&&Symbol.species&&null===(r=this.Get(r,Symbol.species))&&(r=void 0)),void 0===r)return Array(o);if(!this.IsConstructor(r))throw new TypeError("C must be a constructor");return new r(o)},CreateDataProperty:function(t,e,r){if("Object"!==this.Type(t))throw new TypeError("Assertion failed: Type(O) is not Object");if(!this.IsPropertyKey(e))throw new TypeError("Assertion failed: IsPropertyKey(P) is not true");var o=Object.getOwnPropertyDescriptor(t,e),n=o||"function"!=typeof Object.isExtensible||Object.isExtensible(t);if(o&&(!o.writable||!o.configurable)||!n)return!1;var i={configurable:!0,enumerable:!0,value:r,writable:!0};return Object.defineProperty(t,e,i),!0},CreateDataPropertyOrThrow:function(t,e,r){if("Object"!==this.Type(t))throw new TypeError("Assertion failed: Type(O) is not Object");if(!this.IsPropertyKey(e))throw new TypeError("Assertion failed: IsPropertyKey(P) is not true");var o=this.CreateDataProperty(t,e,r);if(!o)throw new TypeError("unable to create data property");return o},AdvanceStringIndex:function(t,e,r){if("String"!==this.Type(t))throw new TypeError("Assertion failed: Type(S) is not String");if(!this.IsInteger(e))throw new TypeError("Assertion failed: length must be an integer >= 0 and <= (2**53 - 1)");if(e<0||e>l)throw new RangeError("Assertion failed: length must be an integer >= 0 and <= (2**53 - 1)");if("Boolean"!==this.Type(r))throw new TypeError("Assertion failed: Type(unicode) is not Boolean");if(!r)return e+1;if(e+1>=t.length)return e+1;var o=t.charCodeAt(e);if(o<55296||o>56319)return e+1;var n=t.charCodeAt(e+1);return n<56320||n>57343?e+1:e+2}});delete k.CheckObjectCoercible,e.exports=k},{"./es5":10,"./helpers/assign":12,"./helpers/isFinite":13,"./helpers/isNaN":14,"./helpers/isPrimitive":15,"./helpers/mod":16,"./helpers/sign":17,"es-to-primitive/es6":19,"function-bind":24,has:25,"is-regex":28}],10:[function(t,e,r){"use strict";var o=t("./helpers/isNaN"),n=t("./helpers/isFinite"),i=t("./helpers/sign"),a=t("./helpers/mod"),s=t("is-callable"),c=t("es-to-primitive/es5"),u=t("has"),l={ToPrimitive:c,ToBoolean:function(t){return!!t},ToNumber:function(t){return Number(t)},ToInteger:function(t){var e=this.ToNumber(t);return o(e)?0:0!==e&&n(e)?i(e)*Math.floor(Math.abs(e)):e},ToInt32:function(t){return this.ToNumber(t)>>0},ToUint32:function(t){return this.ToNumber(t)>>>0},ToUint16:function(t){var e=this.ToNumber(t);if(o(e)||0===e||!n(e))return 0;var r=i(e)*Math.floor(Math.abs(e));return a(r,65536)},ToString:function(t){return String(t)},ToObject:function(t){return this.CheckObjectCoercible(t),Object(t)},CheckObjectCoercible:function(t,e){if(null==t)throw new TypeError(e||"Cannot call method on "+t);return t},IsCallable:s,SameValue:function(t,e){return t===e?0!==t||1/t==1/e:o(t)&&o(e)},Type:function(t){return null===t?"Null":void 0===t?"Undefined":"function"==typeof t||"object"==typeof t?"Object":"number"==typeof t?"Number":"boolean"==typeof t?"Boolean":"string"==typeof t?"String":void 0},IsPropertyDescriptor:function(t){if("Object"!==this.Type(t))return!1;var e={"[[Configurable]]":!0,"[[Enumerable]]":!0,"[[Get]]":!0,"[[Set]]":!0,"[[Value]]":!0,"[[Writable]]":!0};for(var r in t)if(u(t,r)&&!e[r])return!1;var o=u(t,"[[Value]]"),n=u(t,"[[Get]]")||u(t,"[[Set]]");if(o&&n)throw new TypeError("Property Descriptors may not be both accessor and data descriptors");return!0},IsAccessorDescriptor:function(t){if(void 0===t)return!1;if(!this.IsPropertyDescriptor(t))throw new TypeError("Desc must be a Property Descriptor");return!(!u(t,"[[Get]]")&&!u(t,"[[Set]]"))},IsDataDescriptor:function(t){if(void 0===t)return!1;if(!this.IsPropertyDescriptor(t))throw new TypeError("Desc must be a Property Descriptor");return!(!u(t,"[[Value]]")&&!u(t,"[[Writable]]"))},IsGenericDescriptor:function(t){if(void 0===t)return!1;if(!this.IsPropertyDescriptor(t))throw new TypeError("Desc must be a Property Descriptor");return!this.IsAccessorDescriptor(t)&&!this.IsDataDescriptor(t)},FromPropertyDescriptor:function(t){if(void 0===t)return t;if(!this.IsPropertyDescriptor(t))throw new TypeError("Desc must be a Property Descriptor");if(this.IsDataDescriptor(t))return{value:t["[[Value]]"],writable:!!t["[[Writable]]"],enumerable:!!t["[[Enumerable]]"],configurable:!!t["[[Configurable]]"]};if(this.IsAccessorDescriptor(t))return{get:t["[[Get]]"],set:t["[[Set]]"],enumerable:!!t["[[Enumerable]]"],configurable:!!t["[[Configurable]]"]};throw new TypeError("FromPropertyDescriptor must be called with a fully populated Property Descriptor")},ToPropertyDescriptor:function(t){if("Object"!==this.Type(t))throw new TypeError("ToPropertyDescriptor requires an object");var e={};if(u(t,"enumerable")&&(e["[[Enumerable]]"]=this.ToBoolean(t.enumerable)),u(t,"configurable")&&(e["[[Configurable]]"]=this.ToBoolean(t.configurable)),u(t,"value")&&(e["[[Value]]"]=t.value),u(t,"writable")&&(e["[[Writable]]"]=this.ToBoolean(t.writable)),u(t,"get")){var r=t.get;if(void 0!==r&&!this.IsCallable(r))throw new TypeError("getter must be a function");e["[[Get]]"]=r}if(u(t,"set")){var o=t.set;if(void 0!==o&&!this.IsCallable(o))throw new TypeError("setter must be a function");e["[[Set]]"]=o}if((u(e,"[[Get]]")||u(e,"[[Set]]"))&&(u(e,"[[Value]]")||u(e,"[[Writable]]")))throw new TypeError("Invalid property descriptor. Cannot both specify accessors and a value or writable attribute");return e}};e.exports=l},{"./helpers/isFinite":13,"./helpers/isNaN":14,"./helpers/mod":16,"./helpers/sign":17,"es-to-primitive/es5":18,has:25,"is-callable":26}],11:[function(t,e,r){"use strict";e.exports=t("./es2015")},{"./es2015":9}],12:[function(t,e,r){var o=Object.prototype.hasOwnProperty;e.exports=function(t,e){if(Object.assign)return Object.assign(t,e);for(var r in e)o.call(e,r)&&(t[r]=e[r]);return t}},{}],13:[function(t,e,r){var o=Number.isNaN||function(t){return t!==t};e.exports=Number.isFinite||function(t){return"number"==typeof t&&!o(t)&&t!==1/0&&t!==-1/0}},{}],14:[function(t,e,r){e.exports=Number.isNaN||function(t){return t!==t}},{}],15:[function(t,e,r){e.exports=function(t){return null===t||"function"!=typeof t&&"object"!=typeof t}},{}],16:[function(t,e,r){e.exports=function(t,e){var r=t%e;return Math.floor(r>=0?r:r+e)}},{}],17:[function(t,e,r){e.exports=function(t){return t>=0?1:-1}},{}],18:[function(t,e,r){"use strict";var o=Object.prototype.toString,n=t("./helpers/isPrimitive"),i=t("is-callable"),a={"[[DefaultValue]]":function(t,e){var r=e||("[object Date]"===o.call(t)?String:Number);if(r===String||r===Number){var a,s,c=r===String?["toString","valueOf"]:["valueOf","toString"];for(s=0;s<c.length;++s)if(i(t[c[s]])&&(a=t[c[s]](),n(a)))return a;throw new TypeError("No default value")}throw new TypeError("invalid [[DefaultValue]] hint supplied")}};e.exports=function(t,e){return n(t)?t:a["[[DefaultValue]]"](t,e)}},{"./helpers/isPrimitive":20,"is-callable":26}],19:[function(t,e,r){"use strict";var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator,n=t("./helpers/isPrimitive"),i=t("is-callable"),a=t("is-date-object"),s=t("is-symbol"),c=function(t,e){if(void 0===t||null===t)throw new TypeError("Cannot call method on "+t);if("string"!=typeof e||"number"!==e&&"string"!==e)throw new TypeError('hint must be "string" or "number"');var r,o,a,s="string"===e?["toString","valueOf"]:["valueOf","toString"];for(a=0;a<s.length;++a)if(r=t[s[a]],i(r)&&(o=r.call(t),n(o)))return o;throw new TypeError("No default value")},u=function(t,e){var r=t[e];if(null!==r&&void 0!==r){if(!i(r))throw new TypeError(r+" returned for property "+e+" of object "+t+" is not a function");return r}};e.exports=function(t,e){if(n(t))return t;var r="default";arguments.length>1&&(e===String?r="string":e===Number&&(r="number"));var i;if(o&&(Symbol.toPrimitive?i=u(t,Symbol.toPrimitive):s(t)&&(i=Symbol.prototype.valueOf)),void 0!==i){var l=i.call(t,r);if(n(l))return l;throw new TypeError("unable to convert exotic object to primitive")}return"default"===r&&(a(t)||s(t))&&(r="string"),c(t,"default"===r?"number":r)}},{"./helpers/isPrimitive":20,"is-callable":26,"is-date-object":27,"is-symbol":29}],20:[function(t,e,r){arguments[4][15][0].apply(r,arguments)},{dup:15}],21:[function(e,r,o){(function(e,r){!function(e){function n(t){return"[object Array]"===Object.prototype.toString.call(t)}function i(){for(var t=0;t<T.length;t++)T[t][0](T[t][1]);T=[],b=!1}function a(t,e){T.push([t,e]),b||(b=!0,S(i,0))}function s(t,e){function r(t){l(e,t)}function o(t){d(e,t)}try{t(r,o)}catch(t){o(t)}}function c(t){var e=t.owner,r=e.state_,o=e.data_,n=t[r],i=t.then;if("function"==typeof n){r=E;try{o=n(o)}catch(t){d(i,t)}}u(i,o)||(r===E&&l(i,o),r===P&&d(i,o))}function u(t,e){var r;try{if(t===e)throw new TypeError("A promises callback cannot return that same promise.");if(e&&("function"==typeof e||"object"==typeof e)){var o=e.then;if("function"==typeof o)return o.call(e,function(o){r||(r=!0,e!==o?l(t,o):h(t,o))},function(e){r||(r=!0,d(t,e))}),!0}}catch(e){return r||d(t,e),!0}return!1}function l(t,e){t!==e&&u(t,e)||h(t,e)}function h(t,e){t.state_===w&&(t.state_=x,t.data_=e,a(p,t))}function d(t,e){t.state_===w&&(t.state_=x,t.data_=e,a(m,t))}function f(t){var e=t.then_;t.then_=void 0;for(var r=0;r<e.length;r++)c(e[r])}function p(t){t.state_=E,f(t)}function m(t){t.state_=P,f(t)}function y(t){if("function"!=typeof t)throw new TypeError("Promise constructor takes a function argument");if(this instanceof y==!1)throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this.then_=[],s(t,this)}var v=e.Promise,g=v&&"resolve"in v&&"reject"in v&&"all"in v&&"race"in v&&function(){var t;return new v(function(e){t=e}),"function"==typeof t}();void 0!==o&&o?(o.Promise=g?v:y,o.Polyfill=y):"function"==typeof t&&t.amd?t(function(){return g?v:y}):g||(e.Promise=y);var b,w="pending",x="sealed",E="fulfilled",P="rejected",I=function(){},S=void 0!==r?r:setTimeout,T=[];y.prototype={constructor:y,state_:w,then_:null,data_:void 0,then:function(t,e){var r={owner:this,then:new this.constructor(I),fulfilled:t,rejected:e};return this.state_===E||this.state_===P?a(c,r):this.then_.push(r),r.then},catch:function(t){return this.then(null,t)}},y.all=function(t){var e=this;if(!n(t))throw new TypeError("You must pass an array to Promise.all().");return new e(function(e,r){for(var o,n=[],i=0,a=0;a<t.length;a++)o=t[a],o&&"function"==typeof o.then?o.then(function(t){return i++,function(r){n[t]=r,--i||e(n)}}(a),r):n[a]=o;i||e(n)})},y.race=function(t){var e=this;if(!n(t))throw new TypeError("You must pass an array to Promise.race().");return new e(function(e,r){for(var o,n=0;n<t.length;n++)o=t[n],o&&"function"==typeof o.then?o.then(e,r):e(o)})},y.resolve=function(t){var e=this;return t&&"object"==typeof t&&t.constructor===e?t:new e(function(e){e(t)})},y.reject=function(t){return new this(function(e,r){r(t)})}}("undefined"!=typeof window?window:void 0!==e?e:"undefined"!=typeof self?self:this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("timers").setImmediate)},{timers:34}],22:[function(t,e,r){var o=Object.prototype.hasOwnProperty,n=Object.prototype.toString;e.exports=function(t,e,r){if("[object Function]"!==n.call(e))throw new TypeError("iterator must be a function")
;var i=t.length;if(i===+i)for(var a=0;a<i;a++)e.call(r,t[a],a,t);else for(var s in t)o.call(t,s)&&e.call(r,t[s],s,t)}},{}],23:[function(t,e,r){"use strict";var o=Array.prototype.slice,n=Object.prototype.toString;e.exports=function(t){var e=this;if("function"!=typeof e||"[object Function]"!==n.call(e))throw new TypeError("Function.prototype.bind called on incompatible "+e);for(var r,i=o.call(arguments,1),a=function(){if(this instanceof r){var n=e.apply(this,i.concat(o.call(arguments)));return Object(n)===n?n:this}return e.apply(t,i.concat(o.call(arguments)))},s=Math.max(0,e.length-i.length),c=[],u=0;u<s;u++)c.push("$"+u);if(r=Function("binder","return function ("+c.join(",")+"){ return binder.apply(this,arguments); }")(a),e.prototype){var l=function(){};l.prototype=e.prototype,r.prototype=new l,l.prototype=null}return r}},{}],24:[function(t,e,r){"use strict";var o=t("./implementation");e.exports=Function.prototype.bind||o},{"./implementation":23}],25:[function(t,e,r){var o=t("function-bind");e.exports=o.call(Function.call,Object.prototype.hasOwnProperty)},{"function-bind":24}],26:[function(t,e,r){"use strict";var o=Function.prototype.toString,n=/^\s*class /,i=function(t){try{var e=o.call(t),r=e.replace(/\/\/.*\n/g,""),i=r.replace(/\/\*[.\s\S]*\*\//g,""),a=i.replace(/\n/gm," ").replace(/ {2}/g," ");return n.test(a)}catch(t){return!1}},a=function(t){try{return!i(t)&&(o.call(t),!0)}catch(t){return!1}},s=Object.prototype.toString,c="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag;e.exports=function(t){if(!t)return!1;if("function"!=typeof t&&"object"!=typeof t)return!1;if(c)return a(t);if(i(t))return!1;var e=s.call(t);return"[object Function]"===e||"[object GeneratorFunction]"===e}},{}],27:[function(t,e,r){"use strict";var o=Date.prototype.getDay,n=function(t){try{return o.call(t),!0}catch(t){return!1}},i=Object.prototype.toString,a="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag;e.exports=function(t){return"object"==typeof t&&null!==t&&(a?n(t):"[object Date]"===i.call(t))}},{}],28:[function(t,e,r){"use strict";var o=t("has"),n=RegExp.prototype.exec,i=Object.getOwnPropertyDescriptor,a=function(t){try{var e=t.lastIndex;return t.lastIndex=0,n.call(t),!0}catch(t){return!1}finally{t.lastIndex=e}},s=Object.prototype.toString,c="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag;e.exports=function(t){if(!t||"object"!=typeof t)return!1;if(!c)return"[object RegExp]"===s.call(t);var e=i(t,"lastIndex");return!(!e||!o(e,"value"))&&a(t)}},{has:25}],29:[function(t,e,r){"use strict";var o=Object.prototype.toString;if("function"==typeof Symbol&&"symbol"==typeof Symbol()){var n=Symbol.prototype.toString,i=/^Symbol\(.*\)$/,a=function(t){return"symbol"==typeof t.valueOf()&&i.test(n.call(t))};e.exports=function(t){if("symbol"==typeof t)return!0;if("[object Symbol]"!==o.call(t))return!1;try{return a(t)}catch(t){return!1}}}else e.exports=function(t){return!1}},{}],30:[function(t,e,r){"use strict";function o(t){!h&&p.createRange&&(h=p.createRange(),h.selectNode(p.body));var e;return h&&h.createContextualFragment?e=h.createContextualFragment(t):(e=p.createElement("body"),e.innerHTML=t),e.childNodes[0]}function n(t,e){var r=t.nodeName,o=e.nodeName;return r===o||!!(e.actualize&&r.charCodeAt(0)<91&&o.charCodeAt(0)>90)&&r===o.toUpperCase()}function i(t,e){return e&&e!==f?p.createElementNS(e,t):p.createElement(t)}function a(t,e){for(var r=t.firstChild;r;){var o=r.nextSibling;e.appendChild(r),r=o}return e}function s(t,e){var r,o,n,i,a,s=e.attributes;for(r=s.length-1;r>=0;--r)o=s[r],n=o.name,i=o.namespaceURI,a=o.value,i?(n=o.localName||n,t.getAttributeNS(i,n)!==a&&t.setAttributeNS(i,n,a)):t.getAttribute(n)!==a&&t.setAttribute(n,a);for(s=t.attributes,r=s.length-1;r>=0;--r)o=s[r],!1!==o.specified&&(n=o.name,i=o.namespaceURI,i?(n=o.localName||n,y(e,i,n)||t.removeAttributeNS(i,n)):y(e,null,n)||t.removeAttribute(n))}function c(t,e,r){t[r]!==e[r]&&(t[r]=e[r],t[r]?t.setAttribute(r,""):t.removeAttribute(r,""))}function u(){}function l(t){return t.id}var h,d,f="http://www.w3.org/1999/xhtml",p="undefined"==typeof document?void 0:document,m=p?p.body||p.createElement("div"):{};d=m.hasAttributeNS?function(t,e,r){return t.hasAttributeNS(e,r)}:m.hasAttribute?function(t,e,r){return t.hasAttribute(r)}:function(t,e,r){return null!=t.getAttributeNode(e,r)};var y=d,v={OPTION:function(t,e){c(t,e,"selected")},INPUT:function(t,e){c(t,e,"checked"),c(t,e,"disabled"),t.value!==e.value&&(t.value=e.value),y(e,null,"value")||t.removeAttribute("value")},TEXTAREA:function(t,e){var r=e.value;t.value!==r&&(t.value=r);var o=t.firstChild;if(o){var n=o.nodeValue;if(n==r||!r&&n==t.placeholder)return;o.nodeValue=r}},SELECT:function(t,e){if(!y(e,null,"multiple")){for(var r=0,o=e.firstChild;o;){var n=o.nodeName;if(n&&"OPTION"===n.toUpperCase()){if(y(o,null,"selected")){r;break}r++}o=o.nextSibling}t.selectedIndex=r}}},g=1,b=3,w=8,x=function(t){return function(e,r,s){function c(t){E?E.push(t):E=[t]}function h(t,e){if(t.nodeType===g)for(var r=t.firstChild;r;){var o=void 0;e&&(o=P(r))?c(o):(_(r),r.firstChild&&h(r,e)),r=r.nextSibling}}function d(t,e,r){!1!==O(t)&&(e&&e.removeChild(t),_(t),h(t,r))}function f(t){if(t.nodeType===g)for(var e=t.firstChild;e;){var r=P(e);r&&(A[r]=e),f(e),e=e.nextSibling}}function m(t){S(t);for(var e=t.firstChild;e;){var r=e.nextSibling,o=P(e);if(o){var i=A[o];i&&n(e,i)&&(e.parentNode.replaceChild(i,e),y(i,e))}m(e),e=r}}function y(o,i,a){var s,u=P(i);if(u&&delete A[u],!r.isSameNode||!r.isSameNode(e)){if(!a){if(!1===T(o,i))return;if(t(o,i),N(o),!1===D(o,i))return}if("TEXTAREA"!==o.nodeName){var l,h,f,x,E=i.firstChild,S=o.firstChild;t:for(;E;){for(f=E.nextSibling,l=P(E);S;){if(h=S.nextSibling,E.isSameNode&&E.isSameNode(S)){E=f,S=h;continue t}s=P(S);var O=S.nodeType,_=void 0;if(O===E.nodeType&&(O===g?(l?l!==s&&((x=A[l])?S.nextSibling===x?_=!1:(o.insertBefore(x,S),h=S.nextSibling,s?c(s):d(S,o,!0),S=x):_=!1):s&&(_=!1),(_=!1!==_&&n(S,E))&&y(S,E)):O!==b&&O!=w||(_=!0,S.nodeValue!==E.nodeValue&&(S.nodeValue=E.nodeValue))),_){E=f,S=h;continue t}s?c(s):d(S,o,!0),S=h}if(l&&(x=A[l])&&n(x,E))o.appendChild(x),y(x,E);else{var j=I(E);!1!==j&&(j&&(E=j),E.actualize&&(E=E.actualize(o.ownerDocument||p)),o.appendChild(E),m(E))}E=f,S=h}for(;S;)h=S.nextSibling,(s=P(S))?c(s):d(S,o,!0),S=h}var k=v[o.nodeName];k&&k(o,i)}}if(s||(s={}),"string"==typeof r)if("#document"===e.nodeName||"HTML"===e.nodeName){var x=r;r=p.createElement("html"),r.innerHTML=x}else r=o(r);var E,P=s.getNodeKey||l,I=s.onBeforeNodeAdded||u,S=s.onNodeAdded||u,T=s.onBeforeElUpdated||u,N=s.onElUpdated||u,O=s.onBeforeNodeDiscarded||u,_=s.onNodeDiscarded||u,D=s.onBeforeElChildrenUpdated||u,j=!0===s.childrenOnly,A={};f(e);var k=e,C=k.nodeType,B=r.nodeType;if(!j)if(C===g)B===g?n(e,r)||(_(e),k=a(e,i(r.nodeName,r.namespaceURI))):k=r;else if(C===b||C===w){if(B===C)return k.nodeValue!==r.nodeValue&&(k.nodeValue=r.nodeValue),k;k=r}if(k===r)_(e);else if(y(k,r,j),E)for(var G=0,M=E.length;G<M;G++){var L=A[E[G]];L&&d(L,L.parentNode,!1)}return!j&&k!==e&&e.parentNode&&(k.actualize&&(k=k.actualize(e.ownerDocument||p)),e.parentNode.replaceChild(k,e)),k}}(s);e.exports=x},{}],31:[function(t,e,r){"use strict";var o=Object.prototype.hasOwnProperty,n=Object.prototype.toString,i=Array.prototype.slice,a=t("./isArguments"),s=Object.prototype.propertyIsEnumerable,c=!s.call({toString:null},"toString"),u=s.call(function(){},"prototype"),l=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],h=function(t){var e=t.constructor;return e&&e.prototype===t},d={$console:!0,$external:!0,$frame:!0,$frameElement:!0,$frames:!0,$innerHeight:!0,$innerWidth:!0,$outerHeight:!0,$outerWidth:!0,$pageXOffset:!0,$pageYOffset:!0,$parent:!0,$scrollLeft:!0,$scrollTop:!0,$scrollX:!0,$scrollY:!0,$self:!0,$webkitIndexedDB:!0,$webkitStorageInfo:!0,$window:!0},f=function(){if("undefined"==typeof window)return!1;for(var t in window)try{if(!d["$"+t]&&o.call(window,t)&&null!==window[t]&&"object"==typeof window[t])try{h(window[t])}catch(t){return!0}}catch(t){return!0}return!1}(),p=function(t){if("undefined"==typeof window||!f)return h(t);try{return h(t)}catch(t){return!1}},m=function(t){var e=null!==t&&"object"==typeof t,r="[object Function]"===n.call(t),i=a(t),s=e&&"[object String]"===n.call(t),h=[];if(!e&&!r&&!i)throw new TypeError("Object.keys called on a non-object");var d=u&&r;if(s&&t.length>0&&!o.call(t,0))for(var f=0;f<t.length;++f)h.push(String(f));if(i&&t.length>0)for(var m=0;m<t.length;++m)h.push(String(m));else for(var y in t)d&&"prototype"===y||!o.call(t,y)||h.push(String(y));if(c)for(var v=p(t),g=0;g<l.length;++g)v&&"constructor"===l[g]||!o.call(t,l[g])||h.push(l[g]);return h};m.shim=function(){if(Object.keys){if(!function(){return 2===(Object.keys(arguments)||"").length}(1,2)){var t=Object.keys;Object.keys=function(e){return t(a(e)?i.call(e):e)}}}else Object.keys=m;return Object.keys||m},e.exports=m},{"./isArguments":32}],32:[function(t,e,r){"use strict";var o=Object.prototype.toString;e.exports=function(t){var e=o.call(t),r="[object Arguments]"===e;return r||(r="[object Array]"!==e&&null!==t&&"object"==typeof t&&"number"==typeof t.length&&t.length>=0&&"[object Function]"===o.call(t.callee)),r}},{}],33:[function(t,e,r){function o(){throw new Error("setTimeout has not been defined")}function n(){throw new Error("clearTimeout has not been defined")}function i(t){if(h===setTimeout)return setTimeout(t,0);if((h===o||!h)&&setTimeout)return h=setTimeout,setTimeout(t,0);try{return h(t,0)}catch(e){try{return h.call(null,t,0)}catch(e){return h.call(this,t,0)}}}function a(t){if(d===clearTimeout)return clearTimeout(t);if((d===n||!d)&&clearTimeout)return d=clearTimeout,clearTimeout(t);try{return d(t)}catch(e){try{return d.call(null,t)}catch(e){return d.call(this,t)}}}function s(){y&&p&&(y=!1,p.length?m=p.concat(m):v=-1,m.length&&c())}function c(){if(!y){var t=i(s);y=!0;for(var e=m.length;e;){for(p=m,m=[];++v<e;)p&&p[v].run();v=-1,e=m.length}p=null,y=!1,a(t)}}function u(t,e){this.fun=t,this.array=e}function l(){}var h,d,f=e.exports={};!function(){try{h="function"==typeof setTimeout?setTimeout:o}catch(t){h=o}try{d="function"==typeof clearTimeout?clearTimeout:n}catch(t){d=n}}();var p,m=[],y=!1,v=-1;f.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];m.push(new u(t,e)),1!==m.length||y||i(c)},u.prototype.run=function(){this.fun.apply(null,this.array)},f.title="browser",f.browser=!0,f.env={},f.argv=[],f.version="",f.versions={},f.on=l,f.addListener=l,f.once=l,f.off=l,f.removeListener=l,f.removeAllListeners=l,f.emit=l,f.prependListener=l,f.prependOnceListener=l,f.listeners=function(t){return[]},f.binding=function(t){throw new Error("process.binding is not supported")},f.cwd=function(){return"/"},f.chdir=function(t){throw new Error("process.chdir is not supported")},f.umask=function(){return 0}},{}],34:[function(t,e,r){(function(e,o){function n(t,e){this._id=t,this._clearFn=e}var i=t("process/browser.js").nextTick,a=Function.prototype.apply,s=Array.prototype.slice,c={},u=0;r.setTimeout=function(){return new n(a.call(setTimeout,window,arguments),clearTimeout)},r.setInterval=function(){return new n(a.call(setInterval,window,arguments),clearInterval)},r.clearTimeout=r.clearInterval=function(t){t.close()},n.prototype.unref=n.prototype.ref=function(){},n.prototype.close=function(){this._clearFn.call(window,this._id)},r.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},r.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},r._unrefActive=r.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},r.setImmediate="function"==typeof e?e:function(t){var e=u++,o=!(arguments.length<2)&&s.call(arguments,1);return c[e]=!0,i(function(){c[e]&&(o?t.apply(null,o):t.call(null),r.clearImmediate(e))}),e},r.clearImmediate="function"==typeof o?o:function(t){delete c[t]}}).call(this,t("timers").setImmediate,t("timers").clearImmediate)},{"process/browser.js":33,timers:34}],35:[function(t,e,r){"use strict";function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(r,"__esModule",{value:!0});var a=function(){function t(t,e){for(var r=0;r<e.length;r++){var o=e[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,r,o){return r&&t(e.prototype,r),o&&t(e,o),e}}(),s=t("a-template"),c=function(t){return t&&t.__esModule?t:{default:t}}(s);t("custom-event-polyfill");var u='<div class="\\{classNames.smartPhoto\\}"\x3c!-- BEGIN hide:exist --\x3e aria-hidden="true"\x3c!-- END hide:exist --\x3e\x3c!-- BEGIN hide:empty --\x3e aria-hidden="false"\x3c!-- END hide:empty --\x3e role="dialog">\n\t<div class="\\{classNames.smartPhotoBody\\}">\n\t\t<div class="\\{classNames.smartPhotoInner\\}">\n\t\t\t   <div class="\\{classNames.smartPhotoHeader\\}">\n\t\t\t\t\t<span class="\\{classNames.smartPhotoCount\\}">{currentIndex}[increment]/{total}</span>\n\t\t\t\t\t<span class="\\{classNames.smartPhotoCaption\\}" aria-live="polite" tabindex="-1">\x3c!-- BEGIN groupItems:loop --\x3e\x3c!-- \\BEGIN currentIndex:touch#{index} --\x3e{caption}\x3c!-- \\END currentIndex:touch#{index} --\x3e\x3c!-- END groupItems:loop --\x3e</span>\n\t\t\t\t\t<button class="\\{classNames.smartPhotoDismiss\\}" data-action-click="hidePhoto()"><span class="smartphoto-sr-only">\\{message.closeDialog\\}</span></button>\n\t\t\t\t</div>\n\t\t\t\t<div class="\\{classNames.smartPhotoContent\\}"\x3c!-- BEGIN isSmartPhone:exist --\x3e data-action-touchstart="beforeDrag" data-action-touchmove="onDrag" data-action-touchend="afterDrag(false)"\x3c!-- END isSmartPhone:exist --\x3e\x3c!-- BEGIN isSmartPhone:empty --\x3e data-action-click="hidePhoto()"\x3c!-- END isSmartPhone:empty --\x3e>\n\t\t\t\t</div>\n\t\t\t\t<ul style="transform:translate({translateX}px,{translateY}px);" class="\\{classNames.smartPhotoList\\}\x3c!-- BEGIN onMoveClass:exist --\x3e \\{classNames.smartPhotoListOnMove\\}\x3c!-- END onMoveClass:exist --\x3e">\n\t\t\t\t\t\x3c!-- BEGIN groupItems:loop --\x3e\n\t\t\t\t\t<li style="transform:translate({translateX}px,{translateY}px);" class="\x3c!-- \\BEGIN currentIndex:touch#{index} --\x3ecurrent\x3c!-- \\END currentIndex:touch#{index} --\x3e">\n\t\t\t\t\t\t\x3c!-- BEGIN processed:exist --\x3e\n\t\t\t\t\t\t<div style="transform:translate({x}px,{y}px) scale({scale});" class="\\\\{classNames.smartPhotoImgWrap\\\\}"\x3c!-- \\BEGIN isSmartPhone:empty --\x3e data-action-mousemove="onDrag" data-action-mousedown="beforeDrag" data-action-mouseup="afterDrag"\x3c!-- \\END isSmartPhone:empty --\x3e\x3c!-- \\BEGIN isSmartPhone:exist --\x3e data-action-touchstart="beforeDrag" data-action-touchmove="onDrag" data-action-touchend="afterDrag"\x3c!-- \\END isSmartPhone:exist --\x3e>\n\t\t\t\t\t\t\t<img style="\x3c!-- \\BEGIN currentIndex:touch#{index} --\x3etransform:translate(\\{photoPosX\\}[virtualPos]px,\\{photoPosY\\}[virtualPos]px) scale(\\{scaleSize\\});\x3c!-- \\END currentIndex:touch#{index} --\x3ewidth:{width}px;" src="{src}" class="\\\\{classNames.smartPhotoImg\\\\}\x3c!-- \\BEGIN scale:exist --\x3e  \\\\{classNames.smartPhotoImgOnMove\\\\}\x3c!-- \\END scale:exist --\x3e\x3c!-- \\BEGIN elastic:exist --\x3e \\\\{classNames.smartPhotoImgElasticMove\\\\}\x3c!-- \\END elastic:exist --\x3e\x3c!-- \\BEGIN appear:exist --\x3e active\x3c!-- \\END appear:exist --\x3e" ondragstart="return false;">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\x3c!-- END processed:exist --\x3e\n\t\t\t\t\t\t\x3c!-- BEGIN processed:empty --\x3e\n\t\t\t\t\t\t<div class="\\\\{classNames.smartPhotoLoaderWrap\\\\}">\n\t\t\t\t\t\t\t<span class="\\\\{classNames.smartPhotoLoader\\\\}"></span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\x3c!-- END processed:empty --\x3e\n\t\t\t\t\t</li>\n\t\t\t\t\t\x3c!-- END groupItems:loop --\x3e\n\t\t\t\t</ul>\n\t\t\t\t\x3c!-- BEGIN arrows:exist --\x3e\n\t\t\t\t<ul class="\\{classNames.smartPhotoArrows\\}"\x3c!-- BEGIN hideUi:exist --\x3e aria-hidden="true"\x3c!-- END hideUi:exist --\x3e\x3c!-- BEGIN hideUi:exist --\x3e aria-hidden="false"\x3c!-- END hideUi:exist --\x3e>\n\t\t\t\t\t<li class="\\{classNames.smartPhotoArrowLeft\\}"\x3c!-- BEGIN showPrevArrow:empty --\x3e aria-hidden="true"\x3c!-- END showPrevArrow:empty --\x3e><a href="#" data-action-click="gotoSlide({prev})" role="button"><span class="smartphoto-sr-only">\\{message.gotoPrevImage\\}</span></a></li>\n\t\t\t\t\t<li class="\\{classNames.smartPhotoArrowRight\\}"\x3c!-- BEGIN showNextArrow:empty --\x3e aria-hidden="true"\x3c!-- END showNextArrow:empty --\x3e><a href="#" data-action-click="gotoSlide({next})" role="button"><span class="smartphoto-sr-only">\\{message.gotoNextImage\\}</span></a></li>\n\t\t\t\t</ul>\n\t\t\t\t\x3c!-- END arrows:exist --\x3e\n\t\t\t\t\x3c!-- BEGIN nav:exist --\x3e\n\t\t\t\t<nav class="\\{classNames.smartPhotoNav\\}"\x3c!-- BEGIN hideUi:exist --\x3e aria-hidden="true"\x3c!-- END hideUi:exist --\x3e\x3c!-- BEGIN hideUi:exist --\x3e aria-hidden="false"\x3c!-- END hideUi:exist --\x3e>\n\t\t\t\t\t<ul>\n\t\t\t\t\t\t\x3c!-- BEGIN groupItems:loop --\x3e\n\t\t\t\t\t\t<li><a href="#" data-action-click="gotoSlide({index})" class="\x3c!-- \\BEGIN currentIndex:touch#{index} --\x3ecurrent\x3c!-- \\END currentIndex:touch#{index} --\x3e" style="background-image:url({thumb});" role="button"><span class="smartphoto-sr-only">go to {caption}</span></a></li>\n\t\t\t\t\t\t\x3c!-- END groupItems:loop --\x3e\n\t\t\t\t\t</ul>\n\t\t\t\t</nav>\n\t\t\t\t\x3c!-- END nav:exist --\x3e\n\t\t</div>\n\t\t\x3c!-- BEGIN appearEffect:exist --\x3e\n\t\t<img src=\\{appearEffect.img\\}\n\t\tclass="\\{classNames.smartPhotoImgClone\\}"\n\t\tstyle="width:\\{appearEffect.width\\}px;height:\\{appearEffect.height\\}px;transform:translate(\\{appearEffect.left\\}px,\\{appearEffect.top\\}px) scale(1)" />\n\t\t\x3c!-- END appearEffect:exist --\x3e\n\t</div>\n</div>\n',l=t("../lib/util"),h=t("es6-promise-polyfill").Promise,d={classNames:{smartPhoto:"smartphoto",smartPhotoClose:"smartphoto-close",smartPhotoBody:"smartphoto-body",smartPhotoInner:"smartphoto-inner",smartPhotoContent:"smartphoto-content",smartPhotoImg:"smartphoto-img",smartPhotoImgOnMove:"smartphoto-img-onmove",smartPhotoImgElasticMove:"smartphoto-img-elasticmove",smartPhotoImgWrap:"smartphoto-img-wrap",smartPhotoArrows:"smartphoto-arrows",smartPhotoNav:"smartphoto-nav",smartPhotoArrowRight:"smartphoto-arrow-right",smartPhotoArrowLeft:"smartphoto-arrow-left",smartPhotoImgLeft:"smartphoto-img-left",smartPhotoImgRight:"smartphoto-img-right",smartPhotoList:"smartphoto-list",smartPhotoListOnMove:"smartphoto-list-onmove",smartPhotoHeader:"smartphoto-header",smartPhotoCount:"smartphoto-count",smartPhotoCaption:"smartphoto-caption",smartPhotoDismiss:"smartphoto-dismiss",smartPhotoLoader:"smartphoto-loader",smartPhotoLoaderWrap:"smartphoto-loader-wrap",smartPhotoImgClone:"smartphoto-img-clone"},message:{gotoNextImage:"go to the next image",gotoPrevImage:"go to the previous image",closeDialog:"close the image dialog"},arrows:!0,nav:!0,showAnimation:!0,verticalGravity:!1,useOrientationApi:!1,useHistoryApi:!0,swipeTopToClose:!1,swipeBottomToClose:!0,swipeOffset:100,headerHeight:60,footerHeight:60,forceInterval:10,registance:.5,loadOffset:2,resizeStyle:"fit"},f=function(t){function e(t,r){o(this,e);var i=n(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));i.data=l.extend({},d,r),i.data.currentIndex=0,i.data.oldIndex=0,i.data.hide=!0,i.data.group={},i.data.scaleSize=1,i.data.scale=!1,i.pos={x:0,y:0},i.data.photoPosX=0,i.data.photoPosY=0,i.convert={increment:i.increment,virtualPos:i.virtualPos},i.data.groupItems=i.groupItems,i.elements="string"==typeof t?document.querySelectorAll(t):t;var a=new Date;i.tapSecond=a.getTime(),i.onListMove=!1,i.clicked=!1,i.id=i._getUniqId(),i.vx=0,i.vy=0,i.data.appearEffect=null,i.addTemplate(i.id,u),i.data.isSmartPhone=i._isSmartPhone();var s=document.querySelector("body");l.append(s,"<div data-id='"+i.id+"'></div>"),[].forEach.call(i.elements,function(t){i.addNewItem(t)}),i.update();var c=i._getCurrentItemByHash();return c&&l.triggerEvent(c.element,"click"),setInterval(function(){i._doAnim()},i.data.forceInterval),i.data.isSmartPhone?(window.addEventListener("orientationchange",function(){i.groupItems()&&(i._resetTranslate(),i._setPosByCurrentIndex(),i._setHashByCurrentIndex(),i._setSizeByScreen(),i.update())}),i.data.useOrientationApi?(window.addEventListener("deviceorientation",function(t){var e=window.orientation;t&&t.gamma&&!i.data.appearEffect&&(i.isBeingZoomed||i.photoSwipable||i.data.elastic||!i.data.scale||(0===e?i._calcGravity(t.gamma,t.beta):90===e?i._calcGravity(t.beta,t.gamma):-90===e?i._calcGravity(-t.beta,-t.gamma):180===e&&i._calcGravity(-t.gamma,-t.beta)))}),i):n(i)):(window.addEventListener("resize",function(){i.groupItems()&&(i._resetTranslate(),i._setPosByCurrentIndex(),i._setSizeByScreen(),i.update())}),window.addEventListener("keydown",function(t){var e=t.keyCode||t.which;!0!==i.data.hide&&(37===e?i.gotoSlide(i.data.prev):39===e?i.gotoSlide(i.data.next):27===e&&i.hidePhoto())}),n(i))}return i(e,t),a(e,[{key:"on",value:function(t,e){var r=this;this._getElementByClass(this.data.classNames.smartPhoto).addEventListener(t,function(t){e.call(r,t)})}},{key:"increment",value:function(t){return t+1}},{key:"virtualPos",value:function(t){return(t=parseInt(t,10))/this._getSelectedItem().scale/this.data.scaleSize}},{key:"groupItems",value:function(){return this.data.group[this.data.currentGroup]}},{key:"_resetTranslate",value:function(){var t=this;this.groupItems().forEach(function(e,r){e.translateX=t._getWindowWidth()*r})}},{key:"addNewItem",value:function(t){var e=this,r=t.getAttribute("data-group")||"nogroup",o=this.data.group;"nogroup"===r&&t.setAttribute("data-group","nogroup"),o[r]||(o[r]=[]);var n=o[r].length,i=document.querySelector("body"),a=t.getAttribute("href"),s=t.querySelector("img"),c=a;s&&(c=s.src);var u={src:a,thumb:c,caption:t.getAttribute("data-caption"),groupId:r,translateX:this._getWindowWidth()*n,index:n,translateY:0,width:50,height:50,id:t.getAttribute("data-id")||n,loaded:!1,processed:!1,element:t};o[r].push(u),this.data.currentGroup=r,t.getAttribute("data-id")||t.setAttribute("data-id",n),t.setAttribute("data-index",n),t.addEventListener("click",function(r){r.preventDefault(),e.data.currentGroup=t.getAttribute("data-group"),e.data.currentIndex=parseInt(t.getAttribute("data-index"),10),e._setHashByCurrentIndex();var o=e._getSelectedItem();o.loaded?(e._initPhoto(),e.addAppearEffect(t,o),e.clicked=!0,e.update(),i.style.overflow="hidden",e._fireEvent("open")):e._loadItem(o).then(function(){e._initPhoto(),e.addAppearEffect(t,o),e.clicked=!0,e.update(),i.style.overflow="hidden",e._fireEvent("open")})})}},{key:"_initPhoto",value:function(){this.data.total=this.groupItems().length,this.data.hide=!1,this.data.photoPosX=0,this.data.photoPosY=0,this._setPosByCurrentIndex(),this._setSizeByScreen(),this.setArrow(),"fill"===this.data.resizeStyle&&this.data.isSmartPhone&&(this.data.scale=!0,this.data.hideUi=!0,this.data.scaleSize=this._getScaleBoarder())}},{key:"onUpdated",value:function(){var t=this;if(this.data.appearEffect&&this.data.appearEffect.once&&(this.data.appearEffect.once=!1,this.execEffect().then(function(){t.data.appearEffect=null,t.data.appear=!0,t.update()})),this.clicked){this.clicked=!1;var e=this.data.classNames;this._getElementByClass(e.smartPhotoCaption).focus()}}},{key:"execEffect",value:function(){var t=this;return new h(function(e){l.isOldIE()&&e();var r=t.data.appearEffect,o=t.data.classNames,n=t._getElementByClass(o.smartPhotoImgClone),i=function t(){n.removeEventListener("transitionend",t,!0),e()};n.addEventListener("transitionend",i,!0),setTimeout(function(){n.style.transform="translate("+r.afterX+"px, "+r.afterY+"px) scale("+r.scale+")"},10)})}},{key:"addAppearEffect",value:function(t,e){if(!1===this.data.showAnimation)return void(this.data.appear=!0);var r=t.querySelector("img"),o=l.getViewPos(r),n={},i=1;n.width=r.offsetWidth,n.height=r.offsetHeight,n.top=o.top,n.left=o.left,n.once=!0,n.img=r.getAttribute("src");var a=this._getWindowWidth(),s=this._getWindowHeight(),c=s-this.data.headerHeight-this.data.footerHeight;"fill"===this.data.resizeStyle&&this.data.isSmartPhone?i=r.offsetWidth>r.offsetHeight?s/r.offsetHeight:a/r.offsetWidth:(n.width>=n.height?i=e.height<c?e.width/n.width:c/n.height:n.height>n.width&&(i=e.height<c?e.height/n.height:c/n.height),n.width*i>a&&(i=a/n.width));var u=(i-1)/2*r.offsetWidth+(a-r.offsetWidth*i)/2,h=(i-1)/2*r.offsetHeight+(s-r.offsetHeight*i)/2;n.afterX=u,n.afterY=h,n.scale=i,this.data.appearEffect=n}},{key:"hidePhoto",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"bottom";this.data.hide=!0,this.data.appear=!1,this.data.appearEffect=null,this.data.hideUi=!1,this.data.scale=!1,this.data.scaleSize=1;var r=void 0!==window.pageXOffset?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,o=void 0!==window.pageYOffset?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop,n=document.querySelector("body");location.hash&&this._setHash(""),window.scroll(r,o),this._doHideEffect(e).then(function(){t.update(),n.style.overflow="",t._fireEvent("close")})}},{key:"_doHideEffect",value:function(t){var e=this;return new h(function(r){l.isOldIE()&&r();var o=e.data.classNames,n=e._getElementByClass(o.smartPhoto),i=e._getElementByQuery(".current ."+o.smartPhotoImg),a=e._getWindowHeight(),s=function t(){n.removeEventListener("transitionend",t,!0),r()};n.style.opacity=0,"bottom"===t?i.style.transform="translateY("+a+"px)":"top"===t&&(i.style.transform="translateY(-"+a+"px)"),n.addEventListener("transitionend",s,!0)})}},{key:"_getElementByClass",value:function(t){return document.querySelector('[data-id="'+this.id+'"] .'+t)}},{key:"_getElementByQuery",value:function(t){return document.querySelector('[data-id="'+this.id+'"] '+t)}},{key:"_getTouchPos",value:function(){var t=0,e=0,r="undefined"==typeof event?this.e:event;return this._isTouched(r)?(t=r.touches[0].pageX,e=r.touches[0].pageY):r.pageX&&(t=r.pageX,e=r.pageY),{x:t,y:e}}},{key:"_getGesturePos",value:function(t){var e=t.touches;return[{x:e[0].pageX,y:e[0].pageY},{x:e[1].pageX,y:e[1].pageY}]}},{key:"_setPosByCurrentIndex",value:function(){var t=this,e=this.groupItems(),r=-1*e[this.data.currentIndex].translateX;this.pos.x=r,setTimeout(function(){t.data.translateX=r,t.data.translateY=0,t._listUpdate()},1)}},{key:"_setHashByCurrentIndex",value:function(){var t=void 0!==window.pageXOffset?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,e=void 0!==window.pageYOffset?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop,r=this.groupItems(),o=r[this.data.currentIndex].id,n=this.data.currentGroup,i="group="+n+"&photo="+o;this._setHash(i),window.scroll(t,e)}},{key:"_setHash",value:function(t){window.history&&window.history.pushState&&this.data.useHistoryApi&&(t?window.history.replaceState(null,null,""+location.pathname+location.search+"#"+t):window.history.replaceState(null,null,""+location.pathname+location.search))}},{key:"_getCurrentItemByHash",value:function(){var t=this.data.group,e=location.hash.substr(1),r=l.parseQuery(e),o=null,n=function(t){r.group===t.groupId&&r.photo===t.id&&(o=t)};return Object.keys(t).forEach(function(e){t[e].forEach(n)}),o}},{key:"_loadItem",value:function(t){return new h(function(e){var r=new Image;r.onload=function(){t.width=r.width,t.height=r.height,t.loaded=!0,e()},r.onerror=function(){e()},r.src=t.src})}},{key:"_getItemByIndex",value:function(t){var e=this.data;return e.group[e.currentGroup][t]?e.group[e.currentGroup][t]:null}},{key:"_loadNeighborItems",value:function(){for(var t=this,e=this.data.currentIndex,r=this.data.loadOffset,o=e-r,n=e+r,i=[],a=o;a<n;a++){var s=this._getItemByIndex(a);s&&!s.loaded&&i.push(this._loadItem(s))}i.length&&h.all(i).then(function(){t._initPhoto(),t.update()})}},{key:"_setSizeByScreen",value:function(){var t=this._getWindowWidth(),e=this._getWindowHeight(),r=this.data.headerHeight,o=this.data.footerHeight,n=e-(r+o);this.groupItems().forEach(function(r){r.loaded&&(r.processed=!0,r.scale=n/r.height,r.height<n&&(r.scale=1),r.x=(r.scale-1)/2*r.width+(t-r.width*r.scale)/2,r.y=(r.scale-1)/2*r.height+(e-r.height*r.scale)/2,r.width*r.scale>t&&(r.scale=t/r.width,r.x=(r.scale-1)/2*r.width))})}},{key:"_slideList",value:function(){var t=this;this.data.scaleSize=1,this.isBeingZoomed=!1,this.data.hideUi=!1,this.data.scale=!1,this.data.photoPosX=0,this.data.photoPosY=0,this.data.onMoveClass=!0,this._setPosByCurrentIndex(),this._setHashByCurrentIndex(),this._setSizeByScreen(),setTimeout(function(){var e=t._getSelectedItem();t.data.onMoveClass=!1,t.setArrow(),t.update(),t.data.oldIndex!==t.data.currentIndex&&t._fireEvent("change"),t.data.oldIndex=t.data.currentIndex,t._loadNeighborItems(),e.loaded||t._loadItem(e).then(function(){t._initPhoto(),t.update()})},200)}},{key:"gotoSlide",value:function(t){this.e&&this.e.preventDefault&&this.e.preventDefault(),this.data.currentIndex=parseInt(t,10),this.data.currentIndex||(this.data.currentIndex=0),this._slideList()}},{key:"setArrow",value:function(){var t=this.groupItems(),e=t.length,r=this.data.currentIndex+1,o=this.data.currentIndex-1;this.data.showNextArrow=!1,this.data.showPrevArrow=!1,r!==e&&(this.data.next=r,this.data.showNextArrow=!0),-1!==o&&(this.data.prev=o,this.data.showPrevArrow=!0)}},{key:"beforeDrag",value:function(){if(this._isGestured(this.e))return void this.beforeGesture();if(this.isBeingZoomed=!1,this.data.scale)return void this.beforePhotoDrag();var t=this._getTouchPos();this.isSwipable=!0,this.dragStart=!0,this.firstPos=t,this.oldPos=t}},{key:"afterDrag",value:function(){var t=this.groupItems(),e=new Date,r=e.getTime(),o=this.tapSecond-r,n=0,i=0;return this.isSwipable=!1,this.onListMove=!1,this.oldPos&&(n=this.oldPos.x-this.firstPos.x,i=this.oldPos.y-this.firstPos.y),this.isBeingZoomed?void this.afterGesture():this.data.scale?void this.afterPhotoDrag():l.isSmartPhone()||0!==n||0!==i?Math.abs(o)<=500&&0===n&&0===i?(this.e.preventDefault(),void this.zoomPhoto()):(this.tapSecond=r,this._fireEvent("swipeend"),"horizontal"===this.moveDir&&(n>=this.data.swipeOffset&&0!==this.data.currentIndex?this.data.currentIndex-=1:n<=-this.data.swipeOffset&&this.data.currentIndex!==t.length-1&&(this.data.currentIndex+=1),this._slideList()),void("vertical"===this.moveDir&&(this.data.swipeBottomToClose&&i>=this.data.swipeOffset?this.hidePhoto("bottom"):this.data.swipeTopToClose&&i<=-this.data.swipeOffset?this.hidePhoto("top"):(this.data.translateY=0,this._slideList())))):void this.zoomPhoto()}},{key:"onDrag",value:function(){if(this.e.preventDefault(),this._isGestured(this.e)&&!1===this.onListMove)return void this.onGesture();if(!this.isBeingZoomed){if(this.data.scale)return void this.onPhotoDrag();if(this.isSwipable){var t=this._getTouchPos(),e=t.x-this.oldPos.x,r=t.y-this.firstPos.y;this.dragStart&&(this._fireEvent("swipestart"),this.dragStart=!1,Math.abs(e)>Math.abs(r)?this.moveDir="horizontal":this.moveDir="vertical"),"horizontal"===this.moveDir?(this.pos.x+=e,this.data.translateX=this.pos.x):this.data.translateY=r,this.onListMove=!0,this.oldPos=t,this._listUpdate()}}}},{key:"zoomPhoto",value:function(){var t=this
;this.data.hideUi=!0,this.data.scaleSize=this._getScaleBoarder(),this.data.scaleSize<=1||(this.data.photoPosX=0,this.data.photoPosY=0,this._photoUpdate(),setTimeout(function(){t.data.scale=!0,t._photoUpdate(),t._fireEvent("zoomin")},300))}},{key:"zoomOutPhoto",value:function(){this.data.scaleSize=1,this.isBeingZoomed=!1,this.data.hideUi=!1,this.data.scale=!1,this.data.photoPosX=0,this.data.photoPosY=0,this._photoUpdate(),this._fireEvent("zoomout")}},{key:"beforePhotoDrag",value:function(){var t=this._getTouchPos();this.photoSwipable=!0,this.data.photoPosX||(this.data.photoPosX=0),this.data.photoPosY||(this.data.photoPosY=0),this.oldPhotoPos=t,this.firstPhotoPos=t}},{key:"onPhotoDrag",value:function(){if(this.photoSwipable){this.e.preventDefault();var t=this._getTouchPos(),e=t.x-this.oldPhotoPos.x,r=t.y-this.oldPhotoPos.y,o=this._round(this.data.scaleSize*e,6),n=this._round(this.data.scaleSize*r,6);"number"==typeof o&&(this.data.photoPosX+=o,this.photoVX=o),"number"==typeof n&&(this.data.photoPosY+=n,this.photoVY=n),this.oldPhotoPos=t,this._photoUpdate()}}},{key:"afterPhotoDrag",value:function(){if(this.oldPhotoPos.x===this.firstPhotoPos.x&&this.photoSwipable)this.photoSwipable=!1,this.zoomOutPhoto();else{this.photoSwipable=!1;var t=this._getSelectedItem(),e=this._makeBound(t),r=this.data.swipeOffset*this.data.scaleSize,o=0,n=0;if(this.data.photoPosX>e.maxX?o=-1:this.data.photoPosX<e.minX&&(o=1),this.data.photoPosY>e.maxY?n=-1:this.data.photoPosY<e.minY&&(n=1),this.data.photoPosX-e.maxX>r&&0!==this.data.currentIndex)return void this.gotoSlide(this.data.prev);if(e.minX-this.data.photoPosX>r&&this.data.currentIndex+1!==this.data.total)return void this.gotoSlide(this.data.next);0===o&&0===n?(this.vx=this.photoVX/5,this.vy=this.photoVY/5):this._registerElasticForce(o,n)}}},{key:"beforeGesture",value:function(){this._fireEvent("gesturestart");var t=this._getGesturePos(this.e),e=this._getDistance(t[0],t[1]);this.isBeingZoomed=!0,this.oldDistance=e,this.data.scale=!0,this.e.preventDefault()}},{key:"onGesture",value:function(){var t=this._getGesturePos(this.e),e=this._getDistance(t[0],t[1]),r=(e-this.oldDistance)/100,o=this.data.scaleSize,n=this.data.photoPosX,i=this.data.photoPosY;this.isBeingZoomed=!0,this.data.scaleSize+=this._round(r,6),this.data.scaleSize<.2&&(this.data.scaleSize=.2),this.data.scaleSize<o&&(this.data.photoPosX=(1+this.data.scaleSize-o)*n,this.data.photoPosY=(1+this.data.scaleSize-o)*i),this.data.scaleSize<1||this.data.scaleSize>this._getScaleBoarder()?this.data.hideUi=!0:this.data.hideUi=!1,this.oldDistance=e,this.e.preventDefault(),this._photoUpdate()}},{key:"afterGesture",value:function(){this.data.scaleSize>this._getScaleBoarder()||(this.data.photoPosX=0,this.data.photoPosY=0,this.data.scale=!1,this.data.scaleSize=1,this.data.hideUi=!1,this._fireEvent("gestureend"),this._photoUpdate())}},{key:"_getForceAndTheta",value:function(t,e){return{force:Math.sqrt(t*t+e*e),theta:Math.atan2(e,t)}}},{key:"_getScaleBoarder",value:function(){var t=this._getSelectedItem(),e=this._getWindowWidth(),r=this._getWindowHeight();return l.isSmartPhone()?t.width>t.height?r/(t.height*t.scale):e/(t.width*t.scale):1/t.scale}},{key:"_makeBound",value:function(t){var e=t.width*t.scale*this.data.scaleSize,r=t.height*t.scale*this.data.scaleSize,o=void 0,n=void 0,i=void 0,a=void 0,s=this._getWindowWidth(),c=this._getWindowHeight();return s>e?(i=(s-e)/2,o=-1*i):(i=(e-s)/2,o=-1*i),c>r?(a=(c-r)/2,n=-1*a):(a=(r-c)/2,n=-1*a),{minX:this._round(o,6)*this.data.scaleSize,minY:this._round(n,6)*this.data.scaleSize,maxX:this._round(i,6)*this.data.scaleSize,maxY:this._round(a,6)*this.data.scaleSize}}},{key:"_registerElasticForce",value:function(t,e){var r=this,o=this._getSelectedItem(),n=this._makeBound(o);this.data.elastic=!0,1===t?this.data.photoPosX=n.minX:-1===t&&(this.data.photoPosX=n.maxX),1===e?this.data.photoPosY=n.minY:-1===e&&(this.data.photoPosY=n.maxY),this._photoUpdate(),setTimeout(function(){r.data.elastic=!1,r._photoUpdate()},300)}},{key:"_getSelectedItem",value:function(){var t=this.data,e=t.currentIndex;return t.group[t.currentGroup][e]}},{key:"_getUniqId",value:function(){return(Date.now().toString(36)+Math.random().toString(36).substr(2,5)).toUpperCase()}},{key:"_getDistance",value:function(t,e){var r=t.x-e.x,o=t.y-e.y;return Math.sqrt(r*r+o*o)}},{key:"_round",value:function(t,e){var r=Math.pow(10,e);return t*=r,t=Math.round(t),t/=r}},{key:"_isTouched",value:function(t){return!(!t||!t.touches)}},{key:"_isGestured",value:function(t){return!!(t&&t.touches&&t.touches.length>1)}},{key:"_isSmartPhone",value:function(){var t=navigator.userAgent;return t.indexOf("iPhone")>0||t.indexOf("iPad")>0||t.indexOf("ipod")>0||t.indexOf("Android")>0}},{key:"_calcGravity",value:function(t,e){(t>5||t<-5)&&(this.vx+=.05*t),!1!==this.data.verticalGravity&&(e>5||e<-5)&&(this.vy+=.05*e)}},{key:"_photoUpdate",value:function(){var t=this.data.classNames,e=this._getElementByQuery(".current"),r=e.querySelector("."+t.smartPhotoImg),o=this._getElementByQuery("."+t.smartPhotoNav),n=this._getElementByQuery("."+t.smartPhotoArrows),i=this.virtualPos(this.data.photoPosX),a=this.virtualPos(this.data.photoPosY),s=this.data.scaleSize,c="translate("+i+"px,"+a+"px) scale("+s+")";r.style.transform=c,this.data.scale?l.addClass(r,t.smartPhotoImgOnMove):l.removeClass(r,t.smartPhotoImgOnMove),this.data.elastic?l.addClass(r,t.smartPhotoImgElasticMove):l.removeClass(r,t.smartPhotoImgElasticMove),this.data.hideUi?(o&&o.setAttribute("aria-hidden","true"),n&&n.setAttribute("aria-hidden","true")):(o&&o.setAttribute("aria-hidden","false"),n&&n.setAttribute("aria-hidden","false"))}},{key:"_getWindowWidth",value:function(){return document&&document.documentElement?document.documentElement.clientWidth:window&&window.innerWidth?window.innerWidth:0}},{key:"_getWindowHeight",value:function(){return document&&document.documentElement?document.documentElement.clientHeight:window&&window.innerHeight?window.innerHeight:0}},{key:"_listUpdate",value:function(){var t=this.data.classNames,e=this._getElementByQuery("."+t.smartPhotoList),r="translate("+this.data.translateX+"px,"+this.data.translateY+"px)";e.style.transform=r,this.data.onMoveClass?l.addClass(e,t.smartPhotoListOnMove):l.removeClass(e,t.smartPhotoListOnMove)}},{key:"_fireEvent",value:function(t){var e=this._getElementByClass(this.data.classNames.smartPhoto);l.triggerEvent(e,t)}},{key:"_doAnim",value:function(){if(!(this.isBeingZoomed||this.isSwipable||this.photoSwipable||this.data.elastic)&&this.data.scale){this.data.photoPosX+=this.vx,this.data.photoPosY+=this.vy;var t=this._getSelectedItem(),e=this._makeBound(t);this.data.photoPosX<e.minX?(this.data.photoPosX=e.minX,this.vx*=-.2):this.data.photoPosX>e.maxX&&(this.data.photoPosX=e.maxX,this.vx*=-.2),this.data.photoPosY<e.minY?(this.data.photoPosY=e.minY,this.vy*=-.2):this.data.photoPosY>e.maxY&&(this.data.photoPosY=e.maxY,this.vy*=-.2);var r=this._getForceAndTheta(this.vx,this.vy),o=r.force,n=r.theta;o-=this.data.registance,Math.abs(o)<.5||(this.vx=Math.cos(n)*o,this.vy=Math.sin(n)*o,this._photoUpdate())}}}]),e}(c.default);r.default=f,e.exports=r.default},{"../lib/util":37,"a-template":1,"custom-event-polyfill":7,"es6-promise-polyfill":21}],36:[function(t,e,r){"use strict";e.exports=t("./core/")},{"./core/":35}],37:[function(t,e,r){"use strict";function o(t){t=t||{};for(var e=1;e<arguments.length;e++){var r=arguments[e];if(r)for(var i in r)r.hasOwnProperty(i)&&("object"===n(r[i])?t[i]=o(t[i],r[i]):t[i]=r[i])}return t}Object.defineProperty(r,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=(r.isSmartPhone=function(){var t=navigator.userAgent;return t.indexOf("iPhone")>0||t.indexOf("iPad")>0||t.indexOf("ipod")>0||t.indexOf("Android")>0},r.extend=o,r.triggerEvent=function(t,e,r){var o=void 0;window.CustomEvent?o=new CustomEvent(e,{cancelable:!0}):(o=document.createEvent("CustomEvent"),o.initCustomEvent(e,!1,!1,r)),t.dispatchEvent(o)},r.parseQuery=function(t){for(var e,r,o,n=t.split("&"),i={},a=0,s=n.length;a<s;a++)e=n[a].split("="),void 0!==e[0]&&(r=e[0],o=void 0!==e[1]?e.slice(1).join("="):r,i[r]=decodeURIComponent(o));return i},r.getViewPos=function(t){return{left:t.getBoundingClientRect().left,top:t.getBoundingClientRect().top}},r.removeElement=function(t){t&&t.parentNode&&t.parentNode.removeChild(t)},r.append=function(t,e){var r=document.createElement("div");for(r.innerHTML=e;r.children.length>0;)t.appendChild(r.children[0])},r.addClass=function(t,e){t.classList?t.classList.add(e):t.className+=" "+e},r.removeClass=function(t,e){t.classList?t.classList.remove(e):t.className=t.className.replace(new RegExp("(^|\\b)"+e.split(" ").join("|")+"(\\b|$)","gi")," ")},r.getBrowser=function(){var t=window.navigator.userAgent.toLowerCase(),e=window.navigator.appVersion.toLowerCase(),r="unknown";return-1!=t.indexOf("msie")?r=-1!=e.indexOf("msie 6.")?"ie6":-1!=e.indexOf("msie 7.")?"ie7":-1!=e.indexOf("msie 8.")?"ie8":-1!=e.indexOf("msie 9.")?"ie9":-1!=e.indexOf("msie 10.")?"ie10":"ie":-1!=t.indexOf("trident/7")?r="ie11":-1!=t.indexOf("chrome")?r="chrome":-1!=t.indexOf("safari")?r="safari":-1!=t.indexOf("opera")?r="opera":-1!=t.indexOf("firefox")&&(r="firefox"),r});r.isOldIE=function(){var t=i();return-1!==t.indexOf("ie")&&parseInt(t.replace(/[^0-9]/g,""))<=10}},{}]},{},[36])(36)});
semantic.dropdown = {};

// ready event
semantic.dropdown.ready = function() {


  $.fn.api.settings.mockResponse = function(settings) {
    var response = {
      first  : '<h3 class="ui header">AJAX Tab One</h3><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png">',
      second : '<h3 class="ui header">AJAX Tab Two</h3><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png">',
      third  : '<h3 class="ui header">AJAX Tab Three</h3><img class="ui wireframe image" src="/images/wireframe/paragraph.png"><img class="ui wireframe image" src="/images/wireframe/paragraph.png">'
    };
    return response[settings.urlData.tab];
  };

  $('.first.example .menu .item')
    .tab({
      context: '.first.example'
    })
  ;

  $('.history.example .menu .item')
    .tab({
      context : '.history.example',
      history : true,
      path    : '/modules/tab.html'
    })
  ;

  $('.paths.example .menu .item')
    .tab({
      context: '.paths.example'
    })
  ;

  $('.context.example #context1 .menu .item')
    .tab({
      context: $('.context.example #context1')
    })
  ;
  $('.context.example #context2 .menu .item')
    .tab({
      // special keyword works same as above
      context: 'parent'
    })
  ;

  $('.dynamic.example .menu .item')
    .tab({
      apiSettings: {
        loadingDuration: 300
      },
      cache   : false,
      context : 'parent',
      auto    : true,
      history : false,
      path    : '/'
    })
  ;

  $('.eval.example .menu .item')
    .tab({
      // faking api request
      apiSettings: {
        mockResponse    : function(settings) {
          var response = {
            first  : '<script>alert("JS Fired Once");</script>AJAX Tab One',
            second : '<script>alert("JS Fired Once");</script>AJAX Tab Two',
            third  : '<script>alert("JS Fired Once");</script>AJAX Tab Three'
          };
          return response[settings.urlData.tab];
        }
      },
      context : 'parent',
      auto    : true,
      path    : '/'
    })
  ;

};


// attach ready event
$(document)
  .ready(semantic.dropdown.ready)
;
/*
	A simple, lightweight jQuery plugin for creating sortable tables.
	https://github.com/kylefox/jquery-tablesort
	Version 0.0.11
*/

!function(t){t.tablesort=function(e,s){var i=this;this.$table=e,this.$thead=this.$table.find("thead"),this.settings=t.extend({},t.tablesort.defaults,s),this.$sortCells=this.$thead.length>0?this.$thead.find("th:not(.no-sort)"):this.$table.find("th:not(.no-sort)"),this.$sortCells.on("click.tablesort",function(){i.sort(t(this))}),this.index=null,this.$th=null,this.direction=null},t.tablesort.prototype={sort:function(e,s){var i=new Date,n=this,o=this.$table,l=o.find("tbody").length>0?o.find("tbody"):o,a=l.find("tr").has("td, th"),r=a.find(":nth-child("+(e.index()+1)+")").filter("td, th"),d=e.data().sortBy,h=[],c=r.map(function(s,i){return d?"function"==typeof d?d(t(e),t(i),n):d:null!=t(this).data().sortValue?t(this).data().sortValue:t(this).text()});0!==c.length&&(this.index!==e.index()?(this.direction="asc",this.index=e.index()):"asc"!==s&&"desc"!==s?this.direction="asc"===this.direction?"desc":"asc":this.direction=s,s="asc"==this.direction?1:-1,n.$table.trigger("tablesort:start",[n]),n.log("Sorting by "+this.index+" "+this.direction),n.$table.css("display"),setTimeout(function(){n.$sortCells.removeClass(n.settings.asc+" "+n.settings.desc);for(var o=0,d=c.length;o<d;o++)h.push({index:o,cell:r[o],row:a[o],value:c[o]});h.sort(function(t,e){return n.settings.compare(t.value,e.value)*s}),t.each(h,function(t,e){l.append(e.row)}),e.addClass(n.settings[n.direction]),n.log("Sort finished in "+((new Date).getTime()-i.getTime())+"ms"),n.$table.trigger("tablesort:complete",[n]),n.$table.css("display")},c.length>2e3?200:10))},log:function(e){(t.tablesort.DEBUG||this.settings.debug)&&console&&console.log&&console.log("[tablesort] "+e)},destroy:function(){return this.$sortCells.off("click.tablesort"),this.$table.data("tablesort",null),null}},t.tablesort.DEBUG=!1,t.tablesort.defaults={debug:t.tablesort.DEBUG,asc:"sorted ascending",desc:"sorted descending",compare:function(t,e){return t>e?1:t<e?-1:0}},t.fn.tablesort=function(e){var s,i;return this.each(function(){s=t(this),i=s.data("tablesort"),i&&i.destroy(),s.data("tablesort",new t.tablesort(s,e))})}}(window.Zepto||window.jQuery);
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){function n(n){function t(t,r,e,u,i,o){for(;i>=0&&o>i;i+=n){var a=u?u[i]:i;e=r(e,t[a],a,t)}return e}return function(r,e,u,i){e=b(e,i,4);var o=!k(r)&&m.keys(r),a=(o||r).length,c=n>0?0:a-1;return arguments.length<3&&(u=r[o?o[c]:c],c+=n),t(r,e,u,o,c,a)}}function t(n){return function(t,r,e){r=x(r,e);for(var u=O(t),i=n>0?0:u-1;i>=0&&u>i;i+=n)if(r(t[i],i,t))return i;return-1}}function r(n,t,r){return function(e,u,i){var o=0,a=O(e);if("number"==typeof i)n>0?o=i>=0?i:Math.max(i+a,o):a=i>=0?Math.min(i+1,a):i+a+1;else if(r&&i&&a)return i=r(e,u),e[i]===u?i:-1;if(u!==u)return i=t(l.call(e,o,a),m.isNaN),i>=0?i+o:-1;for(i=n>0?o:a-1;i>=0&&a>i;i+=n)if(e[i]===u)return i;return-1}}function e(n,t){var r=I.length,e=n.constructor,u=m.isFunction(e)&&e.prototype||a,i="constructor";for(m.has(n,i)&&!m.contains(t,i)&&t.push(i);r--;)i=I[r],i in n&&n[i]!==u[i]&&!m.contains(t,i)&&t.push(i)}var u=this,i=u._,o=Array.prototype,a=Object.prototype,c=Function.prototype,f=o.push,l=o.slice,s=a.toString,p=a.hasOwnProperty,h=Array.isArray,v=Object.keys,g=c.bind,y=Object.create,d=function(){},m=function(n){return n instanceof m?n:this instanceof m?void(this._wrapped=n):new m(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=m),exports._=m):u._=m,m.VERSION="1.8.3";var b=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}},x=function(n,t,r){return null==n?m.identity:m.isFunction(n)?b(n,t,r):m.isObject(n)?m.matcher(n):m.property(n)};m.iteratee=function(n,t){return x(n,t,1/0)};var _=function(n,t){return function(r){var e=arguments.length;if(2>e||null==r)return r;for(var u=1;e>u;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;a>c;c++){var f=o[c];t&&r[f]!==void 0||(r[f]=i[f])}return r}},j=function(n){if(!m.isObject(n))return{};if(y)return y(n);d.prototype=n;var t=new d;return d.prototype=null,t},w=function(n){return function(t){return null==t?void 0:t[n]}},A=Math.pow(2,53)-1,O=w("length"),k=function(n){var t=O(n);return"number"==typeof t&&t>=0&&A>=t};m.each=m.forEach=function(n,t,r){t=b(t,r);var e,u;if(k(n))for(e=0,u=n.length;u>e;e++)t(n[e],e,n);else{var i=m.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},m.map=m.collect=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=Array(u),o=0;u>o;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},m.reduce=m.foldl=m.inject=n(1),m.reduceRight=m.foldr=n(-1),m.find=m.detect=function(n,t,r){var e;return e=k(n)?m.findIndex(n,t,r):m.findKey(n,t,r),e!==void 0&&e!==-1?n[e]:void 0},m.filter=m.select=function(n,t,r){var e=[];return t=x(t,r),m.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e},m.reject=function(n,t,r){return m.filter(n,m.negate(x(t)),r)},m.every=m.all=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},m.some=m.any=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},m.contains=m.includes=m.include=function(n,t,r,e){return k(n)||(n=m.values(n)),("number"!=typeof r||e)&&(r=0),m.indexOf(n,t,r)>=0},m.invoke=function(n,t){var r=l.call(arguments,2),e=m.isFunction(t);return m.map(n,function(n){var u=e?t:n[t];return null==u?u:u.apply(n,r)})},m.pluck=function(n,t){return m.map(n,m.property(t))},m.where=function(n,t){return m.filter(n,m.matcher(t))},m.findWhere=function(n,t){return m.find(n,m.matcher(t))},m.max=function(n,t,r){var e,u,i=-1/0,o=-1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],e>i&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(u>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},m.min=function(n,t,r){var e,u,i=1/0,o=1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],i>e&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(o>u||1/0===u&&1/0===i)&&(i=n,o=u)});return i},m.shuffle=function(n){for(var t,r=k(n)?n:m.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=m.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},m.sample=function(n,t,r){return null==t||r?(k(n)||(n=m.values(n)),n[m.random(n.length-1)]):m.shuffle(n).slice(0,Math.max(0,t))},m.sortBy=function(n,t,r){return t=x(t,r),m.pluck(m.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=x(r,e),m.each(t,function(e,i){var o=r(e,i,t);n(u,e,o)}),u}};m.groupBy=F(function(n,t,r){m.has(n,r)?n[r].push(t):n[r]=[t]}),m.indexBy=F(function(n,t,r){n[r]=t}),m.countBy=F(function(n,t,r){m.has(n,r)?n[r]++:n[r]=1}),m.toArray=function(n){return n?m.isArray(n)?l.call(n):k(n)?m.map(n,m.identity):m.values(n):[]},m.size=function(n){return null==n?0:k(n)?n.length:m.keys(n).length},m.partition=function(n,t,r){t=x(t,r);var e=[],u=[];return m.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},m.first=m.head=m.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:m.initial(n,n.length-t)},m.initial=function(n,t,r){return l.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},m.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:m.rest(n,Math.max(0,n.length-t))},m.rest=m.tail=m.drop=function(n,t,r){return l.call(n,null==t||r?1:t)},m.compact=function(n){return m.filter(n,m.identity)};var S=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=O(n);a>o;o++){var c=n[o];if(k(c)&&(m.isArray(c)||m.isArguments(c))){t||(c=S(c,t,r));var f=0,l=c.length;for(u.length+=l;l>f;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};m.flatten=function(n,t){return S(n,t,!1)},m.without=function(n){return m.difference(n,l.call(arguments,1))},m.uniq=m.unique=function(n,t,r,e){m.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=x(r,e));for(var u=[],i=[],o=0,a=O(n);a>o;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?m.contains(i,f)||(i.push(f),u.push(c)):m.contains(u,c)||u.push(c)}return u},m.union=function(){return m.uniq(S(arguments,!0,!0))},m.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=O(n);u>e;e++){var i=n[e];if(!m.contains(t,i)){for(var o=1;r>o&&m.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},m.difference=function(n){var t=S(arguments,!0,!0,1);return m.filter(n,function(n){return!m.contains(t,n)})},m.zip=function(){return m.unzip(arguments)},m.unzip=function(n){for(var t=n&&m.max(n,O).length||0,r=Array(t),e=0;t>e;e++)r[e]=m.pluck(n,e);return r},m.object=function(n,t){for(var r={},e=0,u=O(n);u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},m.findIndex=t(1),m.findLastIndex=t(-1),m.sortedIndex=function(n,t,r,e){r=x(r,e,1);for(var u=r(t),i=0,o=O(n);o>i;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},m.indexOf=r(1,m.findIndex,m.sortedIndex),m.lastIndexOf=r(-1,m.findLastIndex),m.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var E=function(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=j(n.prototype),o=n.apply(i,u);return m.isObject(o)?o:i};m.bind=function(n,t){if(g&&n.bind===g)return g.apply(n,l.call(arguments,1));if(!m.isFunction(n))throw new TypeError("Bind must be called on a function");var r=l.call(arguments,2),e=function(){return E(n,e,t,this,r.concat(l.call(arguments)))};return e},m.partial=function(n){var t=l.call(arguments,1),r=function(){for(var e=0,u=t.length,i=Array(u),o=0;u>o;o++)i[o]=t[o]===m?arguments[e++]:t[o];for(;e<arguments.length;)i.push(arguments[e++]);return E(n,r,this,this,i)};return r},m.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=m.bind(n[r],n);return n},m.memoize=function(n,t){var r=function(e){var u=r.cache,i=""+(t?t.apply(this,arguments):e);return m.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},m.delay=function(n,t){var r=l.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},m.defer=m.partial(m.delay,m,1),m.throttle=function(n,t,r){var e,u,i,o=null,a=0;r||(r={});var c=function(){a=r.leading===!1?0:m.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=m.now();a||r.leading!==!1||(a=f);var l=t-(f-a);return e=this,u=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||r.trailing===!1||(o=setTimeout(c,l)),i}},m.debounce=function(n,t,r){var e,u,i,o,a,c=function(){var f=m.now()-o;t>f&&f>=0?e=setTimeout(c,t-f):(e=null,r||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=m.now();var f=r&&!e;return e||(e=setTimeout(c,t)),f&&(a=n.apply(i,u),i=u=null),a}},m.wrap=function(n,t){return m.partial(t,n)},m.negate=function(n){return function(){return!n.apply(this,arguments)}},m.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},m.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},m.before=function(n,t){var r;return function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=null),r}},m.once=m.partial(m.before,2);var M=!{toString:null}.propertyIsEnumerable("toString"),I=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];m.keys=function(n){if(!m.isObject(n))return[];if(v)return v(n);var t=[];for(var r in n)m.has(n,r)&&t.push(r);return M&&e(n,t),t},m.allKeys=function(n){if(!m.isObject(n))return[];var t=[];for(var r in n)t.push(r);return M&&e(n,t),t},m.values=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},m.mapObject=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=u.length,o={},a=0;i>a;a++)e=u[a],o[e]=t(n[e],e,n);return o},m.pairs=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},m.invert=function(n){for(var t={},r=m.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},m.functions=m.methods=function(n){var t=[];for(var r in n)m.isFunction(n[r])&&t.push(r);return t.sort()},m.extend=_(m.allKeys),m.extendOwn=m.assign=_(m.keys),m.findKey=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=0,o=u.length;o>i;i++)if(e=u[i],t(n[e],e,n))return e},m.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;m.isFunction(t)?(u=m.allKeys(o),e=b(t,r)):(u=S(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;c>a;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},m.omit=function(n,t,r){if(m.isFunction(t))t=m.negate(t);else{var e=m.map(S(arguments,!1,!1,1),String);t=function(n,t){return!m.contains(e,t)}}return m.pick(n,t,r)},m.defaults=_(m.allKeys,!0),m.create=function(n,t){var r=j(n);return t&&m.extendOwn(r,t),r},m.clone=function(n){return m.isObject(n)?m.isArray(n)?n.slice():m.extend({},n):n},m.tap=function(n,t){return t(n),n},m.isMatch=function(n,t){var r=m.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;e>i;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof m&&(n=n._wrapped),t instanceof m&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(m.isFunction(o)&&o instanceof o&&m.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}r=r||[],e=e||[];for(var c=r.length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if(c=n.length,c!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=m.keys(n);if(c=l.length,m.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!m.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};m.isEqual=function(n,t){return N(n,t)},m.isEmpty=function(n){return null==n?!0:k(n)&&(m.isArray(n)||m.isString(n)||m.isArguments(n))?0===n.length:0===m.keys(n).length},m.isElement=function(n){return!(!n||1!==n.nodeType)},m.isArray=h||function(n){return"[object Array]"===s.call(n)},m.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},m.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){m["is"+n]=function(t){return s.call(t)==="[object "+n+"]"}}),m.isArguments(arguments)||(m.isArguments=function(n){return m.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(m.isFunction=function(n){return"function"==typeof n||!1}),m.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},m.isNaN=function(n){return m.isNumber(n)&&n!==+n},m.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===s.call(n)},m.isNull=function(n){return null===n},m.isUndefined=function(n){return n===void 0},m.has=function(n,t){return null!=n&&p.call(n,t)},m.noConflict=function(){return u._=i,this},m.identity=function(n){return n},m.constant=function(n){return function(){return n}},m.noop=function(){},m.property=w,m.propertyOf=function(n){return null==n?function(){}:function(t){return n[t]}},m.matcher=m.matches=function(n){return n=m.extendOwn({},n),function(t){return m.isMatch(t,n)}},m.times=function(n,t,r){var e=Array(Math.max(0,n));t=b(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},m.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},m.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=m.invert(B),R=function(n){var t=function(t){return n[t]},r="(?:"+m.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};m.escape=R(B),m.unescape=R(T),m.result=function(n,t,r){var e=null==n?void 0:n[t];return e===void 0&&(e=r),m.isFunction(e)?e.call(n):e};var q=0;m.uniqueId=function(n){var t=++q+"";return n?n+t:t},m.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};m.template=function(n,t,r){!t&&r&&(t=r),t=m.defaults({},t,m.templateSettings);var e=RegExp([(t.escape||K).source,(t.interpolate||K).source,(t.evaluate||K).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var o=new Function(t.variable||"obj","_",i)}catch(a){throw a.source=i,a}var c=function(n){return o.call(this,n,m)},f=t.variable||"obj";return c.source="function("+f+"){\n"+i+"}",c},m.chain=function(n){var t=m(n);return t._chain=!0,t};var P=function(n,t){return n._chain?m(t).chain():t};m.mixin=function(n){m.each(m.functions(n),function(t){var r=m[t]=n[t];m.prototype[t]=function(){var n=[this._wrapped];return f.apply(n,arguments),P(this,r.apply(m,n))}})},m.mixin(m),m.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=o[n];m.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],P(this,r)}}),m.each(["concat","join","slice"],function(n){var t=o[n];m.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),m.prototype.value=function(){return this._wrapped},m.prototype.valueOf=m.prototype.toJSON=m.prototype.value,m.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return m})}).call(this);
//# sourceMappingURL=underscore-min.map
;
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//




;
