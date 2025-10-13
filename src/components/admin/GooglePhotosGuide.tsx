import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const GooglePhotosGuide = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          מדריך שימוש ב-Google Photos
        </CardTitle>
        <CardDescription>
          איך להוסיף תמונות מ-Google Photos לאתר
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>חשוב:</strong> התמונות לא נשמרות באתר שלך, הן מוצגות ישירות מ-Google Photos. זה חוסך מקום ומשאבים.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold">שלב 1: העלה תמונות ל-Google Photos</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
            <li>היכנס ל-Google Photos (photos.google.com)</li>
            <li>צור אלבום חדש לכל אירוע</li>
            <li>העלה את כל התמונות והסרטונים לאלבום</li>
          </ol>

          <h4 className="font-semibold mt-4">שלב 2: קבל קישור ישיר לכל תמונה</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
            <li>פתח את התמונה ב-Google Photos</li>
            <li>לחץ על כפתור השיתוף (Share)</li>
            <li>בחר "Create Link" או "צור קישור"</li>
            <li>העתק את הקישור</li>
            <li>הדבק אותו בשדה "קישור לקובץ" כאן באתר</li>
          </ol>

          <h4 className="font-semibold mt-4">טיפ מקצר:</h4>
          <p className="text-sm text-muted-foreground">
            אם יש לך הרבה תמונות, שמור את כל הקישורים בגיליון Excel/Google Sheets ואז העלה אותם בכמות גדולה דרך ייבוא CSV (תכונה עתידית).
          </p>

          <Alert className="mt-4">
            <AlertDescription>
              <strong>שים לב:</strong> וודא שהאלבום ב-Google Photos מוגדר כציבורי או לפחות שהקישורים פעילים, אחרת התמונות לא יוצגו לגולשים.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};
