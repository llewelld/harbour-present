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


