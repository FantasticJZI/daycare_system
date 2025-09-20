# 建置階段
FROM node:16-alpine as build

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製原始碼
COPY . .

# 建置應用
RUN npm run build

# 生產階段
FROM nginx:alpine

# 複製建置檔案到 nginx
COPY --from=build /app/build /usr/share/nginx/html

# 複製 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3000

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]

