from time import time
from __init__ import db, login_manager, app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime
import math

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    # columns
    id       = db.Column(db.Integer, primary_key = True)
    email    = db.Column(db.String(64),unique=True, index=True)
    username = db.Column(db.String(64),unique=True, index=True)
    password_hash = db.Column(db.String(128))
    cash = db.Column(db.Integer)
    def __init__(self, email, username, password):
        """初始化"""
        self.email = email
        self.username = username
        # 實際存入的為password_hash，而非password本身
        self.password_hash = generate_password_hash(password)
        self.cash = 1000000
    
    def check_password(self, password):
        """檢查使用者密碼"""
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

class transactions(db.Model):
    __tablename__ = 'transactions'
    
    # columns
    id       = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer)
    stock_no = db.Column(db.String(64))
    stock_name = db.Column(db.String(64))
    shares = db.Column(db.Integer)
    price = db.Column(db.Float)
    fee = db.Column(db.Integer)
    tax = db.Column(db.Integer)
    total = db.Column(db.Integer)
    etl_date = db.Column(db.String(64))
    def __init__(self, user_id, stock_no, stock_name, shares, price, fee, tax, total):
        """初始化"""
        self.user_id = user_id
        self.stock_no = stock_no
        self.stock_name = stock_name
        self.shares = shares
        self.price = price
        self.fee = fee
        self.tax = tax
        self.total = total
        now = datetime.now() 
        self.etl_date = datetime.strftime(now,'%Y-%m-%d %H:%M:%S')

with app.app_context():
    db.create_all()