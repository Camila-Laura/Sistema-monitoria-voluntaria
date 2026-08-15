from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
from datetime import datetime
from flask_login import login_required, logout_user, login_user, current_user
from flask import abort
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Voluntario, Administrador, Solicitante, Atendimento
from flask_login import LoginManager
import hashlib

app = Flask(__name__)
CORS(app)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

app.secret_key = "camila_1098765rt2893"
engine = create_engine("sqlite:///database.db")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
db_session = Session()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"



@app.route("/")
def home():
    ids_atendidos = []
    for a in db_session.query(Atendimento).all():
        ids_atendidos.append(a.solicitante_id)

    pendentes = db_session.query(Solicitante).filter(Solicitante.id.notin_(ids_atendidos)).all()
    
    
    total_voluntarios = db_session.query(Voluntario).count()
    total_solicitantes = db_session.query(Solicitante).count()
    total_conexoes = db_session.query(Atendimento).count()

    return render_template(
        "index.html",
        pendentes=pendentes,
        total_voluntarios=total_voluntarios,
        total_solicitantes=total_solicitantes,
        total_conexoes=total_conexoes
    )
    # return render_template("index.html")

@app.route("/login", methods=["GET"])
def tela_login():
    admin_existente = db_session.query(Administrador).first() is not None
    return render_template("login.html", admin_existente=admin_existente)

def hash(txt):
    hash_objeto = hashlib.sha256(txt.encode('utf-8'))
    return hash_objeto.hexdigest()



# ------------------------função para identificar se o admin está logado no sistema -------------------------------------------
@login_manager.user_loader
def load_user(user_id):
    return db_session.query(Administrador).get(int(user_id))
    
@app.route("/login", methods=["POST"])
def login():
    dados = request.get_json() #pegar dados enviados pelo frontend
    email = dados.get("email")
    senha = dados.get("senha")

    admin = db_session.query(Administrador).filter_by(email=email).first()

    if admin and admin.senha == hash(senha):
        login_user(admin)
        return jsonify({"sucesso": True})
    else:
        return jsonify({"erro": "E-mail ou senha inválidos"}), 401

# ------------------------------------rotas web------------------------------------------------------------
@app.route('/sair')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))
    
@app.route("/admin")
@login_required
def painel_admin():
    ids_atendidos = []
    for a in db_session.query(Atendimento).all():
        ids_atendidos.append(a.solicitante_id)

    pendentes = db_session.query(Solicitante).filter(Solicitante.id.notin_(ids_atendidos)).all()
    
    
    total_voluntarios = db_session.query(Voluntario).count()
    total_solicitantes = db_session.query(Solicitante).count()
    total_conexoes = db_session.query(Atendimento).count()

    return render_template(
        "painel_admin.html",
        pendentes=pendentes,
        total_voluntarios=total_voluntarios,
        total_solicitantes=total_solicitantes,
        total_conexoes=total_conexoes
    )

@app.route("/admin/formulario-voluntario")
@app.route("/formulario-voluntario") 
def tela_cadastro_voluntario():
    return render_template("formulario_voluntario.html")

@app.route("/admin/formulario-admin")
def formulario_admin():
    return render_template("formulario_admin.html")

@app.route("/admin/formulario-solicitante")
@app.route("/formulario-solicitante") 
def formulario_solicitante():
    return render_template("formulario_solicitante.html")

@app.route("/dados-voluntario")
def tabela_voluntario():
    return render_template("tabela_voluntario.html")

@app.route("/admin/dados-solicitante")
def tabela_solicitante():
    return render_template("tabela_solicitante.html")

@app.route("/admin/atendimentos")
def tabela_atendimentos():
    return render_template("tabela_atendimento.html")

@app.route("/admin/Como-funciona")
def como_funciona():
    return render_template("como_funciona.html")


#----------------------  Rotas do Administrador --------------------------------------
@app.route("/cadastro-administrador", methods=["POST"])
def criar_admin():
    try:
        if db_session.query(Administrador).first():
            return jsonify({"message": "Já existe um administrador cadastrado!"}), 400
        data = request.get_json() 

        admin = Administrador(
            nome=data["nome"],
            cargo=data["cargo"],
            email=data["email"],
            senha=hash(data["senha"])
        )
        db_session.add(admin)
        db_session.commit()
        return jsonify({"message": "Administrador criado com sucesso!"})
    
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao criar administrador: {str(e)}"}), 500

# ------------------------- Deletar Conta do Admin ----------------------------------------------

@app.route("/api/admin/me", methods=["DELETE"])
@login_required
def deletar_conta_admin():
    a = db_session.query(Administrador).get(current_user.id)
    if not a:
        return jsonify({"erro": "Administrador não encontrado"}), 404

    db_session.delete(a)
    db_session.commit()
    logout_user()

    return jsonify({"message": "Conta do administrador deletada!"})


