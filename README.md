# XYzon

## Install

XYzon requires [appengine-jruby](http://code.google.com/p/appengine-jruby/).

    $ sudo gem install jbundle
    $ sudo gem install google-appengine -v "0.0.19"
    $ sudo gem install appengine-sdk -v "1.4.0"
    $ sudo gem install bundle

## Run

    $ cd xyzon
    $ dev_appserver.rb .

## Upload to App Engine

Create an application id at [appspot.com](http://appengine.google.com/start/createapp).
Replace the application id in config.ru.

    $ appcfg.rb --enable_jar_splitting update .