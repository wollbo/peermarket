"""
Test
"""
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
    MORALIS_MASTER_KEY = env_vars["MORALIS_REST_MASTER_KEY"]
    data = request.get_json(force=True)
    response = tink.account_verification(
        TINK_CLIENT_ID,
        TINK_CLIENT_SECRET,
        data["id"],
    )
    parsed = tink.parse_account_report(response)
    # push to moralis database
    """ implement the following into python:
    curl -X POST \
    -H "X-Parse-Application-Id: LJnmQAZBBR8M6wF4gR8VgypQLRBaJYDTC6GPhH6K" \
    -H "X-Parse-Master-Key: {MORALIS_MASTER_KEY}" \
    --data-urlencode "{\"id\": \"1b79990dcaa1478d83f3aa68e0539ba4\",
    \"created\": 1660300523495,
    \"iban\": \"SE8640219124958516279945\",
    \"currency\": \"SEK\",
    \"market\": \"SE\"}" \
    https://yquro2m8inuv.usemoralis.com:2053/server/classes/Account
    """

    return parsed


if __name__ == "__main__":
    APP.run(debug=True, host="localhost", port="5000", threaded=True)
