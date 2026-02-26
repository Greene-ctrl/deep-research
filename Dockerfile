FROM archlinux

ARG ACCESS_PASSWORD
ARG SEARXNG_API_BASE_URL
ARG MCP_SEARCH_PROVIDER
ARG MCP_AI_PROVIDER
ARG TAVILY_API_KEY
ARG OPENAI_COMPATIBLE_API_BASE_URL
ARG OPENAI_COMPATIBLE_API_KEY

RUN pacman -Syu --noconfirm --overwrite '*'
RUN pacman -S nodejs pnpm git git-lfs base-devel --noconfirm --overwrite '*'

WORKDIR /app
COPY . .

RUN pnpm install
RUN bash setenv.sh

RUN pnpm build

RUN chmod -R 777 /app

EXPOSE 3000

CMD ["pnpm", "start"]
