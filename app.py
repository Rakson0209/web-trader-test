from flask import render_template, redirect, request, url_for, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from __init__ import app, db, stock_crawler, stock_crawler_all
from models import User, transactions
from forms import LoginForm, RegistrationForm, stock_tradingForm
from sqlalchemy import func
import math
import json

@app.route('/taiwan_stock_tick_snapshot',methods=['GET','POST'])
def taiwan_stock_tick_snapshot():
    return stock_crawler(request.args.get('data_id'))

@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route("/dashboard")
@login_required
def dashboard():
    array = {}
    price_of_shares = {}
    stocks = transactions.query.with_entities(transactions.stock_no, transactions.stock_name, func.sum(transactions.shares).label('sumofshares'), func.sum(transactions.total).label('sumoftotal')).filter_by(user_id=current_user.id).group_by(transactions.stock_no, transactions.stock_name).having(func.sum(transactions.shares)>0)
    remaining_cash = current_user.cash
    total = remaining_cash
    res = stock_crawler_all()
    for stock in stocks:
        stock_price = res.loc[stock.stock_no]['price']
        array[stock.stock_no] = stock_price
        fee = math.floor(stock_price*stock.sumofshares*0.001425*0.28)
        fee = fee if fee > 0 else 1
        tax = math.floor(stock_price*stock.sumofshares*0.003)
        tax = tax if tax > 0 else 1
        price_of_shares[stock.stock_no] = math.floor(stock_price*stock.sumofshares) - fee - tax
        total += price_of_shares[stock.stock_no]

    return render_template('dashboard.html', array=array, stocks=stocks, remaining_cash=remaining_cash, total=total, price_of_shares=price_of_shares)

@app.route("/technical_analysis")
@login_required
def technical_analysis():
    f = open('twstock_info.json', encoding='utf-8')
    data = json.load(f)
    f.close()
    return render_template('technical_analysis.html', data=data)

@app.route("/stock_trading",methods=['GET','POST'])
@login_required
def stock_trading():
    f = open('twstock_info.json', encoding='utf-8')
    data = json.load(f)
    f.close()
    form = stock_tradingForm()
    if form.validate_on_submit():
        stock_no = form.stock_no.data
        stock_name = form.stock_name.data
        shares = form.shares.data
        money = current_user.cash
        res = stock_crawler(stock_no)
        stock_price = float(res['price'])
        fee = math.floor(stock_price*shares*0.001425*0.28)
        fee = fee if fee > 0 else 1
        #????????????0.1425% * 2.8??????????????????????????????1???
        if form.buy.data:
            price_of_shares = math.floor(stock_price*shares) + fee
            if money > price_of_shares:
                current_user.cash = money - price_of_shares
                trans = transactions(user_id=current_user.id, stock_no=stock_no, stock_name=stock_name, shares=shares, price=stock_price, fee=fee, tax=0, total=price_of_shares)
                db.session.add(trans)
                db.session.commit()
                flash("????????????")
                return redirect(url_for('stock_trading'))
            else:
                flash("??????????????????????????????????????????:" + str(money))
                return redirect(url_for('stock_trading'))
        if form.sell.data:
            sum_of_shares = transactions.query.with_entities(func.sum(transactions.shares).label('total')).filter_by(user_id=current_user.id, stock_no=stock_no).first().total
            if sum_of_shares == None:
                flash('stock is not in your portfolio')
                return redirect(url_for('stock_trading'))
            elif shares > sum_of_shares:
                flash('?????????????????????????????????????????????:' + str(sum_of_shares) + '???')
                return redirect(url_for('stock_trading'))
            else:
                tax = math.floor(stock_price*shares*0.003)
                tax = tax if tax > 0 else 1
                #????????????0.3%???????????????????????????1???
                price_of_shares = math.floor(stock_price*shares) - fee - tax
                current_user.cash = current_user.cash + price_of_shares
                trans = transactions(user_id=current_user.id, stock_no=stock_no, stock_name=stock_name, shares=-shares, price=stock_price, fee=fee, tax=tax, total=price_of_shares*-1)
                db.session.add(trans)
                db.session.commit()
                flash('????????????')
                return redirect(url_for('stock_trading'))
    return render_template('stock_trading.html', form=form, data=data)

@app.route('/history',methods=['GET','POST'])
@login_required
def history():
    trans = transactions.query.filter_by(user_id=current_user.id).all()
    return render_template('history.html', trans=trans)

@app.route('/login',methods=['GET','POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if(user):
            if user.check_password(form.password.data) and user is not None:
                login_user(user)
                flash("??????????????????????????????")
                next = request.args.get('next')
                if next == None or not next[0]=='/':
                    next = url_for('welcome_user')
                return redirect(next)
        flash('???????????????...')
    return render_template('login.html',form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("?????????????????????")
    return redirect(url_for('index'))

@app.route('/register',methods=['GET','POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(email=form.email.data,
        username=form.username.data, password=form.password.data)
        
        # add to db table
        db.session.add(user)
        db.session.commit()
        flash("?????????????????????????????????")
        return redirect(url_for('login'))
    return render_template('register.html',form=form)

@app.route('/welcome')
@login_required
def welcome_user():
    return render_template('welcome_user.html')

if __name__ == "__main__":
    app.run(use_reloader=False, debug=True, host='127.0.0.1' , port='3000')

# app.run(use_reloader=False, debug=True, host='127.0.0.1' , port='3000')