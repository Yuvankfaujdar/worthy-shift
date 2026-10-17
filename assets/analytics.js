// Anonymous usage counts via Mixpanel.
// Never sends salary, hourly rate, prices, hours or item names. No session replay, no autocapture, no IP stored.
(function () {
  var TOKEN = "d7818a7919e66c03aef3b89b97453c7e";
  var host = location.hostname;
  var off = location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "";

  // Local no-op so the app never breaks if analytics is off or blocked.
  window.wsTrack = function () {};
  if (off) return;

  window.MIXPANEL_CUSTOM_LIB_URL = "/assets/vendor/mixpanel-2.84.0.min.js";
  // Official Mixpanel loader stub (queues calls until the library loads).
  (function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src=window.MIXPANEL_CUSTOM_LIB_URL;e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[]);

  window.mixpanel.init(TOKEN, {
    api_host: "https://api-js.mixpanel.com",   // US data residency
    autocapture: false,
    track_pageview: false,
    record_sessions_percent: 0,
    ip: false,
    persistence: "localStorage",
    ignore_dnt: false
  });

  window.wsTrack = function (name, props) {
    try { window.mixpanel.track(name, props || {}); } catch (e) {}
  };
})();
