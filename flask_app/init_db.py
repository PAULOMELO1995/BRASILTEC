from app import create_app
from app.extensions import db
from app.models import User


app = create_app()

with app.app_context():
    db.create_all()

    admin = User.query.filter_by(email="admin@brasiltec.local").first()
    if admin is None:
        admin = User(nome="Admin Brasiltec", email="admin@brasiltec.local")
        admin.set_password("123456")
        db.session.add(admin)
        db.session.commit()

    print("DB_OK")
    print("USER_COUNT", User.query.count())
    print("ADMIN_EMAIL", admin.email)
