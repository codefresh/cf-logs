FROM codefresh/buildpacks:all


COPY package.json /cf-logs/package.json

WORKDIR /cf-logs

RUN npm install

COPY . /cf-logs