import { Card, CardContent } from "@/components/ui/card";

interface StoryTabProps {
  story?: string | null;
}

export const StoryTab = ({ story }: StoryTabProps) => {
  if (!story) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">
          עדיין לא נוסף סיפור לאירוע זה
        </p>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8 md:p-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
            {story}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
