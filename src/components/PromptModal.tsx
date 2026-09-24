import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Database, Terminal, Code2 } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'python' | 'sql'>('prompt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const masterPromptText = `Anda adalah Senior Full-Stack Web Architect & AI Engineer. Buatlah aplikasi web sistem informasi utuh untuk "Pengecekan dan Verifikasi File RAB Berbasis AI" dengan spesifikasi teknis dan fungsional berikut:

==================================================
1. TEKNOLOGI & ARSITEKTUR (FULL PYTHON BACKEND)
==================================================
- Frontend: React 19, TypeScript, Tailwind CSS, Lucide React, Motion.
- Backend: FULL PYTHON berbasis Framework FastAPI (Python 3.11+) dengan Uvicorn ASGI server, SQLAlchemy 2.0 ORM, dan Pydantic v2.
- Database: PostgreSQL 15+ / 16 (Postgres) dengan koneksi psycopg2-binary / asyncpg.
- AI Engine: Google Gemini API via SDK Resmi Python google-genai (from google import genai) untuk mengekstraksi isi dokumen PDF Rincian Anggaran Biaya (RAB) serta menelaah kepatuhan 20 kriteria wajib kelayakan anggaran.
- Lingkup Pengecekan: HANYA DOKUMEN RAB SAJA (tidak menggunakan/memeriksa TOR).

==================================================
2. MANAJEMEN PENGGUNA & 3 HAK AKSES (ROLE)
==================================================
Terdapat 3 peran (role) dalam sistem:
1. Super Admin:
   - Memiliki hak akses CRUD penuh untuk akun Super Admin, SatKer, dan Verifikator.
   - Fitur pergantian role akun: 1 akun dapat diberikan 1, 2, hingga 3 role sekaligus (Multi-Role Assignment: misalnya sebuah akun menjadi SatKer sekaligus Verifikator, dilengkapi tombol pemilih role aktif/switcher).
   - Mengelola status aktif/non-aktif akun dan reset password.
   - Ketentuan ID Pengguna: Wajib berpanjang tepat 8 karakter (NIP/ID 8 digit, misal: 19850115).
2. SatKer (Satuan Kerja Pengusul):
   - Hanya memiliki hak akses ganti password untuk akun miliknya.
   - Mengisi usulan telaah anggaran RAB melalui cascading dropdown bertingkat.
3. Verifikator:
   - Hanya memiliki hak akses ganti password untuk akun miliknya.
   - Memeriksa berkas RAB yang diajukan oleh SatKer baris per baris.

==================================================
3. SPESIFIKASI HALAMAN & FITUR
==================================================

A. Halaman Login:
- Input ID Pengguna: Dibatasi tepat 8 karakter (8 digit) dan Password.
- Di bawah kolom input terdapat teks bantuan: "Lupa Password? Hubungi Admin".
- Tombol Submit Login.
- Notifikasi validasi jika input tidak cocok atau ID salah: "user ID tidak ditemukan".

B. Halaman Super Admin:
- Dashboard CRUD pengguna (Tabel daftar pengguna dengan ID tepat 8 karakter, nama, unit, status, dan badge role).
- Modal Tambah/Edit Pengguna dengan opsi checkbox pilihan role (bisa mencentang 2 hingga 3 role dalam 1 akun).
- Manajemen aktivasi akun dan ganti role akun.

C. Halaman SatKer:
1. Formulir Input Cascading Dropdown (Hierarki bersumber dari data referensi anggaran RKA-K/L):
   a. Program (Dropdown pilihan program).
   b. Kegiatan (Dropdown yang otomatis terfilter dan menyesuaikan dengan Program terpilih).
   c. KRO (Klasifikasi Rincian Output, otomatis menyesuaikan dengan Kegiatan terpilih).
   d. RO (Rincian Output, otomatis menyesuaikan dengan KRO terpilih).
   (Menampilkan otomatis informasi Unit Eselon I, Unit Eselon II, dan status Prioritas Nasional).
2. Input File Dokumen PDF:
   - Kolom upload HANYA untuk berkas PDF RAB (Rincian Anggaran Biaya). Tidak ada upload TOR.
   - Tombol Pop-up Preview PDF interaktif untuk melihat dokumen RAB yang telah diunggah sebelum submit.
3. Tombol Aksi:
   - Tombol "Hapus / Reset Formulir" untuk membersihkan input.
   - Tombol "Submit & Periksa RAB dengan AI".
4. Hasil Pengecekan AI (LLM):
   - Sebelum disubmit, area hasil tidak ditampilkan.
   - Setelah disubmit, area hasil penelaahan muncul di bawah formulir dengan status "hasil AI.pdf".
   - Menampilkan label status LOLOS (Hijau) atau TIDAK LOLOS (Merah), skor kepatuhan, uraian alasan, dan rekomendasi perbaikan.
   - Menampilkan tabel checklist evaluasi 20 kriteria wajib kepatuhan dokumen RAB (Bagan Akun Standar BAS 6 digit, Belanja Barang 521, Jasa 522, Perjadin 524, Standar Biaya Masukan SBM, Volume & Satuan, Kalkulasi Perkalian Matematis, PPN/PPh, Pemisahan Biaya Utama/Pendukung, Tidak Ada Duplikasi, Harga Pasar Wajar, Rekapitulasi Sinkron, Batas Pagu, dan Lembar Pengesahan PPK beserta NIP).
   - Fitur Cetak PDF untuk laporan telaah hasil AI.

D. Halaman Verifikator (Tata Letak & Alur Kerja Khusus):
1. Hasil Penelaahan Dokumen oleh AI diletakkan DI ATAS Formulir Keputusan Verifikator:
   - Menampilkan ringkasan penilaian AI dan tabel 20 Kriteria Wajib RAB.
   - Di samping kolom Catatan Bukti AI, terdapat "Kolom Verifikator" di mana Verifikator bisa memilih "Lolos" atau "Ditolak" di setiap barisnya secara mandiri.
   - Di samping "Kolom Verifikator", terdapat "Kolom Catatan Evaluasi" untuk mengisikan catatan evaluasi per baris.
   - Fleksibilitas Penuh: Verifikator memeriksa baris per baris; jika pada AI berstatus Lolos maka Verifikator bisa mengubahnya menjadi Ditolak, maupun sebaliknya jika pada AI Ditolak bisa diubah menjadi Lolos.
2. Formulir Keputusan Verifikator diletakkan DI PALING BAWAH:
   - Berisi 2 kolom aksi mandatori keputusan akhir:
     * Kolom 1: Pilihan Keputusan Akhir ("Diterima" atau "Ditolak").
     * Kolom 2: Kolom Catatan / Keterangan Berita Acara Verifikasi Akhir.
   - Tombol "Simpan Keputusan & Evaluasi Baris per Baris".
3. Fitur Cetak PDF Laporan Akhir:
   - Mencetak Berita Acara Verifikasi Akhir resmi yang memuat hasil evaluasi baris per baris 20 kriteria, keputusan akhir, catatan verifikator, dan Tanda Tangan Digital Terverifikasi (QR Code Integritas BSrE, SHA-256 Hash, serta NIP dan Nama Verifikator).

E. Modal Pengguna:
- Modal Ganti Password mandiri khusus untuk peran SatKer dan Verifikator.`;

  const pythonSetupGuide = `# PANDUAN LENGKAP BACKEND FULL PYTHON (FastAPI + PostgreSQL + Gemini AI)

======================================================================
1. STRUKTUR DIREKTORI BACKEND PYTHON
======================================================================
backend-rab/
├── main.py                   # Entry point FastAPI, CORS, & API Routes
├── database.py               # Konfigurasi SQLAlchemy Engine & Session
├── models.py                 # Skema Database ORM PostgreSQL (User, Submission)
├── schemas.py                # Pydantic Schemas untuk validasi input/output
├── services/
│   └── gemini_checker.py     # Integrasi Google GenAI SDK (Analisis 20 Kriteria RAB)
├── requirements.txt          # Daftar dependensi Python
└── .env                      # File konfigurasi environment

======================================================================
2. FILE: requirements.txt
======================================================================
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
sqlalchemy>=2.0.30
psycopg2-binary>=2.9.9
pydantic>=2.8.0
google-genai>=1.0.0
python-multipart>=0.0.9
python-dotenv>=1.0.0
passlib[bcrypt]>=1.7.4
pypdf>=4.3.0

======================================================================
3. FILE: .env
======================================================================
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/db_verifikasi_rab
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

======================================================================
4. FILE: database.py (Koneksi PostgreSQL)
======================================================================
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/db_verifikasi_rab")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

======================================================================
5. FILE: models.py (Model ORM PostgreSQL)
======================================================================
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(8), primary_key=True, index=True)  # Wajib 8 karakter
    name = Column(String(150), nullable=False)
    unit = Column(String(150), nullable=False)
    roles = Column(JSONB, nullable=False)                 # Array role: ["satker", "verifikator"]
    active_role = Column(String(50), nullable=False, default="satker")
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(50), primary_key=True, index=True)
    ticket_number = Column(String(100), unique=True, nullable=False, index=True)
    satker_user_id = Column(String(8), ForeignKey("users.id"), nullable=False)
    program = Column(String(200), nullable=False)
    kegiatan = Column(String(200), nullable=False)
    kro = Column(String(150), nullable=False)
    ro = Column(String(150), nullable=False)
    unit_eselon1 = Column(String(150), nullable=False)
    unit_eselon2 = Column(String(150), nullable=False)
    prioritas = Column(String(50), nullable=False)
    rab_file_path = Column(String(255), nullable=False)
    rab_file_size = Column(String(50), nullable=True)
    ai_status = Column(String(20), nullable=False)         # LOLOS / TIDAK LOLOS
    ai_score = Column(Integer, nullable=False)
    ai_reason = Column(Text, nullable=True)
    ai_recommendation = Column(Text, nullable=True)
    ai_criteria_results = Column(JSONB, nullable=False)   # 20 kriteria baris per baris
    verification_status = Column(String(50), default="Menunggu") # Menunggu, Diterima, Ditolak
    verifikator_notes = Column(Text, nullable=True)
    verified_by_id = Column(String(8), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    digital_signature_hash = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

======================================================================
6. FILE: services/gemini_checker.py (SDK google-genai)
======================================================================
import os
import json
from google import genai
from google.genai import types

def analyze_rab_document(pdf_bytes: bytes, file_name: str) -> dict:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    prompt = """
    Anda adalah Pejabat Verifikator Anggaran Ahli Kementerian Keuangan & Komdigi RI.
    Telaah dokumen PDF Rincian Anggaran Biaya (RAB) berikut terhadap 20 Kriteria Wajib:
    1. Bagan Akun Standar (BAS 6 digit)
    2. Belanja Bahan (521211) sesuai SBM
    3. Belanja Konsumsi Rapat (521219)
    4. Belanja Honor Output Kegiatan (521213)
    5. Belanja Jasa Profesi Narasumber (522151)
    6. Belanja Sewa Gedung/Ruangan (522141)
    7. Belanja Langganan Daya & Jasa (522111)
    8. Belanja Pemeliharaan Peralatan (523121)
    9. Biaya Perjalanan Dinas Dalam Negeri (524111)
    10. Transportasi Lokal & Uang Harian SBM
    11. Kesesuaian Volume & Satuan Ukur
    12. Kejelasan Komponen Biaya Rinci
    13. Pemisahan Biaya Pokok & Biaya Pendukung
    14. Perhitungan Matematis Perkalian Akurat
    15. Perlakuan Pajak PPN (12%) / PPh Pasal 21/23
    16. Rasionalitas Harga Pasar & Tidak Pemborosan
    17. Tidak Terdapat Duplikasi Anggaran
    18. Total Biaya Tidak Melampaui Batas Pagu
    19. Rekapitulasi Rincian Sinkron dengan Total Akhir
    20. Lembar Pengesahan PPK Bertanda Tangan & NIP

    Balas HANYA dalam format JSON valid:
    {
      "aiStatus": "LOLOS" atau "TIDAK LOLOS",
      "aiScore": integer 0-100,
      "aiReason": "ringkasan uraian temuan",
      "aiRecommendation": "langkah tindak lanjut rekomendasi",
      "criteriaResults": [
         {
           "id": 1,
           "text": "nama kriteria",
           "status": "passed" atau "failed",
           "notes": "bukti kutipan dari file",
           "verifierStatus": "Lolos" atau "Ditolak",
           "verifierNotes": ""
         }, ... 20 kriteria lengkap
      ]
    }
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    return json.loads(response.text)

======================================================================
7. FILE: main.py (FastAPI Application)
======================================================================
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

======================================================================
8. CARA MENJALANKAN BACKEND PYTHON
======================================================================
1. Buka Terminal / CMD:
   cd backend-rab
2. Buat Virtual Environment:
   python -m venv venv
   # Di Windows:
   venv\\Scripts\\activate
   # Di Linux/Mac:
   source venv/bin/activate
3. Install dependensi:
   pip install -r requirements.txt
4. Jalankan server FastAPI:
   uvicorn main:app --reload --port 8000
5. Dokumentasi API Interaktif (Swagger UI) langsung terbuka di:
   http://localhost:8000/docs`;

  const sqlSchemaText = `-- ======================================================================
-- SKEMA STRUKTUR DATABASE POSTGRESQL (POSTGRES) UNTUK PYTHON FASTAPI
-- Nama Database: db_verifikasi_rab
-- ======================================================================

-- 1. PEMBUATAN DATABASE (Jalankan pada query tool postgres / pgAdmin / psql)
-- CREATE DATABASE db_verifikasi_rab;
-- \\c db_verifikasi_rab;

-- Mengaktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPE DATA ENUM KHUSUS POSTGRESQL
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('superadmin', 'satker', 'verifikator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_decision_status AS ENUM ('LOLOS', 'TIDAK LOLOS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verifier_decision_status AS ENUM ('Menunggu', 'Diterima', 'Ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL PENGGUNA (USERS)
-- Catatan: ID dibatasi tepat 8 karakter (NIP/ID 8 digit)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(8) PRIMARY KEY, -- Wajib tepat 8 karakter (contoh: 19850115)
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(150) NOT NULL,
    roles JSONB NOT NULL, -- Format JSONB PostgreSQL: ["satker", "verifikator"]
    active_role user_role_type NOT NULL DEFAULT 'satker',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indeks GIN untuk pencarian role di dalam JSONB
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);

-- 4. TABEL PENGAJUAN USULAN DOKUMEN RAB (SUBMISSIONS)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    satker_user_id VARCHAR(8) NOT NULL,
    program VARCHAR(200) NOT NULL,
    kegiatan VARCHAR(200) NOT NULL,
    kro VARCHAR(150) NOT NULL,
    ro VARCHAR(150) NOT NULL,
    unit_eselon1 VARCHAR(150) NOT NULL,
    unit_eselon2 VARCHAR(150) NOT NULL,
    prioritas VARCHAR(50) NOT NULL,
    rab_file_path VARCHAR(255) NOT NULL,
    rab_file_size VARCHAR(50),
    ai_status ai_decision_status NOT NULL,
    ai_score INT NOT NULL CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_reason TEXT,
    ai_recommendation TEXT,
    ai_criteria_results JSONB, -- Menyimpan 20 kriteria beserta verifier_status dan verifier_notes
    verification_status verifier_decision_status NOT NULL DEFAULT 'Menunggu',
    verifikator_notes TEXT,
    verified_by_id VARCHAR(8),
    verified_at TIMESTAMPTZ,
    digital_signature_hash VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_satker FOREIGN KEY (satker_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_verifikator FOREIGN KEY (verified_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indeks pencarian berkas
CREATE INDEX IF NOT EXISTS idx_submissions_satker ON submissions(satker_user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(verification_status);
CREATE INDEX IF NOT EXISTS idx_submissions_ticket ON submissions(ticket_number);

-- 5. DATA AWAL (SEEDERS) UNTUK PENGUJIAN DI POSTGRESQL
-- Password hash menggunakan bcrypt passlib Python: pwd_context.hash('password123')
-- '$2b$12$e8kgnQ1pC.h7p3vUuM1K1O9k1/kQW4O77Ea.K9t0zC1G1p6l3K2.i'
INSERT INTO users (id, name, unit, roles, active_role, password_hash, is_active, phone)
VALUES
('19850115', 'Dr. Hendra Wijaya, M.Kom', 'Biro Perencanaan Komdigi', '["superadmin"]'::jsonb, 'superadmin', '$2b$12$e8kgnQ1pC.h7p3vUuM1K1O9k1/kQW4O77Ea.K9t0zC1G1p6l3K2.i', TRUE, '081234567890'),
('19890422', 'Rudi Hermawan, S.T.', 'Pusdatin Komdigi', '["satker"]'::jsonb, 'satker', '$2b$12$e8kgnQ1pC.h7p3vUuM1K1O9k1/kQW4O77Ea.K9t0zC1G1p6l3K2.i', TRUE, '081298765432'),
('19910718', 'Ahmad Fauzi, S.E., Ak.', 'Inspektorat IV Komdigi', '["verifikator"]'::jsonb, 'verifikator', '$2b$12$e8kgnQ1pC.h7p3vUuM1K1O9k1/kQW4O77Ea.K9t0zC1G1p6l3K2.i', TRUE, '081377889900'),
('19871212', 'Siti Rahmawati, S.Sos', 'Ditjen APTIKA Komdigi', '["satker", "verifikator"]'::jsonb, 'satker', '$2b$12$e8kgnQ1pC.h7p3vUuM1K1O9k1/kQW4O77Ea.K9t0zC1G1p6l3K2.i', TRUE, '081122334455')
ON CONFLICT (id) DO NOTHING;`;

  const handleCopy = () => {
    let textToCopy = masterPromptText;
    if (activeTab === 'python') textToCopy = pythonSetupGuide;
    if (activeTab === 'sql') textToCopy = sqlSchemaText;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Master Prompt AI Studio &amp; Backend Full Python (FastAPI + PostgreSQL)
              </h3>
              <p className="text-xs text-slate-400">
                Spesifikasi Resmi: ID 8 Karakter, Pengecekan RAB Saja, Backend Python (FastAPI) &amp; Database PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'prompt' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Prompt Gemini AI Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Panduan Backend Python (FastAPI &amp; PostgreSQL)</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'sql' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Skema DDL Database (PostgreSQL)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
          {activeTab === 'prompt' && masterPromptText}
          {activeTab === 'python' && pythonSetupGuide}
          {activeTab === 'sql' && sqlSchemaText}
        </div>
      </div>
    </div>
  );
};
