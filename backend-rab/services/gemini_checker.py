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