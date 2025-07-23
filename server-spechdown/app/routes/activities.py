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

# Utilidad para insertar actividad en DB
def save_activity(activity_dict):
    inserted = mongo.db.activities.insert_one(activity_dict)
    activity_dict["_id"] = str(inserted.inserted_id)
    activity_dict["created_by"] = str(activity_dict["created_by"])
    return activity_dict


# Obtener todas las actividades
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


# Crear una actividad manual
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


# Obtener una actividad por ID
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


# Actualizar una actividad por ID
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


# Eliminar una actividad por ID
@activities_bp.route('/<id>', methods=['DELETE'])
def delete_activity(id):
    try:
        result = mongo.db.activities.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Actividad no encontrada'}), 404
        return jsonify({'message': 'Actividad eliminada'}), 200
    except Exception:
        return jsonify({'error': 'ID inválido'}), 400


# GENERAR ACTIVIDAD IA: JUEGOS DE LECTURA
@activities_bp.route('/generate/reading', methods=['POST'])
def generate_reading_activity():
    data = request.get_json()
    age = data.get('age')
    therapist_id = data.get('therapist_id')
    length = data.get('length', 5)
    theme = data.get('theme', 'animales')

    if not age or not therapist_id:
        return jsonify({"error": "Faltan parámetros age y therapist_id"}), 400

    prompt = (
        f"Genera un cuento corto de {length} oraciones para un niño de {age} años, "
        f"con lenguaje sencillo y temática de {theme}, adecuado para terapia de lectura."
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un generador de cuentos terapéuticos para niños."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        content = response.choices[0].message.content.strip()
        activity = {
            "title": f"Cuento terapéutico ({theme})",
            "content": content,
            "type": "lectura",
            "created_by": ObjectId(therapist_id),
            "created_at": datetime.utcnow(),
            "is_ai_generated": True,
            "prompt": prompt
        }
        return jsonify(save_activity(activity)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# GENERAR ACTIVIDAD IA: JUEGOS DE PRONUNCIACIÓN
@activities_bp.route('/generate/pronunciation', methods=['POST'])
def generate_pronunciation_activity():
    data = request.get_json()
    age = data.get('age')
    therapist_id = data.get('therapist_id')
    syllable_type = data.get('syllable_type', 'fáciles')
    count = data.get('count', 10)

    if not age or not therapist_id:
        return jsonify({"error": "Faltan parámetros age y therapist_id"}), 400

    prompt = (
        f"Genera una lista de {count} palabras con sílabas {syllable_type} para un niño de {age} años "
        f"que practica pronunciación."
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un generador de palabras para ejercicios de pronunciación."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=150
        )
        content = response.choices[0].message.content.strip()
        activity = {
            "title": f"Ejercicio de pronunciación ({syllable_type})",
            "content": content,
            "type": "pronunciacion",
            "created_by": ObjectId(therapist_id),
            "created_at": datetime.utcnow(),
            "is_ai_generated": True,
            "prompt": prompt
        }
        return jsonify(save_activity(activity)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@activities_bp.route('/<id>/progress', methods=['POST'])
def save_progress(id):
    data = request.get_json()
    try:
        progress = {
            "activity_id": ObjectId(id),
            "notes": data.get("notes", ""),
            "completed": data.get("completed", False),
            "created_at": datetime.utcnow()
        }
        mongo.db.activity_progress.insert_one(progress)
        return jsonify({"message": "Progreso guardado"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400



# GENERAR ACTIVIDAD IA: JUEGOS DE COMPRENSIÓN
@activities_bp.route('/generate/comprehension', methods=['POST'])
def generate_comprehension_activity():
    data = request.get_json()
    age = data.get('age')
    therapist_id = data.get('therapist_id')
    question_count = data.get('question_count', 3)
    theme = data.get('theme', 'cotidiana')

    if not age or not therapist_id:
        return jsonify({"error": "Faltan parámetros age y therapist_id"}), 400

    prompt = (
        f"Genera un texto corto de 3-4 oraciones sobre una situación {theme} para un niño de {age} años, "
        f"seguido de {question_count} preguntas de comprensión con respuestas."
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un generador de ejercicios de comprensión lectora para niños."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=400
        )
        content = response.choices[0].message.content.strip()
        activity = {
            "title": f"Comprensión lectora ({theme})",
            "content": content,
            "type": "comprension",
            "created_by": ObjectId(therapist_id),
            "created_at": datetime.utcnow(),
            "is_ai_generated": True,
            "prompt": prompt
        }
        return jsonify(save_activity(activity)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
