/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

#include "resource.h"

Resource::Resource(QByteArray const &data, QByteArray const &contentType)
    : data(data)
    , contentType(contentType)
{}

Resource::Resource()
    : data()
    , contentType()
{}

QByteArray const &Resource::getData() const
{
  return data;
}
QByteArray const &Resource::getContentType() const
{
  return contentType;
}


