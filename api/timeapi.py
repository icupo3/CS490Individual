import time
from flask import Flask

app = Flask(__name__)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/')
def get_current_time_home():
    return {'timeButHome': time.time()}

@app.route('/time2')
def get_current_time2():
    return {'time2': time.time()}