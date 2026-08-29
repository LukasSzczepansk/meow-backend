import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { QuestionList } from "@/components/porozmawiajmy/QuestionList";
import { getCategory, type QuestionCategoryKey } from "@/lib/content/questions";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const info = getCategory(category as QuestionCategoryKey);

  return (
    <div className="flex flex-col gap-2 pb-5">
      <BackLink href="/razem/porozmawiajmy" />
      <TopBar title={info.label} subtitle={info.description} />
      <QuestionList categoryKey={category as QuestionCategoryKey} />
    </div>
  );
}
