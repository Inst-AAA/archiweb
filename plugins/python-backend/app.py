from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from formfinding import from_vertices_and_faces

# only log error
import logging

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", path='/py')
CORS(app)


def chunk(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]

@socketio.on('connect')
def on_connect():
    print('connected')


@socketio.on('compasFormFinding')
def handle_param(data):
    # print(data)

    vs = list(chunk(data['vertex'], 3))
    fs = data['face']

    form = from_vertices_and_faces(vs, fs)

    emit('generateFormFindingResult', form.to_data())


if __name__ == '__main__':
    socketio.run(app, debug=True)
