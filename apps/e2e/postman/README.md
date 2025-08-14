# Fuel Manager API Testing with Postman

Bu Postman collection'ı Fuel Manager API'lerini test etmek için hazırlanmıştır. **Effective cookie management** kullanır.

## 🚀 Kurulum

### 1. Postman'i Açın
- Postman uygulamasını açın
- Collection'ı import edin: `Fuel_Manager_API_Collection.postman_collection.json`
- Environment'ı import edin: `Fuel_Manager_API_Environment.postman_environment.json`

### 2. Environment'ı Seçin
- Postman'de sağ üst köşeden "Fuel Manager API Environment" seçin

### 3. Uygulamayı Başlatın
```bash
# Terminal'de proje dizininde
pnpm dev
```

### 4. Supabase'i Başlatın (Local)
```bash
# Terminal'de proje dizininde
pnpm run supabase:web:start
```

## 🔐 Authentication

### Manual Cookie Header Management
Bu collection **manual cookie header management** kullanır:

1. **Supabase Auth API** için: JWT Bearer token
2. **Uygulama API'leri** için: Manuel cookie header injection
3. **Pre-request Script**: Her `localhost:3000` request'inde otomatik olarak `Cookie` header'ı ekler

### Test Kullanıcısı Oluşturma
Eğer test kullanıcınız yoksa:

1. Supabase Studio'ya gidin: `http://localhost:54323`
2. **Authentication > Users** bölümüne gidin
3. **"Add user"** butonuna tıklayın
4. Email: `test@example.com`, Password: `password123` girin
5. **"Create user"** butonuna tıklayın

## 📋 Test Sırası

