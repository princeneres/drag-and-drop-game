# Imagem base oficial do Python
FROM python:3.10-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=3000

WORKDIR /app

# Instala dependências primeiro (melhor cache de camadas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante da aplicação
COPY . .

EXPOSE 3000

# Servidor de produção (gunicorn). Onrender injeta a env $PORT.
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 runserver:app
