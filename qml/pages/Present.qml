import QtQuick 2.0
import Sailfish.Silica 1.0
import Sailfish.WebView 1.0

Page {
    allowedOrientations: Orientation.Landscape

    WebView {
        id: webview
        anchors.fill: parent
        url: "http://localhost:8080/present.html"
    }
}
