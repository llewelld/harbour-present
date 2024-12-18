/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

#ifndef SERVER_H
#define SERVER_H

#include <QObject>
#include <QFile>
#include <QMap>

#include <qhttpserver.hpp>
#include "resource.h"

using namespace qhttp::server;

class Server : public QObject
{
  Q_OBJECT
public:
  explicit Server(QObject *parent = nullptr);

  bool start();
signals:

private:
  bool loadResources();
  bool loadResource(QString const &name, QString const &filename, QString const &contentType = QString());

private:
  QHttpServer *server;
  QMap<QString, Resource> resources;
  QMap<QString, QByteArray> contenttypes;
};

#endif // SERVER_H
