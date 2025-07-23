# routes/tts.py

from flask import Blueprint, request, send_file, jsonify
from gtts import gTTS
import io

tts_bp = Blueprint('tts', __name__)

@tts_bp.route('/hablar', methods=['GET', 'POST'])
def hablar():
    texto = None
    if request.method == 'POST':
        json_data = request.get_json()
        if json_data and 'texto' in json_data:
            texto = json_data['texto']
    
    if texto is None:
        texto = request.args.get('texto', request.form.get('texto', "Hola, ¿cómo estás?"))

    if not texto:
        return jsonify({'error': 'Por favor, proporciona texto para convertir a voz.'}), 400

    try:
        # Generar audio con gTTS
        tts = gTTS(text=texto, lang='es')
        buffer_audio = io.BytesIO()
        tts.write_to_fp(buffer_audio)
        buffer_audio.seek(0)

        return send_file(buffer_audio, mimetype='audio/mpeg', as_attachment=False, download_name='voz.mp3')

    except Exception as e:
        print(f"Error durante la generación de contenido de voz con gTTS: {e}")
        return jsonify({'error': f'Ocurrió un error al generar la voz: {str(e)}'}), 500
