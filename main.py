from flask import Flask, render_template, Response, request, jsonify, send_file
import cv2
import threading
import numpy as np
from flask_cors import CORS
import google.generativeai as genai


app = Flask(__name__)
CORS(app)

class VideoCamera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0)
        self.lock = threading.Lock()
        self.current_frame = None

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
            if self.current_frame is not None:
                cv2.imwrite(filename, self.current_frame)
                return True
            else:
                return False

camera = VideoCamera()


@app.route('/')
def index():
    return render_template('index.js')

def gen(camera):
    while True:
        frame = camera.get_frame()
        if frame is None:
            continue
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen(camera), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/capture', methods=['POST'])
def capture():
    success = camera.capture_photo("captured_photo.jpg")
    if not success:
        return jsonify({"status": "error", "message": "No frame available"}), 500

    process_image("captured_photo.jpg")
    return jsonify({"status": "success", "message": "Photo captured and preprocessed"})

@app.route('/upload', methods=['POST'])
def upload():
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
    return send_file('captured_photo.jpg', mimetype='image/jpeg')

@app.route('/step_thresh.jpg')
def get_step_thresh():
    return send_file('step_thresh.jpg', mimetype='image/jpeg')

@app.route('/analyze', methods=['GET'])
def analyze():
    GEMINI_API_KEY = "AIzaSyAA3nI6Pyj6sS_BW4l7mWfQUBxpFNI2Rdg"
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

        print("[INFO] Initializing Gemini model")
        model = genai.GenerativeModel('gemini-1.5-pro-latest')

        print("[INFO] Sending request to Gemini with image + prompt")
        response = model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": encoded_image.tobytes()},
                "Please analyze this image and provide all the text or details you can find. only reply with the text you see and ignore obscurities."
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
    app.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)




