/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

#ifdef QT_QML_DEBUG
#include <QtQuick>
#endif

#include <sailfishapp.h>
#include <libsailfishwebengine/webengine.h>

#include "server.h"

int main(int argc, char *argv[])
{
  int result = 0;

  // SailfishApp::main() will display "qml/harbour-present.qml", if you need more
  // control over initialization, you can use:
  //
  //   - SailfishApp::application(int, char *[]) to get the QGuiApplication *
  //   - SailfishApp::createView() to get a new QQuickView * instance
  //   - SailfishApp::pathTo(QString) to get a QUrl to a resource file
  //   - SailfishApp::pathToMainQml() to get a QUrl to the main QML file
  //
  // To display the view, call "show()" (will show fullscreen on device).

  QGuiApplication *app = SailfishApp::application(argc, argv);

  Server server(app);
  result = server.start();
  if (!result ) {
      qDebug("Server could not be started");
      return -1;
  }

  QQuickView *view = SailfishApp::createView();
  // The engine takes ownership of the ImageProvider
  view->setSource(SailfishApp::pathTo("qml/harbour-present.qml"));

  view->show();

  SailfishOS::WebEngine *webEngine = SailfishOS::WebEngine::instance();
  webEngine->addComponentManifest(SailfishApp::pathTo("presentation/component.manifest").toLocalFile());

  result = app->exec();

  return result;
}