### 1. Authentication
1. **"Sign In (Local Supabase)"** - Giriş yapın (JWT token alınır ve cookie'ler set edilir)
2. **"Get Current User"** - Kullanıcı bilgilerini doğrulayın (Bearer token kullanır)

### 2. Fuel Quality
1. **"List Fuel Quality Data"** - Mevcut verileri listeleyin (Manuel cookie header)
2. **"Upload Fuel Quality Data"** - CSV dosyası yükleyin (Manuel cookie header)

### 3. Fuel Inventory
1. **"Get Fuel Types"** - Yakıt türlerini alın (Manuel cookie header)
2. **"Get Port Names"** - Liman isimlerini alın (Manuel cookie header)
3. **"Get Ship Names"** - Gemi isimlerini alın (Manuel cookie header)
4. **"Calculate and Save Fuel Inventory"** - Envanter hesaplayın (Manuel cookie header)
   - **Required fields**: `shipName`, `fuelType`
   - **Optional fields**: `rob`, `me`, `ae`, `boiler`, `maxFuelCapacity`, `minFuelPolicy`, `averageVoyagePeriod`
   - **Logic**: Ship'i `shipName` ile arar, bulamazsa hata verir (ship oluşturmaz)

### 4. Price Prediction
1. **"Get Price Prediction Files"** - Mevcut dosyaları listeleyin (Manuel cookie header)
2. **"Upload Price Prediction File"** - CSV dosyası yükleyin (Manuel cookie header)

### 5. Ships Management
1. **"Get All Ships"** - Tüm gemileri listeleyin
2. **"Create Ship"** - Yeni gemi oluşturun (ID otomatik kaydedilir)
3. **"Get Ship by ID"** - ID ile gemi getirin
4. **"Get Ship by Name"** - İsim ile gemi getirin
5. **"Update Ship"** - Gemi bilgilerini güncelleyin
6. **"Delete Ship"** - Gemi silin

### 6. Ports Management
1. **"Get All Ports"** - Tüm limanları listeleyin
2. **"Create Port"** - Yeni liman oluşturun (ID otomatik kaydedilir)
   - **Required fields**: `shipId`, `portName`
   - **Optional fields**: `etaDate`
   - **Logic**: Port bir ship'e ait olmalı, ship önce oluşturulmalı
3. **"Get Port by ID"** - ID ile liman getirin
4. **"Get Port by Name"** - İsim ile liman getirin
5. **"Update Port"** - Liman bilgilerini güncelleyin
6. **"Delete Port"** - Liman silin

### 7. Calculated Ship Price Coefficient Management
1. **"Get All Calculated Ship Price Coefficients"** - Tüm fiyat katsayılarını listeleyin
2. **"Create Calculated Ship Price Coefficient"** - Yeni fiyat katsayısı oluşturun (ID otomatik kaydedilir)
   - **Required fields**: `shipId`
   - **Optional fields**: `priceIndex`, `priceAndQualityIndicator`, `finalDecision`, `bestPrice`, `shipInventoryIndex`, `qualityIndex`, `fuelType`, `port`, `etaDate`, `priceDate`
   - **Logic**: Fiyat katsayısı bir ship'e ait olmalı, ship önce oluşturulmalı

### 8. Fuel Quality Data Management
1. **"Get All Fuel Quality Data"** - Tüm fuel quality data'yı listeleyin
2. **"Create Fuel Quality Data"** - Yeni fuel quality data oluşturun (ID otomatik kaydedilir)
   - **Optional fields**: `port`, `supplier`, `date`, `fuelType`, `grade`, `densityFifteenC`, `kViscosityFiftyC`, `pourPoint`, `ash`, `waterContent`, `sulphurContent`, `vanadium`, `sodium`, `aluminiumSilicon`, `totalAcidNumber`, `ccai`
   - **Logic**: Java entity'sine uygun olarak tüm kalite parametreleri
3. **"Get Fuel Quality Data by ID"** - ID ile fuel quality data getirin
4. **"Update Fuel Quality Data"** - Fuel quality data'yı güncelleyin
5. **"Delete Fuel Quality Data"** - Fuel quality data'yı silin

## 📁 Test Dosyaları

### CSV Dosyası Örneği
`fuel-quality-sample.csv` dosyasını kullanabilirsiniz:

```csv
fuel_type,density,viscosity,sulfur_content,flash_point,pour_point
diesel,0.85,2.5,0.1,60,-10
gasoline,0.75,1.2,0.05,45,-20
heavy_fuel_oil,0.95,180.0,3.5,80,15
```

## 🔧 Environment Variables

| Variable | Value | Açıklama |
|----------|-------|----------|
| `supabase_url` | `http://localhost:54321` | Local Supabase URL |
| `supabase_anon_key` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Local Supabase anon key |
| `app_url` | `http://localhost:3000` | Next.js uygulama URL |
| `email` | `test@example.com` | Test kullanıcı email |
| `password` | `password123` | Test kullanıcı şifre |
| `auth_token` | `(otomatik)` | JWT access token |
| `refresh_token` | `(otomatik)` | JWT refresh token |
| `ship_id` | `(otomatik)` | Oluşturulan gemi ID'si |
| `port_id` | `(otomatik)` | Oluşturulan liman ID'si |
| `coefficient_id` | `(otomatik)` | Oluşturulan fiyat katsayısı ID'si |
| `fuel_quality_data_id` | `(otomatik)` | Oluşturulan fuel quality data ID'si |

## 🐛 Sorun Giderme

### "Unauthorized" Hatası
- **"Sign In (Local Supabase)"** request'ini tekrar çalıştırın
- Pre-request script'in cookie header'ı doğru eklediğinden emin olun
- Console'da "Cookie header set:" mesajını kontrol edin
- Uygulamanın çalıştığından emin olun (`http://localhost:3000`)

### "This endpoint requires a Bearer token" Hatası
- **"Sign In (Local Supabase)"** request'ini tekrar çalıştırın
- JWT token'ın environment'a kaydedildiğinden emin olun

### "404 Not Found" Hatası
- Uygulamanın çalıştığından emin olun: `pnpm dev`
- Supabase'in çalıştığından emin olun: `pnpm run supabase:web:start`

### "Bucket not found" Hatası
- Database'i reset edin: `pnpm run supabase:web:reset`
- Storage bucket'ın oluşturulduğundan emin olun

## ✅ Başarılı Test Sonuçları

### Authentication
- **Sign In**: `200 OK` - JWT token alınır ve cookie'ler otomatik set edilir
- **Get Current User**: `200 OK` - Kullanıcı bilgileri döner

### Fuel Quality
- **List**: `200 OK` - Boş array `[]` veya veri listesi
- **Upload**: `200 OK` - `{"message": "File uploaded successfully", "fileId": "..."}`

### Fuel Inventory
- **Get Types/Ports/Ships**: `200 OK` - Veri listesi
- **Calculate**: `200 OK` - Hesaplama sonucu

### Price Prediction
- **List**: `200 OK` - Dosya listesi
- **Upload**: `200 OK` - `{"message": "File uploaded successfully", "fileId": "..."}`

### Ships Management
- **Get All**: `200 OK` - Gemi listesi
- **Create**: `200 OK` - `{"message": "Ship created successfully", "ship": {...}}`
- **Get by ID**: `200 OK` - Gemi detayları
- **Get by Name**: `200 OK` - Gemi detayları
- **Update**: `200 OK` - `{"message": "Ship updated successfully", "ship": {...}}`
- **Delete**: `200 OK` - `{"message": "Ship deleted successfully"}`

### Ports Management
- **Get All**: `200 OK` - Liman listesi
- **Create**: `200 OK` - `{"message": "Port created successfully", "port": {...}}`
- **Get by ID**: `200 OK` - Liman detayları
- **Get by Name**: `200 OK` - Liman detayları
- **Update**: `200 OK` - `{"message": "Port updated successfully", "port": {...}}`
- **Delete**: `200 OK` - `{"message": "Port deleted successfully"}`

### Calculated Ship Price Coefficient Management
- **Get All**: `200 OK` - Fiyat katsayısı listesi
- **Create**: `200 OK` - `{"message": "Calculated ship price coefficient created successfully", "coefficient": {...}}`

### Fuel Quality Data Management
- **Get All**: `200 OK` - Fuel quality data listesi
- **Create**: `200 OK` - `{"message": "Fuel quality data created successfully", "fuelQualityData": {...}}`
- **Get by ID**: `200 OK` - Fuel quality data detayları
- **Update**: `200 OK` - `{"message": "Fuel quality data updated successfully", "fuelQualityData": {...}}`
- **Delete**: `200 OK` - `{"message": "Fuel quality data deleted successfully"}`

### Fuel Types Management
- **Get All**: `200 OK` - Fuel types listesi
- **Create**: `200 OK` - `{"message": "Fuel type created successfully", "fuelType": {...}}`
- **Get by ID**: `200 OK` - Fuel type detayları
- **Update**: `200 OK` - `{"message": "Fuel type updated successfully", "fuelType": {...}}`
- **Delete**: `200 OK` - `{"message": "Fuel type deleted successfully"}`

### Port Fuel Quality Index Management
- **Get All**: `200 OK` - Port fuel quality index listesi
- **Create**: `200 OK` - `{"message": "Port fuel quality index created successfully", "portFuelQualityIndex": {...}}`
- **Get by ID**: `200 OK` - Port fuel quality index detayları
- **Update**: `200 OK` - `{"message": "Port fuel quality index updated successfully", "portFuelQualityIndex": {...}}`
- **Delete**: `200 OK` - `{"message": "Port fuel quality index deleted successfully"}`

### Port Fuel Quality Value Management
- **Get All**: `200 OK` - Port fuel quality value listesi
- **Create**: `200 OK` - `{"message": "Port fuel quality value created successfully", "portFuelQualityValue": {...}}`
- **Get by ID**: `200 OK` - Port fuel quality value detayları
- **Update**: `200 OK` - `{"message": "Port fuel quality value updated successfully", "portFuelQualityValue": {...}}`
- **Delete**: `200 OK` - `{"message": "Port fuel quality value deleted successfully"}`

### Procurement Decisions Management
- **Get All**: `200 OK` - Procurement decisions listesi
- **Create**: `200 OK` - `{"message": "Procurement decision created successfully", "procurementDecision": {...}}`
- **Get by ID**: `200 OK` - Procurement decision detayları
- **Update**: `200 OK` - `{"message": "Procurement decision updated successfully", "procurementDecision": {...}}`
- **Delete**: `200 OK` - `{"message": "Procurement decision deleted successfully"}`

### Supply and Demand Data Management
- **Get All**: `200 OK` - Supply and demand data listesi
- **Create**: `200 OK` - `{"message": "Supply and demand data created successfully", "supplyAndDemandData": {...}}`
- **Get by ID**: `200 OK` - Supply and demand data detayları
- **Update**: `200 OK` - `{"message": "Supply and demand data updated successfully", "supplyAndDemandData": {...}}`
- **Delete**: `200 OK` - `{"message": "Supply and demand data deleted successfully"}`

### Supply and Demand Second Data Management
- **Get All**: `200 OK` - Supply and demand second data listesi
- **Create**: `200 OK` - `{"message": "Supply and demand second data created successfully", "supplyAndDemandSecondData": {...}}`
- **Get by ID**: `200 OK` - Supply and demand second data detayları
- **Update**: `200 OK` - `{"message": "Supply and demand second data updated successfully", "supplyAndDemandSecondData": {...}}`
- **Delete**: `200 OK` - `{"message": "Supply and demand second data deleted successfully"}`

## 🎯 Test Senaryoları

### Senaryo 1: Temel API Testleri
1. Authentication
2. Fuel Quality List
3. Fuel Inventory Types
4. Price Prediction List

### Senaryo 2: Dosya Yükleme Testleri
1. Fuel Quality Upload
2. Price Prediction Upload

### Senaryo 3: Tam Workflow Testleri
1. Authentication
2. Upload Fuel Quality Data
3. Upload Price Prediction Data
4. Calculate Fuel Inventory

### Senaryo 4: CRUD Testleri
1. Authentication
2. Create Ship
3. Get Ship by ID
4. Update Ship
5. Create Port
6. Get Port by ID
7. Update Port
8. Delete Port
9. Delete Ship

### Senaryo 5: Calculated Ship Price Coefficient Testleri
1. Authentication
2. Create Ship
3. Create Calculated Ship Price Coefficient
4. Get All Calculated Ship Price Coefficients

### Senaryo 6: Fuel Quality Data Testleri
1. Authentication
2. Create Fuel Quality Data
3. Get All Fuel Quality Data
4. Get Fuel Quality Data by ID
5. Update Fuel Quality Data
6. Delete Fuel Quality Data

### Senaryo 7: Fuel Types Testleri
1. Authentication
2. Create Fuel Type
3. Get All Fuel Types
4. Get Fuel Type by ID
5. Update Fuel Type
6. Delete Fuel Type

### Senaryo 8: Port Fuel Quality Index Testleri
1. Authentication
2. Create Port Fuel Quality Index
3. Get All Port Fuel Quality Index
4. Get Port Fuel Quality Index by ID
5. Update Port Fuel Quality Index
6. Delete Port Fuel Quality Index

### Senaryo 9: Port Fuel Quality Value Testleri
1. Authentication
2. Create Port Fuel Quality Value
3. Get All Port Fuel Quality Value
4. Get Port Fuel Quality Value by ID
5. Update Port Fuel Quality Value
6. Delete Port Fuel Quality Value

### Senaryo 10: Procurement Decisions Testleri
1. Authentication
2. Create Procurement Decision
3. Get All Procurement Decisions
4. Get Procurement Decision by ID
5. Update Procurement Decision
6. Delete Procurement Decision

### Senaryo 11: Supply and Demand Data Testleri
1. Authentication
2. Create Supply and Demand Data
3. Get All Supply and Demand Data
4. Get Supply and Demand Data by ID
5. Update Supply and Demand Data
6. Delete Supply and Demand Data

### Senaryo 12: Supply and Demand Second Data Testleri
1. Authentication
2. Create Supply and Demand Second Data
3. Get All Supply and Demand Second Data
4. Get Supply and Demand Second Data by ID
5. Update Supply and Demand Second Data
6. Delete Supply and Demand Second Data

## 📝 Notlar

- **Manual cookie header management**: Pre-request script ile manuel cookie header injection
- **Local Supabase**: Tüm testler local Supabase instance'ı kullanır
- **File uploads**: CSV ve Excel dosyaları desteklenir
- **Error handling**: Detaylı hata mesajları döner

## 🔄 Güncellemeler

- **v14.0**: Supply and Demand Second Data CRUD API'leri eklendi (Java entity'sine uygun)
- **v13.0**: Supply and Demand Data CRUD API'leri eklendi (Java entity'sine uygun)
- **v12.0**: Procurement Decisions CRUD API'leri eklendi (Java entity'sine uygun)
- **v11.0**: Port Fuel Quality Value CRUD API'leri eklendi (Java entity'sine uygun)
- **v10.0**: Port Fuel Quality Index CRUD API'leri eklendi (Java entity'sine uygun)
- **v9.0**: Fuel Types CRUD API'leri eklendi (Java entity'sine uygun)
- **v8.0**: Fuel Quality Data CRUD API'leri eklendi (Java entity'sine uygun)
- **v7.0**: Calculated Ship Price Coefficient CRUD API'leri eklendi
- **v6.0**: Ships ve Ports CRUD API'leri eklendi
- **v5.0**: Manual cookie header management (Pre-request script ile manuel cookie header injection)
- **v4.0**: Effective cookie management (Pre-request script ile otomatik cookie yönetimi)
- **v3.0**: Hybrid authentication (JWT + Cookie)
- **v2.0**: Cookie-based authentication
- **v1.0**: Authorization header tabanlı authentication
