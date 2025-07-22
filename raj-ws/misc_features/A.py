from doclayout_yolo import YOLOv10
from huggingface_hub import hf_hub_download
import numpy as np
from pdf2image import convert_from_path


class DocumentParser:
    def __init__(self) -> None:
        self.docs = []  # stores multiple pages as images
        filepath = hf_hub_download(
            repo_id="juliozhao/DocLayout-YOLO-DocStructBench",
            filename="doclayout_yolo_docstructbench_imgsz1024.pt",
        )
        self.model = YOLOv10(filepath)

    def load(self, path) -> None:
        """
        loads file from path, appropriately populates docs with text
        """
        self.docs = convert_from_path(path)

    def detect_layout(self):
        self.layout_results = []
        for doc in self.docs:
            det_res = self.model.predict(
                np.asarray(doc),  # Image to predict
                imgsz=1024,  # Prediction image size
                conf=0.2,  # Confidence threshold
                device="mps",  # Device to use (e.g., 'cuda:0' or 'cpu')
            )
            self.layout_results.append(det_res)

    def parse_figures(self):
        for res, img in zip(self.layout_results, self.docs):
            for label, xyxy in zip(res[0].boxes.cls, res[0].boxes.xyxy):
                if (
                    res[0].names[int(label.item())] == "figure"
                    or res[0].names[int(label.item())] == "isolate_formula"
                ):
                    img.crop(box=xyxy.tolist())  # save image in an object with page_id
