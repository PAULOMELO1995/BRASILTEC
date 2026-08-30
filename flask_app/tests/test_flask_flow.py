from app import create_app
from app.extensions import db
from app.models import CheckoutOrder, SupportMessage, User


def test_main_flows():
    app = create_app()
    app.config.update(TESTING=True, WTF_CSRF_ENABLED=False)

    with app.app_context():
        db.drop_all()
        db.create_all()

    with app.test_client() as client:
        response = client.get('/')
        assert response.status_code == 200

        response = client.get('/login')
        assert response.status_code == 200

        response = client.post('/cadastro', data={
            'nome': 'Maria',
            'email': 'maria@test.com',
            'password': '123456'
        }, follow_redirects=True)
        assert response.status_code == 200

        response = client.post('/login', data={
            'email': 'maria@test.com',
            'password': '123456'
        }, follow_redirects=True)
        assert response.status_code == 200

        response = client.get('/painel')
        assert response.status_code == 200

        response = client.post('/suporte', data={
            'nome': 'Maria',
            'email': 'maria@test.com',
            'mensagem': 'Preciso de ajuda com acesso.'
        }, follow_redirects=True)
        assert response.status_code == 200

        response = client.post('/checkout', follow_redirects=True)
        assert response.status_code == 200

    with app.app_context():
        assert User.query.count() == 1
        assert SupportMessage.query.count() == 1
        assert CheckoutOrder.query.count() == 1
