FROM ruby:3.3.4

WORKDIR /usr/app

COPY Gemfile Gemfile.lock package.json package-lock.json /usr/app/

RUN bundle install

RUN apt-get update

# Install NVM
ENV NVM_DIR /root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Add NVM to PATH and install Node.js
RUN . "$NVM_DIR/nvm.sh" \
    && nvm install 17.9.1 \
    && nvm use 17.9.1 \
    && nvm alias default 17.9.1

# Add NVM and Node binaries to PATH for the rest of the Docker build
ENV NODE_VERSION 17.9.1
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# (Optional) Set up for subsequent shells (if using bash profile)
RUN echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc

# Test
RUN node --version

# Install tailwind
RUN npm i

COPY . /usr/app

RUN bundle exec jekyll build

EXPOSE 4000/tcp