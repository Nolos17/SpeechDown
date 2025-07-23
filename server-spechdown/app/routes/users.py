from flask import Blueprint, request, jsonify
from app import mongo
from bson.objectid import ObjectId

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@users_bp.route('', methods=['GET'])
def get_users():
    users = mongo.db.users.find()
    result = []
    for u in users:
        u['_id'] = str(u['_id'])
        result.append(u)
    return jsonify(result), 200

@users_bp.route('/', methods=['POST'])
@users_bp.route('', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data.get('name') or not data.get('email') or not data.get('role'):
        return jsonify({'error': 'name, email y role son requeridos'}), 400
    if data['role'] not in ['parent', 'therapist']:
        return jsonify({'error': 'role debe ser "parent" o "therapist"'}), 400

    user = {
        'name': data['name'],
        'email': data['email'],
        'role': data['role']
    }
    inserted = mongo.db.users.insert_one(user)
    return jsonify({'_id': str(inserted.inserted_id)}), 201

@users_bp.route('/<id>', methods=['GET'])
@users_bp.route('/<id>/', methods=['GET'])
def get_user(id):
    try:
        user = mongo.db.users.find_one({'_id': ObjectId(id)})
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    except:
        return jsonify({'error': 'ID inválido'}), 400

@users_bp.route('/<id>', methods=['PUT'])
@users_bp.route('/<id>/', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    try:
        result = mongo.db.users.update_one({'_id': ObjectId(id)}, {'$set': data})
        if result.matched_count == 0:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        return jsonify({'message': 'Usuario actualizado'}), 200
    except:
        return jsonify({'error': 'ID inválido'}), 400

@users_bp.route('/<id>', methods=['DELETE'])
@users_bp.route('/<id>/', methods=['DELETE'])
def delete_user(id):
    try:
        result = mongo.db.users.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        return jsonify({'message': 'Usuario eliminado'}), 200
    except:
        return jsonify({'error': 'ID inválido'}), 400
