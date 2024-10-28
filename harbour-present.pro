# NOTICE:
#
# Application name defined in TARGET has a corresponding QML filename.
# If name defined in TARGET is changed, the following needs to be done
# to match new name:
#   - corresponding QML filename must be changed
#   - desktop icon filename must be changed
#   - desktop filename must be changed
#   - icon definition filename in desktop file must be changed
#   - translation filenames have to be changed

# The name of your application
TARGET = harbour-present

CONFIG += sailfishapp

SOURCES += src/harbour-present.cpp \
    src/resource.cpp \
    src/server.cpp

HEADERS += \
    src/resource.h \
    src/server.h

DISTFILES += README.md \
    LICENSE \
    presentation/fragment-shader.frag \
    presentation/vertex-shader.vert \
    qml/harbour-present.qml \
    qml/cover/CoverPage.qml \
    qml/pages/Present.qml \
    rpm/harbour-present.changes.in \
    rpm/harbour-present.changes.run.in \
    rpm/harbour-present.spec \
    translations/*.ts \
    harbour-present.desktop

presentation.path = /usr/share/$${TARGET}/presentation
presentation.files = presentation/*

INSTALLS += presentation

SAILFISHAPP_ICONS = 86x86 108x108 128x128 172x172

# to disable building translations every time, comment out the
# following CONFIG line
CONFIG += sailfishapp_i18n

# German translation is enabled as an example. If you aren't
# planning to localize your app, remember to comment out the
# following TRANSLATIONS line. And also do not forget to
# modify the localized app name in the the .desktop file.
TRANSLATIONS += translations/harbour-present-de.ts

# Qhttp
# See https://github.com/azadkuh/qhttp
INCLUDEPATH += \
    ./libs/ \
    ./libs/qhttp/src/

SOURCES += \
    ./libs/qhttp/src/qhttpabstracts.cpp \
    ./libs/qhttp/src/qhttpserverconnection.cpp \
    ./libs/qhttp/src/qhttpserverrequest.cpp \
    ./libs/qhttp/src/qhttpserverresponse.cpp \
    ./libs/qhttp/src/qhttpserver.cpp

HEADERS += \
    ./libs/qhttp/src/qhttpfwd.hpp \
    ./libs/qhttp/src/qhttpabstracts.hpp \
    ./libs/qhttp/src/qhttpserverconnection.hpp \
    ./libs/qhttp/src/qhttpserverrequest.hpp \
    ./libs/qhttp/src/qhttpserverresponse.hpp \
    ./libs/qhttp/src/qhttpserver.hpp

# Joyent http_parser
# See https://github.com/nodejs/http-parser
SOURCES += \
    ./libs/http-parser/http_parser.c
HEADERS += \
    ./libs/http-parser/http_parser.h
