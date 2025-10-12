import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Image as ImageIcon, Heart } from "lucide-react";
import { EventsManager } from "@/components/admin/EventsManager";
import { MediaManager } from "@/components/admin/MediaManager";
import { BlessingsManager } from "@/components/admin/BlessingsManager";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">ניהול המערכת</h1>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowRight className="mr-2 h-4 w-4" />
              חזרה לאתר
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="events" className="w-full" dir="rtl">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              אירועים
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              מדיה
            </TabsTrigger>
            <TabsTrigger value="blessings" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              ברכות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsManager />
          </TabsContent>

          <TabsContent value="media">
            <MediaManager />
          </TabsContent>

          <TabsContent value="blessings">
            <BlessingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
