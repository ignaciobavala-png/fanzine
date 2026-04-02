export function getSoundCloudEmbedUrl(soundcloudUrl) {
  if (!soundcloudUrl) return null;
  
  // Extraer el track ID o convertir a URL de widget
  if (soundcloudUrl.includes('api.soundcloud.com')) {
    return soundcloudUrl;
  }
  
  // Convertir URL regular a URL de widget embebido
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
}

export function getDirectAudioUrl(soundcloudUrl) {
  // SoundCloud no permite reproducción directa por CORS
  // Devolvemos null para indicar que no se puede reproducir directamente
  return null;
}

export function canPlayDirectly(soundcloudUrl) {
  // Verificar si es una URL que se puede reproducir directamente
  return false; // SoundCloud siempre requiere widget
}
