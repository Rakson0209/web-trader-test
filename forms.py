from flask_wtf import FlaskForm
from wtforms.fields import  StringField, PasswordField, SubmitField, HiddenField, IntegerField
from wtforms.validators import DataRequired, Email, EqualTo, NumberRange
from wtforms import ValidationError
from models import User

class LoginForm(FlaskForm):
    email = StringField('電子郵件', validators=[DataRequired(), Email()])
    password = PasswordField('密碼',validators=[DataRequired()])
    submit = SubmitField('登入系統')

class RegistrationForm(FlaskForm):
    email = StringField('電子郵件', validators=[DataRequired(), Email()])
    username = StringField('使用者', validators=[DataRequired()])
    password = PasswordField('密碼', validators=[DataRequired(), EqualTo('pasw_confirm', message='密碼需要吻合')])
    pasw_confirm = PasswordField('確認密碼', validators=[DataRequired()])
    submit = SubmitField('註冊')

    def validate_email(self, field):
        """檢查Email"""
        if User.query.filter_by(email=field.data).first():
            raise ValidationError('電子郵件已經被註冊過了')
    def validate_username(self, field):
        """檢查username"""
        if User.query.filter_by(username=field.data).first():
            raise ValidationError('使用者名稱已經存在')

class stock_tradingForm(FlaskForm):
    stock_no = HiddenField('stock_no', render_kw={'id':'stock_no'})
    stock_name = HiddenField('stock_name', render_kw={'id':'stock_name'})
    shares = IntegerField('數量', validators=[DataRequired(), NumberRange(min=1)], render_kw={'autocomplete':'off','autofocus':'True','placeholder':'數量'})
    buy = SubmitField('買入')
    sell = SubmitField('賣出')