/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

#ifndef RESOURCE_H
#define RESOURCE_H

#include <QByteArray>

class Resource {
public:
  explicit Resource(QByteArray const &data, QByteArray const &contentType);
  Resource();

  QByteArray const &getData() const;
  QByteArray const &getContentType() const;

private:
  QByteArray data;
  QByteArray contentType;
};

#endif // RESOURCE_H
