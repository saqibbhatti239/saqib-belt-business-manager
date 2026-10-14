# SAQIB — Belt Business Manager (Android Studio Project)

**Owners:** Saqib, Adil, Javaid  
**Currency:** Pakistani Rupees (PKR)  
**Database:** SQLite (`saqib_belt_business.db`)  
**Programming Language:** Java + XML Layouts  
**Architecture:** Offline-First Android Architecture  

---

## 🚀 Newly Added Features

### 1. "+ Add New Belt" Feature
Clearly visible **"+ Add New Belt"** buttons have been added to:
- **Product List Screen** (`ProductsActivity.java` / `activity_products.xml` & `ProductsView.tsx`)
- **Stock Management Screen** (`StockActivity.java` / `activity_stock.xml` & `StockView.tsx`)

#### Belt Details Form (12 Fields):
1. **Belt Name** — Required. Any commercial or brand name.
2. **Belt Code** — Unique code with auto-generator (`BLT-XXX`) and duplicate prevention check.
3. **Belt Design** — Optional (e.g., Formal Stitch, Reversible Classic, Automatic Buckle, Italian Braided).
4. **Belt Colour** — Optional (e.g., Black, Dark Brown, Tan, Burgundy, Cognac).
5. **Belt Size** — Optional (e.g., 28 to 46 waist or Free Size).
6. **Belt Material** — Optional (e.g., Full Grain Leather, Top Grain Cowhide, Buffalo Leather).
7. **Purchase Price per Belt** — Required (PKR).
8. **Selling Price per Belt** — Required (PKR).
9. **Opening Stock Quantity** — Required. Accepts `0` if no stock is purchased yet. If > 0, records opening stock balance without creating false supplier purchase bills.
10. **Minimum Stock Alert Quantity** — Optional (defaults to 5 pcs). Alerts appear when stock falls below this number.
11. **Belt Photo** — Select from mobile gallery or pick from leather presets.
12. **Notes** — Optional supplier notes, tannery origin, or warranty remarks.

### 2. Belt Operations & Safety
- **View Belt Details:** Modal showing all belt specs, profit margin %, stock level, and transaction counts.
- **Edit Belt:** Update belt names, design, sizes, and specs.
- **Update Prices:** Dedicated quick updater for cost price and retail price.
- **Update Stock (Audit):** Physical inventory count adjustment with audit trail logged in `stock_movements`.
- **Archive Belt:** Archive/unarchive toggle to hide discontinued belts while keeping history intact.
- **Safe Delete Protection:** Prevents deleting belts that have recorded sales or purchase history, protecting database integrity.
- **Multi-Dimensional Filters:** Filter by Name/Code, Colour, Design, Stock Level (In Stock, Low Stock, Out of Stock), and Active/Archived.

### 3. Restart & Erase All App Data Button
- A prominent **"Restart & Erase All Data"** button with a safety confirmation dialog.
- Allows clearing all belts, purchase bills, sales invoices, customer/supplier ledgers, stock movements, and expenses so owners can start completely fresh.
- Settings (languages, themes, wallpapers, PIN security) are preserved.

---

## 🛠️ How to Build and Run the APK in Android Studio

### Step 1: Open in Android Studio
1. Launch **Android Studio** (Hedgehog, Iguana, Koala, Ladybug, or newer).
2. Click **File -> Open...** and select the project folder.
3. Allow Gradle to sync dependencies (`com.android.tools.build:gradle:8.2.2`, `androidx.appcompat`, `material`, `androidx.biometric`).

### Step 2: Build Debug APK
- **Via GUI:** Select **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
- **Via Command Line / Terminal:**
  ```bash
  ./gradlew assembleDebug
  ```
- The APK will be generated at:
  `app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Install on Device
- Connect your phone via USB with USB Debugging enabled, and click the green **Run (Play)** button in Android Studio.
- Or transfer `app-debug.apk` to your phone via USB, Google Drive, or WhatsApp, and tap to install (enable "Install unknown apps" if prompted).

### Step 4: Build Signed Production APK
1. In Android Studio, go to **Build -> Generate Signed Bundle / APK...**
2. Select **APK** and click **Next**.
3. Create or choose your release keystore file (`saqib_release.jks`).
4. Select the **release** build variant, check **V1 (Jar Signature)** and **V2 (Full APK Signature)**, and click **Finish**.
5. Your production APK will be ready at:
   `app/release/app-release.apk`
