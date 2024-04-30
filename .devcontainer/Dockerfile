# FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye
FROM mcr.microsoft.com/devcontainers/javascript-node:20-bullseye

FROM python:3.11-slim

#サイズ削減のため不要なものは削除
RUN apt-get autoremove -y

RUN pip install torch==1.13 \
    && pip install transformers \
    && pip install sentence_transformers \
    && pip install fugashi \
    && pip install ipadic \
    && pip install unidic_lite \
    && pip install eland


# TODO ENVを使って環境変数化する。
# export GOOGLE_APPLICATION_CREDENTIALS=firebase-admin.json

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install &&{EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