#------------------------ Rotas do Solicitante ----------------------------------------
# ------------------------- Criar solicitante ----------------------------------------
@app.route("/solicitante", methods=["POST"])
def criar_solicitante():
    try:
        data = request.get_json()
        data_convertida = datetime.strptime(data["data"], "%Y-%m-%d").date()
        
        solicitante = Solicitante(
            nome=data["nome"],
            dificuldade=data["dificuldade"],
            data=data_convertida,
            dias_disponivel=data["dias_disponivel"],
            horario_disponivel=data["horario_disponivel"],
            email=data["email"]
        )
        db_session.add(solicitante)
        db_session.commit()
        return jsonify({"message": "Solicitante criado com sucesso!", "redirect": "/"})
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao cadastrar solicitante: {str(e)}"}), 500


# ------------------------- Listar solicitante ----------------------------------------
@app.route("/admin/solicitante", methods=["GET"])
def listar_solicitante():
    try:
        solicitante = db_session.query(Solicitante).all()
        return jsonify([
            {
                "id": s.id,
                "nome": s.nome,
                "dificuldade": s.dificuldade,
                "data": s.data.strftime("%d/%m/%Y") if s.data else None,
                "dias_disponivel": s.dias_disponivel,
                "horario_disponivel": s.horario_disponivel,
                "email": s.email
            }
            for s in solicitante
        ])
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao listar dados do solicitante: {str(e)}"}), 500
  
# ------------------------- Atualizar solicitante ----------------------------------------   
@app.route("/admin/solicitante/<int:id>", methods=["PUT"])
def atualizar_dados_solicitante(id):
    try:
        s = db_session.query(Solicitante).get(id)
        if not s:
            return jsonify({"erro": "Solicitante não encontrado"}), 404
        data = request.get_json()
        s.nome = data.get("nome", s.nome)
        s.email = data.get("email", s.email)
        s.dificuldade = data.get("materia", s.dificuldade)

        nova_data = data.get("data")
        if nova_data:
            s.data = datetime.strptime(nova_data, "%d/%m/%Y").date()
            
        s.dias_disponivel = data.get("dia", s.dias_disponivel)
        s.horario_disponivel = data.get("horario", s.horario_disponivel)
        db_session.commit()
        return jsonify({"message": "Solicitante atualizado!"})
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao atualizar dados do solicitante: {str(e)}"}), 500

# ------------------------- Deletar solicitante ----------------------------------------
@app.route("/admin/solicitante/<int:id>", methods=["DELETE"])
def deletar_dados_solicitante(id):
    try:
        u = db_session.query(Solicitante).get(id)
        if not u:
            return jsonify({"erro": "Solicitante não encontrado"}), 404

        db_session.query(Atendimento).filter(Atendimento.solicitante_id == id).delete()
        db_session.delete(u)
        db_session.commit()
        return jsonify({"message": "Solicitante deletado!"})
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao deletar solicitante: {str(e)}"}), 500


#-------------------------------------- rotas do voluntario --------------------------------
# ------------------------- Criar voluntario ----------------------------------------------
@app.route("/voluntarios", methods=["POST"])
def add_voluntario():
    try:
        data = request.get_json()
        data_convertida = datetime.strptime(data["data"], "%Y-%m-%d").date()
        data_final_convertida = datetime.strptime(data["data_final"], "%Y-%m-%d").date()
        
        novo = Voluntario(
        nome=data["nome"],
        disponibilidade=data["disponibilidade"],
        data=data_convertida,
        data_final=data_final_convertida,
        dias_disponivel=data["dias_disponivel"],
        tipo_apoio=data["tipo_apoio"],
        email=data["email"]
    )
        db_session.add(novo)
        db_session.commit()
        return jsonify({"message": "Voluntário criado com sucesso!", "redirect": "/"})
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": "Erro ao cadastrar voluntário: {str(e)}"}), 500
    

# ------------------------- Listar voluntario ----------------------------------------------
@app.route("/voluntarios", methods=["GET"])
def listar_voluntarios():
    try:
        voluntarios = db_session.query(Voluntario).all()
        return jsonify([
            {
                "id": v.id,
                "nome": v.nome,
                "disponibilidade": v.disponibilidade,
                "data": v.data.strftime("%d/%m/%Y") if v.data else None,
                "data_final": v.data_final.strftime("%d/%m/%Y") if v.data_final else None,
                "dias_disponivel": v.dias_disponivel,
                "tipo_apoio": v.tipo_apoio,
                "email": v.email
            }
            for v in voluntarios
        ])
        
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao listar voluntários: {str(e)}"}), 500

