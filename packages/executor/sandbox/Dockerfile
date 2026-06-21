FROM node:20-alpine
RUN npm install -g tsx@4.22.4
# node:20-alpine already ships uid/gid 1000 as the "node" user
# Set HOME to /tmp so tsx/esbuild cache writes succeed under ReadonlyRootfs
ENV HOME=/tmp
USER node
WORKDIR /tmp
ENTRYPOINT ["sh", "-c"]
