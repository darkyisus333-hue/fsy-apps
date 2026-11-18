# FSY Occidente · App de logística (PWA + Firebase)

Qué incluye: app instalable (PWA), inicio de sesión con Google, datos en tiempo real (Firestore) y avisos push 15 minutos antes de cada actividad.

## Pasos (una sola vez)
1. **Crear proyecto** en https://console.firebase.google.com
2. **Authentication** > Comenzar > activar el proveedor **Google**.
3. **Firestore Database** > Crear base de datos (modo producción, región cercana).
4. **Configuración del proyecto** > Tus apps > agregar **app web**. Copia los datos a `public/firebase-config.js`.
5. **Configuración del proyecto > Cloud Messaging > Certificados push web** > Generar par de claves. Pega la clave en `VAPID_KEY` de `public/firebase-config.js`.
6. Plan **Blaze** (requiere tarjeta; este uso cabe en la cuota gratis). Es necesario para la función de avisos.
7. En una terminal, dentro de esta carpeta:
   ```
   npm i -g firebase-tools
   firebase login
   firebase use --add        (elige tu proyecto)
   cd functions && npm install && cd ..
   firebase deploy
   ```
8. **Quién puede entrar**: en Firestore crea la colección `config`, documento `acceso`, con dos campos tipo *array* de texto, correos de Google en minúsculas:
   - `editores`: [ "coordinador@gmail.com", ... ]
   - `lectores`: [ "hotel@gmail.com", ... ]
9. Abre `https://TU-PROYECTO.web.app` con un correo de editor. El primer editor que entra carga el horario inicial. Comparte ese enlace.

## Para tus usuarios
- Android/Chrome: aparece **Instalar app** en Inicio. iPhone: Compartir > Agregar a pantalla de inicio (iOS 16.4 o superior, los avisos funcionan desde la app instalada).
- Tocan **Activar avisos** y reciben una notificación antes de cada actividad, con lugar y comités.

## Ajustes
- Minutos de anticipación: `AVISO_MIN` en `functions/index.js`.
- Después de cambiar algo: `firebase deploy`.
