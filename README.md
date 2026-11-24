# ice-Breaker

[Zum Eisshop](https://ginux42.github.io/kugelkrawall/)

## Unterrichtsablauf

| Aufgabe | Woran die Lernenden den Erfolg erkennen | Punkte |
| --- | --- | ---: |
| Die vierte Sorte | Die Sortensuche zeigt vier Treffer und nennt die Geheimsorte. | 50 |
| Sortensuche reparieren | Die Suche nach Mango liefert einen Treffer. Der Bon für Theke und Lager liefert keinen. | 25 |
| Krach an der Eistafel | Ein erfundener Gästebuchstempel schaltet die Tafel auf KIRSCHALARM. | 50 |
| Gästebuch reparieren | Der Stempel und der normale Kommentar erscheinen als Text. Die Tafel bleibt bei beiden Eingaben unverändert. | 25 |
| Schichtwechsel | Der Fallbericht ordnet einen Eintrag, die Uhrzeit des zweiten Tafelbildes und die Begründung richtig zu. | 50 |

Jede Reparatur wird durch das zugehörige Rätsel freigeschaltet. Der Partnerfall lässt sich jederzeit öffnen. Zu zweit liest eine Person das Gästebuch und eine die Eistafel. Wer allein arbeitet, öffnet beide Rollenkarten. Für maximal 200 Punkte muss jede Aufgabe einmal gelöst werden. Hinweise und Fehlversuche kosten keine Punkte.

## Spielstand

Abgeschlossene Aufgaben, aktivierte Schutzmaßnahmen und bestandene Tests werden im Browserprofil auf dem jeweiligen Gerät gespeichert. Vorhandene Punkte der beiden ursprünglichen Rätsel zählen weiter. Bei gesperrtem Speicher gilt der Spielstand für die geöffnete Seite. Am selben Gerät nutzen zwei Personen einen Spielstand. Auf zwei Geräten reicht jede Person ihren eigenen Fallbericht ein. Über **Neue Runde beginnen** lässt sich der Fortschritt nach Bestätigung löschen.

## Technik

GitHub Pages liefert die statischen Dateien aus dem Stammverzeichnis des Hauptzweigs `main` aus. Lokal genügt ein statischer Webserver im Projektordner. Die Sortensuche filtert vorbereitete Karten, das Gästebuch setzt Text über `textContent`. Die Schutzmaßnahmen und Spielstempel sind Simulationen. Alle Eingaben bleiben im Browser.
