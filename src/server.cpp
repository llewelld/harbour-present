/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

#include "server.h"

#include <QMultiMap>
#include <sailfishapp.h>

#include <qhttpserver.hpp>
#include <qhttpserverrequest.hpp>
#include <qhttpserverresponse.hpp>

#include "resource.h"

using namespace qhttp::server;

Server::Server(QObject *parent)
  : QObject(parent)
{
  contenttypes.insert("html","text/html");
  contenttypes.insert("txt","text/plain");
  contenttypes.insert("js","text/javascript");
  contenttypes.insert("jsm","text/javascript");
  contenttypes.insert("css","text/css");
  contenttypes.insert("pdf","application/pdf");
  contenttypes.insert("vert","text/plain");
  contenttypes.insert("frag","text/plain");
  loadResources();
}

bool Server::loadResources()
{
  bool success = true;
  QString path;

  path = SailfishApp::pathTo("presentation/present.html").toLocalFile();
  success &= loadResource("/present.html", path);
  path = SailfishApp::pathTo("presentation/present.css").toLocalFile();
  success &= loadResource("/present.css", path);
  path = SailfishApp::pathTo("presentation/present.jsm").toLocalFile();
  success &= loadResource("/present.jsm", path);
  path = SailfishApp::pathTo("presentation/pdf.js").toLocalFile();
  success &= loadResource("/pdf.js", path);
  path = SailfishApp::pathTo("presentation/pdf.worker.min.js").toLocalFile();
  success &= loadResource("/pdf.worker.min.js", path);
  path = SailfishApp::pathTo("presentation/vertex-shader.vert").toLocalFile();
  success &= loadResource("/vertex-shader.vert", path);
  path = SailfishApp::pathTo("presentation/lava.frag").toLocalFile();
  success &= loadResource("/lava.frag", path);
  path = SailfishApp::pathTo("presentation/presentation.pdf").toLocalFile();
  success &= loadResource("/presentation.pdf", path);

  return success;
}

bool Server::loadResource(QString const &name, QString const &filename, QString const &contentType)
{
  bool success;
  QFile file(filename);
  success = file.open(QIODevice::ReadOnly);
  if (success) {
    QByteArray contents = file.readAll();
    QByteArray insertType = contentType.toLatin1();
    if (insertType.isEmpty()) {
      int extsep = filename.lastIndexOf(".");
      QString const &extension = extsep >= 0 ? filename.mid(extsep + 1) : "html";
      insertType = contenttypes.value(extension, "text/html");
    }
    resources.insert(name, Resource(contents, insertType));
    qDebug() << "Loaded resource: " << name << " (size " << contents.length() << " bytes)";
  }
  else {
    qDebug() << "Failed to open file: " << filename;
  }
  return success;
}

bool Server::start()
{
  bool success;

  // Listen on 0.0.0.0:8080
  server = new QHttpServer(&*this);
  server->listen(
      QHostAddress::Any, 8080,
      [this](QHttpRequest* req, QHttpResponse* res) {
          QUrl url = req->url();
          if (resources.contains(url.path())) {
            // HTTP status 200
            res->setStatusCode(qhttp::ESTATUS_OK);
            Resource const &resource = resources.value(url.path());
            res->addHeader("Content-Type", resource.getContentType());
            // The response body data
            res->end(resource.getData());
          }
          else {
            // HTTP status 200
            res->setStatusCode(qhttp::ESTATUS_NOT_FOUND);
            // The response body data
            res->end("<p>Not found</p>");
            qDebug() << "Not found: " << url;
          }
      }
  );

  success = server->isListening();

  qDebug() << "Server status: " << success;

  return success;
}
