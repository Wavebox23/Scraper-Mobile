# 🚀 Quick Start - Deployment zu Apify

## 📦 Dein ZIP-Archiv ist bereit!

Das Archiv `mobile-de-scraper.zip` wurde erstellt und ist bereit zum Upload.

---

## 🎯 Schritt-für-Schritt Anleitung

### **Schritt 1: Apify Account erstellen**

1. Gehe zu [apify.com](https://apify.com)
2. Klicke auf "Sign up" (oben rechts)
3. Registriere dich mit E-Mail oder Google/GitHub
4. Bestätige deine E-Mail-Adresse
5. Du erhältst **$5 Startguthaben** kostenlos!

---

### **Schritt 2: Neuen Actor erstellen**

1. Nach dem Login → Gehe zu [Apify Console](https://console.apify.com)
2. Klicke auf **"Actors"** im linken Menü
3. Klicke auf **"Create new"** (blauer Button oben rechts)
4. Wähle **"Empty Actor"** (oder "From scratch")

---

### **Schritt 3: Code hochladen**

Es gibt **zwei Methoden**:

#### **Methode A: ZIP Upload (Empfohlen für Start)**

1. Im Actor-Editor → Gehe zu **"Source"** Tab
2. Klicke auf **"Upload files"** oder nutze Drag & Drop
3. Wähle die Datei: `/Users/mitch/scraper mobile/mobile-de-scraper.zip`
4. Warte bis der Upload abgeschlossen ist
5. Die Dateien werden automatisch entpackt

#### **Methode B: Manuelles Kopieren**

1. Öffne den **"Source code"** Editor
2. Erstelle die Ordnerstruktur manuell
3. Kopiere die Dateien einzeln (nicht empfohlen)

---

### **Schritt 4: Actor konfigurieren**

1. Gehe zum **"Settings"** Tab
2. Konfiguriere folgendes:

   **Basis-Einstellungen:**
   ```
   Name: mobile-de-scraper
   Title: Mobile.de Scraper
   Description: Extract vehicle listings from Mobile.de
   ```

   **Build:**
   ```
   Build tag: latest
   ```

   **Resources:**
   ```
   Memory: 2048 MB
   Timeout: 3600 seconds (1 Stunde)
   ```

   **Dockerfile:** (bereits vorhanden in deinem ZIP)
   ```
   Leave as ./Dockerfile
   ```

---

### **Schritt 5: Actor bauen**

1. Klicke auf den **"Build"** Tab (oder Button)
2. Klicke auf **"Build"** Button
3. Warte 2-5 Minuten während der Build läuft
4. Du siehst die Build-Logs in Echtzeit
5. ✅ Warte bis "Build successful" erscheint

**Häufige Build-Fehler:**
- Wenn Fehler auftreten → Prüfe die Logs
- Stelle sicher, dass alle Dateien hochgeladen wurden
- Node.js Version sollte 18+ sein

---

### **Schritt 6: Ersten Test-Run durchführen**

1. Gehe zum **"Console"** oder **"Input"** Tab
2. Füge diesen Test-Input ein:

   ```json
   {
     "startUrls": [
       {
         "url": "https://suchen.mobile.de/fahrzeuge/search.html?s=Car&vc=Car"
       }
     ],
     "maxItems": 5,
     "reviewLimit": 3,
     "proxyConfiguration": {
       "useApifyProxy": true,
       "apifyProxyGroups": ["RESIDENTIAL"]
     }
   }
   ```

3. Klicke auf **"Start"** (oder "Save & Start")
4. Warte 30-60 Sekunden
5. Überprüfe die Ergebnisse!

---

### **Schritt 7: Ergebnisse überprüfen**

1. **Run Status**: Sollte "SUCCEEDED" sein ✅
2. **Dataset**:
   - Klicke auf "Dataset" Tab
   - Du solltest 5 Fahrzeuge sehen
3. **Logs**:
   - Überprüfe Logs auf Fehler
   - Schaue nach "Scraped vehicle" Meldungen
4. **Export**:
   - Exportiere als JSON, CSV oder Excel
   - Download die Daten

---

## 🎨 Dein Actor anpassen

### **Input-Schema bearbeiten**

Die Datei `INPUT_SCHEMA.json` definiert die UI:
- Ändere Labels und Beschreibungen
- Füge neue Felder hinzu
- Passe Standardwerte an

### **Logo hinzufügen**

1. Gehe zu Settings → "Avatar"
2. Lade ein Logo hoch (empfohlen: 256x256 px)
3. Erstelle ein professionelles Icon

### **README anpassen**

Die `README.md` wird im Apify Store angezeigt:
- Füge Screenshots hinzu
- Erkläre Use-Cases
- Zeige Beispiele

---

## 💰 Monetarisierung einrichten

### **Option 1: Rental Model**

1. Gehe zu **"Settings"** → **"Pricing"**
2. Wähle **"Rental"**
3. Setze Preise:
   - Basic: $19/Monat
   - Pro: $49/Monat
   - Enterprise: $99/Monat
4. Beschreibe die Unterschiede

### **Option 2: Pay-per-Result**

1. Wähle **"Pay per result"**
2. Setze Preis: z.B. **$0.30 per 1000 results**
3. Minimum: $0.10 per run
4. Maximale Credits pro Run: $10

---

## 📢 Im Apify Store veröffentlichen

### **Voraussetzungen:**

- ✅ Actor funktioniert fehlerfrei
- ✅ Gute README mit Beispielen
- ✅ Screenshot/Logo vorhanden
- ✅ Input-Schema vollständig
- ✅ Pricing konfiguriert

### **Veröffentlichen:**

1. Gehe zu **"Publication"** Tab
2. Wähle **Visibility**:
   - **Private**: Nur du siehst ihn
   - **Unlisted**: Jeder mit Link kann nutzen
   - **Public**: Im Apify Store sichtbar
3. Füge **Categories** hinzu: "E-commerce", "Scraping"
4. Klicke **"Publish to Store"**

---

## 🔧 Troubleshooting

### **Build schlägt fehl:**

```bash
Fehler: "Cannot find module 'apify'"
```
**Lösung**: Stelle sicher, dass `package.json` hochgeladen wurde

```bash
Fehler: "Dockerfile not found"
```
**Lösung**: Prüfe ob `Dockerfile` im Root liegt

### **Actor startet nicht:**

1. Überprüfe Logs im "Log" Tab
2. Stelle sicher Memory ist ausreichend (2048 MB)
3. Timeout erhöhen falls nötig

### **Keine Ergebnisse:**

1. Aktiviere Proxies in Input:
   ```json
   "proxyConfiguration": {
     "useApifyProxy": true,
     "apifyProxyGroups": ["RESIDENTIAL"]
   }
   ```
2. Teste mit kleinerer `maxItems` Zahl
3. Überprüfe ob Mobile.de erreichbar ist

### **Zu teuer:**

- Reduziere `maxItems` pro Run
- Nutze **"SHADER"** statt "RESIDENTIAL" Proxies (billiger)
- Optimiere Memory auf 1024 MB

---

## 📊 Monitoring einrichten

1. Gehe zu **"Monitoring"** Tab
2. Aktiviere **Alerts**:
   - E-Mail bei Failed Runs
   - Slack/Discord Benachrichtigungen
   - Webhook für Custom Integration

3. Setze **Limits**:
   - Max Budget pro Run
   - Max Duration
   - Max Memory

---

## 🎯 Nächste Schritte

Nach erfolgreichem Deploy:

1. **Teste verschiedene Szenarien:**
   - Große Suchen (100+ Ergebnisse)
   - Spezifische Marken/Modelle
   - Preis-Filter

2. **Optimiere Performance:**
   - Erhöhe `maxConcurrency` für Speed
   - Reduziere `reviewLimit` für Kosten
   - Teste verschiedene Proxy-Typen

3. **Sammle Feedback:**
   - Teste selbst ausgiebig
   - Lade Freunde zum Testen ein
   - Sammle Feature-Requests

4. **Marketing:**
   - Teile auf Social Media
   - Erstelle Tutorial-Video
   - Schreibe Blog-Post

---

## 📞 Support Kontakte

- **Apify Docs**: [docs.apify.com](https://docs.apify.com)
- **Apify Discord**: [discord.gg/apify](https://discord.gg/apify)
- **Apify Support**: support@apify.com

---

## ✅ Quick Checklist

Vor dem Go-Live:

- [ ] Account erstellt
- [ ] ZIP hochgeladen
- [ ] Build erfolgreich
- [ ] Test-Run durchgeführt
- [ ] 5 Ergebnisse erhalten
- [ ] Daten validiert (Titel, Preis, Bilder)
- [ ] README angepasst
- [ ] Logo hochgeladen
- [ ] Pricing konfiguriert
- [ ] Im Store veröffentlicht

---

## 🎉 Fertig!

Dein Mobile.de Scraper ist jetzt live auf Apify! 🚀

**Viel Erfolg!** 💪
