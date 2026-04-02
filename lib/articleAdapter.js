export function adaptArticleForPlayer(article) {
  if (!article) return null;
  
  return {
    id: article.id,
    number: `N·${article.tracks?.number || '000'}`,
    slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: article.title,
    author: article.author || 'Redacción Substrato',
    date: new Date(article.created_at).getFullYear().toString(),
    category: 'Artículo',
    accent: article.tracks?.accent || '#a855f7',
    screens: [
      {
        type: "heading",
        content: article.title
      },
      ...(article.content.split('\n\n').filter(paragraph => paragraph.trim()).map(paragraph => ({
        type: "text",
        content: paragraph
      }))),
      {
        type: "closing",
        content: `— ${article.author || 'Anónimo'}`,
      },
    ],
  };
}
