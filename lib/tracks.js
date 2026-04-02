import { supabase } from './supabase';

export async function getTracks() {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('number');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
}

export async function getArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*, tracks(number, title, artist)')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export function getArticleForTrack(articles, trackNumber) {
  // trackNumber format: "001", "002", etc.
  // article.tracks.number format: "001", "002", etc.
  const article = articles.find(a => a.tracks && a.tracks.number === trackNumber);
  return article || null;
}
