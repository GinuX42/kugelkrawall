# ice-Breaker

Ein fiktiver Eis-Shop für den Web-Unterricht. Zwei interaktive Simulationen zu SQL-Injection und Cross-Site-Scripting mit lokalem Punktestand.

**[Eisshop öffnen](https://ginux42.github.io/kugelkrawall/)**

## Im Unterricht

- **Die vierte Sorte (50 Punkte).** Die Lernenden probieren die Zutatensuche aus, entziffern einen Bestellbon und erweitern die Suche auf das Geheimlager.
- **Krach an der Eistafel (50 Punkte).** Die Lernenden vergleichen einen normalen Gästebucheintrag mit einem erfundenen Tafelstempel. Der passende Eintrag schaltet die Eistafel auf die gesuchte Meldung um.

Beide Rätsel lassen sich in beliebiger Reihenfolge lösen. Hinweise kosten keine Punkte. Nach jeder Lösung erklärt der Shop den Zusammenhang mit dem echten Schwachstellentyp und einer passenden Schutzmaßnahme.

Die Punkte gelten pro Browserprofil und Gerät. Gespeichert werden zwei lokale Lösungsmarkierungen. Gästebucheinträge bleiben nur während des Seitenbesuchs sichtbar. Über **Neue Runde beginnen** kann die nächste Person bei null starten.

## Technik

Statische Webseite mit HTML, CSS, JavaScript und lokalen Bilddateien. GitHub Pages liefert den Hauptzweig `main` aus dem Stammverzeichnis aus. Lokal genügt ein statischer Webserver im Projektordner.

Die beiden Eingabefelder erkennen ausschließlich erfundene Spielmuster. Suchanfragen filtern vorbereitete Sortenkarten. Die Tafel und das Gästebuch geben Benutzereingaben als Text aus. Alle Spielfunktionen laufen im Browser.
