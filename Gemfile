disable_system_gems
disable_rubygems
bundle_path ".gems/bundler_gems"

# http://groups.google.com/group/appengine-jruby/browse_thread/thread/20ab744f1b40514e
# jruby-rack 1.0.6 causes a problem

gem 'jruby-rack', '1.0.4'
gem 'jruby-openssl'

gem "sinatra"
gem "dm-core"
gem "dm-appengine"
gem "haml"
gem "ruby-openid" ## for hmac/sha2

# http://code.google.com/p/appengine-jruby/wiki/GettingStarted
# Uninstall:
#   - appengine-sdk 1.4.2
#   - google-appengine 0.0.20
#   - appengine-apis 0.0.23
# Install:
#   - appengine-sdk 1.4.0
#   - google-appengine 0.0.19
#   - appengine-apis 0.0.22