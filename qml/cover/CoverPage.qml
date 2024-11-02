/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
    id: root

    Column {
        width: parent.width
        height: parent.height - (2 * Theme.paddingLarge)
        y: 2 * Theme.paddingLarge
        spacing: Theme.paddingLarge

        Label {
            id: label
            width: parent.width
            horizontalAlignment: "AlignHCenter"
            text: qsTr("Presentation")
        }

        Label {
            width: parent.width
            horizontalAlignment: "AlignHCenter"
            text: qsTr("Page")
        }

        Label {
            width: parent.width
            horizontalAlignment: "AlignHCenter"
            font.pixelSize: Theme.fontSizeExtraLarge
            text: pageNumber
        }
    }

    CoverActionList {
        id: coverAction

        CoverAction {
            iconSource: "image://theme/icon-cover-previous-song"
            onTriggered: prevPage()
        }

        CoverAction {
            iconSource: "image://theme/icon-cover-next-song"
            onTriggered: nextPage()
        }
    }
}
