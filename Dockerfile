FROM ruby:2.6-alpine

RUN apk update && apk upgrade

RUN apk add --no-cache \
  git \
  nodejs \
  npm \
  make \
  gcc \
  build-base

RUN mkdir /opt/application
WORKDIR /opt/application

COPY Gemfile /opt/application
COPY Gemfile.lock /opt/application

RUN gem install bundler
RUN bundle install
