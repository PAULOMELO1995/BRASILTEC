from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from ..extensions import db
from ..models import CheckoutOrder
from . import checkout_bp


@checkout_bp.route("/checkout", methods=["GET", "POST"])
@login_required
def checkout():
    if request.method == "POST":
        order = CheckoutOrder(
            user_id=current_user.id,
            produto="Plano Brasiltec",
            valor=99.0,
            status="pendente",
        )
        db.session.add(order)
        db.session.commit()
        flash("Pedido realizado com sucesso. Status: pendente.", "success")
        return redirect(url_for("dashboard.painel"))

    return render_template("checkout.html", title="Checkout", user=current_user)
