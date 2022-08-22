from flask_cors import CORS
from flask import Flask, jsonify, request
from flask.helpers import send_from_directory
from flask.logging import create_logger
import errors
import tink

APP = Flask(__name__, static_folder = './build', static_url_path='')
CORS(APP) # all errors might be reported as cors errors after this
LOG = create_logger(APP)
errors.init_handler(APP)

env_vars = tink.load_tinkenv()


@APP.route('/')
def serve():
    return send_from_directory(APP.static_folder, 'index.html')


@APP.before_request
def log_request_info():
    """
    Test
    """
    LOG.debug("Headers: %s", request.headers)
    LOG.debug("Body: %s", request.get_data())


@APP.route("/payment/create", methods=["POST"])  # expand to general callback with any arg
def callback():
    """
    Test
    """
    TINK_CLIENT_ID = env_vars["ORACLEPAY_CLIENT_ID"]
    TINK_CLIENT_SECRET = env_vars["ORACLEPAY_CLIENT_SECRET"]
    data = request.get_json(force=True)
    print(TINK_CLIENT_ID)
    print(data)
    response = tink.payment_initiation(
        TINK_CLIENT_ID,
        TINK_CLIENT_SECRET,
        data["market"],
        data["currency"],
        data["amount"]
    )
    print(response)
    return response


@APP.route("/account", methods=["POST"])
def account_check():
    """
    Fetches Tink account verification report
    and posts anonymized data to Moralis DB
    """
    TINK_CLIENT_ID = env_vars["TINK_CLIENT_ID"]
    TINK_CLIENT_SECRET = env_vars["TINK_CLIENT_SECRET"]
    MORALIS_MASTER_KEY = env_vars["MORALIS_REST_MASTER_KEY"]
    MORALIS_SERVER_URL = env_vars["REACT_APP_MORALIS_SERVER_URL"]
    MORALIS_APP_ID = env_vars["REACT_APP_MORALIS_APPLICATION_ID"]
    data = request.get_json(force=True)
    address = data["address"]
    response = tink.account_verification(
        TINK_CLIENT_ID,
        TINK_CLIENT_SECRET,
        data["id"],
    )
    parsed = tink.parse_account_report(response, test=True)
    parsed["address"] = address
    db_response = tink.push_to_database(
        parsed,
        base_url=MORALIS_SERVER_URL,
        classes='/classes/Account',
        app_id=MORALIS_APP_ID,
        api_key=MORALIS_MASTER_KEY
    )
    print(db_response)
    return parsed


if __name__ == "__main__":
    APP.run(debug=False, host="0.0.0.0", port="80", threaded=True)
