from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim
from fastapi import UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
import pytesseract
from io import BytesIO
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import torch
import os


app = FastAPI(
    title="Lost & Found AI Service",
    description="AI semantic matching service for the Lost & Found Portal",
    version="1.0.0"
)


print("Loading text AI model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Text AI model loaded successfully.")

print("Loading CLIP image model...")
image_model = SentenceTransformer("clip-ViT-B-32")
print("CLIP image model loaded successfully.")

def get_image_embedding(image):
    embedding = image_model.encode(
        image,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    return embedding


class MatchRequest(BaseModel):
    item1: str
    item2: str


class CandidateItem(BaseModel):
    id: str
    text: str


class MatchItemsRequest(BaseModel):
    query: str
    candidates: list[CandidateItem]


@app.get("/")
def home():
    return {
        "message": "Lost & Found AI Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "all-MiniLM-L6-v2"
    }


@app.post("/similarity")
def calculate_similarity(request: MatchRequest):

    embedding1 = model.encode(
        request.item1,
        convert_to_tensor=True
    )

    embedding2 = model.encode(
        request.item2,
        convert_to_tensor=True
    )

    similarity = cos_sim(
        embedding1,
        embedding2
    ).item()

    match_percentage = round(
        max(0, similarity) * 100,
        2
    )

    return {
        "item1": request.item1,
        "item2": request.item2,
        "similarity": round(similarity, 4),
        "match_percentage": match_percentage
    }


@app.post("/match")
def match_items(request: MatchItemsRequest):

    if not request.candidates:
        return {
            "matches": []
        }

    query_embedding = model.encode(
        request.query,
        convert_to_tensor=True
    )

    candidate_texts = [
        candidate.text
        for candidate in request.candidates
    ]

    candidate_embeddings = model.encode(
        candidate_texts,
        convert_to_tensor=True
    )

    similarities = cos_sim(
        query_embedding,
        candidate_embeddings
    )[0]

    matches = []

    for candidate, similarity in zip(
        request.candidates,
        similarities
    ):

        score = max(
            0,
            float(similarity)
        )

        matches.append({
            "id": candidate.id,
            "similarity": round(score, 4),
            "match_percentage": round(
                score * 100,
                2
            )
        })

    matches.sort(
        key=lambda x: x["similarity"],
        reverse=True
    )

    return {
        "matches": matches
    }



tesseract_path = os.getenv("TESSERACT_CMD")

if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
elif os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

def extract_ocr_text(image, psm):
    data = pytesseract.image_to_data(
        image,
        lang="eng",
        config=f"--oem 3 --psm {psm}",
        output_type=pytesseract.Output.DICT
    )

    words = []

    for i, word in enumerate(data["text"]):
        word = word.strip()

        try:
            confidence = float(data["conf"][i])
        except (ValueError, TypeError):
            continue

        if word and confidence >= 40:
            words.append(word)

    return " ".join(words).strip()

@app.post("/image-similarity")
async def image_similarity(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):
    try:
        # Read uploaded images
        image1_bytes = await image1.read()
        image2_bytes = await image2.read()

        if not image1_bytes or not image2_bytes:
            raise HTTPException(
                status_code=400,
                detail="Both images are required."
            )

        # Convert bytes into PIL images
        img1 = Image.open(BytesIO(image1_bytes)).convert("RGB")
        img2 = Image.open(BytesIO(image2_bytes)).convert("RGB")

        # Generate CLIP embeddings
        embedding1 = get_image_embedding(img1)
        embedding2 = get_image_embedding(img2)

        # Calculate cosine similarity
        similarity = torch.nn.functional.cosine_similarity(
            embedding1.unsqueeze(0),
            embedding2.unsqueeze(0)
        ).item()

        return {
            "similarity": round(similarity, 4),
            "match_percentage": round(similarity * 100, 2)
        }

    except HTTPException:
        raise

    except Exception as error:
        print("Image similarity error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to compare images."
        )

@app.post("/image-embedding")
async def generate_image_embedding(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Image is required."
            )

        image = Image.open(
            BytesIO(image_bytes)
        ).convert("RGB")

        embedding = get_image_embedding(image)

        return {
            "embedding": embedding.cpu().tolist(),
            "dimensions": len(embedding)
        }

    except HTTPException:
        raise

    except Exception as error:
        print("Image embedding error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to generate image embedding."
        )

@app.post("/ocr")
async def extract_text_from_image(
    file: UploadFile = File(...)
):
    if file.content_type not in {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/tiff",
        "image/bmp",
        "image/jpg",
        "image/x-png",
        "image/gif",
    }:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {file.content_type or 'unknown'}",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    # Basic upload-size protection: 10 MB.
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be 10 MB or smaller."
        )

    try:
        image = Image.open(BytesIO(image_bytes))
        image.verify()

        # Reopen after verify() before performing OCR.
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

        processed_image = ImageOps.grayscale(image)

        width, height = processed_image.size

        processed_image = processed_image.resize(
            (width * 2, height * 2),
            Image.Resampling.LANCZOS
        )

        processed_image = ImageOps.autocontrast(processed_image)
        processed_image = processed_image.filter(ImageFilter.SHARPEN)

        text_psm6 = extract_ocr_text(processed_image, 6)
        text_psm11 = extract_ocr_text(processed_image, 11)


        extracted_text = text_psm6

        print("PSM 6:", text_psm6)
        print("PSM 11:", text_psm11)

        ocr_data = pytesseract.image_to_data(
                processed_image,
                lang="eng",
                config="--oem 3 --psm 11",
                output_type=pytesseract.Output.DICT
        )

        recognized_words = []

        for i, word in enumerate(ocr_data["text"]):
            word = word.strip()

            try:
                confidence = float(ocr_data["conf"][i])
            except (ValueError, TypeError):
                continue

            if word and confidence >= 40:
                recognized_words.append(word)

        extracted_text = " ".join(recognized_words).strip()

        return {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "text_found": bool(extracted_text)
        }

    except (UnidentifiedImageError, OSError) as exc:
        print(
            f"OCR image validation failed: "
            f"{type(exc).__name__}: {exc}"
        )
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image."
        )

    except pytesseract.TesseractNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Tesseract OCR is not installed or configured."
        )