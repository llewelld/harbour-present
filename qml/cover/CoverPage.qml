import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
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
            text: qsTr("1")
        }
    }

    CoverActionList {
        id: coverAction

        CoverAction {
            iconSource: "image://theme/icon-cover-previous-song"
        }

        CoverAction {
            iconSource: "image://theme/icon-cover-next-song"
        }
    }
}
