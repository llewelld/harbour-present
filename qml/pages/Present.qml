/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

import QtQuick 2.0
import Sailfish.Silica 1.0
import Sailfish.WebView 1.0
import Sailfish.WebEngine 1.0

Page {
    allowedOrientations: Orientation.Landscape
    WebView {
        id: webview
        anchors.fill: parent
        url: "http://localhost:8080/present.html"

        Component.onCompleted: {
            console.log("Loading component");
            loadFrameScript("chrome://components/content/component.js");
            WebEngine.addObserver("present:pagechange")

            function observe(message, data) {
                if (message == "present:pagechange") {
                    console.log("present:pagechange");
                    pageNumber = data.page;
                }
            }
            WebEngine.onRecvObserve.connect(observe)
        }
    }
}
