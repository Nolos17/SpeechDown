from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
import config

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config["MONGO_URI"] = config.MONGO_URI
    mongo.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Importar y registrar blueprints DESPUÉS de configurar mongo
    from .routes.users import users_bp
    from .routes.activities import activities_bp
    from .routes.progress import progress_bp
    from .routes.children import children_bp
    from .routes.tts import tts_bp

    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(children_bp, url_prefix='/api/children')
    app.register_blueprint(activities_bp, url_prefix="/api/activities")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")
    app.register_blueprint(tts_bp, url_prefix="/api/tts")

    return app
