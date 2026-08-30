from flask import Flask
from .config import Config
from .extensions import db, login_manager
from .models import User


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"

    with app.app_context():
        db.create_all()

    from .site.routes import site_bp
    from .auth.routes import auth_bp
    from .dashboard.routes import dashboard_bp
    from .suporte.routes import suporte_bp
    from .checkout.routes import checkout_bp
    from .admin.routes import admin_bp

    app.register_blueprint(site_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(suporte_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(admin_bp)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    return app
