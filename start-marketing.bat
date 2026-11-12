@echo off
title ParaTunisie & Protein.tn - Marketing Hub
color 0b
echo ====================================================================
echo        PARATUNISIE & PROTEIN.TN - MARKETING DISPATCHER HUB
echo                   Email Marketing & SMS Marketing
echo ====================================================================
echo.
echo [1/2] Demarrage du serveur de marketing...
echo       - Gmail SMTP charge depuis .env
echo       - WinSMS Pro (SOBITAS) charge depuis .env
echo       - Base contacts : protein_tn_contacts.json (5,337 contacts)
echo.

start "" "http://localhost:4500"

node --env-file=.env scripts/marketing-hub.js
pause
