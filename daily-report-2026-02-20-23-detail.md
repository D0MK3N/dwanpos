# Daily Report - 2026-02-20

## Work Details

Today, I started by evaluating the results from my previous work on February 19, especially focusing on the integration between the frontend and backend for the login and register features. I reviewed the Next.js folder and file structure to make sure that `app/auth/login/page.tsx` and `app/auth/register/page.tsx` were present and free of errors.

I tested the backend endpoints `/auth/login` and `/auth/register` using both Postman and PowerShell. This was to confirm that the backend server was running and responding correctly to authentication requests. Next, I tested the frontend route `/auth/login` by accessing it through the browser and using curl. Despite the login page file existing, I encountered a 404 error on the frontend, which indicated a routing issue.

To address this, I checked the Next.js configuration file (`next.config.ts`) to ensure there were no custom routing rules interfering with the default behavior. I also restarted the Next.js development server to make sure the routing was updated and working according to the folder structure. Throughout the process, I documented each troubleshooting step and the results of my tests for future reference.

---

# Daily Report - 2026-02-23

## Work Details

Today, I continued troubleshooting the 404 error that appeared on the `/auth/login` route in the frontend. I carefully rechecked the folder and file structure, making sure there were no typos or mistakes in naming that could cause routing issues.

I tested both frontend and backend endpoints from the browser and terminal. This allowed me to confirm that the backend was responding correctly to POST requests, and that the frontend was attempting to connect as expected. I also checked the login and register `page.tsx` files to ensure they were free of errors and properly implemented.

To further validate the setup, I verified that the Next.js development server was running and that there were no build errors that could affect routing or page rendering. Throughout the day, I documented every troubleshooting step, the results of my tests, and my evaluation of the errors encountered. Finally, I compiled a detailed report to serve as a reference for future development and documentation.

---

# Daily Report - 2026-02-24

## Work Details

1. **Review & Evaluasi Pekerjaan Sebelumnya:**
	- Mengevaluasi hasil integrasi frontend-backend pada fitur login dan register yang telah dikerjakan sebelumnya.
	- Memastikan file dan folder seperti `app/auth/login/page.tsx` dan `app/auth/register/page.tsx` sudah benar dan bebas error.
	- Melakukan pengecekan routing di Next.js agar tidak terjadi 404 error pada halaman login/register.
	- Menguji endpoint backend `/auth/login` dan `/auth/register` menggunakan Postman dan PowerShell untuk memastikan server berjalan dan merespon dengan benar.
	- Melakukan troubleshooting jika terjadi error pada frontend, termasuk restart server dan pengecekan konfigurasi Next.js.

2. **API Exploration:**
	- Mendalami struktur dan dokumentasi API yang telah dibuat.
	- Menganalisis format request dan response, serta memastikan endpoint sesuai kebutuhan aplikasi.

3. **API Testing:**
	- Melakukan pengujian menyeluruh terhadap endpoint menggunakan Postman dan PowerShell.
	- Menguji berbagai skenario, termasuk validasi data, error handling, dan konsistensi response.

4. **Bug & Improvement Review:**
	- Mendokumentasikan hasil pengujian, menemukan beberapa bug dan area yang perlu perbaikan.
	- Memberikan catatan untuk pengembangan dan integrasi lebih lanjut antara frontend dan backend.

5. **Documentation:**
	- Menulis laporan detail terkait proses eksplorasi dan pengujian API.
	- Menyimpan catatan untuk referensi troubleshooting dan pengembangan berikutnya.
