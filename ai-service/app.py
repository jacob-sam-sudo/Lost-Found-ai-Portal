from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim


app = FastAPI(
    title="Lost & Found AI Service",
    description="AI semantic matching service for the Lost & Found Portal",
    version="1.0.0"
)


print("Loading AI model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("AI model loaded successfully.")


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