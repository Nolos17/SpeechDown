from flask import Blueprint, request, jsonify
from app import mongo
from bson.objectid import ObjectId

children_bp = Blueprint('children', __name__)

@children_bp.route('/', methods=['GET'])
def get_children():
    children = mongo.db.children.find()
    result = []
    for c in children:
        c['_id'] = str(c['_id'])
        c['parent_id'] = str(c['parent_id'])
        c['therapist_id'] = str(c['therapist_id'])
        result.append(c)
    return jsonify(result), 200

@children_bp.route('/', methods=['POST'])
def create_child():
    data = request.get_json()
    required = ['name', 'parent_id', 'therapist_id']
    if not all(key in data for key in required):
        return jsonify({'error': f'{required} son requeridos'}), 400

    try:
        child = {
            'name': data['name'],
            'age': data.get('age', 0),
            'diagnosis': data.get('diagnosis', ''),
            'parent_id': ObjectId(data['parent_id']),
            'therapist_id': ObjectId(data['therapist_id']),
            'notes': data.get('notes', '')
        }
        inserted = mongo.db.children.insert_one(child)
        return jsonify({'_id': str(inserted.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': 'IDs inválidos o error interno'}), 400

@children_bp.route('/<id>', methods=['GET'])
def get_child(id):
    try:
        child = mongo.db.children.find_one({'_id': ObjectId(id)})
        if not child:
            return jsonify({'error': 'Niño no encontrado'}), 404
        child['_id'] = str(child['_id'])
        child['parent_id'] = str(child['parent_id'])
        child['therapist_id'] = str(child['therapist_id'])
        return jsonify(child), 200
    except:
        return jsonify({'error': 'ID inválido'}), 400

@children_bp.route('/<id>', methods=['PUT'])
def update_child(id):
    data = request.get_json()
    try:
        if 'parent_id' in data:
            data['parent_id'] = ObjectId(data['parent_id'])
        if 'therapist_id' in data:
            data['therapist_id'] = ObjectId(data['therapist_id'])
        result = mongo.db.children.update_one({'_id': ObjectId(id)}, {'$set': data})
        if result.matched_count == 0:
            return jsonify({'error': 'Niño no encontrado'}), 404
        return jsonify({'message': 'Niño actualizado'}), 200
    except:
        return jsonify({'error': 'ID inválido o error de datos'}), 400

@children_bp.route('/<id>', methods=['DELETE'])
def delete_child(id):
    try:
        result = mongo.db.children.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Niño no encontrado'}), 404
        return jsonify({'message': 'Niño eliminado'}), 200
    except:
        return jsonify({'error': 'ID inválido'}), 400
