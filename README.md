html5_performance
=================

A simple javascript library for recording browser performance statistics using the html5 performance API

Usage
-----

1. Download and include html_performance_stats.js in your javascript package, manifest, etc
2. By default the PerformanceStats.logTiming method will accumulate statistics for 10 requests,
then POST those stats via ajax to the url specified by 'dataSendUrl', which by default is
'/performance_log'.  To modify the send url you can call the .config function like so...

  PerformanceStats.config({dataSendUrl: '/some/custom/url/to/POST/to'})

based upon http://www.html5rocks.com/en/tutorials/webperformance/basics/

 see also:  http://calendar.perfplanet.com/2011/a-practical-guide-to-the-navigation-timing-api/