FROM node:18

WORKDIR /apps/api

# Copia apenas o package.json e lock para instalar no ambiente certo
COPY apps/api/package*.json ./

RUN npm install

# Agora sim: copia o código
COPY apps/api .

# Inicia com tsx
CMD ["npx", "tsx", "src/app.ts"]
