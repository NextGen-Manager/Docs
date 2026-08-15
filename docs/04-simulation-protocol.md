# Protokol Simulasi Pasar

## Pertanyaan yang boleh dijawab

Simulasi menjawab pertanyaan eksploratif seperti:

- keberatan apa yang muncul dari persona berbeda;
- apakah perubahan harga atau positioning mengubah distribusi respons sintetis;
- segmen mana yang paling/kurang cocok terhadap proposisi nilai;
- seberapa besar disagreement antarpersona;
- asumsi apa yang perlu divalidasi lewat survei lapangan.

Simulasi tidak boleh menjawab “berapa omzet pasti”, “berapa pelanggan nyata”, atau “probabilitas usaha sukses” tanpa model yang dikalibrasi dan tervalidasi secara eksternal.

## Input contract

### Input pengguna wajib

- kategori dan format usaha;
- titik/area target yang dinormalisasi;
- rentang harga atau average selling price;
- modal awal;
- jam operasi dan channel utama;
- produk unggulan dan value proposition;
- fixed cost, variable cost/HPP, dan kapasitas jika angka finance ingin dianggap lengkap.

### Evidence context wajib

- area boundary dan radius/administrative level;
- competitor observations beserta category mapping;
- population/demographic aggregate yang tersedia;
- tanggal pengambilan dan provider;
- coverage/quality note;
- daftar field yang tidak tersedia.

## Four-agent execution protocol

```text
1. Context Builder publishes immutable input + evidence snapshot.
2. Market Analyst Council:
   Opportunity Scout proposes -> Competition Skeptic challenges
   -> Evidence Auditor verifies -> reducer emits MarketAssessment.
3. Customer Persona Council:
   persona population receives stimulus -> interacts across rounds
   -> private interviews -> reducer emits CustomerSimulationResult.
4. Finance Council:
   Conservative/Base/Optimistic propose bounded assumptions
   -> deterministic calculator executes -> Assumption Auditor challenges
   -> reducer emits FinanceScenarioResult.
5. Rule-Based Scoring Engine consumes typed artifacts and emits ScoreResult.
6. Report Council:
   Synthesizer drafts -> Red-team critiques -> Evidence Editor revises
   -> schema/citation/arithmetic validators approve final report.
```

Setiap panah direpresentasikan sebagai artifact ID di run manifest. Agent berikutnya menerima artifact yang sudah divalidasi, bukan seluruh chat history mentah.

## Cohort construction MVP

Gunakan 12–24 persona per run, dibagi seimbang ke 4 archetype. Jumlah final dipilih dari cost/latency spike, bukan karena angka tersebut secara statistik representatif.

Sampling harus:

- memakai template versioned;
- menggunakan atribut perilaku yang relevan;
- mencakup variasi budget dan occasion;
- tidak mengklaim distribusi representatif bila tidak ada data pembobot;
- menyimpan `cohort_manifest` agar run dapat diaudit.

Contoh manifest:

```json
{
  "cohort_version": "jabodetabek-fnb-v1",
  "size": 16,
  "allocation": {
    "budget_driven": 4,
    "convenience_driven": 4,
    "quality_driven": 4,
    "social_family_driven": 4
  },
  "representativeness": "exploratory_unweighted",
  "source_notes": ["persona hypotheses pending interview calibration"]
}
```

## Scenario stimulus

Concept card yang sama harus terlihat oleh seluruh persona:

```json
{
  "business_type": "gerobak rice bowl",
  "area": "jabodetabek-area-id",
  "offer": "rice bowl ayam dengan pilihan sambal",
  "price": 18000,
  "service_mode": ["takeaway", "delivery"],
  "opening_hours": "11:00-21:00",
  "claims": ["porsi makan siang", "siap kurang dari 10 menit"]
}
```

Context builder harus mengutip user text sebagai data dan menetralkan instruksi tersembunyi untuk mencegah prompt injection.

## Round design Customer Persona Council

### Round 0 — baseline private response

Orchestrator menggunakan `INTERVIEW` secara manual untuk memperoleh respons independen sebelum persona melihat respons lain. `INTERVIEW` tidak dimasukkan ke `available_actions`, sesuai desain OASIS.

### Round 1 — exposure

Stimulus diposting melalui action manual. Persona aktif dapat mengomentari, like/dislike, purchase, atau tidak melakukan apa-apa. Activation subset, urutan, dan persona yang benar-benar melihat marker stimulus disimpan. Reaksi hanya dihitung dari exposure yang terverifikasi.

### Round 2 — interaction

Persona melihat feed/rekomendasi dan dapat merespons. Round ini menguji social influence, bukan meningkatkan “akurasi”.

### Round 3 — controlled intervention

Harga, promo, atau message diubah satu variabel pada satu waktu. Cohort dan konfigurasi dipertahankan agar perbandingan lebih masuk akal.

### Final interview

