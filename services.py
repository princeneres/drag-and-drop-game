from flask import jsonify


def validate_theme(data, has_existing_password=False):
    '''Valida o payload de criação/edição de um tema.

    has_existing_password: True em edições onde o tema já é privado e
    possui senha salva (permite manter a senha sem reenviá-la).
    '''
    if not data:
        return False, jsonify({'error': 'Sem informações suficientes para criação!'})

    name = data.get('name')
    private = data.get('private')
    password = data.get('password')
    description = data.get('description')
    categories = data.get('categories') or []

    if not name:
        return False, jsonify({'error': 'O nome não pode ficar em branco!'})
    if not description:
        return False, jsonify({'error': 'A descrição não pode ficar em branco!'})
    if private and not password and not has_existing_password:
        return False, jsonify({'error': 'Temas privados precisam de senha!'})
    if len(categories) < 2:
        return False, jsonify({'error': 'Temas não podem ter menos de 2 categorias!'})
    if len(categories) > 10:
        return False, jsonify({'error': 'Temas não podem ter mais de 10 categorias!'})

    for category in categories:
        if not category.get('name'):
            return False, jsonify({'error': 'O nome da categoria não pode ficar em branco!'})
        items = category.get('items') or []
        if len(items) < 1:
            return False, jsonify({'error': 'Categorias precisam de pelo menos 1 item!'})
        if len(items) > 10:
            return False, jsonify({'error': 'Categorias não podem ter mais de 10 items!'})
        for item in items:
            if not item.get('name'):
                return False, jsonify({'error': 'O nome do item não pode ficar em branco!'})

    return True, {}
