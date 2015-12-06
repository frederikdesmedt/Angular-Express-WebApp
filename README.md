Project Webapps Frederik De Smedt
=================================
Dit project breidt de applicatie die we in de website gemaakt hebben, Flapper News, verder uit door het volgende te integreren:
- Linting, via gulp
- Material Design
- Angular UI Notifications
- Angular Loading Bar
- Uitgebreide testen
- (Minimaal) gebruik van Promises
- Zelf geschreven middleware
- Licht aangepaste Mongoose models
- Upvote & downvote (backend + frontend)
- Mobile versie
- Gulp Load Plugins
- Opkuis Javascript en templates
- Backend
 - Controleer of username bezet is
 - Kom te weten of de gebruiker een post of comment reeds leuk vindt
 
Alle code die op zelfstandige basis gedaan moest worden is zelf geschreven, geen copy paste van tutorials

Er is geprobeerd om de webapplicatie online te plaatsen via Openshift en Azure, Azure bevat echter geen uitgebreide support voor Node applications.
OpenShift heeft wel meer uitgebreide support maar maakt geen gebruik van gulp, men kan deze handmatig via SSH wel starten met gulp maar deze
SSH-sessie zal dan 24/7 moeten opstaan, terwijl deze na 5 minuten van inactivity timeout. In een OpenShift DIY-cartridge kan dit wel gedaan worden
maar daar zijn de maximum ondersteunde NPM & Node versies respectievelijk 1.1.37 & 0.6.20. Deze zijn echter te oud om de applicatie te draaien,
er komen undefined errors omdat dependencies niet ingeladen kunnen worden of incompatibel zijn.
