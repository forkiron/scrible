from flask import Flask, render_template, Response, request, jsonify, send_file
from flask_cors import CORS
import cv2
import threading
import numpy as np
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Configure CORS to allow all origins and methods - permissive for development
CORS(app, 
     origins="*",
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=False)

class VideoCamera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0)
        self.lock = threading.Lock()
        self.current_frame = None
        if not self.video.isOpened():
            print("[WARNING] Camera not opened. Trying to open...")
            self.video.open(0)

    def __del__(self):
        self.video.release()

    def get_frame(self):
        with self.lock:
            ret, frame = self.video.read()
            if ret:
                self.current_frame = frame
                ret, jpeg = cv2.imencode('.jpg', frame)
                return jpeg.tobytes()
            else:
                return None

    def capture_photo(self, filename="captured_photo.jpg"):
        with self.lock:
            if not self.video.isOpened():
                print("[ERROR] Camera is not opened")
                return False
            ret, frame = self.video.read()
            if not ret:
                print("[ERROR] Failed to read frame from camera")
                return False
            if frame is None:
                print("[ERROR] Frame is None")
                return False
            try:
                cv2.imwrite(filename, frame)
                self.current_frame = frame
                print(f"[INFO] Successfully captured photo to {filename}")
                return True
            except Exception as e:
                print(f"[ERROR] Failed to write image: {e}")
                return False

camera = VideoCamera()


@app.route('/')
def index():
    return jsonify({"status": "ok", "message": "Scrible API is running"})

def gen(camera):
    while True:
        frame = camera.get_frame()
        if frame is None:
            continue
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    try:
        return Response(gen(camera), mimetype='multipart/x-mixed-replace; boundary=frame')
    except Exception as e:
        print(f"[ERROR] Video feed error: {e}")
        return jsonify({"status": "error", "message": "Camera not available"}), 500

@app.route('/capture', methods=['POST', 'OPTIONS'])
def capture():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"})
        
    print("[INFO] Capture endpoint called")
    try:
        success = camera.capture_photo("captured_photo.jpg")
        if not success:
            print("[ERROR] Capture failed")
            return jsonify({"status": "error", "message": "Failed to capture frame from camera. Make sure camera is connected and not in use by another application."}), 500

        print("[INFO] Processing captured image")
        process_image("captured_photo.jpg")
        return jsonify({"status": "success", "message": "Photo captured and preprocessed"})
    except Exception as e:
        print(f"[ERROR] Exception in capture endpoint: {e}")
        return jsonify({"status": "error", "message": f"Internal server error: {str(e)}"}), 500

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return jsonify({"status": "ok"})
    
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    try:
        file.save("captured_photo.jpg")
        process_image("captured_photo.jpg")
        return jsonify({"status": "success", "message": "Image uploaded and preprocessed"})
    except Exception as e:
        print(f"Error processing upload: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


def process_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        print(f"[ERROR] Could not read image {image_path}")
        return

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    cv2.imwrite("step_thresh.jpg", thresh)


@app.route('/captured_photo.jpg')
def get_captured_photo():
    try:
        return send_file('captured_photo.jpg', mimetype='image/jpeg')
    except Exception as e:
        print(f"[ERROR] Failed to send captured_photo.jpg: {e}")
        return jsonify({"status": "error", "message": "Image not found"}), 404

@app.route('/step_thresh.jpg')
def get_step_thresh():
    try:
        return send_file('step_thresh.jpg', mimetype='image/jpeg')
    except Exception as e:
        print(f"[ERROR] Failed to send step_thresh.jpg: {e}")
        return jsonify({"status": "error", "message": "Image not found"}), 404

@app.route('/analyze', methods=['GET', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"})
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if not GEMINI_API_KEY:
        print("[ERROR] GEMINI_API_KEY environment variable not set")
        return jsonify({"status": "error", "message": "GEMINI_API_KEY environment variable not set"}), 500
    print("[INFO] Starting /analyze endpoint")

    try:
        print("[INFO] Configuring Gemini API key")
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print("[ERROR] Failed to configure Gemini API key:", e)
        return jsonify({"status": "error", "message": f"Gemini API configuration failed: {str(e)}"}), 500

    try:
        print("[INFO] Loading preprocessed image: step_thresh.jpg")
        img = cv2.imread('step_thresh.jpg')
        if img is None:
            print("[ERROR] step_thresh.jpg not found or could not be loaded")
            return jsonify({"status": "error", "message": "step_thresh.jpg not found"}), 404

        print("[INFO] Encoding image to JPEG")
        success, encoded_image = cv2.imencode('.jpg', img)
        if not success:
            print("[ERROR] Failed to encode image step_thresh.jpg")
            return jsonify({"status": "error", "message": "Image encoding failed"}), 500

        print("[INFO] Initializing Gemini model: gemini-2.5-flash")
        model = genai.GenerativeModel('gemini-2.5-flash')

        print("[INFO] Sending request to Gemini with image + prompt")
        response = model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": encoded_image.tobytes()},
                "Extract all the text from this image. Only return the text you see, nothing else. Do not add any explanations or descriptions."
            ]
        )

        if not hasattr(response, 'text') or response.text is None:
            print("[ERROR] Gemini returned invalid or empty response")
            return jsonify({"status": "error", "message": "Gemini response invalid or empty"}), 500

        extracted_text = response.text.strip()
        print("[Gemini API Extracted Text]:", extracted_text)

        return jsonify({"status": "success", "extracted_text": extracted_text})

    except Exception as e:
        print("[ERROR] Exception in /analyze:", e)
        return jsonify({"status": "error", "message": f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True, use_reloader=False)




