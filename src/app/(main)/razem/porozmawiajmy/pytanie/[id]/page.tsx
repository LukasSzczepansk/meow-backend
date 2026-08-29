import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { QuestionDetail } from "@/components/porozmawiajmy/QuestionDetail";

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/razem/porozmawiajmy" />
      <TopBar title="Pytanie" />
      <QuestionDetail questionId={id} />
    </div>
  );
}
