from flask import Blueprint, request, jsonify
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime
from openai import OpenAI
import os

activities_bp = Blueprint('activities', __name__)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)
# --------------------------------------------
# Obtener todas las actividades
# --------------------------------------------
@activities_bp.route('/', methods=['GET'])
def get_activities():
    try:
        activities = mongo.db.activities.find()
        result = []
        for a in activities:
            a['_id'] = str(a['_id'])
            a['created_by'] = str(a['created_by'])
            result.append(a)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --------------------------------------------
# Crear una actividad manual
# --------------------------------------------
@activities_bp.route('/', methods=['POST'])
def create_activity():
    data = request.get_json()
    required = ['title', 'content', 'created_by']
    if not all(key in data for key in required):
        return jsonify({'error': f'Los campos {required} son requeridos'}), 400
    try:
        activity = {
            'title': data['title'],
            'content': data['content'],
            'created_by': ObjectId(data['created_by']),
            'created_at': datetime.utcnow(),
            'is_ai_generated': data.get('is_ai_generated', False),
            'prompt': data.get('prompt', '')
        }
        inserted = mongo.db.activities.insert_one(activity)
        return jsonify({'_id': str(inserted.inserted_id)}), 201
    except Exception:
        return jsonify({'error': 'ID inválido o error interno'}), 400


# --------------------------------------------
# Obtener una actividad por ID
# --------------------------------------------
@activities_bp.route('/<id>', methods=['GET'])
def get_activity(id):
    try:
        activity = mongo.db.activities.find_one({'_id': ObjectId(id)})
        if not activity:
            return jsonify({'error': 'Actividad no encontrada'}), 404
        activity['_id'] = str(activity['_id'])
        activity['created_by'] = str(activity['created_by'])
        return jsonify(activity), 200
    except Exception:
        return jsonify({'error': 'ID inválido'}), 400


# --------------------------------------------
# Actualizar una actividad por ID
# --------------------------------------------
@activities_bp.route('/<id>', methods=['PUT'])
def update_activity(id):
    data = request.get_json()
    try:
        if 'created_by' in data:
            data['created_by'] = ObjectId(data['created_by'])
        result = mongo.db.activities.update_one({'_id': ObjectId(id)}, {'$set': data})
        if result.matched_count == 0:
            return jsonify({'error': 'Actividad no encontrada'}), 404
        return jsonify({'message': 'Actividad actualizada'}), 200
    except Exception:
        return jsonify({'error': 'ID inválido o error de datos'}), 400


# --------------------------------------------
# Eliminar una actividad por ID
# --------------------------------------------
@activities_bp.route('/<id>', methods=['DELETE'])
def delete_activity(id):
    try:
        result = mongo.db.activities.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Actividad no encontrada'}), 404
        return jsonify({'message': 'Actividad eliminada'}), 200
    except Exception:
        return jsonify({'error': 'ID inválido'}), 400


# --------------------------------------------
# Generar una actividad usando IA (OpenRouter)
# --------------------------------------------
@activities_bp.route('/generate', methods=['POST'])
def generate_activity():
    data = request.get_json()

    child_age = data.get('child_age')
    task_type = data.get('task_type')
    syllable_type = data.get('syllable_type')
    therapist_id = data.get('therapist_id')

    if not child_age or not task_type or not syllable_type or not therapist_id:
        return jsonify({"error": "Faltan parámetros necesarios"}), 400

    prompt = (
        f"Genera una {task_type} de 5 oraciones con palabras con sílabas {syllable_type} "
        f"para un niño de {child_age} años, enfocada en terapia de habla para Síndrome de Down."
    )

    try:
        # Nueva forma de llamar a la API
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",  # puedes cambiar modelo si quieres
            messages=[
                {"role": "system", "content": "Eres un generador de ejercicios de terapia de habla para niños con síndrome de Down."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )

        content = response.choices[0].message.content.strip()

        activity = {
            "title": f"{task_type.capitalize()} terapéutica para {child_age} años",
            "content": content,
            "created_by": ObjectId(therapist_id),
            "created_at": datetime.utcnow(),
            "is_ai_generated": True,
            "prompt": prompt
        }

        inserted = mongo.db.activities.insert_one(activity)
        activity["_id"] = str(inserted.inserted_id)
        activity["created_by"] = therapist_id

        return jsonify(activity), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500