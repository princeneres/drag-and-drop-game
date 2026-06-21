'''
Conexão com o MongoDB.
'''

import os
from pymongo import MongoClient
import certifi


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "project-game")


def dbConnection():
    '''Abre conexão com o banco e retorna o database.'''
    # certifi só é necessário para conexões TLS (ex.: Mongo Atlas).
    if MONGO_URI.startswith("mongodb+srv") or "mongodb.net" in MONGO_URI:
        client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    else:
        client = MongoClient(MONGO_URI)
    return client[DB_NAME]
