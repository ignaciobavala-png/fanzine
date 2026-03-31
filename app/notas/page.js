import { ARTICLES } from "@/lib/articles";
import ArticleIndex from "@/components/ArticleIndex";

export const metadata = {
  title: "Notas — Substrato",
  description: "Ensayos y textos de la revista Substrato",
};

export default function NotasPage() {
  return <ArticleIndex articles={ARTICLES} />;
}
