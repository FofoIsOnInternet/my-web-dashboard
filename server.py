#server.py

# Imports
import flask
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os


# Init flask 
app = flask.Flask(__name__)
CORS(app)


# Consts
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'assets/images')


# End-points
# Client files

# Get index.html
@app.route('/',methods=['GET'])
def get_index():
    return flask.send_file("index.html")
# Get app.js
@app.route('/app.js',methods=['GET'])
def get_js():
    return flask.send_file('app.js')
# Get style.css
@app.route('/style.css',methods=['GET'])
def get_css():
    return flask.send_file('style.css')


# Assets

# Images
@app.route('/assets/images/<filename>', methods=['GET'])
def get_image(filename):
    return flask.send_from_directory(UPLOAD_FOLDER, filename)
# Icons
@app.route('/assets/icons/<filename>', methods=['GET'])
def get_icon(filename):
    return flask.send_from_directory("./assets/icons", filename)


# User data - assets/data.json

# Get user data
@app.route('/get-data',methods=['GET'])
def get_data():
    return flask.send_file("./assets/data.json")
# Set user data
@app.route('/set-data',methods=['POST'])
def set_data():
    if 'data' not in flask.request.form:
        return flask.jsonify({'error': 'No data part in the request'}), 400
    
    data = flask.request.form.get('data')
    
    with open('assets/data.json',mode="w",encoding="utf-8") as f:
        f.write(data)
        f.close()
    
    return flask.jsonify({'message': 'Data saved successfully'})


# User images - assets/images/

# Upload Image
@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in flask.request.files:
        return flask.jsonify({'error': 'No image part in the request'}), 400

    file = flask.request.files['image']

    if file.filename == '':
        return flask.jsonify({'error': 'No file selected for uploading'}), 400

    filename = secure_filename(file.filename)
    
    # Save the file to the upload folder
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    return flask.jsonify({'message': 'File uploaded successfully!', 'filename': file.filename})
# Delete image
@app.route('/delete-image',methods=['POST'])
def delete_image():
    if 'imagename' not in flask.request.form:
        return flask.jsonify({'error': 'No imagename part in the request'}), 400
    
    filename = secure_filename(flask.request.form.get('imagename'))
    file_path = os.path.join(UPLOAD_FOLDER,filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return flask.jsonify({'message': 'Image deleted successfully'})


# Main
if __name__ == '__main__':
    app.run(debug=True, port=5000)