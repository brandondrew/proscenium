# frozen_string_literal: true

source 'https://rubygems.org'

# Specify your gem's dependencies in proscenium.gemspec
gemspec

gem 'puma'
gem 'rails', '~> 7.0'
gem 'sqlite3'

group :development do
  gem 'benchmark-ips'
  gem 'rubocop'
  gem 'rubocop-minitest'
  gem 'rubocop-packaging'
  gem 'rubocop-performance'
  gem 'rubocop-rake'
end

group :test do
  gem 'capybara'
  gem 'cuprite'
  gem 'dry-initializer'
  gem 'fakefs', require: 'fakefs/safe'
  gem 'gem1', path: './test/dummy/vendor/gem1'
  gem 'gem2', path: './test/external/gem2'
  gem 'minitest-focus'
  gem 'minitest-snapshots'
  gem 'phlex-rails'
  gem 'phlex-testing-capybara'
  gem 'view_component'
end
