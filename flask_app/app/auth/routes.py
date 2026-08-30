from flask import flash, redirect, render_template, request, url_for
from flask_login import login_required, login_user, logout_user

from ..extensions import db
from ..models import User
from . import auth_bp


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            login_user(user)
            flash("Login realizado com sucesso.", "success")
            return redirect(url_for("dashboard.painel"))

        flash("Credenciais inválidas.", "error")

    return render_template("login.html", title="Login")


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Você saiu da sua conta.", "info")
    return redirect(url_for("site.index"))


@auth_bp.route("/cadastro", methods=["GET", "POST"])
def cadastro():
    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not nome or not email or not password:
            flash("Preencha todos os campos.", "error")
            return render_template("cadastro.html", title="Cadastro")

        if User.query.filter_by(email=email).first():
            flash("Este e-mail já está cadastrado.", "error")
            return render_template("cadastro.html", title="Cadastro")

        user = User(nome=nome, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash("Cadastro realizado com sucesso! Faça login.", "success")
        return redirect(url_for("auth.login"))

    return render_template("cadastro.html", title="Cadastro")
