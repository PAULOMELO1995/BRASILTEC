from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user

from ..extensions import db
from ..models import SupportMessage
from . import suporte_bp


@suporte_bp.route("/suporte", methods=["GET", "POST"])
def suporte():
    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        email = request.form.get("email", "").strip().lower()
        mensagem = request.form.get("mensagem", "").strip()

        if not nome or not email or not mensagem:
            flash("Preencha nome, e-mail e mensagem.", "error")
            return render_template("suporte.html", title="Suporte")

        support_message = SupportMessage(
            user_id=current_user.id if current_user.is_authenticated else None,
            nome=nome,
            email=email,
            mensagem=mensagem,
        )
        db.session.add(support_message)
        db.session.commit()
        flash("Mensagem enviada com sucesso. Nossa equipe responderá em breve.", "success")
        return redirect(url_for("suporte.suporte"))

    return render_template("suporte.html", title="Suporte")
