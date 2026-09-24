from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import uuid
import json
from datetime import datetime
from database import engine, get_db, Base
from models import User, Submission
from services.gemini_checker import analyze_rab_document

# Buat tabel otomatis jika belum ada di PostgreSQL
Base.metadata.create_all(bind=engine)
app = FastAPI(title="API Pengecekan Dokumen RAB AI", version="1.0.0")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Konfigurasi CORS agar frontend React dapat mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/login")
def login(payload: dict, db: Session = Depends(get_db)):
    user_id = payload.get("id", "").strip()
    password = payload.get("password", "")

    if len(user_id) != 8:
        raise HTTPException(status_code=400, detail="user ID tidak ditemukan")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        raise HTTPException(status_code=401, detail="user ID tidak ditemukan")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun ini sedang dinonaktifkan.")

    return {
        "id": user.id,
        "name": user.name,
        "unit": user.unit,
        "roles": user.roles,
        "activeRole": user.active_role,
        "isActive": user.is_active,
        "phone": user.phone
    }

@app.post("/api/submissions/upload-and-check")
async def submit_rab(
    program: str = Form(...),
    kegiatan: str = Form(...),
    kro: str = Form(...),
    ro: str = Form(...),
    unit_eselon1: str = Form(...),
    unit_eselon2: str = Form(...),
    prioritas: str = Form(...),
    satker_user_id: str = Form(...),
    rab_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    pdf_bytes = await rab_file.read()

    # 1. Panggil Gemini AI Service untuk pengecekan 20 kriteria
    ai_result = analyze_rab_document(pdf_bytes, rab_file.filename)
    ticket_number = f"TIKET-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    submission = Submission(
        id=str(uuid.uuid4()),
        ticket_number=ticket_number,
        satker_user_id=satker_user_id,
        program=program,
        kegiatan=kegiatan,
        kro=kro,
        ro=ro,
        unit_eselon1=unit_eselon1,
        unit_eselon2=unit_eselon2,
        prioritas=prioritas,
        rab_file_path=f"uploads/{rab_file.filename}",
        rab_file_size=f"{round(len(pdf_bytes)/1024, 1)} KB",
        ai_status=ai_result["aiStatus"],
        ai_score=ai_result["aiScore"],
        ai_reason=ai_result["aiReason"],
        ai_recommendation=ai_result["aiRecommendation"],
        ai_criteria_results=ai_result["criteriaResults"],
        verification_status="Menunggu"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@app.put("/api/submissions/{sub_id}/verify")
def verify_submission(sub_id: str, payload: dict, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == sub_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Berkas tidak ditemukan")
    
    submission.criteria_results = payload.get("criteriaResults", submission.ai_criteria_results)
    submission.verification_status = payload.get("verificationStatus")
    submission.verifikator_notes = payload.get("verifikatorNotes")
    submission.verified_by_id = payload.get("verifierId")
    submission.verified_at = datetime.now()
    submission.digital_signature_hash = f"DIGISIG-KOMDIGI-{uuid.uuid4().hex[:8].upper()}"
    db.commit()
    return {"status": "success", "message": "Keputusan verifikasi berhasil disimpan"}