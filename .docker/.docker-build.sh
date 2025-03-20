# 构建镜像
pnpm build:docker-amd
pnpm build:docker-arm
pnpm build:docker-public
pnpm build:docker-public-arm

# 推送镜像
pnpm push:amd
pnpm push:arm
pnpm push:public
pnpm push:public-arm
