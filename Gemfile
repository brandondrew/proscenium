# frozen_string_literal: true

source 'https://rubygems.org'

# Specify your gem's dependencies in proscenium.gemspec
gemspec

gem 'amazing_print'
gem 'debug'
gem 'phlex-rails'
gem 'rails', '~> 7.0'

group :development do
  gem 'benchmark-ips'
  gem 'puma'
  gem 'rubocop'
  gem 'rubocop-packaging'
  gem 'rubocop-performance'
  gem 'rubocop-rake'
  gem 'sqlite3'
  gem 'web-console'

  # Playground
  gem 'htmlbeautifier'
  gem 'literal', github: 'joeldrapper/literal'
  gem 'phlexible'
  gem 'rouge'
end

group :test do
  gem 'capybara'
  gem 'cuprite'
  gem 'database_cleaner-active_record', require: 'database_cleaner/active_record'
  gem 'dry-initializer'
  gem 'fakefs', require: 'fakefs/safe'
  gem 'gem1', path: './fixtures/dummy/vendor/gem1'
  gem 'gem2', path: './fixtures/external/gem2'
  gem 'gem3', path: './fixtures/dummy/vendor/gem3'
  gem 'gem4', path: './fixtures/external/gem4'
  gem 'phlex-testing-capybara'
  gem 'sus'
  gem 'view_component', '~> 3.6.0'
end
