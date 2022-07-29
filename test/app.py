"""
Test
"""
import dotenv
from flask import Flask, jsonify, request
from flask.logging import create_logger

APP = Flask(__name__)
LOG = create_logger(APP)


@APP.before_request
def log_request_info():
    """
    Test
    """
    LOG.debug("Headers: %s", request.headers)
    LOG.debug("Body: %s", request.get_data())


@APP.route("/callback", methods=["GET"])  # expand to general callback with any arg
def callback():
    """
    Test
    """
    args = request.args
    env = dotenv.find_dotenv()
    arg = args["account_verification_report_id"]
    dotenv.set_key(env, "ACCOUNT_VERIFICATION_REPORT_ID", arg)

    return jsonify(dict(data=arg))


@APP.route("/webhook", methods=["POST"])  # expand to general callback with any arg
def post_callback():
    """
    Test
    """
    args = request.args
    return jsonify(dict(args))


if __name__ == "__main__":
    APP.run(debug=True, host="localhost", port="3000", threaded=True)
