import requests
from bs4 import BeautifulSoup
import pandas as pd
from fake_useragent import UserAgent
from sqlalchemy import create_engine
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.executors.pool import ThreadPoolExecutor

def stock_crawler():
    # 抓取股票資訊
    url = "https://histock.tw/stock/rank.aspx?m=0&d=0&p=all"
    user_agent = UserAgent()
    headers = {'user-agent': user_agent.random}

    # 獲取 html 資訊
    res = requests.get(url, headers = headers)
    tmp = BeautifulSoup(res.text, 'lxml').select_one('#CPHB1_gv')
    df = pd.read_html(tmp.prettify())[0]

    # 優化一下欄位名稱
    df.columns = ['stock_no', 'stock_name', 'price', 'ud', 'udp', 'ud_w', 'amp','open', 'high', 'low', 'price_y', 'vol', 'vol_p']
    # 新增欄位註記資料更新時間
    now = datetime.now()
    df["etl_date"] =  datetime.strftime(now,'%Y-%m-%d %H:%M:%S')
    
    # 連線DB並寫入，裡面的資訊記得改成自己的
    engine = create_engine('postgresql://rgebussfpcabig:3beea883f44b198cb0a50f0c08309e8219da2197fb0150c8a45825e7098892c5@ec2-54-152-28-9.compute-1.amazonaws.com:5432/dgbp1fhbqfv1a')
    # 使用 replace 取代
    df.to_sql("stock_info", engine, if_exists='replace',index=False,method='multi')

stock_crawler()
scheduler = BlockingScheduler(timezone="Asia/Taipei", executors={'threadpool': ThreadPoolExecutor(max_workers=1)})
scheduler.add_job(stock_crawler, 'cron', day_of_week='mon-fri', hour='9-14', minute='*', second='*/15', id='stock_crawler', max_instances=1)

scheduler.start()