Orchestrator meminta structured final ballot dan alasan singkat. Jawaban disimpan pada trace dan divalidasi ke schema.

## OASIS action space MVP

| Action | Arti dalam eksperimen |
|---|---|
| `CREATE_COMMENT` | Menyampaikan alasan/objection yang dapat dilihat agent lain |
| `LIKE_POST` / `DISLIKE_POST` | Reaksi ringan terhadap concept stimulus |
| `PURCHASE_PRODUCT` | Purchase-intent proxy pada kondisi sintetis |
| `DO_NOTHING` | Tidak tertarik/tidak teraktivasi, dibedakan melalui trace |
| `INTERVIEW` | Pertanyaan manual dari orchestrator, tidak dipilih agent |

`FOLLOW`, `MUTE`, repost, dan action lain dikeluarkan bila tidak berkaitan dengan hipotesis. Action space kecil mengurangi noise dan token.

Market, Finance, dan Report Council memakai capability contract berikut. Nama di tabel menjelaskan mandat, bukan autonomous social action atau CAMEL tool yang selalu dipilih model:

| Council | Actions/tools utama |
|---|---|
| Market Analyst | `publish_assessment`, `challenge_claim`, `lookup_evidence`, `revise_assessment`, `submit_ballot` |
| Finance | `propose_assumption_set`, `run_finance_calculator`, `challenge_assumption`, `submit_scenario` |
| Report | `load_artifact`, `draft_section`, `flag_unsupported_claim`, `revise_section`, `validate_report` |

Pada MVP, deliberasi ketiga council dijalankan melalui manual `INTERVIEW`. Evidence adapter, deterministic finance calculator, artifact retrieval, citation validator, dan arithmetic validator dipanggil application orchestrator. Interaction agent dicatat di OASIS trace; hasil deterministic tool dicatat sebagai application audit artifact dengan correlation ID yang sama. Lihat [ADR-004](adr/ADR-004-orchestrator-owned-deterministic-tools.md).

## Output metrics

| Metric | Definisi | Batas interpretasi |
|---|---|---|
| Synthetic purchase share | Persona yang memilih purchase / persona aktif | Bukan conversion rate nyata |
| Positive reaction share | Like / exposure valid | Dipengaruhi action policy |
| Objection distribution | Frekuensi label objection | Bergantung prompt/schema |
| Acceptable price band | Distribusi band hasil interview | Preferensi sintetis |
| Segment fit | Respons per archetype | Tidak mewakili populasi tanpa weights |
| Opinion shift | Perubahan baseline ke final | Menunjukkan influence dalam simulation |
| Disagreement | Entropy/variance respons | Berguna sebagai uncertainty signal |
| Run stability | Variasi metric antar repeated run | Mengukur sensitivitas model, bukan real-world accuracy |

## Counterfactual comparison

Untuk membandingkan A vs B:

- cohort manifest sama;
- evidence snapshot sama kecuali variabel lokasi memang diuji;
- model, prompt, temperature, action space, round, dan seed dicatat;
- hanya satu variabel bisnis berubah bila mungkin;
- minimal tiga repeated run untuk mengukur variance pada tahap evaluasi;
- tampilkan delta bersama run-to-run variability.

Jangan menyebut A lebih baik bila delta lebih kecil dari variability atau evidence confidence rendah.

## Reproducibility manifest

Setiap run menyimpan:

```yaml
run_id: uuid
created_at: iso-8601
oasis_package: 0.2.5
oasis_commit: git-sha-if-vendored-tested
camel_package: 0.2.78
model_provider: gemini
model_id: exact-version-or-alias
prompt_versions: {}
cohort_version: jabodetabek-fnb-v1
random_seed: 42
rounds: 4
activation_policy: fixed_subset_v1
evidence_snapshot_id: uuid
input_snapshot_hash: sha256
token_budget: integer
wall_clock_budget_seconds: integer
```

LLM output tetap tidak dijamin bit-for-bit reproducible. Manifest memungkinkan comparison dan audit yang wajar.

## Calibration plan

1. Buat 10–20 concept cards yang juga dinilai narasumber manusia.
2. Bandingkan ranking, objection category, dan price sensitivity manusia vs cohort sintetis.
3. Ukur agreement dan systematic bias per archetype.
4. Perbaiki prompt/cohort weights tanpa memakai test set yang sama.
5. Laporkan calibration result, termasuk kegagalan.

Sebelum calibration, label semua hasil sebagai `experimental synthetic signal`.

## Fallback

Jika OASIS timeout atau provider gagal:

- report tetap memuat market evidence, finance, dan score yang dapat dihitung;
- simulation section berstatus `unavailable` dengan alasan aman;
- readiness score tidak diberi nilai default palsu untuk komponen simulation;
- confidence diturunkan sesuai rule;
- pengguna dapat retry hanya stage simulation dengan idempotency control.
