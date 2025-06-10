# 🌾 Sahabat Tani - Machine Learning API

Layanan Machine Learning API untuk aplikasi Sahabat Tani yang menyediakan berbagai fitur seperti deteksi penyakit pada tanaman pertanian, melihat riwayat deteksi penyakit,melihat peta persebaran penyakit disekitar, pencegahan dan solusi penyakit pada tanaman serta interaksi antar petani melalui forum diskusi. Machine Learning API ini dibangun menggunakan **Node.js**, **Express.js** dan **PostgreSQL**.

🚀 **Production URL:**  
[https://sahabattani.netlify.app](https://sahabattani.netlify.app)

---

## 🛠️ Teknologi yang Digunakan

- Node.js
- Express.js
- Tenserflow.js
- Supabase (Storage)
- PostgreSQL (Database)
- Railway (Deployment)

---

## ⚙️ Persiapan & Instalasi di Lokal

Ikuti langkah-langkah berikut untuk menjalankan project ini di lokal (port default: **3000**):

### 1. Clone Repositori

```bash
git clone https://github.com/SahabatTani/Machine-Learning-API.git
cd Machine-Learning-API
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env` 

Isi file `.env` sesuai dengan konfigurasi lokal kamu:

```
# SERVER CONFIGURATION
HOST=your_host
PORT=your_port

# POSTGREQL
PGUSER=your_pguser
PGHOST=your_pghost
PGPASSWORD=your_pgpassword
PGDATABASE=your_pgdatabase
PGPORT=your_pgport

#SUPABASE
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLIC_URL_PREFIX=your_supabase_public_url_prefix
SUPABASE_BUCKET=your_supabase_bucket
SUPABASE_KEY=your_supabase_key

#JWT token
ACCESS_TOKEN_KEY=your_access_token_key
```

### 4. Jalankan Aplikasi di local

```bash
npm run dev
```

### 5. Dokumentasi API

🌐 **Base URL:**  
[https://sahabattani-ml.netlify.app](https://sahabattani-ml.netlify.app)

#### `POST /api/public-predict`  
Deteksi penyakit tanaman sebagai guest.

**Headers:**
```json
{
    "Content-Type": "multipart/form-data"
}
```

**Request Body:**
```json
{
    "image": "image_file",
    "plant": "jagung"
}
```

**Response Body:**
```json
{
    "status": "success",
    "data": {
        "status": "disease 1",
        "reason": "reason 1",
        "indication": "indication 1",
        "solution": " solution 1",
        "plant": "jagung",
        "medicine_image_url": "https://medicine_image_url.com",
        "shop_url": "https://shop_url.com"
    }
}
```

#### `POST /api/predict`  
Deteksi penyakit tanaman.

**Headers:**
```json
{
    "Authorization": "Bearer <token>",
    "Content-Type": "multipart/form-data"
}
```

**Request Body:**
```json
{
    "image": "image_file",
    "plant": "jagung"
}
```

**Response Body:**
```json
{
    "status": "success",
    "data": {
        "status": "disease 1",
        "reason": "reason 1",
        "indication": "indication 1",
        "solution": " solution 1",
        "plant": "jagung",
        "medicine_image_url": "https://medicine_image_url.com",
        "shop_url": "https://shop_url.com"
    }
}
```

#### `GET /api/histories/map`  
Mendapatkan data riwayat deteksi penyakit tanaman untuk keperluan peta persebaran.

**Response Body:**
```json
{
    "status": "success",
    "data": [
        {
            "id": "unique_id",
            "plant": "plant 1",
            "image_url": "https://imaage_url.com",
            "latitude": -7.7956,
            "longitude": 110.3695,
            "created_at": "",
            "user": {
                "fullname": "fullname 1"
            },
            "prediction": {
                "status": "disease 1",
                "reason": "reason 1",
                "indication": "indication 1",
                "solution": "solution 1",
                "plant": "plant 1",
                "medicine_image_url": "https://medicine_image_url.com",
                "shop_url": "https://shop_url.com"
            }
        },
        ...
    ]
}
```

#### `GET /api/histories`  
Mendapat data riwayat deteksi penyakit tanaman.

**Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response Body:**
```json
{
    "status": "success",
    "data": [
        {
            "id": "unique_id",
            "plant": "plant 1",
            "image_url": "https://imaage_url.com",
            "latitude": -7.7956,
            "longitude": 110.3695,
            "created_at": "",
            "user": {
                "fullname": "fullname 1"
            },
            "prediction": {
                "status": "disease 1",
                "reason": "reason 1",
                "indication": "indication 1",
                "solution": "solution 1",
                "plant": "plant 1",
                "medicine_image_url": "https://medicine_image_url.com",
                "shop_url": "https://shop_url.com"
            }
        },
        ...
    ]
}
```

#### `DELETE /api/histories/{id}`  
Menghapus data riwayat deteksi penyakit tanaman.

**Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response Body:**
```json
{
    "status": "success"
}
```

---

## 🔗 Link Terkait

- 🌐 [Website](https://sahabattani.netlify.app/)
- 📄 [Dokumentasi Backend API](https://sahabattani.up.railway.app/)
- 🌾 [Machine Learning API](https://sahabattani-ml.up.railway.app/)