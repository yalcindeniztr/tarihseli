@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo 🚀 TARIH OYUNU - HIZLI DAGITIM VE DERLEME BASLATIYOR
echo =======================================================

:: 1. Temizlik (Eski APK/AAB ve Build Dosyalari)
echo.
echo 🧹 1. Eski Insalar Temizleniyor...
if exist "android\app\build\outputs\apk\release" (
    echo    - Eski APK klasoru siliniyor...
    rmdir /s /q "android\app\build\outputs\apk\release"
)
if exist "android\app\build\outputs\bundle\release" (
    echo    - Eski AAB klasoru siliniyor...
    rmdir /s /q "android\app\build\outputs\bundle\release"
)
cd android
call gradlew.bat clean
cd ..

:: 2. Web Projesini Derle
echo.
echo 📦 2. Web Projesi Derleniyor (npm run build)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Web Build Hatasi!
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Firebase'e Yukle
echo.
echo 🔥 3. Firebase Hosting'e Yukleniyor...
call firebase deploy
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Firebase Deploy Hatasi!
    pause
    exit /b %ERRORLEVEL%
)

:: 4. GitHub'a Gonder
echo.
echo 🐙 4. GitHub'a Kodlar Gonderiliyor...
git add .
git commit -m "Oto-Deploy: Versiyon Guncellemesi ve Duzeltmeler"
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Git Push uyarisi - belki degisiklik yoktu veya hata alindi...
)

:: 5. Android APK ve AAB Olustur
echo.
echo 🤖 5. Android APK ve AAB Olusturuluyor...
cd android
call gradlew.bat assembleRelease bundleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Android Build Hatasi!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo =======================================================
echo ✅ ISLEM TAMAMLANDI!
echo =======================================================
echo.
echo 📁 CIKTI DOSYALARI:
echo -------------------
echo 📱 APK: android\app\build\outputs\apk\release\app-release.apk
echo 📦 AAB: android\app\build\outputs\bundle\release\app-release.aab
echo.
echo 🌍 Web: https://tarihoyun-2026.web.app
echo.
pause
