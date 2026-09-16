# 9Router AI Agent System

Kumpulan AI Agent dengan konsep **Single Responsibility** untuk memahami, menganalisis, merencanakan, mengimplementasikan, mereview, dan mendokumentasikan project software — digunakan melalui OpenCode.

---

## Agent Overview

### 1. Explorer — `explorer.md`
**Fungsi**: Menganalisis project dari awal hingga akhir tanpa mengubah kode.

**Kapabilitas**:
- Mengenali framework, bahasa, dan dependency
- Memetakan struktur folder
- Mendaftarkan semua route dan endpoint
- Menganalisis business flow dan API flow
- Mengidentifikasi risiko dan technical debt

**Kapan digunakan**:
- Saat pertama kali masuk ke project baru
- Saat ingin memahami codebase sebelum membuat perubahan
- Saat onboarding developer baru
- Sebelum Planner membuat implementation plan

**Kapan TIDAK digunakan**:
- Saat hanya butuh info spesifik (gunakan grep/glob langsung)
- Saat ingin mengubah kode
- Saat project sudah sangat dikenal

---

### 2. Planner — `planner.md`
**Fungsi**: Mengubah user request menjadi implementation plan yang terstruktur dan executable.

**Kapabilitas**:
- Impact analysis (file mana yang terdampak)
- Dependency mapping (internal dan eksternal)
- Task decomposition (memecah menjadi langkah kecil)
- Risk assessment dan mitigasi
- Testing strategy dan rollback plan

**Kapan digunakan**:
- Sebelum mengimplementasikan fitur baru
- Sebelum memperbaiki bug kompleks
- Sebelum melakukan refactor besar
- Saat ingin memastikan semua dampak sudah dipertimbangkan

**Kapan TIDAK digunakan**:
- Untuk perubahan sepele (typo, formatting, single-line fix)
- Untuk task yang sudah sangat jelas scope-nya
- Saat user hanya ingin eksplorasi atau research

---

### 3. Implementer — `implementer.md`
**Fungsi**: Menulis kode production-ready berdasarkan implementation plan.

**Kapabilitas**:
- Mengikuti existing pattern dan convention
- Menjaga backward compatibility
- Menghindari duplicate logic
- Error handling dan input validation
- Menghasilkan kode yang readable dan maintainable

**Kapan digunakan**:
- Untuk mengimplementasikan setiap step dari Planner
- Untuk menambah fitur, fix bug, atau refactor
- Saat butuh kode yang langsung production-ready

**Kapan TIDAK digunakan**:
- Untuk prototyping atau POC (gunakan pendekatan lebih cepat)
- Untuk rewrite besar tanpa plan
- Untuk eksplorasi atau research

---

### 4. Reviewer — `reviewer.md`
**Fungsi**: Mengaudit hasil implementasi secara menyeluruh tanpa mengubah kode.

**Kapabilitas**:
- Audit correctness, security, performance
- Deteksi code smell, duplicate logic, dead code
- Verifikasi backward compatibility
- Verifikasi consistency dengan existing pattern
- Memberikan approval status dan actionable feedback

**Kapan digunakan**:
- Setelah Implementer menyelesaikan task
- Sebelum merge ke main branch
- Saat ingin quality gate sebelum deployment
- Untuk code review otomatis

**Kapan TIDAK digunakan**:
- Saat kode masih dalam progress (WIP)
- Untuk menilai requirement atau business logic
- Untuk mengubah kode (Reviewer hanya mengaudit)

---

### 5. Documenter — `documenter.md`
**Fungsi**: Membuat dan memperbarui dokumentasi project berdasarkan source code terkini.

**Kapabilitas**:
- SYSTEM_MAP, DEPENDENCY_MAP, MODULE_MAP, API_MAP
- BUSINESS_FLOW documentation
- CHANGELOG dan IMPLEMENTATION_NOTE
- README update
- Cross-reference validation

**Kapan digunakan**:
- Setelah implementasi selesai
- Saat project berubah signifikan
- Saat onboarding dokumentasi perlu di-update
- Untuk menghasilkan dokumentasi yang akurat dan up-to-date