# ------------------------- Buscar voluntario ----------------------------------------------
@app.route("/voluntarios/<int:id>", methods=["GET"])
def buscar_voluntario(id):
    try:
        v = db_session.query(Voluntario).get(id)
        if not v:
            return jsonify({"erro": "Não encontrado"}), 404

        return jsonify({
            "id": v.id,
            "nome": v.nome,
            "disponibilidade": v.disponibilidade,
            "data": v.data,
            "data_final": v.data_final,
            "dias_disponivel": v.dias_disponivel,
            "tipo_apoio": v.tipo_apoio,
            "email": v.email
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao buscar voluntário: {str(e)}"}), 500
    
# ------------------------- Atualizar voluntario ----------------------------------------------
@app.route("/admin/voluntarios/<int:id>", methods=["PUT"])
def atualizar_dados_voluntario(id):
    try: 
        u = db_session.query(Voluntario).get(id)
        if not u:
            return jsonify({"erro": "Voluntário não encontrado"}), 404
        data = request.get_json()

        u.nome = data.get("nome", u.nome)
        u.email = data.get("email", u.email)
        u.tipo_apoio = data.get("materia", u.tipo_apoio)       
        u.disponibilidade = data.get("horario", u.disponibilidade)
        u.dias_disponivel = data.get("dia", u.dias_disponivel)

        nova_data = data.get("data")
        if nova_data:
            u.data = datetime.strptime(nova_data, "%d/%m/%Y").date()

        nova_data_final = data.get("data_final")
        if nova_data:
            u.data_final = datetime.strptime(nova_data_final, "%d/%m/%Y").date()
        db_session.commit()
        
        return jsonify({"message": "Voluntario atualizado!"})
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao atualizar voluntário: {str(e)}"}), 500

# ------------------------- deletar voluntario ----------------------------------------------
@app.route("/admin/voluntarios/<int:id>", methods=["DELETE"])
def deletar_dados_voluntario(id):
    try:
        u = db_session.query(Voluntario).get(id)
        if not u:
            return jsonify({"erro": "Voluntário não encontrado"}), 404
        db_session.delete(u)
        db_session.commit()
        return jsonify({"message": "Voluntario deletado!"})
    
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao deletar voluntário: {str(e)}"}), 500

# ------------------------- Rotas Atendimento ----------------------------------------------
# ------------------------- Listar Atendimento ----------------------------------------------
@app.route("/api/atendimentos", methods=["GET"])
def listar_atendimentos():
    atendimentos = db_session.query(Atendimento).all()

    lista = []
    for a in atendimentos:
        dias_comuns = None

        if a.voluntario and a.solicitante:
            dias_voluntario = a.voluntario.dias_disponivel.split(",")
            dias_solicitante = a.solicitante.dias_disponivel.split(",")

            lista_comum = []
            for dia in dias_voluntario:
                dia_limpo = dia.strip()
                for outro_dia in dias_solicitante:
                    if dia_limpo == outro_dia.strip():
                        lista_comum.append(dia_limpo)

            if len(lista_comum) > 0:
                dias_comuns = ""
                for i in range(len(lista_comum)):
                    dias_comuns += lista_comum[i]
                    if i < len(lista_comum) - 1:
                        dias_comuns += ", "

        lista.append({
            "id": a.id,
            "voluntario_id": a.voluntario_id,
            "voluntario_nome": a.voluntario.nome if a.voluntario else None,
            "solicitante_id": a.solicitante_id,
            "solicitante_nome": a.solicitante.nome if a.solicitante else None,
            "dias_disponivel": dias_comuns,
            "status": a.status
        })
    return jsonify(lista)

# ------------------------- Criar Atendimento ----------------------------------------------
@app.route("/api/atendimentos", methods=["POST"])
def criar_atendimento():
    try:
        data = request.get_json()
        voluntario = db_session.query(Voluntario).get(data["voluntario_id"])
        solicitante = db_session.query(Solicitante).get(data["solicitante_id"])
        if not voluntario:
            return jsonify({"message": "ID do voluntário não encontrado"}),404
        if not solicitante:
            return jsonify({"message": "ID do solicitante não encontrado"}),404
        
        atendimento = Atendimento(
            voluntario_id=data["voluntario_id"],
            solicitante_id=data["solicitante_id"]
        )

        db_session.add(atendimento)
        db_session.commit()
        return jsonify({"message": "Atendimento criado com sucesso!"})
        
    except Exception as e:
        db_session.rollback()
        return jsonify({"erro": f"Erro ao criar atendimento: {str(e)}"}), 500

# ---------------------- rota para mudar o status--------------------------------------------
# ---------------------- rota para mudar o status--------------------------------------------
@app.route("/atender/<int:id>/<status>", methods=["PUT"])
@login_required
def atender(id, status):
    status_validos = ["em andamento", "atendido"]
    if status not in status_validos:
        return jsonify({"erro": "Status inválido"}), 400

    atendimento = db_session.query(Atendimento).get(id)
    if not atendimento:
        return jsonify({"erro": "Atendimento não encontrado"}), 404

    atendimento.status = status
    db_session.commit()
    return jsonify({"message": f"Atendimento marcado como {status}!"})

def buscar_solicitacoes_pendentes():
    return db_session.query(Atendimento).filter_by(status="pendente").all()

# ------------------------- Deletar Atendimento ----------------------------------------------
@app.route("/api/atendimentos/<int:id>", methods=["DELETE"])
def deletar_atendimento(id):
    a = db_session.query(Atendimento).get(id)
    if not a:
        return jsonify({"erro": "Atendimento não encontrado"}), 404
    db_session.delete(a)
    db_session.commit()
    return jsonify({"message": "Atendimento deletado!"})

if __name__ == "__main__":
    app.run(debug=True)