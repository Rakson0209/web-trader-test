from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bootstrap import Bootstrap5

import requests
from bs4 import BeautifulSoup
import pandas as pd
from fake_useragent import UserAgent
from datetime import datetime


def stock_crawler(stock_id):
    # 抓取股票資訊
    url = "https://histock.tw/stock/" + stock_id
    user_agent = UserAgent()
    headers = {'user-agent': user_agent.random}

    # 獲取 html 資訊
    res = requests.get(url, headers=headers)
    tmp = BeautifulSoup(res.text, 'lxml')

    url = "https://histock.tw/stock/" + stock_id
    user_agent = UserAgent()
    headers = {'user-agent': user_agent.random}

    # 獲取 html 資訊
    res = requests.get(url, headers=headers)
    tmp = BeautifulSoup(res.text, 'lxml')

    # find <span id="Price1_lbTPrice">
    price = tmp.find(id="Price1_lbTPrice").text
    # find <span id="Price1_lbTChange">
    ud = tmp.find(id="Price1_lbTChange").text
    # find <span id="Price1_lbTPercent">
    udp = tmp.find(id="Price1_lbTPercent").text
    now = datetime.now()
    etl_date = datetime.strftime(now, '%Y-%m-%d %H:%M:%S')
    result = {'price': price, 'ud': ud, 'udp': udp, 'etl_date': etl_date}
    return result


def stock_crawler_all():
    # 抓取股票資訊
    url = "https://histock.tw/stock/rank.aspx?m=0&d=0&p=all"
    user_agent = UserAgent()
    headers = {'user-agent': user_agent.random}

    # 獲取 html 資訊
    res = requests.get(url, headers=headers)
    tmp = BeautifulSoup(res.text, 'lxml').select_one('#CPHB1_gv')
    df = pd.read_html(tmp.prettify())[0]

    # 優化一下欄位名稱
    df.columns = ['stock_no', 'stock_name', 'price', 'ud', 'udp',
                  'ud_w', 'amp', 'open', 'high', 'low', 'price_y', 'vol', 'vol_p']
    # 新增欄位註記資料更新時間
    now = datetime.now()
    df["etl_date"] = datetime.strftime(now, '%Y-%m-%d %H:%M:%S')
    df.set_index('stock_no', inplace=True)

    return df


app = Flask(__name__)
bootstrap = Bootstrap5(app)
app.config['SECRET_KEY'] = '346ffb6015c0677893c592ec8f13a7b7'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://rgebussfpcabig:3beea883f44b198cb0a50f0c08309e8219da2197fb0150c8a45825e7098892c5@ec2-54-152-28-9.compute-1.amazonaws.com:5432/dgbp1fhbqfv1a'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
db = SQLAlchemy()
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"
login_manager.login_view = 'login'
login_manager.login_message = 'Access Denied'
