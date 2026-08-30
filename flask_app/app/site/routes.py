from flask import render_template
from . import site_bp


@site_bp.route("/")
def index():
    return render_template("index.html", title="Brasiltec")


@site_bp.route("/health")
def health():
    return {"status": "ok"}
