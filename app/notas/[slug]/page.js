import { ARTICLES } from "@/lib/articles";
import ArticleReader from "@/components/ArticleReader";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} — Substrato`,
    description: `${article.category} · ${article.date}`,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();
  return <ArticleReader article={article} />;
}