**Kapan TIDAK digunakan**:
- Saat project belum berubah (dokumentasi masih akurat)
- Untuk menulis dokumentasi tanpa verifikasi source code
- Untuk menulis dokumentasi non-teknis (marketing, user guide)

---

## Urutan Penggunaan Agent

**PENTING**: Setiap agent wajib membaca `docs/SYSTEM_MAP.md` sebagai langkah pertama sebelum memulai tugas apapun. SYSTEM_MAP adalah quick file reference yang memudahkan pencarian file, memahami struktur, dan menghindari kesasar.

### Workflow Standar

```
REQUEST
   │
   ▼
┌──────────────┐
│   EXPLORER   │  (1) Pahami project
└──────┬───────┘
       │ Explorer Output
       ▼
┌──────────────┐
│   PLANNER    │  (2) Buat rencana
└──────┬───────┘
       │ Implementation Plan
       ▼
┌──────────────┐
│ IMPLEMENTER  │  (3) Tulis kode
└──────┬───────┘
       │ Implementer Output
       ▼
┌──────────────┐
│   REVIEWER   │  (4) Audit kode
└──────┬───────┘
       │ Reviewer Output
       ▼
┌──────────────┐
│   DOCUMENTER │  (5) Perbarui docs
└──────────────┘
```

---

## Contoh Workflow

### Workflow Sederhana — Menambah Satu Endpoint API

1. **User request**: "Tambah GET /api/users/:id yang return user detail"
2. **Planner** (tanpa Explorer — project sudah dikenal):
   - Impact: 1 file baru, tidak ada file modified
   - Step: Buat route handler, tambah ke service
   - Output: Implementation Plan
3. **Implementer**:
   - Baca pattern dari route existing
   - Tulis route handler mengikuti pattern
   - Output: Kode + penjelasan
4. **Reviewer**:
   - Audit kode baru
   - Output: Approved atau Changes Requested
5. **Documenter** (opsional — untuk endpoint baru):
   - Update API_MAP dengan endpoint baru

### Workflow Kompleks — Refactor Authentication System

1. **User request**: "Refactor auth dari JWT manual ke NextAuth.js"
2. **Explorer**:
   - Analisis semua file yang terkait auth
   - Petakan dependency: middleware, route guard, API handler, store
   - Identifikasi risiko: backward compat, session migration
   - Output: Explorer Report
3. **Planner**:
   - Impact analysis: 15+ file terdampak
   - Task decomposition: 8 steps
   - Risk: session invalidation, existing token handling, migration script
   - Rollback plan: git revert + restore old middleware
   - Output: Implementation Plan
4. **Implementer** (dieksekusi per step):
   - Step 1: Install NextAuth, setup config
   - Step 2: Buat auth adapter
   - Step 3: Migrasi middleware
   - ...dst...
   - Setiap step direview oleh Reviewer
5. **Reviewer** (setelah setiap step atau setelah semua step):
   - Audit keamanan, backward compat, performance
   - Verifikasi semua acceptance criteria
6. **Documenter** (setelah semua step lolos review):
   - Update SYSTEM_MAP (auth flow baru)
   - Update MODULE_MAP (modul auth berubah)
   - Update API_MAP (endpoint auth berubah)
   - Update README (prerequisites NextAuth)
   - Buat IMPLEMENTATION_NOTE (keputusan NextAuth vs alternatif)
   - Update CHANGELOG

---

## Kolaborasi Antar Agent

### Explorer → Planner
Explorer menyediakan **konteks project** yang komprehensif. Planner menggunakan:
- Folder Structure → untuk tahu di mana file yang relevan
- Module Summary → untuk identifikasi modul yang terdampak
- Dependency Analysis → untuk prediksi cascading effect
- Risk Analysis → sebagai starting point risk assessment

### Planner → Implementer
Planner menyediakan **rencana eksekusi** yang detail. Implementer menggunakan:
- Implementation Steps → panduan langkah demi langkah
- Affected Files → tahu file mana yang diubah
- New Files → tahu file mana yang dibuat, dan template-nya
- Acceptance Criteria → tahu kapan step dianggap selesai

