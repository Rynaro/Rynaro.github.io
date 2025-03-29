FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /site

# Install Jekyll and Bundler
RUN gem install jekyll bundler webrick

# Expose port 4000 for Jekyll server
EXPOSE 4000

# Add volume for site content
VOLUME /site

# Command to run when container starts
# Using webrick since it's no longer bundled with Ruby 3.0+
CMD ["sh", "-c", "if [ ! -f Gemfile ]; then jekyll new . --force; fi && bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload"]
