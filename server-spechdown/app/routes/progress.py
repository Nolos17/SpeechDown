from flask import Blueprint, request, jsonify
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/', methods=['GET'])
def get_progress():
    items = mongo.db.progress.find()
    result = []
    for p in items:
        p['_id'] = str(p['_id'])
        p['child_id'] = str(p['child_id'])
        p['activity_id'] = str(p['activity_id'])
        p['therapist_id'] = str(p['therapist_id'])
        result.append(p)
    return jsonify(result), 200

@progress_bp.route('/', methods=['POST'])
def create_progress():
    data = request.get_json()
    required = ['child_id', 'activity_id', 'therapist_id']
    if not all(key in data for key in required):
        return jsonify({'error': f'{required} son requeridos'}), 400

    try:
        # Opcional: Validar que child_id pertenece a therapist_id
        child = mongo.db.children.find_one({'_id': ObjectId(data['child_id']), 'therapist_id': ObjectId(data['therapist_id'])})
        if not child:
            return jsonify({'error': 'El niño no está asociado a ese terapeuta'}), 400

        progress = {
            'child_id': ObjectId(data['child_id']),
            'activity_id': ObjectId(data['activity_id']),
            'therapist_id': ObjectId(data['therapist_id']),
            'score': data.get('score', 0),
            'date': datetime.utcnow(),
            'notes': data.get('notes', '')
        }
        inserted = mongo.db.progress.insert_one(progress)
        return jsonify({'_id': str(inserted.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': 'ID inválido o error interno'}), 400

@progress_bp.route('/<id>', methods=['GET'])
def get_progress_item(id):
    try:
        item = mongo.db.progress.find_one({'_id': ObjectId(id)})
        if not item:
            return jsonify({'error': 'Registro no encontrado'}), 404
        item['_id'] = str(item['_id'])
        item['child_id'] = str(item['child_id'])
        item['activity_id'] = str(item['activity_id'])
        item['therapist_id'] = str(item['therapist_id'])
        return jsonify(item), 200
    except:
        return jsonify({'error': 'ID inválido'}), 400

@progress_bp.route('/<id>', methods=['PUT'])
def update_progress(id):
    data = request.get_json()
    try:
        if 'child_id' in data:
            data['child_id'] = ObjectId(data['child_id'])
        if 'activity_id' in data:
            data['activity_id'] = ObjectId(data['activity_id'])
        if 'therapist_id' in data:
            data['therapist_id'] = ObjectId(data['therapist_id'])
        result = mongo.db.progress.update_one({'_id': ObjectId(id)}, {'$set': data})
        if result.matched_count == 0:
            return jsonify({'error': 'Registro no encontrado'}), 404
        return jsonify({'message': 'Registro actualizado'}), 200
    except:
        return jsonify({'error': 'ID inválido o error de datos'}), 400

@progress_bp.route('/<id>', methods=['DELETE'])
def delete_progress(id):
    try:
        result = mongo.db.progress.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Registro no encontrado'}), 404
        return jsonify({'message': 'Registro eliminado'}), 200
    except:
        return jsonify({'error': 'ID inválido'}), 400
