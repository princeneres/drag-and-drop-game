'''
  Rotas da Aplicação
'''

from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from flask import render_template, request, jsonify
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from app import app
from services import validate_theme
import database as dbase


db = dbase.dbConnection()
coll_themes = db['themes']
coll_scores = db['scores']


def _public_theme(theme):
    '''Remove campos sensíveis antes de enviar ao template/cliente.'''
    theme = dict(theme)
    theme.pop('password', None)
    return theme


# Lista todos temas
@app.route('/', methods=['GET'])
def home():
    '''Página inicial da Aplicação'''
    try:
        themes = [_public_theme(t) for t in coll_themes.find()]
        return render_template('index.html', temas=themes)
    except Exception as error:
        return jsonify({'error': f'Erro ao encontrar temas: {error}!'})


# Template de jogo
@app.route('/tema/<string:id>', methods=['GET'])
def game(id):
    '''Tela de jogo'''
    try:
        theme = coll_themes.find_one({'_id': ObjectId(id)})
    except InvalidId:
        theme = None

    if not theme:
        return jsonify({'error': 'Tema não encontrado!'}), 404

    find_record = coll_scores.find(
        {'theme_id': str(id)}).sort('final_score', -1).limit(1)
    record = next(iter(find_record), 0)

    categories = theme['categories']
    items = []
    for category in categories:
        for item in category['items']:
            item['category'] = category['name']
            items.append(item)

    return render_template('jogo.html', tema=_public_theme(theme),
                           categories=categories, items=items, record=record)


# Templates para criação e edição de tema
@app.route('/formulario/<string:id>', methods=['GET'])
def form(id):
    '''Página de formulário dos temas'''
    if id == 'novo':
        return render_template('formulario.html')

    try:
        theme = coll_themes.find_one({'_id': ObjectId(id)})
    except InvalidId:
        theme = None

    if theme:
        return render_template('edicao.html', tema=_public_theme(theme))
    return jsonify({'error': 'Tema não encontrado!'}), 404


# Template sobre aplicação de desenvolvedores
@app.route('/sobre', methods=['GET'])
def about():
    '''Página sobre'''
    return render_template('sobre.html')


# Rota para criação de tema
@app.route('/create_theme', methods=['POST'])
@cross_origin()
def create_theme():
    '''Recebe um JSON para criação de tema'''
    now = datetime.now()
    data = request.get_json()
    valid, response = validate_theme(data)
    if not valid:
        return response

    data['private'] = bool(data.get('private'))
    if data['private']:
        data['password'] = generate_password_hash(data['password'])
    else:
        data['password'] = None

    data['created_date'] = now
    data['updated_date'] = now
    try:
        coll_themes.insert_one(data)
        return jsonify({'success': f'Tema {data["name"]} criado com sucesso!'})
    except Exception as error:
        return jsonify({'error': f'Erro ao tentar criar tema: {error}!'})


# Rota para atualização de tema
@app.route('/update_theme/<string:id>', methods=['PUT'])
@cross_origin()
def update_theme(id):
    '''Recebe JSON para atualizar tema'''
    now = datetime.now()
    data = request.get_json()
    existing = coll_themes.find_one({'_id': ObjectId(id)})
    if not existing:
        return jsonify({'error': 'Tema não foi encontrado!'}), 404

    has_existing_password = bool(existing.get('password'))
    valid, response = validate_theme(data, has_existing_password)
    if not valid:
        return response

    private = bool(data.get('private'))
    if private:
        if data.get('password'):
            password = generate_password_hash(data['password'])
        else:
            password = existing.get('password')  # mantém a senha atual
    else:
        password = None

    theme = {
        '$set': {
            'name': data['name'],
            'description': data['description'],
            'categories': data['categories'],
            'updated_date': now,
            'private': private,
            'password': password,
        }
    }
    try:
        coll_themes.update_one({'_id': ObjectId(id)}, theme)
        return jsonify({'success': 'Tema atualizado com sucesso!'})
    except Exception as error:
        return jsonify({'error': f'Erro ao tentar editar tema: {error}!'})


# Rota para remoção de tema
@app.route('/delete_theme/<string:id>', methods=['DELETE'])
@cross_origin()
def delete_theme(id):
    '''Recebe ID para deletar tema'''
    theme = coll_themes.find_one({'_id': ObjectId(id)})
    if not theme:
        return jsonify({'error': 'Tema não foi encontrado!'}), 404
    coll_themes.delete_one({'_id': ObjectId(id)})
    return jsonify({'success': 'Tema deletado com sucesso!'})


# Verifica senha de tema privado (no servidor, sem vazar o hash)
@app.route('/verify_password/<string:id>', methods=['POST'])
@cross_origin()
def verify_password(id):
    '''Confere a senha de um tema privado.'''
    data = request.get_json() or {}
    try:
        theme = coll_themes.find_one({'_id': ObjectId(id)})
    except InvalidId:
        theme = None

    if not theme:
        return jsonify({'ok': False, 'error': 'Tema não encontrado!'}), 404

    stored = theme.get('password')
    if stored and check_password_hash(stored, data.get('password', '')):
        return jsonify({'ok': True})
    return jsonify({'ok': False, 'error': 'Senha incorreta!'}), 401


# Rota para salvar pontuação
@app.route('/save_score', methods=['POST'])
@cross_origin()
def save_score():
    '''Salva a pontuação de uma partida.'''
    now = datetime.now()
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Sem informações suficientes para salvar!'})

    data['date'] = now
    data['final_score'] = data['score'] + data['time'] - data['mistakes']
    try:
        coll_scores.insert_one(data)
        return jsonify({'success': 'Pontuação salva com sucesso!'})
    except Exception as error:
        return jsonify({'error': f'Erro ao salvar pontuação: {error}!'})
