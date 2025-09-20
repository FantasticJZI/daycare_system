# 使用 Node.js 官方映像
FROM node:16-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install --production

# 複製專案檔案
COPY . .

# 建立上傳目錄
RUN mkdir -p uploads

# 暴露端口
EXPOSE 5000

# 設定環境變數
ENV NODE_ENV=production

# 啟動應用
CMD ["npm", "start"]

