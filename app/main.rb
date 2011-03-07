$KCODE = "u"
require 'sinatra'
require 'dm-core'
require 'haml'

set :haml, {:format => :html5}
set :views, File.dirname(__FILE__) + '/views'

get '/' do
  haml :index
end

get '/search' do
  @keyword = params['keyword']
  @recommend_categories = []
  haml :search
end

#
# Search API
# format: xml, yaml, json
# Example:
# /ajax/search/Pc/Netbook/1/xml
#
get '/ajax/search/:category/:keyword/:page/:format' do
  body = Kakaku::Item.search(params[:category],
                             params[:keyword],
                             params[:page]
                             ).body
  case params[:format]
  when "xml"
    output_xml body
  when "yaml"
    output_yaml Hash.from_xml(body).to_yaml
  when "json"
    outpus_json Hash.from_xml(body).to_json
  end
end

def output_xml(body)
  content_type "text/xml"
  body
end

def output_yaml(body)
  content_type "text"
  body
end

def output_json(body)
  content_type "application/json"
  body
end
