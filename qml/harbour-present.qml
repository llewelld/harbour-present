/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

import QtQuick 2.0
import Sailfish.Silica 1.0
import Sailfish.WebEngine 1.0
import "pages"

ApplicationWindow {
    property int pageNumber: 1

    initialPage: Component { Present { } }
    cover: Qt.resolvedUrl("cover/CoverPage.qml")
    allowedOrientations: defaultAllowedOrientations

    function nextPage() {
        WebEngine.notifyObservers("present:nextpage", {});
    }
    function prevPage() {
        WebEngine.notifyObservers("present:prevpage", {});
    }
}