### Implementer → Reviewer
Implementer menyediakan **kode + penjelasan**. Reviewer menggunakan:
- Changes Summary → memahami scope review
- Implementation Notes → tahu trade-off dan asumsi
- Acceptance Criteria Check → tahu apa yang perlu diverifikasi
- File references → tahu file mana yang perlu diaudit

### Reviewer → Implementer
Jika Reviewer menemukan issue, Implementer:
- Membaca Critical/Major/Minor Issues
- Memperbaiki berdasarkan fix suggestion
- Tidak mengubah hal lain di luar issue yang dilaporkan
- Submit ulang untuk re-review

### Reviewer → Documenter
Reviewer menyediakan **keputusan teknis dan issue**. Documenter menggunakan:
- Issue yang ditemukan → untuk IMPLEMENTATION_NOTE
- Approval status → untuk tahu apakah kode sudah stabil
- Detailed Analysis → untuk memahami trade-off yang diambil

### Documenter → Semua Agent
Documenter menyediakan **dokumentasi terbaru** yang bisa digunakan oleh:
- Explorer: sebagai starting point (bukan pengganti analisis)
- Planner: sebagai referensi saat membuat plan
- Implementer: sebagai panduan pattern dan convention
- Reviewer: sebagai referensi expected behavior

---

## Best Practices

0. **Selalu baca `docs/SYSTEM_MAP.md` pertama kali** — setiap agent wajib membaca SYSTEM_MAP sebelum memulai tugas apapun. Ini mencegah kesasar dan mempercepat pencarian file.
1. **Jangan skip Explorer** untuk project baru — asumsi adalah musuh terbesar
2. **Jangan skip Planner** untuk perubahan kompleks — plan yang baik mencegah rework
3. **Jalankan Reviewer setelah setiap step**, bukan menunggu semua selesai
4. **Jalankan Documenter hanya setelah kode stabil** — dokumentasi yang selalu berubah tidak berguna
5. **Gunakan Explorer output sebagai "single source of truth"** — semua agent lain mereferensikan Explorer
6. **Implementation Plan harus bisa dieksekusi tanpa tanya lagi** — jika Implementer masih bingung, plan belum matang
7. **Reviewer harus memberikan fix suggestion** — jangan hanya melaporkan masalah tanpa solusi
8. **Documenter harus verifikasi ke source code** — jangan percaya implementer output begitu saja

---

## File Structure

```
project-root/
├── .opencode/
│   ├── opencode.json         # Agent registration & permissions
│   └── agents/
│       ├── explorer.md       # Subagent: analisis project
│       ├── planner.md        # Subagent: perencanaan implementasi
│       ├── implementer.md    # Subagent: implementasi kode
│       ├── reviewer.md       # Subagent: audit kode
│       └── documenter.md     # Subagent: dokumentasi project
├── docs/
│   ├── ARCHITECTURE.md  # Full architecture documentation (narrative)
│   └── SYSTEM_MAP.md    # Quick file reference map — BACA DULUAN!
├── agents/
│   ├── README.md         # File ini — panduan sistem agent
│   ├── explorer.md       # Reference copy — Agent 1
│   ├── planner.md        # Reference copy — Agent 2
│   ├── implementer.md    # Reference copy — Agent 3
│   ├── reviewer.md       # Reference copy — Agent 4
│   └── documenter.md     # Reference copy — Agent 5
```

---

## OpenCode Integration — Via @mention

Setiap agent sudah terdaftar sebagai **OpenCode subagent** (`.opencode/agents/*.md`). Kamu bisa invoke langsung dengan `@` mention:

```
@explorer analisis file terkait auth
@planner rencanain fitur quota API key
@implementer eksekusi step 3 dari plan
@reviewer audit hasil implementasi
@documenter update SYSTEM_MAP setelah perubahan
```

**Primary agent (Build)** akan otomatis invoke subagent yang tepat untuk task kompleks — kamu ga perlu sebutin manual setiap saat.
