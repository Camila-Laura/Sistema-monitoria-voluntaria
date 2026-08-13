from sqlalchemy import Column, Integer, String, ForeignKey, Date
from flask_login import UserMixin
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


class Administrador(Base, UserMixin):
    __tablename__ = "administradores"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    cargo = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha = Column(String(50), nullable=False)


class Voluntario(Base):
    __tablename__ = "voluntarios"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    disponibilidade =  Column(String(300), nullable=False)
    data = Column(Date, nullable=False)
    data_final = Column(Date, nullable=False)
    dias_disponivel = Column(String(50), nullable=False)
    tipo_apoio =  Column(String(300), nullable=False)
    email = Column(String(50), unique=True, nullable=False)

class Solicitante(Base):
    __tablename__ = "solicitantes"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=True)
    dificuldade = Column(String(300), nullable=True)  
    data = Column(Date, nullable=False)
    dias_disponivel = Column(String(50), nullable=False)
    horario_disponivel = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)

class Atendimento(Base):
    __tablename__ = "atendimentos"
    id = Column(Integer, primary_key=True)
    voluntario_id = Column(Integer, ForeignKey("voluntarios.id"))
    solicitante_id = Column(Integer, ForeignKey("solicitantes.id"))
    voluntario = relationship("Voluntario")
    solicitante = relationship("Solicitante")
    status = Column(String(20), nullable=False, default="pendente")