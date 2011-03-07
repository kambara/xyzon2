require 'appengine-rack'
require 'config/settings'

Dir["./app/**/*.rb"].each {|file|
  require file
}

configure :development do
  class Sinatra::Reloader < ::Rack::Reloader
    def safe_load(file, mtime, stderr)
      if File.expand_path(file) == File.expand_path(::Sinatra::Application.app_file)
        ::Sinatra::Application.reset!
        stderr.puts "#{self.class}: reseting routes"
      end
      super
    end
  end
  use Sinatra::Reloader
end

run Sinatra::Application
