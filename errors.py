from flask import json, make_response, jsonify
from flask.helpers import send_from_directory
from werkzeug.exceptions import HTTPException


def init_handler(app):

    @app.errorhandler(404)
    def not_found(e):
        return app.send_from_directory(app.static_folder, 'index.html')

    @app.errorhandler(Exception)
    def handle_exception(e):

        if isinstance(e, HTTPException):
            response = e.get_response()
            response.data = json.dumps({
                "code": e.code,
                "name": e.name,
                "description": e.description,
            })
        else:
            print(e)
            response = make_response(jsonify({"message": 'Something went wrong', "description": e}))
        
        response.headers["Access-Control-Allow-Origin"] = '*'
        response.content_type = "application/json"
        return response
