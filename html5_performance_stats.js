// utility to log browser timing and report-back to a host server
// based upon http://www.html5rocks.com/en/tutorials/webperformance/basics/
// see also:  http://calendar.perfplanet.com/2011/a-practical-guide-to-the-navigation-timing-api/
// author: John Stewart @john_s_in_co

var s;
var PerformanceStats = {

  settings: {
    dataSendUrl:  "/performance_log",
    transmitStats: "sendToServer",
    sendInterval: 10,
    recordDelay: 0
  },

  init: function() {
    s = this.settings;
    return this;
  },

  config: function(settings) {
    for(var att in this.settings) {
      if(settings[att] !== undefined) {
        this.settings[att] = settings[att];
      }
    }
    return this.settings;
  },

  // log the timing of the current page to the local storage
  logTiming: function() {
    // get the browser performance data and save to local storage
    try {
      if(PerformanceStats.supports_performance_stats() && PerformanceStats.supports_html5_storage()) {
        stats = PerformanceStats.getPerfStats();
        data = localStorage['perfTiming'] || "[]";
        data = JSON.parse(data);
        data.push(stats);
        localStorage['perfTiming'] = JSON.stringify(data);
        // if the data count > 10, send to the server
        if(data.length >= s.sendInterval) {
          // PerformanceStats.sendToServer();
          // http://stackoverflow.com/questions/912596/how-to-turn-a-string-into-a-javascript-function-call
          var fn = window[s.transmitStats];
          if(typeof fn === 'function') {
            // call the defined data-send function and pass it the locally stored hash of events
              fn(data);
            // wipe the events
            localStorage.removeItem('perfTiming');
          } else {
            console.log("ERROR! unable to call send function "+s.transmitStats);
          }
        }
      }
    } catch(e) {
      return false;
    }
  },

  // log an error to local storage
  logError: function(error) {
    if(PerformanceStats.supports_html5_storage()) {
      errors = localStorage['errors'] || "[]";
      errors = JSON.parse(errors);
      errors.push(error);
      localStorage['errors'] = JSON.stringify(errors);
      error;
    }
  },

  // send all local event data to the server
  sendToServer: function(data) {
    console.log("sending performance stats to host");
    try {
      var req = PerformanceStats.getAjax();
      statString = data;
      if(req != null && statString != null) {
        req.open('POST', s['dataSendUrl'], true);
        req.setRequestHeader("Content-type","application/json");
        req.send(statString);
      }
    } catch(e) {
      console.log(e);
      return false;
    }
  },

  getPerfStats: function() {
    if(PerformanceStats.supports_performance_stats()) {
      var timing = window.performance.timing;
      var nav = window.performance.navigation;
      return {
        path: window.location.pathname,
        search: window.location.search, 
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        connect: timing.connectEnd - timing.connectStart,
        basePage: timing.responseEnd - timing.responseStart,
        frontEnd: timing.loadEventStart - timing.responseEnd,
        networkLatency: timing.responseEnd - timing.fetchStart,
        fullLoad: timing.loadEventEnd - timing.navigationStart,
        requestTime: timing.navigationStart,
        redirects: nav.redirectCount
      };
    } else {
      return null;
    }
  },

  supports_html5_storage: function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }, 

  supports_performance_stats: function() {
    try {
      return 'performance' in window && window['performance'] !== null && window['performance']['timing'] !== null
    } catch (e) {
      return false;
    }
  },

  getAjax: function() {
    if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest;
    } else {
      try {
        return new ActiveXObject("MSXML2.XMLHTTP");
      } catch (ex) {
        return null;
      }
    }
  }

};

 // send all local event data to the server
var sendToServer = function(data) {
    console.log("sending performance stats to host");
    try {
      var req = PerformanceStats.getAjax();
      statString = JSON.stringify(data);
      if(req != null && statString != null) {
        req.open('POST', s['dataSendUrl'], true);
        req.setRequestHeader("Content-type","application/json");
        req.send(statString);
        localStorage.removeItem('perfTiming');
      }
    } catch(e) {
      console.log(e);
      return false;
    }
  }; 

window.onload = function(){
  PerformanceStats.init();
  setTimeout(function(){
    PerformanceStats.logTiming();
  }, s.recordDelay);
};
