from flask import render_template
from flask_login import current_user, login_required

from ..extensions import db
from ..models import CheckoutOrder, SupportMessage, User
from . import dashboard_bp


@dashboard_bp.route("/painel")
@login_required
def painel():
    stats = {
        "usuarios": User.query.count(),
        "pedidos": CheckoutOrder.query.count(),
        "suporte": SupportMessage.query.count(),
    }

    pedidos = CheckoutOrder.query.order_by(CheckoutOrder.created_at.desc()).limit(5).all()
    mensagens = SupportMessage.query.order_by(SupportMessage.created_at.desc()).limit(5).all()

    return render_template(
        "painel.html",
        title="Painel",
        user=current_user,
        stats=stats,
        pedidos=pedidos,
        mensagens=mensagens,
    )
