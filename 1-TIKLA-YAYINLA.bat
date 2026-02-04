@echo off
echo ========================================================
echo   TARIHSELI MASTER DEPLOYMENT SCRIPT
echo ========================================================
echo.

echo [1/6] Git Durumu Kontrol Ediliyor...
git status
echo.

echo [2/6] Kodlar Github'a Gonderiliyor...
git add .
git commit -m "Auto-Deploy: Master Update %date% %time%"
git push origin main
echo.

echo [3/6] Web Uygulamasi Derleniyor (Build)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build Hatasi! Islem durduruldu.
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo [4/6] Firebase'e Yukleniyor (Hosting & Rules)...
call npx firebase deploy --only hosting,firestore
if %ERRORLEVEL% NEQ 0 (
    echo Firebase Hatasi!
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo [5/6] Android Kodu Senkronize Ediliyor...
call npx cap sync android
echo.

echo [6/6] Android APK/AAB Olusturuluyor...
cd android
call gradlew assembleRelease bundleRelease
cd ..
echo.

echo [FINISH] Dosyalar Kopyalaniyor...
copy "d:\SONSİTELERİM\19-tarihoyunugoogleaı\android\app\build\outputs\apk\release\app-release.apk" "d:\SONSİTELERİM\19-tarihoyunugoogleaı\PlayStore_Upload\app-release.apk"
copy "d:\SONSİTELERİM\19-tarihoyunugoogleaı\android\app\build\outputs\bundle\release\app-release.aab" "d:\SONSİTELERİM\19-tarihoyunugoogleaı\PlayStore_Upload\app-release.aab"

echo.
echo ========================================================
echo   ISLEM BASARIYLA TAMAMLANDI!
echo   Web: https://tarihseli.web.app
echo   APK: PlayStore_Upload/app-release.apk
echo ========================================================
pause
