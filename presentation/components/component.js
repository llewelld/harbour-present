/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

"use strict";

var globalObject = null;

function Component() {
  this._init();
}

Component.prototype = {
  QueryInterface: ChromeUtils.generateQI([Ci.nsIObserver,
                                          Ci.nsISupportsWeakReference]),

  _init: function() {
    Logger.debug("Component init called");

    // From DOM to front end
    addEventListener("pagechange", this, true, true);
    // From front end to DOM
    Services.obs.addObserver(this, "present:nextpage", true);
    Services.obs.addObserver(this, "present:prevpage", true);
  },

  handleEvent: function(aEvent) {
    // Events arriving from the DOM
    // These are forwarded to the front end code
    switch (aEvent.type) {
      case "pagechange": {
        var result = { "page": aEvent.detail.page }
        Services.obs.notifyObservers(null, "present:pagechange", JSON.stringify(result));
        break;
      }
    }
  },

  _sendEvent: function(type) {
    // Dispatch a pagechange event
    var event = content.document.createEvent("Event");
    event.initEvent(type, true, true);
    content.dispatchEvent(event);
  },

  observe: function(aSubject, aTopic, data) {
    // Notifications arriving from the front end code
    // These are forwarded to the DOM
    switch (aTopic) {
      case "present:nextpage": {
        this._sendEvent("nextpage");
        break;
      }
      case "present:prevpage": {
        this._sendEvent("prevpage");
      }
    }
  },
};

globalObject = new Component();

Logger.debug("Frame script: component.js loaded");
