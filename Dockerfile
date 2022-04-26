FROM node:16 AS base
RUN npm install --global serve

FROM base as source
RUN useradd -ms /bin/bash default
USER default
WORKDIR /home/default
ADD --chown=default ./web-build web-build/
ADD --chown=default ./cmd.sh cmd.sh
EXPOSE 3001

ENV PORT 3001
ENV ENDPOINT localhost:8054
ENV USE_ARTIFICIAL_LATENCY false

CMD sh ~/cmd.sh

