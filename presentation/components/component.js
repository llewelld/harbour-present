/* -*- Mode: JavaScript; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

var globalObject = null;

function Component() {
  this._init();
}

Component.prototype = {
  QueryInterface: ChromeUtils.generateQI([Ci.nsIObserver,
                                          Ci.nsISupportsWeakReference]),

  _init: function()
  {
    Logger.debug("Component init called");

    addEventListener("pagechange", this, true, true);
  },

  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case "pagechange": {
        Logger.debug("Event: pagechange: " + aEvent.detail.page);
        sendAsyncMessage("embed:pagechange", { "page": aEvent.detail.page });
        break;
      }
    }
  },
};

globalObject = new Component();

Logger.debug("Frame script: component.js loaded");
