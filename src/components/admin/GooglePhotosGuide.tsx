import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Upload } from "lucide-react";

export const GooglePhotosGuide = () => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          פתרון מומלץ לאחסון תמונות
        </CardTitle>
        <CardDescription>
          הדרך הטובה ביותר להעלות ולהציג תמונות באתר
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>חשוב:</strong> Google Photos אינו מאפשר הטמעה ישירה של תמונות. מומלץ להשתמש באחד מהפתרונות הבאים:
          </AlertDescription>
        </Alert>

        <div className="space-y-4 text-sm">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
              <Info className="h-4 w-4" />
              פתרונות מומלצים (בחר אחד):
            </h4>
            
            <div className="space-y-3">
              <div className="bg-background p-3 rounded border">
                <p className="font-semibold mb-2">1. Imgur (הכי פשוט) - חינם</p>
                <ol className="list-decimal list-inside space-y-1 mr-4 text-muted-foreground">
                  <li>היכנס ל-<a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">imgur.com</a></li>
                  <li>לחץ "New post" והעלה תמונה</li>
                  <li>לחץ לחיצה ימנית על התמונה ובחר "Copy image address"</li>
                  <li>הדבק את הקישור (מסתיים ב-.jpg או .png)</li>
                </ol>
              </div>

              <div className="bg-background p-3 rounded border">
                <p className="font-semibold mb-2">2. ImgBB - חינם</p>
                <ol className="list-decimal list-inside space-y-1 mr-4 text-muted-foreground">
                  <li>היכנס ל-<a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">imgbb.com</a></li>
                  <li>העלה תמונה</li>
                  <li>העתק את "Direct link"</li>
                  <li>הדבק בשדה "קישור לקובץ"</li>
                </ol>
              </div>

              <div className="bg-background p-3 rounded border">
                <p className="font-semibold mb-2">3. Cloudinary - מקצועי</p>
                <ol className="list-decimal list-inside space-y-1 mr-4 text-muted-foreground">
                  <li>היכנס ל-<a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cloudinary.com</a></li>
                  <li>צור חשבון חינם</li>
                  <li>העלה תמונות ל-Media Library</li>
                  <li>העתק את ה-URL הישיר</li>
                </ol>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>למה לא Google Photos?</strong> Google Photos חוסמת הטמעה ישירה של תמונות מסיבות אבטחה. 
              השירותים למעלה מיועדים להטמעת תמונות ויעבדו מצוין עם האתר.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};
