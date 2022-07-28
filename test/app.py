from flask import Flask, request, jsonify
import dotenv

app = Flask(__name__)


@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())


@app.route('/callback', methods=['GET']) # expand to general callback with any arg
def callback():
    args = request.args
    env = dotenv.find_dotenv()
    arg = args["account_verification_report_id"]
    dotenv.set_key(env, 'ACCOUNT_VERIFICATION_REPORT_ID', arg)

    return jsonify(dict(data=arg))

@app.route('/webhook', methods=['POST']) # expand to general callback with any arg
def callback():
    args = request.args
    return jsonify(dict(args))


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port='3000', threaded=True)