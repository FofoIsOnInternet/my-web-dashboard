#server.py

# Imports
import flask
from werkzeug.utils import secure_filename
import os


# Init flask 
app = flask.Flask(__name__)


# Consts
DATA_FILE = os.path.join(os.getcwd(), 'assets/data.json')
IMAGE_FOLDER = os.path.join(os.getcwd(), 'assets/images')
ICON_FOLDER = os.path.join(os.getcwd(),'assets/icons')
SOURCE_FOLDER = os.path.join(os.getcwd(),'src')
DEFAULT_BG = os.path.join(os.getcwd(),'assets/images/default-bg.JPG')
CUSTOM_BG = os.path.join(os.getcwd(),'assets/images/custom-bg.JPG')

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
    return flask.send_from_directory(IMAGE_FOLDER, filename)
# Icons
@app.route('/assets/icons/<filename>', methods=['GET'])
def get_icon(filename):
    return flask.send_from_directory(ICON_FOLDER, filename)


# Sources
@app.route('/src/<package>/<file>',methods=['GET'])
def get_class(package,file):
    file_path = os.path.join(SOURCE_FOLDER,package,file)
    if not os.path.exists(file_path):
        return flask.jsonify({'error': 'File not found'}), 404
    return flask.send_file(file_path)


# User data - assets/data.json

# Get user data
@app.route('/get-data',methods=['GET'])
def get_data():
    return flask.send_file(DATA_FILE)
# Set user data
@app.route('/set-data',methods=['POST'])
def set_data():
    if 'data' not in flask.request.form:
        return flask.jsonify({'error': 'No data part in the request'}), 400
    
    data = flask.request.form.get('data')
    
    with open(DATA_FILE,mode="w",encoding="utf-8") as f:
        f.write(data)
        f.close()
    
    return flask.jsonify({'message': 'Data saved successfully'})

# User - background
# Get
@app.route('/get-bg',methods=['GET'])
def get_bg():
    path = os.path.relpath(DEFAULT_BG)
    if os.path.exists(CUSTOM_BG):
        path = os.path.relpath(CUSTOM_BG)
    return flask.jsonify({'path': path}), 200
# Set
@app.route('/set-bg',methods=['POST'])
def set_bg():
    # Delete current bg
    if os.path.exists(CUSTOM_BG):
        os.remove(CUSTOM_BG)
    # If an image is given upload it
    if 'image' in flask.request.files :
        file = flask.request.files['image']
        file.save(CUSTOM_BG)
    return flask.jsonify({'message':'Success!'}), 200
    
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
    file_path = os.path.join(IMAGE_FOLDER, filename)
    file.save(file_path)

    return flask.jsonify({'message': 'File uploaded successfully!', 'filename': file.filename})
# Delete image
@app.route('/delete-image',methods=['POST'])
def delete_image():
    if 'imagename' not in flask.request.form:
        return flask.jsonify({'error': 'No imagename part in the request'}), 400
    
    filename = secure_filename(flask.request.form.get('imagename'))
    file_path = os.path.join(IMAGE_FOLDER,filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return flask.jsonify({'message': 'Image deleted successfully'})


# Create app
def create_app():
    # Setup important files
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE,mode="w",encoding="utf-8") as f:
            f.write('{"sections":[]}')
            f.close()
    # Return application
    return app
    
# Main
if __name__ == '__main__':
    # Run server
    create_app().run(debug=True,port=8472)