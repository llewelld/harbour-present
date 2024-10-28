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
