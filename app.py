"""
Test
"""
import dotenv
from flask_cors import CORS
from flask import Flask, jsonify, request
from flask.logging import create_logger
import errors
import tink

APP = Flask(__name__)
CORS(APP) # all errors might be reported as cors errors after this
LOG = create_logger(APP)
errors.init_handler(APP)

env_vars = tink.load_tinkenv()

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
    data = request.get_json(force=True)
    print('Tink client id:', TINK_CLIENT_ID)
    print(data)
    response = tink.account_verification(
        TINK_CLIENT_ID,
        TINK_CLIENT_SECRET,
        data["id"],
    )
    print(response)

    return response


if __name__ == "__main__":
    APP.run(debug=True, host="localhost", port="5000", threaded=True)
