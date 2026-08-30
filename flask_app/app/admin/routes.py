from flask import render_template
from flask_login import current_user, login_required

from ..models import CheckoutOrder, SupportMessage, User
from . import admin_bp


@admin_bp.route("/admin")
@login_required
def admin_home():
    users = User.query.order_by(User.created_at.desc()).all()
    orders = CheckoutOrder.query.order_by(CheckoutOrder.created_at.desc()).all()
    support_messages = SupportMessage.query.order_by(SupportMessage.created_at.desc()).all()

    return render_template(
        "admin/dashboard.html",
        title="Admin",
        user=current_user,
        users=users,
        orders=orders,
        support_messages=support_messages,
        stats={
            "usuarios": len(users),
            "pedidos": len(orders),
            "suporte": len(support_messages),
        },
    )
