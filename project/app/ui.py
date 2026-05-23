from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
from flask import send_from_directory

import os
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

UPLOAD_FOLDER = "app/static/uploads"
RESULT_FOLDER = "app/static/results"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["RESULT_FOLDER"] = RESULT_FOLDER


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    if "image" not in request.files:
        return jsonify({
            "success": False,
            "message": "No image uploaded"
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "Invalid file"
        }), 400

    ext = file.filename.split(".")[-1]

    image_name = f"{uuid.uuid4()}.{ext}"

    image_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        image_name
    )

    file.save(image_path)

    # try:

    #     result = analyze_banknote(
    #         image_path=image_path,
    #         output_dir=RESULT_FOLDER
    #     )

    #     return jsonify({
    #         "success": True,

    #         "prediction":
    #             result["prediction"],

    #         "confidence":
    #             result["confidence"],

    #         "processing_time":
    #             result["processing_time"],

    #         "original":
    #             result["original"],

    #         "segmented":
    #             result["segmented"],

    #         "features":
    #             result["features"],

    #         "authentic":
    #             result["authentic"]
    #     })

    # except Exception as ex:

    #     return jsonify({
    #         "success": False,
    #         "message": str(ex)
    #     }), 500


@app.route("/results/<filename>")
def results(filename):

    return send_from_directory(
        RESULT_FOLDER,
        filename
    )


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )